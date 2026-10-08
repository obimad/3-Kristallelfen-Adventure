import { SCENES, STORY_ITEMS } from './story-data.js';

export function createCampaign(scenes = SCENES) {
  return {
    sceneId: scenes[0]?.id ?? null, inventory: ['bag', 'crystal', 'letter'],
    flags: [], companions: ['fina'], viewed: [], journal: [],
    completedScenes: [], ended: false, pending: null,
  };
}

export function getScene(state, scenes = SCENES) {
  return scenes.find(scene => scene.id === state?.sceneId) ?? null;
}

const key = (scene, hotspot) => `${scene.id}:${hotspot.id}`;
const done = (state, scene, hotspot) => state.viewed.includes(key(scene, hotspot));
const permitted = (state, hotspot) =>
  (hotspot.requiresFlags ?? []).every(id => state.flags.includes(id)) &&
  (hotspot.requiresItems ?? []).every(id => state.inventory.includes(id));
const append = (target, additions = []) => {
  for (const id of additions) if (!target.includes(id)) target.push(id);
};
const message = (title, text, hotspotId) => ({type: 'message', title, text, hotspotId});
const repeat = hotspot => hotspot.repeatText ?? `${hotspot.name} hast du bereits abgeschlossen.`;
const blocked = hotspot => hotspot.blockedText ?? `Für „${hotspot.name}“ fehlt noch ein vorheriger Schritt oder ein Gegenstand.`;

function applyEffects(state, scene, hotspot) {
  append(state.flags, hotspot.setFlags);
  state.inventory = state.inventory.filter(id => !(hotspot.removeItems ?? []).includes(id));
  append(state.inventory, [...(hotspot.giveItems ?? []), ...(hotspot.item ? [hotspot.item] : [])]);
  state.companions = state.companions.filter(id => !(hotspot.removeCompanions ?? []).includes(id));
  append(state.companions, hotspot.addCompanions);
  append(state.viewed, [key(scene, hotspot)]);
  append(state.journal, [hotspot.journalText ?? `${scene.title}: ${hotspot.name} abgeschlossen.`]);
}

export function requestAction(state, hotspotId, scenes = SCENES) {
  const scene = getScene(state, scenes);
  if (!scene) return message('Abenteuer', 'Diese Szene ist nicht verfügbar.', hotspotId);
  if (state.ended) return {type: 'ending', title: scene.title, text: 'Die Geschichte ist abgeschlossen.', hotspotId};
  const hotspot = scene.hotspots.find(entry => entry.id === hotspotId);
  if (!hotspot) return message(scene.title, 'Dieses Ziel ist hier nicht erreichbar.', hotspotId);
  if (state.pending) return message(hotspot.name, 'Lies das Gespräch zu Ende oder schließe es zuerst.', hotspotId);
  // Completed puzzles can consume their requirements, so repetition precedes the gate.
  if (done(state, scene, hotspot)) return message(hotspot.name, repeat(hotspot), hotspotId);
  if (!permitted(state, hotspot)) return message(hotspot.name, blocked(hotspot), hotspotId);
  if (hotspot.type === 'puzzle') return {
    type: 'puzzle', title: hotspot.name, text: hotspot.puzzle.question,
    puzzle: hotspot.puzzle, hotspotId,
  };
  if (hotspot.type === 'exit') {
    const index = scenes.findIndex(entry => entry.id === scene.id);
    const nextId = hotspot.nextScene ?? scenes[index + 1]?.id;
    const next = nextId ? scenes.find(entry => entry.id === nextId) : null;
    if (nextId && !next) return message(hotspot.name, 'Das nächste Kapitel ist nicht verfügbar.', hotspotId);
    applyEffects(state, scene, hotspot);
    append(state.completedScenes, [scene.id]);
    if (!next) {
      state.ended = true;
      return {
        type: 'ending', title: scene.title,
        text: hotspot.description ?? (hotspot.pages?.length ? hotspot.pages.map(page => page.text).join('\n\n') : 'Die Geschichte ist abgeschlossen.'),
        pages: hotspot.pages ?? [], hotspotId,
      };
    }
    state.sceneId = next.id;
    return {type: 'scene', title: next.title, text: next.subtitle ?? '', hotspotId};
  }
  if (hotspot.type !== 'take' && hotspot.pages?.length) {
    state.pending = {sceneId: scene.id, hotspotId};
    return {type: 'dialog', title: hotspot.name, text: '', pages: hotspot.pages, hotspotId};
  }
  applyEffects(state, scene, hotspot);
  return message(hotspot.name, hotspot.description ?? hotspot.pages?.map(page => page.text).join('\n\n') ?? (hotspot.type === 'take' ? `${hotspot.name} ist nun in deiner Tasche.` : 'Du hast diesen Ort untersucht.'), hotspotId);
}

// The controller calls this only when the final page has been acknowledged.
export function finishDialog(state, scenes = SCENES) {
  const pending = state.pending;
  if (!pending) return false;
  state.pending = null;
  const scene = getScene(state, scenes);
  const hotspot = scene?.hotspots.find(entry => entry.id === pending.hotspotId);
  if (pending.sceneId !== scene?.id || !hotspot?.pages?.length || done(state, scene, hotspot) || !permitted(state, hotspot)) return false;
  applyEffects(state, scene, hotspot);
  return true;
}

export function cancelDialog(state) {
  state.pending = null;
}

export function solvePuzzle(state, hotspotId, answers, scenes = SCENES) {
  const scene = getScene(state, scenes);
  const hotspot = scene?.hotspots.find(entry => entry.id === hotspotId);
  if (!hotspot || hotspot.type !== 'puzzle' || state.ended) return {success: false, message: 'Dieses Rätsel ist hier nicht erreichbar.'};
  if (done(state, scene, hotspot)) return {success: true, message: repeat(hotspot)};
  if (state.pending) return {success: false, message: 'Schließe zuerst das Gespräch.'};
  if (!permitted(state, hotspot)) return {success: false, message: blocked(hotspot)};
  const puzzle = hotspot.puzzle;
  const solution = puzzle.solution;
  const validAnswers = Array.isArray(answers) && answers.every(id => typeof id === 'string') && answers.length === solution.length;
  const correct = validAnswers && (puzzle.kind === 'combine'
    ? [...answers].sort().every((id, i) => id === [...solution].sort()[i])
    : answers.every((id, i) => id === solution[i]));
  if (!correct) return {success: false, message: puzzle.failureText ?? 'Das passt noch nicht. Versuche es erneut.'};
  applyEffects(state, scene, hotspot);
  return {success: true, message: puzzle.successText ?? 'Das Rätsel ist gelöst.'};
}

export function nextHint(state, scenes = SCENES) {
  if (state.ended) return 'Die Geschichte ist abgeschlossen. Du kannst die Kapitel im Journal noch einmal ansehen.';
  const scene = getScene(state, scenes);
  if (!scene) return 'Starte die Geschichte am Anfang.';
  if (state.pending) return 'Lies das geöffnete Gespräch bis zur letzten Seite.';
  const hotspot = scene.hotspots.find(entry => !done(state, scene, entry) && permitted(state, entry));
  if (hotspot) return hotspot.hint ?? `Als Nächstes: ${hotspot.name}.${hotspot.type === 'puzzle' ? ` ${hotspot.puzzle.question}` : ''}`;
  const waiting = scene.hotspots.find(entry => !done(state, scene, entry));
  return waiting ? blocked(waiting) : 'Alle Aufgaben an diesem Ort sind erledigt.';
}

function sameArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
function sameSet(left, right) {
  return left.length === right.length && left.every(value => right.includes(value));
}

export function restoreCampaign(raw, scenes = SCENES, items = STORY_ITEMS) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || typeof raw.ended !== 'boolean') return null;
  if (!scenes.some(scene => scene.id === raw.sceneId)) return null;
  const arrayFields = ['inventory', 'flags', 'companions', 'viewed', 'journal', 'completedScenes'];
  if (!arrayFields.every(field => Array.isArray(raw[field]) && raw[field].every(id => typeof id === 'string') && new Set(raw[field]).size === raw[field].length)) return null;
  const allHotspots = scenes.flatMap(scene => scene.hotspots);
  const knownItems = new Set(['bag', 'crystal', 'letter', ...Object.keys(items), ...allHotspots.flatMap(h => [...(h.giveItems ?? []), ...(h.removeItems ?? []), ...(h.item ? [h.item] : [])])]);
  const knownFlags = new Set(allHotspots.flatMap(h => [...(h.setFlags ?? []), ...(h.requiresFlags ?? [])]));
  const knownCompanions = new Set(['fina', ...allHotspots.flatMap(h => [...(h.addCompanions ?? []), ...(h.removeCompanions ?? [])])]);
  if (!raw.inventory.every(id => knownItems.has(id)) || !raw.flags.every(id => knownFlags.has(id)) || !raw.companions.every(id => knownCompanions.has(id))) return null;
  // Replay acknowledged actions. A forged flag, item, chapter or companion cannot
  // survive merely because its identifier exists somewhere later in the book.
  const restored = createCampaign(scenes);
  for (const actionKey of raw.viewed) {
    const scene = getScene(restored, scenes);
    const hotspot = scene?.hotspots.find(entry => key(scene, entry) === actionKey);
    if (!hotspot || !permitted(restored, hotspot) || restored.ended) return null;
    if (hotspot.type === 'puzzle') {
      if (!solvePuzzle(restored, hotspot.id, hotspot.puzzle.solution, scenes).success) return null;
    } else {
      const result = requestAction(restored, hotspot.id, scenes);
      if (result.type === 'dialog' && !finishDialog(restored, scenes)) return null;
    }
    if (!done(restored, scene, hotspot)) return null;
  }
  if (restored.sceneId !== raw.sceneId || restored.ended !== raw.ended ||
      !sameArray(restored.completedScenes, raw.completedScenes) || !sameArray(restored.journal, raw.journal) ||
      !['inventory', 'flags', 'companions'].every(field => sameSet(restored[field], raw[field]))) return null;
  return restored;
}
