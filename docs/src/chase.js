// Market lanes form a connected grid. Solid stall rectangles are never walkable.
export const MARKET_STALLS = [
  { x: 3, y: 2, width: 2, height: 2, kind: 'Kristalle' },
  { x: 7, y: 2, width: 2, height: 2, kind: 'Schnee' },
  { x: 11, y: 2, width: 3, height: 2, kind: 'Kristallkekse' },
  { x: 3, y: 6, width: 3, height: 2, kind: 'Eisfiguren' },
  { x: 8, y: 5, width: 2, height: 3, kind: 'Kristalle' },
  { x: 12, y: 6, width: 2, height: 2, kind: 'Wolkenwolle' },
  { x: 5, y: 10, width: 3, height: 1, kind: 'Schnee' },
  { x: 11, y: 10, width: 2, height: 1, kind: 'Eisfiguren' },
];
export const CHASE_DIRECTIONS = Object.freeze({ up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] });
const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
const tileId = (x, y) => `${x},${y}`;
const actor = (id, x, y) => ({ id, x, y, to: null, progress: 0, direction: null, caught: false });

export function createChase() {
  const maze = Array.from({ length: 13 }, (_, y) => Array.from({ length: 17 }, (_, x) =>
    x === 0 || x === 16 || y === 0 || y === 12 || MARKET_STALLS.some(stall =>
      x >= stall.x && x < stall.x + stall.width && y >= stall.y && y < stall.y + stall.height) ? 1 : 0));
  return { maze, player: actor('fina', 1, 11), targets: [actor('h', 15, 1), actor('o', 15, 9)],
    caught: [], elapsed: 0, paused: false, gentle: false, status: 'chasing', wanted: null };
}

export function chaseWalkable(chase, x, y) {
  return Number.isInteger(x) && Number.isInteger(y) && chase.maze[y]?.[x] === 0;
}

export function chasePosition(actor) {
  return actor.to ? { x: actor.x + (actor.to.x - actor.x) * actor.progress,
    y: actor.y + (actor.to.y - actor.y) * actor.progress } : { x: actor.x, y: actor.y };
}

function neighbours(chase, tile) {
  return Object.entries(CHASE_DIRECTIONS).flatMap(([direction, [dx, dy]]) => {
    const x = tile.x + dx, y = tile.y + dy;
    return chaseWalkable(chase, x, y) ? [{ x, y, direction }] : [];
  });
}

export function chasePath(chase, from, to) {
  const start = { x: Math.round(from.x), y: Math.round(from.y) }, end = { x: Math.round(to.x), y: Math.round(to.y) };
  if (!chaseWalkable(chase, start.x, start.y) || !chaseWalkable(chase, end.x, end.y)) return [];
  const queue = [start], previous = new Map([[tileId(start.x, start.y), null]]);
  for (let index = 0; index < queue.length; index++) {
    const tile = queue[index];
    if (tile.x === end.x && tile.y === end.y) {
      const path = [];
      for (let current = tile; current; current = previous.get(tileId(current.x, current.y))) path.push({ x: current.x, y: current.y });
      return path.reverse();
    }
    for (const next of neighbours(chase, tile)) {
      const id = tileId(next.x, next.y);
      if (!previous.has(id)) { previous.set(id, tile); queue.push(next); }
    }
  }
  return [];
}

export function setChasePaused(chase, paused = true) {
  if (chase.status === 'chasing') chase.paused = Boolean(paused);
}

function moveActor(chase, moving, distance, choose) {
  let remaining = distance;
  while (remaining > 1e-8) {
    if (!moving.to) {
      const direction = choose();
      const delta = CHASE_DIRECTIONS[direction];
      if (!delta || !chaseWalkable(chase, moving.x + delta[0], moving.y + delta[1])) break;
      moving.direction = direction;
      moving.to = { x: moving.x + delta[0], y: moving.y + delta[1] };
      moving.progress = 0;
    }
    const travel = Math.min(1 - moving.progress, remaining);
    moving.progress += travel; remaining -= travel;
    if (moving.progress >= 1 - 1e-8) {
      moving.x = moving.to.x; moving.y = moving.to.y; moving.to = null; moving.progress = 0;
    }
  }
}

function fleeingDirection(chase, target) {
  const playerTile = chase.player.to ?? chase.player;
  const choices = neighbours(chase, target).map(tile => ({ ...tile,
    score: chasePath(chase, tile, playerTile).length - (tile.direction === opposite[target.direction] ? .35 : 0) }));
  choices.sort((a, b) => b.score - a.score);
  return choices[0]?.direction;
}

function catchTargets(chase, events) {
  const player = chasePosition(chase.player);
  for (const target of chase.targets) {
    const position = chasePosition(target);
    if (!target.caught && Math.hypot(position.x - player.x, position.y - player.y) <= .48) {
      target.caught = true; target.to = null; target.progress = 0;
      chase.caught.push(target.id); events.push({ type: 'caught', target: target.id, count: chase.caught.length });
    }
  }
  if (chase.targets.length === 2 && chase.caught.length === 2) {
    chase.status = 'complete'; events.push({ type: 'complete', completed: true, caught: [...chase.caught], elapsed: chase.elapsed });
  }
}

export function advanceChase(chase, input = {}, seconds = 0) {
  if (chase.status !== 'chasing' || chase.paused || !Number.isFinite(seconds) || seconds <= 0) return [];
  const dt = Math.min(.05, seconds), events = [];
  if (Object.hasOwn(CHASE_DIRECTIONS, input.direction)) chase.wanted = input.direction;
  chase.elapsed += dt;
  catchTargets(chase, events);
  if (chase.status === 'complete') return events;
  moveActor(chase, chase.player, dt * 5.5, () => {
    const requested = CHASE_DIRECTIONS[chase.wanted];
    if (requested && chaseWalkable(chase, chase.player.x + requested[0], chase.player.y + requested[1])) return chase.wanted;
    return chase.player.direction;
  });
  for (const target of chase.targets) if (!target.caught) moveActor(chase, target, dt * (chase.gentle ? 1.3 : 2.8), () => fleeingDirection(chase, target));
  catchTargets(chase, events);
  return events;
}
