import { createChase, advanceChase, chasePosition, chasePath, setChasePaused, chaseWalkable, MARKET_STALLS } from './chase.js';

const MOVE_KEYS = new Map([['arrowup', 'up'], ['w', 'up'], ['arrowright', 'right'], ['d', 'right'],
  ['arrowdown', 'down'], ['s', 'down'], ['arrowleft', 'left'], ['a', 'left']]);
const ACTOR_ART = {
  fina: { src: 'assets/fina.png', color: '#efd28f', crop: [.27, .005, .39, .24], label: 'Fina' },
  h: { src: 'assets/characters/h.png', color: '#38c9ed', crop: [.37, .015, .44, .27], label: 'H' },
  o: { src: 'assets/characters/o.png', color: '#edf6ff', crop: [.27, 0, .44, .29], label: 'O' },
};

/** One instance is one attempt, just like createFlightUI. Cancel never awards completion. */
export function createChaseUI({ canvas, overlay, onFinish, onCancel, reducedMotion = false } = {}) {
  const doc = canvas.ownerDocument, win = doc.defaultView, ctx = canvas.getContext('2d');
  const chase = createChase(), images = {}, listeners = [];
  let active = false, promise = null, resolveChase = null, frameId = null, lastTime = null;
  let direction = null, destination = null, previousFocus = null, originalCanvas = null;
  for (const [id, art] of Object.entries(ACTOR_ART)) {
    if (win.Image) { images[id] = new win.Image(); images[id].src = art.src; }
  }
  const panel = doc.createElement('div'), title = doc.createElement('strong'), explanation = doc.createElement('p');
  const progress = doc.createElement('progress'), status = doc.createElement('p'), controls = doc.createElement('div');
  const pauseButton = doc.createElement('button'), gentleButton = doc.createElement('button'), cancelButton = doc.createElement('button');
  const dpad = doc.createElement('div');
  panel.className = 'chase-panel'; title.className = 'chase-title'; explanation.className = 'chase-instructions';
  progress.className = 'chase-progress'; status.className = 'chase-status'; controls.className = 'chase-controls';
  dpad.className = 'chase-dpad'; dpad.setAttribute('role', 'group'); dpad.setAttribute('aria-label', 'Fina lenken');
  title.textContent = 'Fang H und O!';
  explanation.textContent = 'Pfeile / WASD oder Richtungstasten. Du kannst auch einen freien Gang anklicken. Die Marktstände sind feste Hindernisse.';
  progress.max = 2; progress.value = 0; progress.setAttribute('aria-label', 'Regenwachen gefangen');
  status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); status.setAttribute('aria-atomic', 'true');
  pauseButton.type = gentleButton.type = cancelButton.type = 'button';
  pauseButton.textContent = 'Pause'; gentleButton.textContent = 'Mit Wegweiser'; cancelButton.textContent = 'Verfolgung verlassen';
  pauseButton.className = gentleButton.className = cancelButton.className = 'chase-button';
  gentleButton.setAttribute('aria-pressed', 'false');
  controls.append(pauseButton, gentleButton, cancelButton); panel.append(title, explanation, progress, status, controls);
  for (const [move, glyph, name] of [['up', '↑', 'oben'], ['left', '←', 'links'], ['down', '↓', 'unten'], ['right', '→', 'rechts']]) {
    const button = doc.createElement('button'); button.type = 'button'; button.className = `chase-direction chase-${move}`;
    button.textContent = glyph; button.setAttribute('aria-label', `Nach ${name} laufen`);
    button.chaseDirection = move; dpad.append(button);
  }

  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options); listeners.push(() => target.removeEventListener(type, handler, options));
  }
  function announce(text) { if (status.textContent !== text) status.textContent = text; }
  function clearInput() { direction = null; destination = null; chase.wanted = null; }
  function pause() {
    if (!active) return;
    clearInput(); setChasePaused(chase, true); lastTime = null;
    pauseButton.textContent = 'Weiterlaufen'; announce(`Pause · ${chase.caught.length}/2 gefangen. H und O warten, bis du weiterläufst.`);
  }
  function resume() {
    if (!active || doc.hidden) return;
    clearInput(); setChasePaused(chase, false); lastTime = null;
    pauseButton.textContent = 'Pause';
    announce(`${chase.caught.length}/2 gefangen · ${chase.gentle ? 'Der goldene Weg zeigt dir die Richtung. H und O laufen langsamer.' : 'Fina ist schneller. Schneide den beiden an einer Kreuzung den Weg ab!'}`);
    canvas.focus({ preventScroll: true });
  }
  function finish(completed) {
    if (!active) return;
    active = false;
    if (!completed) chase.status = 'cancelled';
    win.cancelAnimationFrame(frameId); frameId = null; clearInput();
    while (listeners.length) listeners.pop()();
    overlay.hidden = true;
    if (originalCanvas) {
      canvas.style.touchAction = originalCanvas.touchAction;
      for (const [attribute, value] of originalCanvas.attributes) {
        if (value === null) canvas.removeAttribute(attribute); else canvas.setAttribute(attribute, value);
      }
    }
    const result = { completed, caught: [...chase.caught], elapsed: chase.elapsed };
    resolveChase(result);
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    if (completed) onFinish?.(result); else onCancel?.(result);
  }
  function keyDown(event) {
    if (!active) return;
    const key = event.key.toLowerCase();
    if (key === 'tab') { pause(); return; }
    if (event.target?.tagName === 'INPUT' || event.target?.tagName === 'TEXTAREA') return;
    if (MOVE_KEYS.has(key)) {
      event.preventDefault(); event.stopPropagation(); destination = null; direction = MOVE_KEYS.get(key); return;
    }
    if (key === 'p' || key === 'escape' || (key === ' ' && event.target === canvas)) {
      event.preventDefault(); event.stopPropagation();
      if (!event.repeat) chase.paused ? resume() : pause();
    }
  }
  function layout() {
    const tile = Math.min(canvas.width * .69 / 17, canvas.height * .83 / 13);
    return { tile, x: canvas.width * .28 + (canvas.width * .70 - tile * 17) / 2,
      y: canvas.height * .125 + (canvas.height * .85 - tile * 13) / 2 };
  }
  function routeDirection() {
    if (!destination) return direction;
    const from = chase.player.to ?? chase.player;
    const next = chasePath(chase, from, destination)[1];
    if (!next) {
      // Stop the queued heading before the last segment ends. Otherwise the
      // engine could spend the remainder of that frame entering another tile.
      direction = null; chase.wanted = null; chase.player.direction = null;
      if (!chase.player.to) destination = null;
      return null;
    }
    return next.x > from.x ? 'right' : next.x < from.x ? 'left' : next.y > from.y ? 'down' : 'up';
  }
  function frame(time) {
    if (!active) return;
    const dt = lastTime === null ? 0 : Math.max(0, (time - lastTime) / 1000); lastTime = time;
    const events = advanceChase(chase, { direction: routeDirection() }, dt);
    for (const event of events) {
      if (event.type === 'caught') announce(`${event.target.toUpperCase()} ist gefangen! ${event.count}/2 · ${event.count === 1 ? 'Jetzt noch die andere Regenwache.' : 'Beide erwischt!'}`);
    }
    progress.value = chase.caught.length;
    draw();
    if (chase.status === 'complete') finish(true); else frameId = win.requestAnimationFrame(frame);
  }
  function start() {
    if (promise) return promise;
    promise = new Promise(resolve => { resolveChase = resolve; }); active = true; previousFocus = doc.activeElement;
    originalCanvas = { touchAction: canvas.style.touchAction, attributes: ['aria-label', 'tabindex'].map(attribute => [attribute, canvas.getAttribute(attribute)]) };
    canvas.style.touchAction = 'none'; canvas.setAttribute('tabindex', '0');
    canvas.setAttribute('aria-label', 'Wolkenmarkt von oben. Fina fängt H und O in den Gängen. Pfeile oder WASD laufen; P oder Esc pausieren.');
    overlay.replaceChildren(panel, dpad); overlay.hidden = false;
    listen(win, 'keydown', keyDown, true);
    listen(win, 'keyup', event => { if (MOVE_KEYS.has(event.key.toLowerCase())) event.stopPropagation(); }, true);
    listen(win, 'blur', pause); listen(doc, 'visibilitychange', () => { if (doc.hidden) pause(); });
    listen(canvas, 'pointerdown', event => {
      if (chase.paused || (event.button !== undefined && event.button !== 0)) return;
      event.preventDefault(); event.stopPropagation();
      const bounds = canvas.getBoundingClientRect(), board = layout();
      if (!bounds.width || !bounds.height) return;
      const x = Math.floor(((event.clientX - bounds.left) * canvas.width / bounds.width - board.x) / board.tile);
      const y = Math.floor(((event.clientY - bounds.top) * canvas.height / bounds.height - board.y) / board.tile);
      if (chaseWalkable(chase, x, y)) { destination = { x, y }; direction = null; }
      canvas.focus({ preventScroll: true });
    }, { passive: false });
    for (const button of dpad.children) {
      const steer = event => { event.preventDefault(); event.stopPropagation(); if (!chase.paused) { direction = button.chaseDirection; destination = null; } };
      listen(button, 'pointerdown', steer, { passive: false });
      listen(button, 'click', steer);
    }
    listen(pauseButton, 'click', () => chase.paused ? resume() : pause());
    listen(gentleButton, 'click', () => {
      chase.gentle = !chase.gentle; gentleButton.setAttribute('aria-pressed', String(chase.gentle));
      gentleButton.textContent = chase.gentle ? 'Ohne Wegweiser' : 'Mit Wegweiser'; resume();
    });
    listen(cancelButton, 'click', () => finish(false));
    announce('0/2 gefangen · H und O rennen los. Fina startet unten links im Markt.');
    canvas.focus({ preventScroll: true }); if (doc.hidden) pause();
    draw(); frameId = win.requestAnimationFrame(frame); return promise;
  }

  function roundBox(x, y, width, height, radius, fill, stroke) {
    ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }
  function cloud(x, y, radius, opacity = 1) {
    ctx.save(); ctx.globalAlpha = opacity; ctx.fillStyle = '#eef8ff'; ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * .38, 0, 0, Math.PI * 2);
    ctx.ellipse(x - radius * .35, y - radius * .19, radius * .42, radius * .40, 0, 0, Math.PI * 2);
    ctx.ellipse(x + radius * .18, y - radius * .24, radius * .46, radius * .48, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.restore();
  }
  function character(moving, board) {
    if (moving.caught) return;
    const point = chasePosition(moving), tile = board.tile, art = ACTOR_ART[moving.id];
    const x = board.x + (point.x + .5) * tile, y = board.y + (point.y + .5) * tile;
    const bob = !reducedMotion && !chase.paused && moving.to ? Math.sin(chase.elapsed * 23) * tile * .022 : 0;
    ctx.save(); ctx.shadowColor = '#142d49aa'; ctx.shadowBlur = 7; ctx.shadowOffsetY = 3;
    ctx.beginPath(); ctx.arc(x, y + bob, tile * .41, 0, Math.PI * 2);
    ctx.fillStyle = art.color; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.lineWidth = Math.max(2, tile * .05); ctx.strokeStyle = moving.id === 'fina' ? '#845329' : '#1d506f'; ctx.stroke();
    const picture = images[moving.id];
    if (picture?.complete && picture.naturalWidth > 0) {
      ctx.save(); ctx.beginPath(); ctx.arc(x, y + bob, tile * .35, 0, Math.PI * 2); ctx.clip();
      const [sx, sy, sw, sh] = art.crop;
      ctx.drawImage(picture, sx * picture.naturalWidth, sy * picture.naturalHeight, sw * picture.naturalWidth, sh * picture.naturalHeight,
        x - tile * .36, y - tile * .36 + bob, tile * .72, tile * .72);
      ctx.restore();
    }
    ctx.font = `bold ${Math.round(tile * .25)}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    roundBox(x - tile * .29, y + tile * .27, tile * .58, tile * .32, tile * .08, '#102e3b', art.color);
    ctx.fillStyle = '#fff4d5'; ctx.fillText(art.label, x, y + tile * .43);
    ctx.restore();
  }
  function stall(stall, board, index) {
    const tile = board.tile, x = board.x + stall.x * tile, y = board.y + stall.y * tile;
    const width = stall.width * tile, height = stall.height * tile, colors = ['#368daa', '#b27057', '#58609c', '#347f88'];
    ctx.save(); ctx.shadowColor = '#24485b66'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 5;
    roundBox(x + tile * .07, y + tile * .07, width - tile * .14, height - tile * .14, tile * .16, '#bce0ef', '#75aabf');
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    roundBox(x + tile * .15, y + tile * .2, width - tile * .3, height - tile * .37, tile * .09, '#e2c390', '#927457');
    const roofHeight = Math.min(height * .4, tile * .68);
    roundBox(x + tile * .03, y + tile * .02, width - tile * .06, roofHeight, tile * .13, colors[index % colors.length], '#edcd88');
    for (let stripe = 1; stripe < stall.width * 3; stripe += 2) {
      ctx.fillStyle = '#ecf0dcb3'; ctx.fillRect(x + stripe * tile / 3, y + tile * .06, tile / 3, roofHeight - tile * .08);
    }
    for (let item = 0; item < stall.width; item++) {
      const px = x + (item + .5) * tile, py = y + height * .7;
      if (stall.kind.includes('Kristall') && !stall.kind.includes('kekse')) {
        ctx.beginPath(); ctx.moveTo(px, py - tile * .20); ctx.lineTo(px + tile * .16, py);
        ctx.lineTo(px, py + tile * .14); ctx.lineTo(px - tile * .16, py); ctx.closePath();
        ctx.fillStyle = item % 2 ? '#c99ce4' : '#a5f0ed'; ctx.fill(); ctx.strokeStyle = '#477f9a'; ctx.stroke();
      } else if (stall.kind === 'Wolkenwolle') cloud(px, py, tile * .23);
      else {
        ctx.fillStyle = stall.kind === 'Kristallkekse' ? '#e8ab4c' : '#f3fcff';
        ctx.beginPath(); ctx.arc(px, py, tile * .16, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#92b4be'; ctx.stroke();
      }
    }
    ctx.restore();
  }
  function draw() {
    const width = canvas.width, height = canvas.height, board = layout(), tile = board.tile;
    ctx.save();
    const sky = ctx.createLinearGradient(0, 0, 0, height); sky.addColorStop(0, '#325c7b'); sky.addColorStop(1, '#accdde');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 12; i++) cloud((i * 173 + 61) % width, height * (.2 + (i % 4) * .22), width * .11, .20);
    roundBox(board.x, board.y, 17 * tile, 13 * tile, tile * .55, '#a8cddd', '#e4c68c');
    for (let y = 0; y < chase.maze.length; y++) for (let x = 0; x < chase.maze[0].length; x++) {
      if (chaseWalkable(chase, x, y)) {
        ctx.fillStyle = (x + y) % 2 ? '#d8e9ed' : '#e3eff1'; ctx.fillRect(board.x + x * tile, board.y + y * tile, tile + .5, tile + .5);
        ctx.strokeStyle = '#bfd9de'; ctx.lineWidth = .7;
        ctx.strokeRect(board.x + x * tile + 2, board.y + y * tile + 2, tile - 4, tile - 4);
      } else if (x === 0 || x === 16 || y === 0 || y === 12) {
        cloud(board.x + (x + .5) * tile, board.y + (y + .5) * tile, tile * .47, .9);
      }
    }
    if (chase.gentle) {
      const target = chase.targets.find(moving => !moving.caught);
      const path = target ? chasePath(chase, chase.player.to ?? chase.player, target.to ?? target) : [];
      ctx.strokeStyle = '#ca934a'; ctx.lineWidth = Math.max(2, tile * .08); ctx.lineCap = 'round'; ctx.setLineDash([tile * .1, tile * .15]);
      ctx.beginPath(); path.forEach((point, i) => {
        const x = board.x + (point.x + .5) * tile, y = board.y + (point.y + .5) * tile;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }); ctx.stroke(); ctx.setLineDash([]);
    }
    MARKET_STALLS.forEach((item, i) => stall(item, board, i));
    for (const target of chase.targets) character(target, board);
    character(chase.player, board);
    ctx.textAlign = 'center'; ctx.fillStyle = '#f8e8c3'; ctx.font = `600 ${Math.round(height * .033)}px Georgia, serif`;
    ctx.fillText('DER WOLKENMARKT', board.x + tile * 8.5, height * .077);
    if (chase.paused) {
      ctx.fillStyle = '#102b4399'; ctx.fillRect(board.x, board.y, tile * 17, tile * 13);
      ctx.fillStyle = '#fff3d2'; ctx.font = `600 ${Math.round(height * .04)}px Georgia, serif`;
      ctx.fillText('Verschnaufpause', board.x + tile * 8.5, board.y + tile * 6.5);
    }
    ctx.restore();
  }
  return { start, cancel: () => finish(false), pause, resume, draw, destroy: () => finish(false),
    get active() { return active; }, get state() { return chase; } };
}
