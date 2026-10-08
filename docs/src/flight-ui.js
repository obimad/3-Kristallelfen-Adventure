import { createFlight, advanceFlight, projectFlightObject, setFlightPaused } from './flight.js';

const clamp = (number, low, high) => Math.min(high, Math.max(low, number));
const MOVE_KEYS = new Map([['arrowleft', [-1, 0]], ['a', [-1, 0]], ['arrowright', [1, 0]], ['d', [1, 0]],
  ['arrowup', [0, -1]], ['w', [0, -1]], ['arrowdown', [0, 1]], ['s', [0, 1]]]);

/** One controller represents one flight attempt. Create another controller to
 * retry after cancellation. Only engine arrival resolves completed:true. */
export function createFlightUI({ canvas, overlay, onFinish, onCancel, reducedMotion = false,
  spriteSrc = 'assets/flight/fina-kian-back.png', skySrc = 'assets/flight/sky.png',
  pilotName = 'Kian', duration = 35 } = {}) {
  const doc = canvas.ownerDocument, win = doc.defaultView, ctx = canvas.getContext('2d');
  let flight = createFlight({ duration }), active = false, frameId = null, lastTime = null;
  let promise = null, resolveFlight = null, pointer = null, pointerId = null, previousFocus = null;
  let originalCanvas = null, mounted = false;
  let visualTime = 0;
  const keys = new Set(), listeners = [];
  const sprite = win.Image ? new win.Image() : null;
  const skyImage = win.Image ? new win.Image() : null;
  if (sprite) sprite.src = spriteSrc;
  if (skyImage) skyImage.src = skySrc;
  const panel = doc.createElement('div'), title = doc.createElement('strong'), explanation = doc.createElement('p');
  const progress = doc.createElement('progress'), status = doc.createElement('p'), controls = doc.createElement('div');
  const pauseButton = doc.createElement('button'), gentleButton = doc.createElement('button'), cancelButton = doc.createElement('button');
  panel.className = 'flight-panel'; title.className = 'flight-title'; explanation.className = 'flight-instructions';
  progress.className = 'flight-progress'; status.className = 'flight-status'; controls.className = 'flight-controls';
  title.textContent = `Mit ${pilotName} durch das Wolkenmeer`;
  explanation.textContent = 'Pfeile oder WASD: lenken · Berühren und ziehen: lenken · P oder Esc: Pause. Weiche Wolken und Vögeln aus.';
  progress.max = 100; progress.value = 0; progress.setAttribute('aria-label', 'Flug zur nächsten Wolkenstraße');
  status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); status.setAttribute('aria-atomic', 'true');
  pauseButton.type = gentleButton.type = cancelButton.type = 'button';
  pauseButton.textContent = 'Flug pausieren'; gentleButton.textContent = 'Gemütlich weiterfliegen'; cancelButton.textContent = 'Flug verlassen';
  pauseButton.className = gentleButton.className = cancelButton.className = 'flight-button';
  gentleButton.setAttribute('aria-pressed', 'false');
  controls.append(pauseButton, gentleButton, cancelButton); panel.append(title, explanation, progress, status, controls);

  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options); listeners.push(() => target.removeEventListener(type, handler, options));
  }
  function clearInput() { keys.clear(); pointer = null; pointerId = null; }
  function announce(text) { if (status.textContent !== text) status.textContent = text; }
  function updateProgress() { progress.value = Math.round(flight.elapsed / flight.duration * 100); }
  function pause() {
    if (!active) return;
    clearInput(); setFlightPaused(flight, true); lastTime = null;
    pauseButton.textContent = 'Weiterfliegen';
    announce('Flug pausiert. Fina und ihr Wolkensegler warten auf dich. Wähle Weiterfliegen.');
  }
  function resume() {
    if (!active || doc.hidden) return;
    clearInput(); setFlightPaused(flight, false); lastTime = null;
    pauseButton.textContent = 'Flug pausieren';
    announce(flight.gentle ? `${pilotName} hält euch auf einer ruhigen Flugbahn. Du kannst weiterhin lenken.` : 'Ihr fliegt weiter. Suche die freien Lücken im Wolkenmeer.');
    canvas.focus({ preventScroll: true });
  }
  function finish(completed) {
    if (!active) return;
    active = false;
    if (!completed) flight.status = 'cancelled';
    win.cancelAnimationFrame(frameId); frameId = null; clearInput();
    while (listeners.length) listeners.pop()();
    overlay.hidden = true;
    if (originalCanvas) {
      canvas.style.touchAction = originalCanvas.touchAction;
      for (const [attribute, value] of originalCanvas.attributes) {
        if (value === null) canvas.removeAttribute(attribute); else canvas.setAttribute(attribute, value);
      }
    }
    const result = { completed, hits: flight.hits };
    resolveFlight(result);
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    if (completed) onFinish?.(result); else onCancel?.(result);
  }
  function steerPointer(event) {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    pointer = { x: clamp(((event.clientX - bounds.left) / bounds.width - .5) / .27, -1, 1),
      y: clamp(((event.clientY - bounds.top) / bounds.height - .77) / .12, -1, 1) };
  }
  function keyDown(event) {
    if (!active) return;
    const key = event.key.toLowerCase();
    if (key === 'tab') { pause(); return; }
    const target = event.target;
    if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
    if (MOVE_KEYS.has(key)) {
      event.preventDefault(); event.stopPropagation(); keys.add(key); pointer = null; return;
    }
    if (key === 'p' || key === 'escape' || (key === ' ' && target === canvas)) {
      event.preventDefault(); event.stopPropagation();
      if (!event.repeat) flight.paused ? resume() : pause();
    }
  }
  function frame(time) {
    if (!active) return;
    const dt = lastTime === null ? 0 : Math.max(0, (time - lastTime) / 1000); lastTime = time;
    let x = 0, y = 0;
    for (const key of keys) { const direction = MOVE_KEYS.get(key); x += direction[0]; y += direction[1]; }
    if (pointer) { x = clamp((pointer.x - flight.player.x) * 5, -1, 1); y = clamp((pointer.y - flight.player.y) * 5, -1, 1); }
    const wasRecovering = flight.recovery > 0;
    const events = advanceFlight(flight, { x, y }, dt);
    if (wasRecovering && flight.recovery === 0) announce('Schon abgefangen. Ihr fliegt weiter – suche wieder eine freie Lücke.');
    for (const event of events) {
      if (event.type === 'hit') announce(`Ein kleiner Luftstoß! ${pilotName} fängt euch sicher ab. Gleich geht es weiter.`);
      if (event.type === 'complete') announce('Die nächste Wolkenstraße ist erreicht. Fina und ihr Wolkensegler landen sicher.');
    }
    updateProgress(); draw(time);
    if (flight.status === 'complete') finish(true); else frameId = win.requestAnimationFrame(frame);
  }
  function start() {
    if (promise) return promise;
    promise = new Promise(resolve => { resolveFlight = resolve; }); active = true; previousFocus = doc.activeElement;
    originalCanvas = { touchAction: canvas.style.touchAction, attributes: ['aria-label', 'tabindex'].map(attribute => [attribute, canvas.getAttribute(attribute)]) };
    canvas.style.touchAction = 'none'; canvas.setAttribute('tabindex', '0');
    canvas.setAttribute('aria-label', `Fina fliegt mit ${pilotName}. Pfeile oder WASD zum Ausweichen; P zum Pausieren.`);
    if (!mounted) { overlay.replaceChildren(panel); mounted = true; }
    overlay.hidden = false;
    listen(win, 'keydown', keyDown, true);
    listen(win, 'keyup', event => { const key = event.key.toLowerCase(); if (MOVE_KEYS.has(key)) { keys.delete(key); event.stopPropagation(); } }, true);
    listen(win, 'blur', pause);
    listen(doc, 'visibilitychange', () => { if (doc.hidden) pause(); });
    listen(canvas, 'pointerdown', event => {
      if (flight.paused || (event.button !== undefined && event.button !== 0)) return;
      event.preventDefault(); event.stopPropagation(); clearInput(); pointerId = event.pointerId;
      canvas.setPointerCapture?.(event.pointerId); canvas.focus({ preventScroll: true }); steerPointer(event);
    }, { passive: false });
    listen(canvas, 'pointermove', event => { if (event.pointerId === pointerId) { event.preventDefault(); event.stopPropagation(); steerPointer(event); } }, { passive: false });
    const releasePointer = event => { if (event.pointerId === pointerId) { pointer = null; pointerId = null; event.stopPropagation(); } };
    listen(canvas, 'pointerup', releasePointer); listen(canvas, 'pointercancel', releasePointer); listen(canvas, 'lostpointercapture', releasePointer);
    listen(pauseButton, 'click', () => flight.paused ? resume() : pause());
    listen(gentleButton, 'click', () => {
      flight.gentle = !flight.gentle; gentleButton.setAttribute('aria-pressed', String(flight.gentle));
      gentleButton.textContent = flight.gentle ? 'Wieder selbst ausweichen' : 'Gemütlich weiterfliegen';
      resume();
    });
    listen(cancelButton, 'click', () => finish(false));
    announce(`Fina und ${pilotName} starten. Die Hindernisse kommen vom Horizont auf euch zu.`);
    canvas.focus({ preventScroll: true });
    if (doc.hidden) pause();
    draw(0); frameId = win.requestAnimationFrame(frame);
    return promise;
  }

  function cloud(x, y, radius, alpha = 1, hazard = false) {
    ctx.save(); ctx.globalAlpha = alpha;
    const fill = ctx.createLinearGradient(x, y - radius * .6, x, y + radius * .6);
    fill.addColorStop(0, hazard ? '#fff3d9' : '#fcf7ec'); fill.addColorStop(.5, '#e4e8f2'); fill.addColorStop(1, hazard ? '#7893b8' : '#b9ccdf');
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * .36, 0, 0, Math.PI * 2);
    ctx.ellipse(x - radius * .38, y - radius * .16, radius * .46, radius * .4, 0, 0, Math.PI * 2);
    ctx.ellipse(x + radius * .12, y - radius * .25, radius * .53, radius * .48, 0, 0, Math.PI * 2);
    ctx.ellipse(x + radius * .58, y - radius * .12, radius * .34, radius * .31, 0, 0, Math.PI * 2);
    ctx.fill();
    if (hazard) { ctx.strokeStyle = '#e4bc83'; ctx.lineWidth = Math.max(1.3, radius / 70); ctx.stroke(); }
    ctx.restore();
  }
  function birds(projected, time) {
    const size = Math.max(3, projected.radiusX * .28), flap = reducedMotion ? .5 : Math.sin(time / 125) * .6;
    ctx.save(); ctx.strokeStyle = '#314763'; ctx.lineWidth = Math.max(2, projected.scale * 3); ctx.lineCap = 'round';
    for (let index = 0; index < 3; index++) {
      const x = projected.x + (index - 1) * size * 2.15, y = projected.y + (index === 1 ? -size * .35 : size * .3);
      ctx.beginPath(); ctx.moveTo(x - size, y - size * flap); ctx.quadraticCurveTo(x - size * .45, y - size * .35, x, y);
      ctx.quadraticCurveTo(x + size * .45, y - size * .35, x + size, y - size * flap); ctx.stroke();
    }
    ctx.restore();
  }
  function city(width, height) {
    const arrival = clamp((flight.elapsed / flight.duration - .55) / .45, 0, 1);
    const x = width * .5, y = height * .325, unit = height * (.004 + arrival * .045);
    ctx.save(); ctx.globalAlpha = .28 + arrival * .66; ctx.translate(x, y);
    cloud(0, unit * 1.8, unit * 8, .85);
    ctx.fillStyle = '#e6dde6'; ctx.strokeStyle = '#b99fae'; ctx.lineWidth = 1;
    for (let index = -3; index <= 3; index++) {
      const towerHeight = (index === 0 ? 5.4 : 2.1 + (3 - Math.abs(index)) * .6) * unit;
      ctx.fillRect(index * unit * 1.65 - unit * .52, -towerHeight, unit * 1.04, towerHeight + unit * 1.2);
      ctx.beginPath(); ctx.moveTo(index * unit * 1.65 - unit * .8, -towerHeight);
      ctx.lineTo(index * unit * 1.65, -towerHeight - unit * 1.1); ctx.lineTo(index * unit * 1.65 + unit * .8, -towerHeight); ctx.closePath();
      ctx.fillStyle = '#8e82ab'; ctx.fill(); ctx.fillStyle = '#e6dde6';
    }
    ctx.restore();
  }
  function drawPilots(time, spriteWidth, spriteHeight) {
    const width = sprite.naturalWidth, height = sprite.naturalHeight;
    const left = .25, right = .66, leftHinge = .20, rightHinge = .28;
    const flap = reducedMotion ? 0 : Math.sin(time / 460) * .026;
    const top = -spriteHeight * .52;
    // Three source crops keep the passengers and harness completely stable.
    // Only the outer wing surfaces turn slightly around their shoulder hinges.
    ctx.save(); ctx.translate(spriteWidth * (left - .5), top + spriteHeight * leftHinge); ctx.rotate(-flap);
    ctx.drawImage(sprite, 0, 0, width * left, height, -spriteWidth * left, -spriteHeight * leftHinge, spriteWidth * left, spriteHeight); ctx.restore();
    ctx.save(); ctx.translate(spriteWidth * (right - .5), top + spriteHeight * rightHinge); ctx.rotate(flap);
    ctx.drawImage(sprite, width * right, 0, width * (1 - right), height, 0, -spriteHeight * rightHinge, spriteWidth * (1 - right), spriteHeight); ctx.restore();
    ctx.drawImage(sprite, width * left, 0, width * (right - left), height, spriteWidth * (left - .5), top, spriteWidth * (right - left), spriteHeight);
  }
  function draw(time = 0) {
    if (!flight.paused) visualTime = time;
    time = visualTime;
    const width = canvas.width, height = canvas.height;
    ctx.save(); ctx.clearRect(0, 0, width, height);
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#416d9e'); sky.addColorStop(.32, '#bbd7e5'); sky.addColorStop(.52, '#efd8d8'); sky.addColorStop(1, '#82a8ca');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
    if (skyImage?.complete && skyImage.naturalWidth > 0) {
      const scale = Math.max(width / skyImage.naturalWidth, height / skyImage.naturalHeight);
      const imageWidth = skyImage.naturalWidth * scale, imageHeight = skyImage.naturalHeight * scale;
      ctx.drawImage(skyImage, (width - imageWidth) / 2, (height - imageHeight) / 2, imageWidth, imageHeight);
    }
    const glow = ctx.createRadialGradient(width * .5, height * .3, 0, width * .5, height * .3, width * .44);
    glow.addColorStop(0, '#fff6dca0'); glow.addColorStop(1, '#fff6dc00'); ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    // Quiet scenery also obeys the same perspective as the approaching hazards.
    for (let index = 0; index < 20; index++) {
      const z = 1 + ((index * .72 + 12 - flight.elapsed * (reducedMotion ? .13 : .34)) % 12 + 12) % 12;
      const side = index % 2 ? -1 : 1;
      const background = projectFlightObject({ x: side * (1.8 + index % 4 * .5), y: 1.5 + index % 3 * 2, z, radiusX: .85, radiusY: .4 }, width, height);
      cloud(background.x, background.y, background.radiusX, .28 + .32 / z);
    }
    city(width, height);
    for (const object of [...flight.objects].sort((a, b) => b.z - a.z)) {
      if (object.z < .65) continue;
      const projected = projectFlightObject(object, width, height);
      if (object.type === 'birds') birds(projected, time);
      else cloud(projected.x, projected.y, projected.radiusX, .94, true);
    }
    const playerX = width * (.5 + flight.player.x * .27), playerY = height * (.77 + flight.player.y * .12);
    const bob = reducedMotion ? 0 : Math.sin(time / 330) * height * .004;
    const bank = reducedMotion ? 0 : flight.player.x * .085;
    ctx.save(); ctx.translate(playerX, playerY + bob); ctx.rotate(bank);
    if (flight.recovery > 0) ctx.globalAlpha = .86;
    if (sprite?.complete && sprite.naturalWidth > 0) {
      const spriteWidth = Math.min(width * .35, height * .65), spriteHeight = spriteWidth * sprite.naturalHeight / sprite.naturalWidth;
      drawPilots(time, spriteWidth, spriteHeight);
    } else {
      ctx.strokeStyle = '#f6e9c8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, height * .022, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#263e60'; ctx.font = `${Math.round(height * .021)}px Georgia, serif`; ctx.textAlign = 'center';
      ctx.fillText(`Fina und ${pilotName} im Anflug …`, 0, height * .052);
    }
    ctx.restore();
    ctx.textAlign = 'center';
    if (flight.paused) {
      ctx.fillStyle = '#19305280'; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#fff6df'; ctx.font = `600 ${Math.round(height * .048)}px Georgia, serif`; ctx.fillText('Eine Pause im Wolkenmeer', width / 2, height * .48);
    } else if (flight.recovery > 0) {
      ctx.fillStyle = '#263e60'; ctx.font = `600 ${Math.round(height * .032)}px Georgia, serif`; ctx.fillText('Ein Luftstoß – ihr seid sicher.', width / 2, height * .18);
    }
    ctx.restore();
  }
  return { start, cancel: () => finish(false), pause, resume, draw, destroy: () => finish(false),
    get active() { return active; }, get state() { return flight; } };
}
