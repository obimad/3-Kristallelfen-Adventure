// Kurze Spieladaption: Das Rätsel und seine Dialoge sind keine Buchzitate.
export const ABILITIES = {
  icy: {
    name: 'Wachenfrost',
    description: 'Icy friert die Wache für diese und zwei weitere Handlungen ein. Fina beobachtet dabei den Frost.',
  },
  powdery: {
    name: 'Schneeschleier',
    description: 'Powdery hüllt die Gruppe für diese und zwei weitere Handlungen in Schnee. Die Wache verliert die Sicht.',
  },
  cold: {
    name: 'Wasserfrost',
    description: 'Cold friert die Wasserzufuhr ein und schützt diese und die nächste Handlung. Fina beobachtet den Frost.',
  },
  fina: {
    name: 'Gelernter Frostimpuls',
    description: 'Nach Cold oder Icy öffnet Fina bei gestopptem Wasser das Tor mit Frost. Ihr Impuls schützt diese Handlung.',
  },
};

export function createBattle() {
  return {
    heroes: ['icy', 'powdery', 'cold', 'fina'].map(id => ({id, hp: 6})),
    round: 1,
    status: 'playing',
    waterFlow: true,
    gateOpen: false,
    coverTurns: 0,
    guardFrozenTurns: 0,
    shieldTurns: 0,
    learnedFrost: false,
    pressure: 0,
    retries: 0,
    last: null,
  };
}

const distracted = s => s.coverTurns > 0 || s.guardFrozenTurns > 0;
const protectedGroup = s => distracted(s) || s.shieldTurns > 0;

export function getBattleHint(s) {
  if (s.status === 'won') return 'Geschafft! Alle vier sind draußen. Mit „Neu starten“ kannst du einen anderen Fluchtweg ausprobieren.';
  if (s.waterFlow) return 'Stoppe zuerst das Wasser: Cold kann es einfrieren. Oder lenke die Wache mit Powderys Schnee oder Icys Frost ab und drehe dann das Ventil zu.';
  if (!s.gateOpen) {
    if (s.learnedFrost) return 'Das Wasser steht. Fina hat Frost beobachtet und kann das Tor öffnen. Mit Powderys Schnee oder Icys Frost lässt es sich auch von Hand öffnen.';
    return 'Das Wasser steht. Öffne das Tor unter Powderys Sichtschutz oder bei eingefrorener Wache. Fina lernt ihren Frostimpuls von Cold oder Icy.';
  }
  if (protectedGroup(s)) return 'Tor offen, Wasser gestoppt und die Gruppe geschützt: Jetzt können alle gemeinsam fliehen!';
  return 'Der Weg ist frei, aber die Wache sieht euch. Powderys Schnee, Icys Wachenfrost oder Colds Schutz geben euch Zeit zur Flucht.';
}

/** Returns whether a turn was resolved; action success is recorded in last.success. */
export function act(s, id, action) {
  if (s.status !== 'playing' || !s.heroes.some(h => h.id === id)
      || !['ability', 'valve', 'gate', 'escape'].includes(action)) return false;

  const last = {hero: id, action, success: false, blocked: false, restarted: false, message: ''};
  if (action === 'valve' && !s.waterFlow) {
    last.message = 'Das Ventil ist bereits zu. Noch fester wird es nicht – kümmert euch jetzt um das Tor!';
    s.last = last;
    return false;
  }
  if ((action === 'gate' || (action === 'ability' && id === 'fina')) && s.gateOpen) {
    last.message = 'Das Tor ist schon offen. Es braucht keinen zweiten Türöffner – sucht Schutz und flieht!';
    s.last = last;
    return false;
  }

  if (action === 'ability') {
    if (id === 'cold') {
      s.waterFlow = false;
      s.shieldTurns = 2;
      s.learnedFrost = true;
      last.success = true;
      last.message = 'Cold friert die Wasserzufuhr ein und schützt die Gruppe. Fina schaut genau hin: Frost kann mehr als kalte Füße!';
    } else if (id === 'powdery') {
      s.coverTurns = 3;
      last.success = true;
      last.message = 'Powderys Schneeschleier verdeckt die Gruppe. Die Wache sucht vier Elfen und findet nur Schneeflocken. Zeit für Ventil, Tor oder Flucht!';
    } else if (id === 'icy') {
      s.guardFrozenTurns = 3;
      s.learnedFrost = true;
      last.success = true;
      last.message = 'Icy friert die Wache fest. Ihre Pause ist unfreiwillig, aber sehr praktisch! Fina beobachtet den Frost; Ventil und Tor sind jetzt erreichbar.';
    } else if (!s.learnedFrost) {
      last.message = 'Fina kennt den Frostimpuls noch nicht. Lass sie zuerst Cold oder Icy beobachten – ohne Vorbild wird das Tor höchstens angehaucht.';
    } else if (s.waterFlow) {
      last.message = 'Fina kennt den Frost, aber das Wasser drückt noch gegen das Tor. Stoppt zuerst die Wasserzufuhr am Ventil.';
    } else {
      s.gateOpen = true;
      s.shieldTurns = Math.max(s.shieldTurns, 1);
      last.success = true;
      last.message = 'Fina öffnet das Tor mit ihrem gelernten Frostimpuls und schützt diese Handlung. Jetzt fehlt nur Schutz für die gemeinsame Flucht!';
    }
  } else if (action === 'valve') {
    if (id === 'cold') {
      s.waterFlow = false;
      s.shieldTurns = 2;
      s.learnedFrost = true;
      last.success = true;
      last.message = 'Cold friert das Ventil direkt ein. Das Wasser steht, die Gruppe ist kurz geschützt und Fina hat den Frost beobachtet.';
    } else if (distracted(s)) {
      s.waterFlow = false;
      last.success = true;
      last.message = 'Das Ventil ist zugedreht. Endlich trockene Füße! Öffnet jetzt das Tor, solange die Wache beschäftigt ist.';
    } else {
      last.message = 'Die Wache versperrt das Ventil. Powderys Sichtschutz oder Icys Wachenfrost helfen beim Zudrehen; Cold kann es direkt einfrieren.';
    }
  } else if (action === 'gate') {
    if (s.waterFlow) {
      last.message = 'Das Wasser drückt gegen das Tor – Schieben macht nur nasse Ärmel. Stoppt zuerst die Wasserzufuhr am Ventil.';
    } else if (!distracted(s)) {
      last.message = 'Die Wache sieht jeden Griff zum Tor. Nutzt Powderys Sichtschutz oder Icys Frost. Fina kann nach beobachtetem Frost ihren Impuls einsetzen.';
    } else {
      s.gateOpen = true;
      last.success = true;
      last.message = 'Das Tor schwingt auf! Sorgt für Schutz bei der nächsten Handlung und flieht gemeinsam.';
    }
  } else if (!s.gateOpen) {
    last.message = 'Das Tor ist noch zu. Vier Elfen passen leider nicht durchs Schlüsselloch: Stoppt das Wasser und öffnet das Tor.';
  } else if (s.waterFlow) {
    last.message = 'Der Wasserstrom blockiert die Flucht. Erst die Wasserzufuhr am Ventil stoppen – Schwimmflügel gehören nicht zum Plan!';
  } else if (!protectedGroup(s)) {
    last.message = 'Die Wache sieht euch am offenen Tor. Holt euch Powderys Sichtschutz, Icys Frost oder Colds Schutz und versucht dann die Flucht.';
  } else {
    s.status = 'won';
    last.success = true;
    last.message = 'Alle vier fliehen durch das offene Tor! Die Wache bleibt mit dem nassen Fußboden zurück. Kampfprobe geschafft!';
    s.last = last;
    return true;
  }

  last.blocked = protectedGroup(s);
  if (!last.blocked) {
    s.pressure++;
    last.message += ` Die Wache kommt näher (${s.pressure}/4 Alarm).`;
  }
  for (const timer of ['coverTurns', 'guardFrozenTurns', 'shieldTurns']) {
    s[timer] = Math.max(0, s[timer] - 1);
  }
  s.round++;

  if (s.pressure >= 4) {
    const learnedFrost = s.learnedFrost;
    const retries = s.retries + 1;
    Object.assign(s, createBattle(), {learnedFrost, retries});
    last.restarted = true;
    last.message += ' Übungsalarm! Die kurze Probe startet neu. Euer Frostwissen bleibt erhalten. Probiert zuerst Sichtschutz oder Frost.';
  }
  s.last = last;
  return true;
}
