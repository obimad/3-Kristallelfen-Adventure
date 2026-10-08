// Pure flight rules. Coordinates describe the pilot's plane: x/y in [-1, 1],
// depth 8 at the horizon and depth 1 when an obstacle reaches the pilot.
export const FLIGHT_DURATION = 35;
export const MAX_FLIGHT_DT = .05;
const FORWARD_SPEED = 1.2;
const clamp = (number, minimum, maximum) => Math.min(maximum, Math.max(minimum, number));
const axis = number => Number.isFinite(number) ? clamp(number, -1, 1) : 0;

export function createFlight({ duration = FLIGHT_DURATION, seed = 731 } = {}) {
  const seconds = Number.isFinite(duration) && duration > 0 ? duration : FLIGHT_DURATION;
  let randomSeed = seed >>> 0;
  const random = () => { randomSeed = (Math.imul(randomSeed, 1664525) + 1013904223) >>> 0; return randomSeed / 4294967296; };
  const schedule = [];
  for (let spawn = .75, index = 0; spawn < seconds - 6.3; spawn += 2.7, index++) {
    const type = index % 3 === 2 ? 'birds' : 'cloud';
    schedule.push({ id: `flight-${index}`, spawn, type, x: (random() - .5) * 1.6, y: (random() - .5) * 1.4,
      z: 8, radiusX: type === 'cloud' ? .32 : .36, radiusY: type === 'cloud' ? .36 : .18, passed: false });
  }
  return { duration: seconds, elapsed: 0, player: { x: 0, y: 0 }, objects: [], schedule,
    hits: 0, recovery: 0, shield: 0, paused: false, gentle: false, status: 'flying' };
}

export function setFlightPaused(flight, paused = true) {
  if (flight.status === 'flying') flight.paused = Boolean(paused);
}

export function projectFlightObject(object, width, height) {
  const scale = 1 / Math.max(.35, Number.isFinite(object.z) ? object.z : 8);
  return { x: width * (.5 + object.x * .27 * scale), y: height * (.32 + (.45 + object.y * .12) * scale),
    radiusX: object.radiusX * width * .27 * scale, radiusY: object.radiusY * height * .12 * scale, scale };
}

export function flightCollision(player, object) {
  if (object.passed || object.z < .85 || object.z > 1.12) return false;
  // Small torso ellipse: decorative mechanical wing tips do not cause hits.
  const dx = (player.x - object.x) / (object.radiusX + .085);
  const dy = (player.y - object.y) / (object.radiusY + .105);
  return dx * dx + dy * dy < 1;
}

export function advanceFlight(flight, input = {}, seconds = 0) {
  if (flight.status !== 'flying' || flight.paused || !Number.isFinite(seconds) || seconds <= 0) return [];
  const dt = Math.min(MAX_FLIGHT_DT, seconds), events = [];
  flight.shield = Math.max(0, flight.shield - dt);
  if (flight.recovery > 0) { flight.recovery = Math.max(0, flight.recovery - dt); return events; }
  let x = axis(input.x), y = axis(input.y);
  const distance = Math.hypot(x, y);
  if (distance > 1) { x /= distance; y /= distance; }
  flight.player.x = clamp(flight.player.x + x * dt * 1.25, -1, 1);
  flight.player.y = clamp(flight.player.y + y * dt * 1.25, -1, 1);
  flight.elapsed = Math.min(flight.duration, flight.elapsed + dt);
  for (const object of flight.objects) object.z -= FORWARD_SPEED * dt;
  while (flight.schedule.length && flight.schedule[0].spawn <= flight.elapsed) {
    const object = flight.schedule.shift();
    flight.objects.push({ ...object, z: 8 - Math.max(0, flight.elapsed - object.spawn) * FORWARD_SPEED });
  }
  for (const object of flight.objects) {
    if (flightCollision(flight.player, object)) {
      object.passed = true;
      if (!flight.gentle && flight.shield === 0) {
        flight.hits++;
        flight.shield = 2.4;
        flight.recovery = .55;
        events.push({ type: 'hit', obstacle: object.type, hits: flight.hits });
      }
    }
    if (object.z < .85) object.passed = true;
  }
  flight.objects = flight.objects.filter(object => object.z > .4);
  if (flight.elapsed >= flight.duration) {
    flight.status = 'complete';
    events.push({ type: 'complete', completed: true, hits: flight.hits });
  }
  return events;
}
