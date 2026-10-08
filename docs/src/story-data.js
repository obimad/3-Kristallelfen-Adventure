// Eigenständige Spieladaption der Romanhandlung. Keine wörtlichen Buchzitate.
// Kleine Ordnungs-, Auswahl- und Inventarrätsel sind ausdrücklich Spieladaptionen.
// Kämpfe werden vorläufig erzählt: keine Gesundheit, Runden oder Zeitlimits.
export const STORY_ITEMS = {
  bag: { name: 'Reisetasche', icon: '♧', description: 'Proviant aus Farbenquell und Platz für Erinnerungen.' },
  crystal: { name: 'Silbas Kristall', icon: '◈', description: 'Der Kristall von Finas verschwundener Mutter. Sie würde ihn niemals freiwillig ablegen.' },
  letter: { name: 'Coloridas Empfehlung', icon: '✉', description: 'Ein Empfehlungsschreiben für Meisterin Aria.' },
  ownCrystal: { name: 'Finas Kristall', icon: '◇', description: 'Finas eigener Schmuckkristall. Mit ihm kann sie die Wolkensegler rufen; er ist nicht ihre Ringwaffe.' },
  ring: { name: 'Finas Ringwaffe', icon: '◯', description: 'Genau ein eisblauer Kampfring. Er leuchtet nur, wenn Fina ihn aktiv benutzt.' },
  sand: { name: 'Sandkornprobe', icon: '⁙', description: 'Ein winziges Sandkorn aus dem Wind. In der Welt der Elfen hilft es jungen Schneekristallen beim Wachsen.' },
  letterRemains: { name: 'Ruiniertes Schreiben', icon: '✉', description: 'Coloridas Empfehlung ist vom Wasser zerstört. Die Geschichte dahinter lässt sich Aria noch erzählen.' },
  appointmentCold: { name: 'Colds Duelltermin', icon: '◷', description: 'Lichtmitte, Wolkenhain. Cold will Fina wegen des Zusammenstoßes sprechen.' },
  appointmentPowdery: { name: 'Powderys Duelltermin', icon: '◷', description: 'Kurz nach Lichtmitte, Wolkenhain. Anlass: ein sehr beleidigter Mantel.' },
  appointmentIcy: { name: 'Icys Duelltermin', icon: '◷', description: 'Vor Lichtmitte, Wolkenhain. Eine unterbrochene Lesung hat Folgen.' },
  streamPlan: { name: 'Schleusenfolge', icon: '≋', description: 'Erst den Sammelstrom öffnen, dann die Flocken sortieren, zuletzt die Kristallrutsche freigeben.' },
  novice: { name: 'Anwärterinnenzeichen', icon: '✧', description: 'Fina darf bei den Kristallelfen lernen. Verantwortung beginnt vor dem ersten Titel.' },
  flakeCore: { name: 'Flockenmitte', icon: '⬡', description: 'Die sechseckige Mitte eines Übungsmodells aus Chrystels Werkstatt.' },
  flakeArms: { name: 'Sechs Modellarme', icon: '❄', description: 'Sechs gleiche Arme für das Übungsmodell. Das sind keine zusätzlichen Ringwaffen.' },
  flakeModel: { name: 'Sechszackiges Modell', icon: '❄', description: 'Ein symmetrisches Schneeflockenmodell. Chrystel hat es geprüft; Christi kann damit die Kartenfassung lösen.' },
  routeMap: { name: 'Wolkenwegskizze', icon: '▧', description: 'Christis Route: Kartentür, Mondtaugang, Blitzkutschen-Ställe, silbern beschlagene Tür.' },
  silverClue: { name: 'Icys Wegbeschreibung', icon: '➜', description: 'Neben den Blitzkutschen steht eine silbern beschlagene Tür. Sie führt zum Wasserverließ; kein Schloss knacken.' },
  vesselClue: { name: 'Gefäß ohne Anhänger', icon: '◉', description: 'Ein lebendig leuchtendes Wassergefäß hat keinen Kristallanhänger. Silbas Kristall befindet sich bei Fina.' },
  honor: { name: 'Vier Eisklingen', icon: '✦', description: 'Fina, Cold, Powdery und Icy gehören zusammen. Auch Mucks Mut und die Hilfe von H2O werden gewürdigt.' },
};

const character = (name, asset) => ({ name, asset, portrait: asset });
export const STORY_CHARACTERS = {
  fina: character('Fina', 'assets/fina.png'),
  muck: character('Muck', 'assets/muck.png'),
  cold: character('Cold', 'assets/cold.png'),
  powdery: character('Powdery', 'assets/powdery.png'),
  icy: character('Icy', 'assets/icy.png'),
  vivid: character('Vivid', 'assets/vivid.png'),
  colorida: character('Colorida', 'assets/colorida.png'),
  cirrus: character('Cirrus', 'assets/characters/cirrus.png'),
  kian: character('Kian', 'assets/characters/kian.png'),
  funkel: character('Funkel', 'assets/characters/funkel.png'),
  h: character('H', 'assets/characters/h.png'),
  two: character('2', 'assets/characters/two.png'),
  o: character('O', 'assets/characters/o.png'),
  chrysta: character('Chrysta', 'assets/characters/chrysta.png'),
  chrystel: character('Chrystel', 'assets/characters/chrystel.png'),
  christi: character('Christi', 'assets/characters/christi.png'),
  silba: character('Silba', 'assets/characters/silba.png'),
  regis: character('Lord Regis', 'assets/characters/regis.png'),
  aria: character('Meisterin Aria', 'assets/characters/aria.png'),
  kristallfee: character('Kristallfee', 'assets/characters/kristallfee.png'),
};

const say = (speaker, text) => ({ speaker, text });
const actor = (id, x, y = 765, height = 310) => ({ id, x, y, height });
const option = (id, label) => ({ id, label });
// Personen-Icons sitzen 40 Pixel über dem Kopf; Laufziele bleiben auf der Wolkenfläche.
const action = (id, name, type, x, pages = [], extra = {}) => ({
  id, name, type, x, y: 675, approach: { x: Math.min(1370, Math.max(220, x - 90)), y: 785 },
  verb: ({ talk: 'Sprechen', inspect: 'Untersuchen', take: 'Mitnehmen', puzzle: 'Lösen', encounter: 'Gemeinsam handeln', exit: 'Weitergehen' })[type],
  icon: ({ talk: '…', inspect: '⌕', take: '♧', puzzle: '✧', encounter: '◯', exit: '➜' })[type],
  pages, setFlags: [id], repeatText: 'Fina: Das ist erledigt. Ich behalte den Hinweis im Kopf.',
  blockedText: 'Fina: Mir fehlt noch ein Hinweis. Ich sollte zuerst mit den Anwesenden sprechen und mich umsehen.',
  ...extra,
});
const talk = (id, name, x, pages, extra = {}) => action(id, name, 'talk', x, pages, { y: 415, ...extra });
const inspect = (id, name, x, pages, extra = {}) => action(id, name, 'inspect', x, pages, extra);
const puzzle = (id, name, x, kind, question, options, solution, successText, failureText, extra = {}) => action(id, name, 'puzzle', x, [], {
  puzzle: { kind, question, options, solution, successText, failureText }, ...extra,
});
const exit = (id, name, requiresFlags, nextScene, extra = {}) => action(id, name, 'exit', 1410, [], {
  y: 650, approach: { x: 1340, y: 770 }, requiresFlags,
  ...(nextScene ? { nextScene } : {}),
  blockedText: 'Fina: Noch kann ich nicht weiter. Unser wichtigster Schritt hier ist noch offen.', ...extra,
});
const scene = (id, title, chapter, subtitle, background, music, actors, intro, hotspots) => ({
  id, title, chapter, subtitle, background: `assets/story/${background}.png`, music,
  spawn: { x: 265, y: 785 }, actors, intro, hotspots,
});

export const SCENES = [
  scene('cirrus', 'Cirrus und die Wolkenschäfchen', 2, 'Eine Reise beginnt mit einer Lücke', 'weide', '03', [actor('cirrus', 980)], [
    say('Fina', 'Farbenquell liegt hinter mir. Und vor mir liegt … sehr viel Himmel.'),
    say('Cirrus', 'Bleib auf der tragfähigen Wolke, Reisende! Meine Schäfchen sind neugierig, aber keine Brücken.'),
    say('Fina', 'Ich suche den Weg zur Himmelsstadt. Ich will Kristallelfe werden.'),
    say('Cirrus', 'Dann brauchst du heute mehr als gute Stiefel.'),
  ], [
    talk('cirrus_greeting', 'Cirrus kennenlernen', 980, [say('Cirrus', 'Ich züchte die Wolkenschäfchen. Manche bleiben klein; andere bringen später Regen, Hagel oder Schnee.'), say('Fina', 'Meine Mutter Silba war eine Kristallelfe. Seit einem Jahr ist sie verschwunden.'), say('Cirrus', 'Silbas Tochter? Dann bewahre ihren Kristall gut. Und sei in der Himmelsstadt vorsichtig; nicht jeder dient der Königin treu.')], { giveItems: ['ownCrystal', 'ring'], repeatText: 'Cirrus: Dein eigener Kristall ruft Hilfe. Silbas Kristall ist eine Erinnerung, die du gut hüten solltest.' }),
    inspect('cirrus_clouds', 'Wolkenschäfchen beobachten', 520, [say('Fina', 'Eines schaut aus wie ein winziger Gewitterkopf.'), say('Cirrus', 'Es hat zu viel Meerwasser genascht. Jetzt fühlt es sich außerordentlich erwachsen.')]),
    inspect('cirrus_gap', 'Unterbrochener Wolkenweg', 1260, [say('Fina', 'Hier endet der Weg. Die nächste Wolkenbank ist viel zu weit weg.'), say('Cirrus', 'Die Wolkendecke ist aufgerissen. Hinüberspringen wäre keine gute Reiseplanung.')]),
    talk('cirrus_call_hint', 'Nach einer Überfahrt fragen', 980, [say('Cirrus', 'Die Wolkensegler hören einen besonderen Ruf: Halte deinen eigenen Kristall hoch und rufe KUMULUS.'), say('Fina', 'Mein Kristall, Kumulus, Wolkensegler. Das merke ich mir.'), say('Cirrus', 'Gut. Das Schäfchen mit den großen Ohren hört auf Krümulus. Das wäre ein ganz anderer Ausflug.')], { requiresFlags: ['cirrus_greeting', 'cirrus_gap'] }),
    exit('cirrus_exit', 'Zur Rufplattform', ['cirrus_call_hint'], 'kumulus'),
  ]),
  scene('kumulus', 'Der Kumulus-Ruf', 2, 'Den richtigen Kristall und das richtige Wort wählen', 'skyport-winged', '04', [], [
    say('Fina', 'Cirrus hat mir alles erklärt. Jetzt muss ich es auch tun.'),
    say('Fina', 'Dort hinten gleiten die Wolkensegler. Hoffentlich reicht meine Stimme.'),
    say('Fina', 'Mutters Kristall bleibt sicher in der Tasche. Für den Ruf nehme ich meinen eigenen.'),
  ], [
    inspect('kumulus_wind', 'Luftströmung', 700, [say('Fina', 'Der Wind trägt die Geräusche zur offenen Himmelsseite. Hier kann man mich hören.')]),
    inspect('kumulus_own', 'Finas eigenen Kristall prüfen', 440, [say('Fina', 'Das ist mein Schmuckkristall. Die Ringwaffe bleibt eisblau und ruhig am Gürtel.'), say('Fina', 'Cirrus hat ausdrücklich den Kristall für den Ruf genannt.')], { requiresItems: ['ownCrystal'] }),
    puzzle('kumulus_signal', 'Wolkensegler rufen', 1050, 'combine', 'Was verbindest du, um die Wolkensegler zu rufen?', [option('ownCrystal', 'Finas eigenen Kristall hochhalten'), option('kumulus', 'KUMULUS rufen'), option('crystal', 'Silbas Kristall abgeben'), option('crumbs', 'KRÜMULUS flüstern')], ['ownCrystal', 'kumulus'], 'Dein Ruf wandert über die Wolken. Mechanische Flügel surren: Kian und die Wolkensegler landen auf der Plattform.', 'Fina: Ich glaube, das hört höchstens ein hungriges Wolkenschäfchen. Eigener Kristall und KUMULUS gehören zusammen.', { requiresFlags: ['kumulus_wind', 'kumulus_own'], requiresItems: ['ownCrystal'] }),
    exit('kumulus_exit', 'Kian begrüßen und einsteigen', ['kumulus_signal'], 'wolkenseglerflug'),
  ]),
  scene('wolkenseglerflug', 'Ein Flug mit Kian', 2, 'Der schnelle Weg durch den Himmel', 'flight', '05', [actor('kian', 1030)], [
    say('Kian', 'Eine Passagierin zur nächsten Wolkenstraße? Einverstanden!'),
    say('Fina', 'Du meinst, ich fliege mit diesen mechanischen Flügeln?'),
    say('Kian', 'Du fliegst mit mir. Der Karabiner kommt an deinen Ring, und du hältst dich gut fest.'),
    say('Fina', 'Mein Magen meldet sich bereits freiwillig zum Bodenpersonal.'),
  ], [
    talk('flight_briefing', 'Kians Flugeinweisung', 1030, [say('Kian', 'Zuerst befestige ich das Seil mit dem Karabiner an deinem Ring. Dann hältst du den Ring fest und bleibst dicht bei mir.'), say('Fina', 'Also erst sichern, dann festhalten, dann abheben.'), say('Kian', 'Genau. Wir sind schnell, aber beim Sichern gibt es keine Abkürzung.')]),
    inspect('flight_wings', 'Mechanische Flügel', 660, [say('Fina', 'Gelenke, Streben und eingefangener Wind. Hier steckt viel Handwerk drin.'), say('Kian', 'Und sehr viel Übung. Dein Ring muss für die Reise übrigens nicht zaubern.')]),
    puzzle('flight_secure', 'Für den Flug sichern', 860, 'order', 'In welcher Reihenfolge beginnt die Überfahrt?', [option('clip', 'Karabiner am Ring befestigen'), option('hold', 'Ring festhalten und an Kian lehnen'), option('launch', 'Gemeinsam abheben')], ['clip', 'hold', 'launch'], 'Klick! Du bist gesichert. Die Wolkensegler steigen auf, tauchen um eine Wolkenbank und tragen dich im Wind zur nächsten Straße.', 'Kian: Erst sichern. Sonst fliegt deine Reihenfolge schneller als du.', { requiresFlags: ['flight_briefing'], requiresItems: ['ring'] }),
    action('flight_landing', 'Mit Kian durch die Wolken fliegen', 'encounter', 1230, [say('Fina', 'Wir stehen wieder auf einer tragfähigen Wolke. Meine Knie wissen das noch nicht.'), say('Kian', 'Der Karabiner ist gelöst. Gute Reise zur Himmelsstadt!'), say('Fina', 'Danke, Kian. Beim nächsten Mal frage ich zuerst nach der gemütlichen Route.')], { requiresFlags: ['flight_secure'],verb:'Fliegen',icon:'➜',journalText:'Ein Flug mit Kian: Die neue Wolkenstraße abgeschlossen.',hint:'Starte den Flug mit Kian. Lenke Fina durch die freien Lücken zwischen Wolken und Vögeln.' }),
    exit('flight_exit', 'Den Wolkenweg betreten', ['flight_landing'], 'muck'),
  ]),
  scene('muck', 'Muck, die Mücke', 2, 'Eine kleine Begleiterin mit großen Ansichten', 'weide', '06', [actor('muck', 890, 610, 110)], [
    say('Fina', 'Endlich wieder allein und ganz still …'),
    say('Muck', 'Still? Nach dieser Landung? Deine Knie haben laut geklappert!'),
    say('Fina', 'Wer spricht da?'),
    say('Muck', 'Muck. Mücke. Eigene Flügel. Sehr praktische Ausstattung.'),
  ], [
    talk('muck_meet', 'Muck kennenlernen', 890, [say('Fina', 'Ich bin Fina. Auf dem Weg zur Himmelsstadt.'), say('Muck', 'Ich könnte mitkommen. Allein herumsummen ist auf Dauer ein ziemlich kurzes Gespräch.'), say('Fina', 'Ich würde mich über Gesellschaft freuen. Aber wir stechen unterwegs nicht einfach jeden.')], { y: 455 }),
    talk('muck_nature', 'Über Mücken und Magie sprechen', 890, [say('Muck', 'Elfenzauber? Damit habe ich nichts zu tun. Ich bin eine Mücke, kein glitzernder Wassertropfen.'), say('Fina', 'Und Wasser?'), say('Muck', 'Igitt. Wenn mein Rüssel eine Speisekarte hätte, wäre Wasser durchgestrichen. Dreimal.')], { y: 455, requiresFlags: ['muck_meet'] }),
    inspect('muck_route', 'Straße zu den Sandfängern', 1220, [say('Fina', 'Der Weg führt zu großen Netzen. Wir gehen auf der breiten Wolkenfläche.'), say('Muck', 'Ich fliege neben dir. Das nennt man bequemes Spazierengehen.')]),
    puzzle('muck_agreement', 'Gemeinsam weiterreisen', 660, 'choice', 'Welche Abmachung passt zu Finas Reise?', [option('friends', 'Gemeinsam reisen; andere erst ansprechen'), option('sting', 'Jede unbekannte Elfe sofort stechen'), option('water', 'Muck muss Wassermagie lernen')], ['friends'], 'Muck nickt, richtet ihre Brille und schließt sich Fina an. Von nun an fliegt sie bei der Erkundung mit.', 'Muck: Ich habe meine Flügel schon dabei. Für Freundschaft brauche ich weder einen Zauberkurs noch eine allgemeine Stecherlaubnis.', { requiresFlags: ['muck_meet', 'muck_nature', 'muck_route'], addCompanions: ['muck'] }),
    exit('muck_exit', 'Zu den Sandfängern', ['muck_agreement'], 'sandfaenger'),
  ]),
  scene('sandfaenger', 'Die Sandfänger', 2, 'Wie winzige Körner dem Schnee helfen', 'sandfaenger', '07', [], [
    say('Muck', 'Netze im Himmel! Fangen sie damit verirrte Wolkensegler?'),
    say('Fina', 'Sandkörner aus dem Saharawind. Die brauchen die Schneekristalle.'),
    say('Muck', 'Die ganze Erde ist voll Sand. Sehr weit gereiste Krümel.'),
    say('Fina', 'Wir schauen zu, ohne die Arbeit zu stören.'),
  ], [
    inspect('sand_nets', 'Sandfangnetze', 500, [say('Fina', 'Die feinen Maschen sammeln winzige Körner aus dem Wind. Große Brocken bleiben draußen.'), say('Muck', 'Ein Sieb für Dinge, die man fast nicht sieht. Mein Hunger ist leichter zu finden.')]),
    inspect('sand_growth', 'Schneekristallmodell', 880, [say('Fina', 'Das Modell zeigt ein kleines Korn in der Mitte und die Kristallstruktur darum. Für die Schneeflocken dieser Welt beginnt das Wachsen im Kleinen.'), say('Muck', 'Also keine Sandburg, die als Schneeflocke verkleidet ist.')]),
    puzzle('sand_sort', 'Eine Probe auswählen', 1050, 'choice', 'Welche Probe eignet sich nach dem Modell für einen jungen Schneekristall?', [option('fine', 'Ein einzelnes feines Sandkorn'), option('stone', 'Ein großer Kiesel'), option('net', 'Ein Stück des Netzes')], ['fine'], 'Du wählst aus der bereitstehenden Probenschale ein feines Korn. Es wird später Chrystels Flockenmodell verständlicher machen.', 'Muck: Auf dem Kiesel müsste die Schneeflocke Miete zahlen. Schau noch einmal auf die winzige Mitte des Modells.', { requiresFlags: ['sand_nets', 'sand_growth'], giveItems: ['sand'] }),
    inspect('sand_city', 'Silberne Türme am Himmel', 1290, [say('Fina', 'Da ist die Himmelsstadt! Eis und Silber über den Wolken.'), say('Muck', 'Gut. Du hast eine Stadt gefunden und ich endlich ein Reiseziel mit Geräuschen.')]),
    exit('sand_exit', 'Zur Himmelsstadt', ['sand_sort', 'sand_city'], 'stadttor'),
  ]),
  scene('stadttor', 'Oh-Ha am Stadttor', 3, 'Eine Empfehlung wird nass', 'stadttor', '08', [actor('h', 910), actor('o', 1170)], [
    say('Fina', 'So viele Elfenstämme! Und dort die Wachen …'),
    say('H', 'H. Verantwortlich. Sehr verantwortlich.'),
    say('O', 'Und O. Zusammen nahezu vollständige Toraufsicht.'),
    say('Muck', 'Nahezu beruhigend.'),
  ], [
    talk('gate_recommendation', 'Empfehlung vorzeigen', 910, [say('Fina', 'Colorida empfiehlt mich bei Meisterin Aria. Hier ist das Schreiben.'), say('H', 'Ein ordentliches Dokument gehört gründlich …'), say('O', '… begossen!'), say('Fina', 'Nein! Das ist Papier! Jetzt ist die Empfehlung ein nasser Klumpen!')], { requiresItems: ['letter'], removeItems: ['letter'], giveItems: ['letterRemains'], repeatText: 'Fina: Das Schreiben ist zerstört. Aria muss die Wahrheit von mir selbst hören.' }),
    talk('gate_protest', 'H und O zur Rede stellen', 1170, [say('Fina', 'Ihr müsst das erklären!'), say('O', 'Hast du mich gerufen, H?'), say('H', 'O nein, O. Höchste Zeit für eine Torbesichtigung von der anderen Seite.'), say('Muck', 'Jetzt laufen sie weg. So sieht sehr verantwortliches Wasser aus.')], { requiresFlags: ['gate_recommendation'] }),
    inspect('gate_tracks', 'Nasse Spur in die Stadt', 1240, [say('Muck', 'Zwei glänzende Spuren führen um die Eissäule.'), say('Fina', 'Ich muss sie erreichen. Aber das Gedränge ist dicht.')], { requiresFlags: ['gate_protest'] }),
    puzzle('gate_path', 'Die Verfolgung aufnehmen', 630, 'choice', 'Wie folgst du den beiden sicher?', [option('cloudlane', 'Auf dem Wolkenweg um die Eissäule'), option('gap', 'Über die offene Wolkenlücke springen'), option('dry', 'Das Schreiben so lange anpusten, bis alles wieder lesbar ist')], ['cloudlane'], 'Du folgst den nassen Spuren in die Stadt. Im Gedränge stolperst du und stößt gegen eine Elfe, die keinen Schritt zurückweicht.', 'Muck: Der sichere Weg ist da drüben. Eine Abkürzung durch offenen Himmel macht deinen Brief auch nicht trockener.', { requiresFlags: ['gate_tracks'] }),
    exit('gate_exit', 'Um die Eissäule', ['gate_path'], 'cold'),
  ]),
  scene('cold', 'Erste Begegnung: Cold', 3, 'Lichtmitte im Wolkenhain', 'himmelsstadt', '10', [actor('cold', 1020)], [
    say('Fina', 'Oh! Entschuldigung. Ich habe dich im Gedränge nicht gesehen.'),
    say('Cold', 'Deine Füße sind hier. Deine Aufmerksamkeit sollte es ebenfalls sein.'),
    say('Fina', 'Zwei Regenwachen haben mein Schreiben zerstört. Ich muss hinterher.'),
    say('Muck', 'Die Hinterher-Geschwindigkeit war größer als die Geradeaus-Geschwindigkeit.'),
  ], [
    talk('cold_identity', 'Die strenge Elfe ansprechen', 1020, [say('Cold', 'Ich bin Cold, eine Eisklinge der Kristallfee. Ein Zusammenstoß ist kein Grund für eine zweite Unhöflichkeit.'), say('Fina', 'Ich wollte dich nicht beleidigen. Aber gerade geht alles schief.'), say('Cold', 'Dann lerne, auch im Ärger Verantwortung zu übernehmen.')]),
    talk('cold_challenge', 'Colds Herausforderung anhören', 1020, [say('Cold', 'Zur Lichtmitte. Im Wolkenhain. Dort sprechen wir über dein Benehmen.'), say('Fina', 'Ein Duell? Also gut. Lichtmitte, Wolkenhain.'), say('Muck', 'Ich merke mir das. Jemand hier sollte Termine sammeln statt Zusammenstöße.')], { requiresFlags: ['cold_identity'], giveItems: ['appointmentCold'] }),
    inspect('cold_column', 'Spur hinter der Eissäule', 1230, [say('Muck', 'H und O biegen schon um die nächste Säule.'), say('Fina', 'Dann weiter. Und diesmal mit Blick auf meine Füße.')]),
    puzzle('cold_note', 'Den ersten Termin merken', 700, 'choice', 'Wann erwartet Cold Fina?', [option('middle', 'Zur Lichtmitte'), option('before', 'Vor Lichtmitte'), option('after', 'Kurz nach Lichtmitte')], ['middle'], 'Du merkst dir Colds Termin. Beim hastigen Umdrehen gerät dein Stiefel auf den Saum eines kostbaren Mantels.', 'Muck: Cold war ziemlich präzise. Lichtmitte – ohne vorher und ohne nachher.', { requiresFlags: ['cold_challenge', 'cold_column'] }),
    exit('cold_exit', 'Der nassen Spur folgen', ['cold_note'], 'powdery'),
  ]),
  scene('powdery', 'Zweite Begegnung: Powdery', 3, 'Der Mantel hat eine Meinung', 'himmelsstadt', '11', [actor('powdery', 1040)], [
    say('Powdery', 'Mein Mantel! Ein perfekter Stiefelabdruck auf meinem besten Stoff!'),
    say('Fina', 'Das war keine Absicht. Wirklich.'),
    say('Muck', 'Zumindest ist es ein sehr deutlicher Abdruck. Man könnte ihn signieren.'),
    say('Powdery', 'Niemand signiert meinen Mantel!'),
  ], [
    inspect('powdery_hem', 'Den Mantelsaum ansehen', 780, [say('Fina', 'Ein nasser Stiefelabdruck. Reiben würde ihn nur tiefer in den Glitzerschnee-Stoff drücken.'), say('Muck', 'Dann reiben wir nicht. Der Mantel wirkt schon aufgeregt genug.')]),
    talk('powdery_apology', 'Powdery ansprechen', 1040, [say('Fina', 'Es tut mir leid. Wenn ich ihn ersetzen kann, will ich es versuchen. Aber die Wachen entkommen!'), say('Powdery', 'Du kannst doch nicht den Mantel ruinieren und sofort davonrennen. Ich bin Powdery, und das klären wir!')]),
    talk('powdery_challenge', 'Den zweiten Duelltermin erfahren', 1040, [say('Powdery', 'Kurz nach Lichtmitte. Wolkenhain. Bring lieber bessere Manieren mit.'), say('Fina', 'Gut. Ich bin da. Bitte lass mich jetzt weiter.'), say('Muck', 'Zwei Termine am selben Ort. Wenigstens sparen wir Wegbeschreibungen.')], { requiresFlags: ['powdery_apology'], giveItems: ['appointmentPowdery'] }),
    puzzle('powdery_response', 'Den Mantel nicht weiter beschädigen', 620, 'choice', 'Was hilft in diesem Moment?', [option('acknowledge', 'Den Schaden anerkennen und den Termin merken'), option('scrub', 'Mit dem nassen Schreiben kräftig schrubben'), option('sand', 'Sandkörner auf dem Stoff verteilen')], ['acknowledge'], 'Du lässt den Mantel in Ruhe und merkst dir den zweiten Termin. Hinter der nächsten Gasse glaubt Muck die Wachen wiederzusehen.', 'Powdery: Mein Mantel ist kein Probentisch! Eine Entschuldigung verträgt er besser als noch mehr Flecken.', { requiresFlags: ['powdery_hem', 'powdery_challenge'] }),
    exit('powdery_exit', 'In die nächste Gasse', ['powdery_response'], 'icy'),
  ]),
  scene('icy', 'Dritte Begegnung: Icy', 3, 'Ein Gedicht und drei Termine', 'himmelsstadt', '12', [actor('icy', 1040)], [
    say('Icy', '… und das Licht ruhte leise auf dem Eis …'),
    say('Fina', 'Verzeihung! Ich suche zwei Regenwachen!'),
    say('Icy', 'Gerade suchte diese Straße einen stillen Augenblick.'),
    say('Muck', 'Wir haben die Wachen verloren. Dafür vermutlich einen dritten Termin gefunden.'),
  ], [
    talk('icy_poem', 'Mit Icy sprechen', 1040, [say('Icy', 'Ich bin Icy. Freundlichkeit hilft auch dann, wenn du es eilig hast.'), say('Fina', 'Ich bin wütend wegen des Briefes. Dabei wollte ich hier etwas Gutes tun.'), say('Icy', 'Gutes beginnt oft bei der Elfe, die direkt vor dir steht.')]),
    talk('icy_challenge', 'Icys Herausforderung anhören', 1040, [say('Icy', 'Vor Lichtmitte, im Wolkenhain. Vielleicht findest du dort wieder etwas Ruhe.'), say('Fina', 'Vor Lichtmitte. Dann habe ich drei Duelle.'), say('Muck', 'Ein voller Kalender. Für den ersten Tag ausgesprochen ehrgeizig.')], { requiresFlags: ['icy_poem'], giveItems: ['appointmentIcy'] }),
    inspect('icy_empty_lane', 'Die leere Seitengasse', 1260, [say('Fina', 'Keine nassen Spuren mehr. H und O sind entkommen.'), say('Muck', 'Wir können jetzt Luft holen. Die Straße hat uns gerade drei Mal eingeholt.')]),
    puzzle('icy_schedule', 'Die drei Termine ordnen', 610, 'order', 'Welche Reihenfolge gilt im Wolkenhain?', [option('icy', 'Icy – vor Lichtmitte'), option('cold', 'Cold – zur Lichtmitte'), option('powdery', 'Powdery – kurz danach')], ['icy', 'cold', 'powdery'], 'Die Termine sind geordnet. Eine klare Glocke klingt durch die Stadt: Die Schneeschleusen werden geöffnet.', 'Muck: Erst vor der Mitte, dann die Mitte, dann danach. Wir sortieren Zeiten, keine Beliebtheitsliste.', { requiresFlags: ['icy_challenge', 'icy_empty_lane'], requiresItems: ['appointmentCold', 'appointmentPowdery', 'appointmentIcy'] }),
    exit('icy_exit', 'Dem Glockenklang folgen', ['icy_schedule'], 'schneeschleusen'),
  ]),
  scene('schneeschleusen', 'Chrystas Glitzerlinge', 3, 'Warum Fina Kristallelfe werden will', 'schleusen', '13', [actor('chrysta', 1050)], [
    say('Chrysta', 'Platz für meine kleinen Schneeflocken! Heute tanzen sie hinaus!'),
    say('Fina', 'Das ist Chrysta, die Hüterin der Schneeschleusen.'),
    say('Muck', 'Diese Stadt hat sogar Aufregung für Dinge, die leise fallen.'),
    say('Chrysta', 'Fallen? Sie reisen! Und bitte nicht pusten.'),
  ], [
    talk('sluice_chry', 'Chrystas Arbeit kennenlernen', 1050, [say('Chrysta', 'Erst sammeln wir den Strom, dann ordnen wir die Flocken. Zuletzt öffne ich die Kristallrutsche. Kein Gedränge für meine Glitzerlinge!'), say('Fina', 'Alle so klein und doch unterschiedlich.'), say('Chrysta', 'Jede einzelne verdient eine freie Bahn.')], { giveItems: ['streamPlan'] }),
    inspect('sluice_controls', 'Drei Schleusenhebel', 710, [say('Fina', 'Die Zeichen stehen für Sammeln, Ordnen und die offene Rutsche.'), say('Muck', 'Ich erkenne noch ein viertes: Nicht mit den Flügeln wedeln. Das richtet sich bestimmt an dich.')]),
    puzzle('sluice_order', 'Die Schneeströme ordnen', 870, 'order', 'Öffne die Schleusen in Chrystas Reihenfolge.', [option('collect', 'Sammelstrom freigeben'), option('sort', 'Flocken in getrennte Bahnen ordnen'), option('release', 'Kristallrutsche öffnen')], ['collect', 'sort', 'release'], 'Die Hebel folgen ruhig aufeinander. Schneeflocken wirbeln als glitzernder Tanz über die Stadt und weiter zur Erde.', 'Chrysta: Noch einmal in Ruhe. Erst sammeln, dann ordnen, dann reisen lassen. Pusten zählt nicht als zusätzlicher Hebel.', { requiresFlags: ['sluice_chry', 'sluice_controls'], requiresItems: ['streamPlan'] }),
    talk('sluice_purpose', 'Finas Entschluss', 1050, [say('Fina', 'Darum möchte ich eine Kristallelfe werden. Um diese Schönheit und die Elfen zu schützen.'), say('Muck', 'Dann schützen wir zuerst deinen Kalender. Drei Duelle, weißt du noch?'), say('Chrysta', 'Der Wolkenhain liegt zwischen den Eistürmen. Nehmt den tieferen Wolkenweg.')], { requiresFlags: ['sluice_order'] }),
    exit('sluice_exit', 'Zum verborgenen Wolkenhain', ['sluice_purpose'], 'wolkenhain'),
  ]),
  { ...scene('wolkenhain', 'Vier gegen die Nebelwache', 4, 'Aus drei Duellen wird ein gemeinsamer Anfang', 'himmelsstadt', '14', [actor('icy', 700), actor('cold', 950), actor('powdery', 1190)], [
    say('Icy', 'Fina? Wir warten offenbar alle auf dieselbe Reisende.'),
    say('Powdery', 'Mein Mantel hat auf dem Weg nicht vergessen, warum.'),
    say('Cold', 'Drei Duelle sind zwei zu viel. Zuerst reden wir.'),
    say('Fina', 'Dann … wartet. H und O kommen mit Nebelwachen!'),
  ], [
    talk('grove_truth', 'Die drei Herausforderungen erklären', 950, [say('Fina', 'Ich war wütend und habe euch nacheinander verletzt. Das war meine Verantwortung, nicht eure.'), say('Icy', 'Es ist gut, dass du das jetzt sagst.'), say('Powdery', 'Der Mantel ist noch beleidigt. Ich höre trotzdem zu.'), say('Cold', 'Hinter uns. Die Wachen wollen uns festnehmen.')]),
    inspect('grove_attacks', 'Wasserangriffe beobachten', 450, [say('Cold', 'Ihre Wasserstrahlen sind hart. Gefroren erreichen sie uns nicht.'), say('Powdery', 'Mein Pulverschnee kann den Ansturm aufhalten.'), say('Icy', 'Fina, spüre das Wasser. Ich helfe dir. Muck kann die Aufmerksamkeit einer Wache ablenken.')], { requiresFlags: ['grove_truth'] }),
    puzzle('grove_team', 'Gemeinsam gegen die Wachen handeln', 720, 'order', 'Wie nutzt ihr die verschiedenen Fähigkeiten?', [option('shield', 'Cold friert die ersten Wasserangriffe ein'), option('snow', 'Powdery hält den Ansturm mit Pulverschnee auf'), option('sense', 'Icy hilft Fina, das Wasser zu spüren; Muck lenkt ab')], ['shield', 'snow', 'sense'], 'Cold schützt die Gruppe. Powderys Pulverschnee stoppt die Wachen. Mit Icys Hilfe findet Fina ihren Zauber; Muck lenkt den letzten Angreifer ab. Die Nebelwache zieht sich zurück.', 'Cold: Erst Schutz, dann Raum schaffen. Fina kann besser spüren, wenn wir sie nicht mitten in einen Wasserstrahl stellen.', { requiresFlags: ['grove_attacks'] }),
    action('grove_alliance', 'Die Eisklingen an Finas Seite', 'encounter', 950, [say('Cold', 'Du bist geblieben, obwohl du hättest fliehen können.'), say('Icy', 'Und dein Zauber war da. Auch wenn du ihn noch nicht sicher führen kannst.'), say('Powdery', 'Komm mit zu Aria. Eine so ungewöhnliche Einführung bekommt sie nicht jeden Tag.')], { requiresFlags: ['grove_team'], addCompanions: ['cold', 'powdery', 'icy'] }),
    exit('grove_exit', 'Zu Meisterin Aria', ['grove_alliance'], 'aria'),
  ]), background: 'Bilder/freepik__a-highquality-digital-comic-book-illustration-in-1__61026.png' },
  scene('aria', 'Die Anwärterin', 4, 'Ehrlichkeit vor Rang und Ruhm', 'akademie', '15', [actor('aria', 1050)], [
    say('Meisterin Aria', 'Cold, Powdery, Icy. Ich habe von den Duellen gehört.'),
    say('Fina', 'Die drei Termine waren meine Schuld. Bitte hört mir zu.'),
    say('Muck', 'Ich bin Muck. Für den Teil mit der Ehrlichkeit kann ich Zeugin sein.'),
    say('Meisterin Aria', 'Dann sprechen wir nacheinander.'),
  ], [
    inspect('aria_letter', 'Das ruinierte Schreiben', 590, [say('Fina', 'Hier ist noch Coloridas Zeichen. Der Rest ist durch H und O unlesbar geworden.'), say('Meisterin Aria', 'Ein beschädigter Brief ist keine beschädigte Wahrheit. Erzähle mir selbst, weshalb du hier bist.')], { requiresItems: ['letterRemains'] }),
    talk('aria_story', 'Aria die Wahrheit erzählen', 1050, [say('Fina', 'Ich komme aus Farbenquell. Silba war meine Mutter. Ich will helfen und herausfinden, was ihr zugestoßen ist.'), say('Cold', 'Fina hat unsere Fehler nicht beschönigt. Gegen die Wachen blieb sie an unserer Seite.'), say('Icy', 'Ich habe ihre Magie gespürt. Sie verdient eine Möglichkeit zu lernen.')], { requiresFlags: ['aria_letter'] }),
    puzzle('aria_oath', 'Verantwortung übernehmen', 790, 'choice', 'Wofür möchte Fina Kristallelfe werden?', [option('protect', 'Für andere da sein und weiter lernen'), option('fame', 'Damit niemand ihr mehr widerspricht'), option('revenge', 'Um jedes Missgeschick mit einem Duell zu bezahlen')], ['protect'], 'Aria erkennt deine Ehrlichkeit und den Mut im Wolkenhain. Sie nimmt Fina als Anwärterin auf.', 'Meisterin Aria: Ein Ring ist keine Genehmigung für jede Laune. Schutz und Lernen beginnen vor dem Titel.', { requiresFlags: ['aria_story'], giveItems: ['novice'] }),
    talk('aria_silba', 'Nach Silba fragen', 1050, [say('Meisterin Aria', 'Silba besaß eine seltene Gabe: Sie konnte dem Wasser Gestalt und Leben geben.'), say('Fina', 'Ihr Kristall ist bei mir. Solange ich ihn habe, gebe ich die Suche nicht auf.'), say('Powdery', 'Und auf die Suche musst du jetzt nicht mehr allein gehen.')], { requiresFlags: ['aria_oath'] }),
    exit('aria_exit', 'Ein Blick hinter den Hof', ['aria_silba'], 'regis_intrige'),
  ]),
  scene('regis_intrige', 'Regis plant den Umsturz', 4, 'Zwischenszene: Wissen für die Spielenden', 'regis', '16', [actor('regis', 1030), actor('two', 720)], [
    say('Erzählung', 'Während Fina ihre Aufnahme erlebt, plant Lord Regis fern von ihr den nächsten Schritt.'),
    say('Lord Regis', 'Alle Kristallelfen sollen in der Sturmarena trainieren. Niemand verlässt sie.'),
    say('2', 'Team H2O übernimmt die Durchführung. Vollständig und pünktlich.'),
    say('Erzählung', 'Dies ist eine Zwischenszene. Fina hört dieses Gespräch nicht.'),
  ], [
    inspect('plot_orders', 'Regis’ Befehl', 430, [say('Lord Regis', 'Ein gemeinsames Training – und dann verriegelte Ausgänge. Die Beschützerinnen sollen meiner Krönung nicht im Weg stehen.'), say('2', 'Eine Falle als Terminplan. Sehr übersichtlich.')]),
    talk('plot_water', 'Regis’ Ziel', 1030, [say('Lord Regis', 'Kein Eis mehr. Kein Schnee. Nur Wasser unter meiner Herrschaft.'), say('2', 'Kein Widerstand, keine Kristallfee. Ein einfacher Plan.'), say('Erzählung', 'Die Wünsche vieler Elfen und der Schnee haben darin keinen Platz.')]),
    inspect('plot_arena', 'Die versiegelte Sturmarena', 1260, [say('Erzählung', 'Die Nebelwache umstellt die Arena. Die hineingelockten Kristallelfen werden gefangen genommen.')], { requiresFlags: ['plot_orders'] }),
    puzzle('plot_understand', 'Die Falle verstehen', 800, 'choice', 'Was ist an diesem Trainingsbefehl gefährlich?', [option('trap', 'Er versammelt die Beschützerinnen hinter verschlossenen Ausgängen'), option('time', 'Er beginnt besonders früh'), option('sport', 'Er enthält zu wenig Aufwärmen')], ['trap'], 'Regis hat die meisten Beschützerinnen ausgeschaltet. Sein nächstes Ziel ist der Thron der Kristallfee.', 'Erzählung: Die entscheidenden Ausgänge werden verriegelt. Darin liegt die Falle.', { requiresFlags: ['plot_water', 'plot_arena'] }),
    exit('plot_exit', 'Zum Thronsaal wechseln', ['plot_understand'], 'thronsturz'),
  ]),
  scene('thronsturz', 'Der Fall der Kristallfee', 5, 'Zwischenszene: Funkel entkommt', 'thron', '17', [actor('kristallfee', 960), actor('regis', 1230), actor('funkel', 600)], [
    say('Kristallfee', 'Lord Regis, was bedeutet dieser Aufmarsch?'),
    say('Lord Regis', 'Die Herrschaft des Eises endet heute.'),
    say('Funkel', 'Herrin! Die Beschützerinnen sind in der Arena eingeschlossen!'),
    say('Erzählung', 'Regis fängt die Königin in einer magischen Schale. Fina ist hier nicht anwesend.'),
  ], [
    inspect('fall_trap', 'Die magische Schale', 800, [say('Erzählung', 'Die Schale hält die Kristallfee fest. Regis’ Zauber löst ihre Gestalt zu lebendigem Wasser auf.'), say('Erzählung', 'Sie lebt. Ihr Gefäß wird ins Wasserverließ gebracht.')]),
    talk('fall_funkel', 'Funkels Entschluss', 600, [say('Funkel', 'Ich muss jemanden warnen. Die Königin lebt, aber sie braucht Hilfe.'), say('Lord Regis', 'Bringt auch die Dienerin ins Verließ!'), say('Funkel', 'Wenn ich hier bleibe, erfährt niemand davon.')]),
    inspect('fall_escape_route', 'Spalt hinter dem Eisvorhang', 440, [say('Erzählung', 'Hinter dem Eisvorhang liegt ein schmaler Weg in den Dienerinnengang. Die Wachen blicken zur Schale.')]),
    puzzle('fall_escape', 'Funkels Fluchtweg wählen', 710, 'choice', 'Wo kann Funkel entkommen, um Hilfe zu holen?', [option('curtain', 'Durch den Spalt hinter dem Eisvorhang'), option('regis', 'Zwischen Regis und seinem Speer'), option('bowl', 'In die magische Schale springen')], ['curtain'], 'Funkel schlüpft hinter den Eisvorhang. Im Gedränge bemerken die Wachen ihre Flucht zu spät.', 'Funkel: Ich brauche einen ungesehenen Weg. Der Eisvorhang verdeckt den Gang.', { requiresFlags: ['fall_trap', 'fall_funkel', 'fall_escape_route'] }),
    exit('fall_exit', 'Funkel folgt der Spur der Eisklingen', ['fall_escape'], 'funkels_warnung'),
  ]),
  scene('funkels_warnung', 'Funkels Warnung', 5, 'Die letzten freien Beschützerinnen', 'himmelsstadt', '18', [actor('funkel', 1050)], [
    say('Funkel', 'Die Königin! Regis hat sie in Wasser verwandelt!'),
    say('Fina', 'Lebt sie noch? Sag mir bitte, dass sie lebt.'),
    say('Funkel', 'Ja. Sie ist im Wasserverließ. Die anderen Kristallelfen wurden in der Arena gefangen.'),
    say('Cold', 'Dann können wir nicht auf Verstärkung warten.'),
  ], [
    talk('warning_account', 'Funkels Bericht anhören', 1050, [say('Funkel', 'Regis hat die Herrin festgehalten und ihre Gestalt aufgelöst. Die Nebelwachen bringen ihre Lebensenergie in einem Gefäß fort.'), say('Fina', 'Mein Kristall pocht. Silbas Kristall … vielleicht hat es mit ihm zu tun.'), say('Icy', 'Wir gehen durch die Werkstätten. Dort gibt es Wege abseits der bewachten Eisgasse.')]),
    inspect('warning_patrol', 'Bewachte Eisgasse', 1220, [say('Cold', 'Der direkte Weg zum Palast ist voller Nebelwachen.'), say('Powdery', 'Eine Führung durch die Werkstätten war ohnehin geplant. Ich hätte mir allerdings weniger Verfolgung dazu gewünscht.')]),
    puzzle('warning_route', 'Einen Rettungsweg wählen', 720, 'choice', 'Welche Route folgt Icys Vorschlag und umgeht die Wachen?', [option('workshops', 'Durch Werkstätten und Observatorium'), option('arena', 'Zuerst alle in der versiegelten Arena suchen'), option('main', 'Über die bewachte Hauptgasse')], ['workshops'], 'Die Gruppe entscheidet sich für die Werkstätten. Ihr Auftrag: zum Wasserverließ gelangen und die Gefangenen befreien.', 'Cold: Wir haben keine Zeit für die Arena und keinen freien Hauptweg. Icy kennt den Werkstattgang.', { requiresFlags: ['warning_account', 'warning_patrol'] }),
    talk('warning_hide', 'Funkel in Sicherheit bringen', 1050, [say('Cold', 'Hinter dem Eisvorhang ist eine Nische. Versteck dich, Funkel. Du hast uns gewarnt; nun übernehmen wir.'), say('Funkel', 'Bitte holt die Herrin zurück.'), say('Fina', 'Wir versuchen es. Für sie und für alle anderen.')], { requiresFlags: ['warning_route'] }),
    exit('warning_exit', 'Die Kristallwerkstatt betreten', ['warning_hide'], 'kristallwerkstatt'),
  ]),
  scene('kristallwerkstatt', 'Chrystels Kristallwerkstatt', 5, 'Sechs Zacken und ein schwieriger Abschied', 'werkstatt', '19', [actor('chrystel', 1090)], [
    say('Chrystel', 'Hände weg von den unfertigen Plänen!'),
    say('Fina', 'Wir brauchen einen Weg zum Palast. Und … diese Flockenzeichnungen sind wunderschön.'),
    say('Chrystel', 'Schönheit, Mathematik, Arbeit! Endlich bemerkt es jemand.'),
    say('Cold', 'Beeilt euch. Die Wachen folgen uns.'),
  ], [
    talk('workshop_master', 'Chrystel um Hilfe bitten', 1090, [say('Chrystel', 'Ich entwerfe die Schneeflocken. Fünfzigtausend werden bestellt, und alle wollen lieber Abenteuer erleben!'), say('Fina', 'Ohne deine Arbeit gäbe es nichts, das wir beschützen könnten.'), say('Chrystel', 'Hm. Christi weiß den Weg weiter. Nehmt das fertige Übungsmodell für die Kartenfassung – die Teile liegen in der freigegebenen Schale.')]),
    action('workshop_parts', 'Freigegebene Modellteile', 'take', 640, [say('Fina', 'Eine sechseckige Mitte und sechs gleiche Arme. Ich nehme nur die freigegebenen Teile.'), say('Chrystel', 'Gut. Nicht jede schöne Zeichnung ist gleichzeitig eine Einladung zum Mitnehmen.')], { requiresFlags: ['workshop_master'], giveItems: ['flakeCore', 'flakeArms'] }),
    puzzle('workshop_flake', 'Eine sechszackige Schneeflocke bauen', 870, 'combine', 'Was gehört zum symmetrischen Übungsmodell?', [option('flakeCore', 'Sechseckige Flockenmitte'), option('flakeArms', 'Sechs gleichmäßig verteilte Arme'), option('sand', 'Sandkornprobe als große Außenzacke'), option('letterRemains', 'Ruiniertes Schreiben als siebter Arm')], ['flakeCore', 'flakeArms'], 'Sechs gleiche Arme um die Mitte: Das Modell ist symmetrisch. Chrystel prüft es und überlässt euch das fertige Stück für Christis Kartenfassung.', 'Chrystel: Sechs Zacken, gleichmäßig um die Mitte! Papier ist kein siebter Arm, und ein Sandkorn bleibt winzig.', { requiresFlags: ['workshop_parts'], requiresItems: ['flakeCore', 'flakeArms'], removeItems: ['flakeCore', 'flakeArms'], giveItems: ['flakeModel'] }),
    action('workshop_cold_hold', 'Cold hält die Wachen auf', 'encounter', 1190, [say('Cold', 'Geht zu Christi. Ich halte den Gang, damit sie euch nicht alle zugleich erreichen.'), say('Fina', 'Aber wir bleiben zusammen!'), say('Cold', 'Unser Ziel ist, die Gefangenen zu retten. Du gehst weiter, Fina. Das ist jetzt dein Teil.'), say('Erzählung', 'Cold friert die Wasserangriffe im Türrahmen ein. Fina, Powdery, Icy und Muck entkommen zum Observatorium.')], { requiresFlags: ['workshop_flake'], removeCompanions: ['cold'], repeatText: 'Fina: Cold hat uns Zeit verschafft. Wir dürfen ihren Entschluss nicht umsonst werden lassen.' }),
    exit('workshop_exit', 'Zu Christi weitergehen', ['workshop_cold_hold'], 'observatorium'),
  ]),
  scene('observatorium', 'Christis Observatorium', 5, 'Mehr Licht für einen geheimen Weg', 'observatorium', '20', [actor('christi', 1090)], [
    say('Christi', 'Mehr Licht! Dieser Wind hat seit gestern schon wieder seine Meinung geändert!'),
    say('Icy', 'Christi, wir brauchen deine Hilfe. Die Königin ist im Wasserverließ.'),
    say('Christi', 'Dann ruft die Kristallelfen!'),
    say('Powdery', 'Hier stehen die letzten, die noch frei sind.'),
  ], [
    talk('observatory_help', 'Christi die Lage erklären', 1090, [say('Fina', 'Cold hält den Gang. Wir müssen auf einem anderen Weg zum Verließ.'), say('Christi', 'Der direkte Weg ist besetzt. Hinter meiner Wolkenkarte liegt ein Gang zum Mondtaugarten. Aber ich brauche Licht, um die sichere Verbindung zu finden.'), say('Muck', 'Mehr Licht, weniger Wachen. Ich beginne, diese Geografie zu mögen.')]),
    inspect('observatory_mirrors', 'Spiegel und Wolkenkarte', 710, [say('Fina', 'Der erste Spiegel empfängt das Licht. Der zweite lenkt es auf die Karte; die helle Linie endet beim Mondtaugang.'), say('Christi', 'Die Kartenfassung passt zum sechszackigen Übungsmodell meiner Schwester. Das macht sie noch lange nicht zur wichtigeren Schwester!')]),
    puzzle('observatory_light', 'Die Spiegel ausrichten', 900, 'order', 'Lenke das Licht zur verborgenen Route.', [option('receive', 'Ersten Spiegel auf das Himmelslicht ausrichten'), option('relay', 'Zweiten Spiegel auf die Wolkenkarte richten'), option('route', 'Lichtlinie zum Mondtaugang verfolgen')], ['receive', 'relay', 'route'], 'Die Wolkenkarte zeigt eine zusammenhängende Route. Christi zeichnet den Weg zum Mondtaugang und weiter zu den Blitzkutschen ein.', 'Christi: Erst Licht empfangen, dann umlenken, dann messen. Im Dunkeln kann selbst ich keinen hellen Weg sehen.', { requiresFlags: ['observatory_help', 'observatory_mirrors'], giveItems: ['routeMap'] }),
    puzzle('observatory_door', 'Die Tür hinter der Karte öffnen', 1210, 'combine', 'Was passt in die freigegebene Kartenfassung?', [option('flakeModel', 'Chrystels sechszackiges Übungsmodell'), option('socket', 'Sechszackige Kartenfassung'), option('ring', 'Finas Ringwaffe'), option('force', 'Die Karte mit Gewalt herunterreißen')], ['flakeModel', 'socket'], 'Das geprüfte Modell passt. Die Karte schwingt zur Seite und legt den geheimen Gang frei. Christi bleibt zurück und schützt ihre Karten.', 'Muck: Sechs Zacken passen zu sechs Zacken. Deine Ringwaffe wäre hier nur ein ziemlich beleidigter Türöffner.', { requiresFlags: ['observatory_light'], requiresItems: ['flakeModel'], removeItems: ['flakeModel'] }),
    action('observatory_powdery_hold', 'Powdery hält die Tür', 'encounter', 990, [say('Erzählung', 'Nebelwachen stoßen gegen die Observatoriumstür.'), say('Powdery', 'Icy, bring Fina durch den Gang. Ich halte sie auf.'), say('Fina', 'Ich hole euch zurück. Cold und dich.'), say('Powdery', 'Dann geh. Und verrate meinem Mantel, dass er einen sehr heldenhaften Tag hat.'), say('Erzählung', 'Powderys Pulverschnee versperrt den Verfolgern die Sicht. Fina, Icy und Muck schlüpfen hinter die Karte.')], { requiresFlags: ['observatory_door'], removeCompanions: ['powdery'] }),
    exit('observatory_exit', 'Durch den Mondtaugang', ['observatory_powdery_hold'], 'mondtaugarten'),
  ]),
  scene('mondtaugarten', 'Der Mondtaugarten', 5, 'Icy schenkt Fina den letzten Vorsprung', 'mondtaugarten', '21', [], [
    say('Fina', 'Hier schwebt silbernes Licht zwischen den Kristallbögen.'),
    say('Icy', 'Mondtau. Bleib auf der festen Wolkenbahn; der Palast ist nah.'),
    say('Muck', 'Powdery hat die Tür gehalten. Aber ich höre die Wachen noch.'),
    say('Icy', 'Dann hör jetzt genau zu, Fina.'),
  ], [
    inspect('moon_drops', 'Schwebender Mondtau', 500, [say('Fina', 'Die Tropfen leuchten wie flüssiges Mondlicht. Zwischen ihnen bleibt eine freie Wolkenbahn.'), say('Muck', 'Schön. Ich bewundere sie von trockenem Abstand aus.')]),
    talk('moon_directions', 'Icys genaue Wegbeschreibung', 1010, [say('Icy', 'Am Palast stehen die Blitzkutschen in den Ställen. Neben ihnen findest du eine silbern beschlagene Tür.'), say('Fina', 'Blitzkutschen. Silberne Tür. Wasserverließ.'), say('Icy', 'Genau. Deine Magie ist stark, Fina. Sie kommt nicht nur aus einem Titel.')], { giveItems: ['silverClue'] }),
    puzzle('moon_route', 'Den letzten Weg merken', 770, 'order', 'Welche Wegmarken führen zum Wasserverließ?', [option('stables', 'Blitzkutschen-Ställe finden'), option('silver', 'Silbern beschlagene Tür daneben suchen'), option('stairs', 'Durch die Tür die Treppe hinabgehen')], ['stables', 'silver', 'stairs'], 'Du kennst den letzten Weg. Finas Aufgabe ist klar: die Gefangenen erreichen und nicht für ein verlorenes Gefecht zurücklaufen.', 'Icy: Die Ställe sind die erste Wegmarke. Die silberne Tür liegt direkt daneben. Du musst kein Schloss erfinden.', { requiresFlags: ['moon_directions'], requiresItems: ['routeMap', 'silverClue'] }),
    action('moon_icy_hold', 'Icys Abschied', 'encounter', 1120, [say('Icy', 'Ich halte die Wachen hier. Du gehst weiter.'), say('Fina', 'Ich kann das nicht allein!'), say('Icy', 'Muck bleibt bei dir. Und wir vertrauen dir. Hole uns zurück.'), say('Muck', 'Komm, Fina. Wir müssen ihren Vorsprung nutzen.'), say('Erzählung', 'Icy wendet sich den Verfolgern zu. Fina und Muck gehen weiter zu den Blitzkutschen.')], { requiresFlags: ['moon_drops', 'moon_route'], removeCompanions: ['icy'], repeatText: 'Fina: Icy hat mir den Weg anvertraut. Jetzt darf ich nicht stehen bleiben.' }),
    exit('moon_exit', 'Zum Wasserverließ', ['moon_icy_hold'], 'wasserverlies'),
  ]),
  scene('wasserverlies', 'Das Wasserverließ', 6, 'Leben in leuchtenden Gefäßen', 'wasserverlies', '22', [], [
    say('Fina', 'Die silberne Tür war direkt neben den Blitzkutschen. Sie ließ sich einfach aufschieben.'),
    say('Muck', 'Jetzt tropft es überall. Trotzdem bleibe ich bei dir.'),
    say('Fina', 'Diese Gefäße leuchten. Und neben jedem hängt ein Kristall …'),
    say('Muck', 'Fast jedem. Schau dort.'),
  ], [
    inspect('prison_life', 'Leuchtende Wassergefäße', 560, [say('Fina', 'Sie leben. Die Elfen sind in ihre Wasserform zurückversetzt, nicht tot.'), say('Muck', 'Dann kann man ihnen ihre Gestalt zurückgeben?'), say('Fina', 'Silba konnte Wasser Leben einhauchen. Aria hat es erzählt. Vielleicht ist noch Hoffnung da.')]),
    inspect('prison_pendants', 'Kristallanhänger vergleichen', 880, [say('Fina', 'Ein Gefäß trägt das Zeichen der Blitzfühler, eines das der Sandfänger. Jeder Kristall gehört zu einer Elfe.'), say('Muck', 'Und dieser eine leere Platz an der Kette?'), say('Fina', 'Jemandem fehlt der Kristall. Mutters Kristall wurde mir nach ihrem Verschwinden gebracht.')], { requiresFlags: ['prison_life'] }),
    puzzle('prison_identity', 'Das besondere Gefäß erkennen', 1080, 'choice', 'Welches Gefäß könnte zu Silba gehören?', [option('missing', 'Das leuchtende Gefäß ohne Kristallanhänger'), option('lightning', 'Das Gefäß mit dem Blitzfühler-Zeichen'), option('empty', 'Ein völlig leeres Gefäß')], ['missing'], 'Fina erkennt das vertraute Leuchten. Das Gefäß ohne Anhänger könnte Silba bergen – ihr Kristall liegt in Finas Tasche.', 'Fina: Mutters Kristall ist hier bei mir. Darum würde an ihrem Gefäß der Anhänger fehlen.', { requiresFlags: ['prison_pendants'], requiresItems: ['crystal'], giveItems: ['vesselClue'] }),
    inspect('prison_hide', 'Schutz hinter der Säule', 400, [say('Muck', 'Schritte! Mehrere. Und Wachen.'), say('Fina', 'Hinter die Säule. Erst hören wir, was sie sagen.'), say('Erzählung', 'H, 2 und O betreten das Verließ. Sie bringen die Kristallfee und die gefesselten Cold, Powdery und Icy.')], { requiresFlags: ['prison_identity'] }),
    exit('prison_exit', 'Aus dem Versteck zuhören', ['prison_hide'], 'h2o_wende'),
  ]),
  scene('h2o_wende', 'Team H2O entscheidet sich', 6, 'Auch Regenwachen lieben Schnee', 'wasserverlies', '22', [actor('h', 650), actor('two', 950), actor('o', 1210)], [
    say('2', 'Die Kristallfee kommt neben Silbas Gefäß. Und hier die drei gefangenen Eisklingen.'),
    say('H', 'Wenn Regis siegt, gibt es dann wirklich keinen Schnee mehr?'),
    say('O', 'Keine kleinen Schneemänner? Keine Kristallkekse?'),
    say('Fina', 'Silba. Sie haben es gesagt. Meine Mutter ist hier.'),
  ], [
    talk('h2o_listen', 'H und O zuhören', 650, [say('H', 'Ich mag den Schnee. Ich dachte, wir helfen der Stadt.'), say('O', 'Eine Stadt nur aus Wasser ist keine Stadt, in der ich leben möchte.'), say('2', 'Ihr stellt meinen perfekten Plan wegen Schneeflocken infrage?'), say('H', 'Wegen der Elfen. Und ja, auch wegen der Schneeflocken.')]),
    talk('h2o_balance', '2 überdenkt den Plan', 950, [say('2', 'Nur Wasser ist genauso einseitig wie nur Eis. Vielleicht braucht ein guter Plan beides.'), say('O', 'Und kleine Schneemänner.'), say('2', 'Die dürfen darin vorkommen. Aber wir müssen Regis aufhalten.'), say('Fina', 'Das können wir gemeinsam versuchen.')], { requiresFlags: ['h2o_listen'] }),
    puzzle('h2o_decision', 'Aus dem Versteck treten', 820, 'choice', 'Womit knüpft Fina an den Sinneswandel an?', [option('balance', 'Gemeinsam die Elfen retten und Wasser, Eis und Schnee erhalten'), option('gift', 'Sand schenken, damit H2O vergessen, was sie getan haben'), option('erase', 'Den Regen für immer verbieten')], ['balance'], 'Fina tritt vor. H2O entscheiden sich aus Überzeugung gegen Regis. 2 durchtrennt die Fesseln der Eisklingen; H und O helfen ihnen auf.', 'Icy: Sie haben gerade verstanden, weshalb alle Formen des Wassers gebraucht werden. Wir dürfen ihnen jetzt kein neues Verbot anbieten.', { requiresFlags: ['h2o_balance'], addCompanions: ['cold', 'powdery', 'icy'] }),
    talk('h2o_reunion', 'Die Freundinnen wiedersehen', 1210, [say('Powdery', 'Fina! Du bist angekommen!'), say('Cold', 'Und wir sind wieder vollständig. Zeig uns Silbas Gefäß.'), say('Icy', 'Ihr Kristall fehlt. Ohne ihn können wir sie nicht rufen.'), say('Fina', 'Er fehlt hier. Aber ich habe ihn die ganze Reise bei mir getragen.')], { requiresFlags: ['h2o_decision'], requiresItems: ['crystal', 'vesselClue'] }),
    exit('h2o_exit', 'Die gemeinsame Befreiung vorbereiten', ['h2o_reunion'], 'befreiung'),
  ]),
  scene('befreiung', 'Wasser erhält wieder Gestalt', 6, 'Silbas Kristall verbindet alle', 'wasserverlies', '23', [actor('h', 690), actor('two', 965), actor('o', 1220)], [
    say('Fina', 'Ich habe Mutters Kristall. Aber kann ich ihr wirklich ihre Gestalt zurückgeben?'),
    say('Icy', 'Silba hatte diese Gabe. Du musst es nicht allein versuchen.'),
    say('Cold', 'Wir verbinden uns. Fina führt den Zauber.'),
    say('Muck', 'Bei Magie bin ich raus. Beim Mutmachen bleibe ich hier.'),
  ], [
    talk('free_support', 'Gemeinsam Kraft sammeln', 965, [say('Fina', 'Cold, Icy, Powdery, H, 2, O – fasst euch an den Händen. Wir bilden einen Kreis.'), say('Powdery', 'Alle geben Kraft. Niemand muss eine andere Elfe ersetzen.'), say('Icy', 'Konzentriere dich auf das Leben im Wasser. Nicht auf deine Angst.')]),
    inspect('free_resonance', 'Kristall und Wasserleuchten', 590, [say('Fina', 'Silbas Kristall und das Gefäß pulsieren im gleichen Takt.'), say('Cold', 'Das ist die Verbindung. Du gibst ihrer Lebensenergie den zugehörigen Kristall zurück.')], { requiresFlags: ['free_support'], requiresItems: ['crystal', 'vesselClue'] }),
    puzzle('free_restore', 'Silba und die Gefangenen befreien', 1060, 'combine', 'Was verbindet Fina für den Wiederherstellungszauber?', [option('crystal', 'Silbas eigenen Kristall'), option('vessel', 'Das leuchtende Gefäß ohne Anhänger'), option('circle', 'Die gemeinsame Kraft des verbundenen Kreises'), option('sand', 'Die Sandkornprobe allein')], ['crystal', 'vessel', 'circle'], 'Silbas Kristall berührt ihr Gefäß. Fina spürt das Leben im Wasser; der verbundene Kreis trägt ihren Zauber. Licht durchzieht das ganze Verließ. Silba, die Kristallfee und alle gefangenen Elfen erhalten ihre Gestalt zurück.', 'Fina: Kristall, zugehöriges Gefäß und die Kraft aller. Niemand soll allein die ganze Befreiung tragen.', { requiresFlags: ['free_resonance'], requiresItems: ['crystal', 'vesselClue'], removeItems: ['crystal', 'vesselClue'] }),
    talk('free_mother', 'Silba in die Arme schließen', 880, [say('Silba', 'Fina. Du hast mich gefunden.'), say('Fina', 'Ich habe deinen Kristall nie weggegeben. Nicht einen Tag.'), say('Silba', 'Er hat dich zu mir gebracht. Aber den Weg bist du mit deinen Freundinnen gegangen.'), say('Fina', 'Wir sind jetzt alle hier. Und ich möchte dich erst einmal nicht mehr loslassen.')], { requiresFlags: ['free_restore'], repeatText: 'Silba: Ich bin bei dir, Fina. Du darfst dir Zeit nehmen.' }),
    talk('free_queen', 'Die befreite Königin begrüßen', 1260, [say('Kristallfee', 'Ihr habt uns allen unsere Gestalt zurückgegeben. H2O, auch eure Entscheidung hat uns geholfen.'), say('Muck', 'Ich habe währenddessen aufgepasst. Und mich erfolgreich von allen Tropfen ferngehalten.'), say('Erzählung', 'Auf der Treppe hört ihr schwere Schritte. Lord Regis kommt ins Verließ.')], { requiresFlags: ['free_mother'] }),
    exit('free_exit', 'Regis gegenübertreten', ['free_queen'], 'regis_finale'),
  ]),
  scene('regis_finale', 'Mucks großer Moment', 6, 'Eine Mücke stoppt den Auflösungszauber', 'wasserverlies', '23', [actor('regis', 1180)], [
    say('Lord Regis', 'Ihr habt die Gefangenen befreit! H! 2! O!'),
    say('Fina', 'Sie haben sich entschieden. Es ist vorbei, Regis.'),
    say('Kristallfee', 'Legt euren Speer nieder. Die Herrschaft gehört nicht eurem Zorn.'),
    say('Lord Regis', 'Dann soll mein letzter Zauber euer ganzes Eis auflösen!'),
  ], [
    action('final_spell', 'Regis’ letzten Zauber erleben', 'encounter', 980, [say('Erzählung', 'Regis richtet seinen Speer auf die Elfen. Eine Welle aus warmer Magie lässt ihre Gestalt schwanken.'), say('Fina', 'Ich kann meinen Ring nicht halten …'), say('Erzählung', 'Cold, Icy, Powdery und Silba sinken mit den anderen Elfen nieder. Muck bleibt in der Luft.'), say('Muck', 'Warum macht mir das nichts? Oh. Ich bin keine Elfe. Ich bin eine Mücke!')]),
    inspect('final_muck', 'Die unberührte Muck', 550, [say('Fina', 'Sein Zauber löst Elfenmagie auf. Muck besteht nicht daraus.'), say('Muck', 'Ich kann nicht zaubern, aber ich kann fliegen. Und stechen. Das hatte ich erwähnt.')], { requiresFlags: ['final_spell'] }),
    puzzle('final_action', 'Muck um Hilfe bitten', 850, 'choice', 'Welche Handlung kann Regis jetzt aufhalten?', [option('muck', 'Muck fliegt zu Regis und entzieht ihm mit ihrem Rüssel Wasser'), option('fina', 'Fina soll allein noch mehr Auflösungsmagie verwenden'), option('water', 'Muck soll selbst einen Elfenzauber sprechen')], ['muck'], 'Fina ruft Muck zu Hilfe. Die Mücke fliegt durch den Elfenzauber, sticht Regis und trinkt sein Wasser. Seine Kraft schwindet; der Zauber bricht ab. Regis sinkt bewusstlos zu Boden.', 'Muck: Elfenzauber kann ich nicht. Meine Flügel und mein Rüssel funktionieren aber auch dann, wenn eure Magie schwankt.', { requiresFlags: ['final_muck'] }),
    talk('final_thanks', 'Muck danken', 650, [say('Muck', 'Päh! Wasser! Wirklich das allerschlechteste Getränk im Himmel!'), say('Fina', 'Und trotzdem hast du uns gerettet. Danke, Muck.'), say('Kristallfee', 'Mut bedeutet manchmal, etwas Unangenehmes für die anderen zu tun. Wir vergessen dir das nicht.')], { requiresFlags: ['final_action'] }),
    inspect('final_custody', 'Regis wird bewacht', 1240, [say('Erzählung', 'Die nun loyalen Nebelwachen nehmen den entkräfteten Regis in Gewahrsam. Er wird ins Eisverließ gebracht.'), say('Cold', 'Alle Gefangenen sind frei. Jetzt kann die Stadt wieder atmen.')], { requiresFlags: ['final_thanks'] }),
    exit('final_exit', 'In den hellen Thronsaal', ['final_custody'], 'ehrung'),
  ]),
  scene('ehrung', 'Die vier Eisklingen', 6, 'Mut verdient Anerkennung', 'thron', '24', [actor('kristallfee', 1090), actor('silba', 720)], [
    say('Kristallfee', 'Die befreiten Elfen sind heute wieder miteinander versammelt.'),
    say('Silba', 'Fina, ich bin stolz auf dich. Und auf die Freundinnen, die dir vertraut haben.'),
    say('Powdery', 'Mein Mantel hat beschlossen, heute nichts mehr zu beanstanden.'),
    say('Muck', 'Sehr großzügig von ihm.'),
  ], [
    talk('honor_fina', 'Finas Ernennung', 1090, [say('Kristallfee', 'Fina aus Farbenquell, Tochter von Silba: Du kamst als Suchende. Dein Mut hat die Suche zur Rettung aller gemacht.'), say('Fina', 'Cold, Powdery, Icy und Muck haben mich getragen. H2O hat geholfen.'), say('Kristallfee', 'Darum trittst du nun als Eisklinge an ihre Seite. Deine Gabe soll den Schwachen dienen.')], { giveItems: ['honor'] }),
    talk('honor_four', 'Alle vier Eisklingen ehren', 890, [say('Kristallfee', 'Cold hielt den ersten Rückzug. Powdery schützte den geheimen Gang. Icy öffnete Fina den letzten Weg. Fina führte die Befreiung.'), say('Cold', 'Wir waren nicht immer nebeneinander. Wir haben trotzdem füreinander gehandelt.'), say('Icy', 'Von nun an sind es vier Eisklingen.'), say('Powdery', 'Und ich nehme die vierte ausdrücklich gern in die Gruppe auf.')], { requiresFlags: ['honor_fina'] }),
    talk('honor_muck', 'Mucks Ehrung', 600, [say('Kristallfee', 'Muck, dein Mut hat Regis gestoppt. Das Himmelsreich braucht auch kleine Wesen mit großen Entscheidungen.'), say('Muck', 'Ich werde das meiner Speisekarte mitteilen. Wasser bleibt trotzdem gestrichen.'), say('Fina', 'Dein Platz ist bei uns.')], { requiresFlags: ['honor_four'], y: 455 }),
    inspect('honor_h2o', 'H2Os neue Aufgabe', 1250, [say('Erzählung', 'H, 2 und O werden für ihren Sinneswandel gewürdigt. Sie übernehmen Kristallkekse und Schneemann-Logistik.'), say('O', 'Ein Plan mit Schnee!'), say('H', 'Und ohne nasse Empfehlungsschreiben.'), say('2', 'Ich erstelle dafür eine sehr präzise Zuständigkeitsliste.')], { requiresFlags: ['honor_muck'] }),
    exit('honor_exit', 'Zeit für Freundinnen und Familie', ['honor_h2o'], 'epilog'),
  ]),
  scene('epilog', 'Epilog: Eine für alle', 6, 'Farbenquell bleibt Zuhause – die Gruppe ist gewachsen', 'thron', '24', [actor('silba', 1060)], [
    say('Fina', 'Als ich aufbrach, hatte ich eine Tasche, einen Kristall und einen Wunsch.'),
    say('Cold', 'Jetzt hast du Verantwortung. Und Freundinnen.'),
    say('Muck', 'Und eine Mücke. Vergiss die hochwertige Reisebegleitung nicht.'),
    say('Silba', 'Und du hast mich wiedergefunden.'),
  ], [
    talk('epilogue_family', 'Mit Silba sprechen', 1060, [say('Fina', 'Ich möchte Vivid und Colorida alles erzählen. Farbenquell wartet bestimmt schon auf eine Nachricht.'), say('Silba', 'Dann erzähl ihnen von den Elfen, die dir halfen. Und dass ich wieder bei dir bin.'), say('Fina', 'Dieses Mal passe ich auf, dass H und O den Brief nicht bewässern.')]),
    talk('epilogue_friends', 'Mit den Eisklingen sprechen', 760, [say('Icy', 'Du bist mit uns gegangen, als du noch an dir gezweifelt hast.'), say('Powdery', 'Und du hast uns zurückgeholt. Eine ausgesprochen gute Fortsetzung unseres ersten Treffens.'), say('Cold', 'Du gehörst zu uns, Fina. Der Titel macht das jetzt nur für alle sichtbar.')], { requiresFlags: ['epilogue_family'] }),
    inspect('epilogue_rings', 'Vier ruhige Ringwaffen', 540, [say('Fina', 'Unsere vier Ringwaffen sind wieder eisblau und ruhig. Heute brauchen sie nicht zu leuchten.'), say('Muck', 'Gut. Ich brauche auch keinen weiteren Wassergeschmack für diesen Tag.')]),
    puzzle('epilogue_promise', 'Das gemeinsame Versprechen', 930, 'choice', 'Was nehmen die vier Eisklingen aus ihrer Reise mit?', [option('together', 'Füreinander einstehen und gemeinsam schützen'), option('alone', 'Immer alles allein schaffen müssen'), option('rank', 'Nur auf Titel und Ruhm achten')], ['together'], 'Die vier Eisklingen stehen mit Silba und Muck im Licht des Thronsaals. Die Stadt ist frei, Finas Mutter ist zurück und die Freundschaft bleibt. Ihre Reise hat sie zusammengeführt.', 'Icy: Niemand musste alles allein schaffen. Wir haben einander getragen – auch über die Abschnitte hinweg, die uns trennten.', { requiresFlags: ['epilogue_friends', 'epilogue_rings'] }),
    exit('epilogue_end', 'Die Geschichte abschließen', ['epilogue_promise'], null, { verb: 'Ende', icon: '✦', description: 'Fina, Cold, Powdery und Icy sind die vier Eisklingen. Silba lebt, die Kristallfee regiert wieder, und Muck hat ihren Platz bei ihnen gefunden. Die Himmelsstadt ist frei. Ende.', repeatText: 'Die Geschichte ist abgeschlossen. Die vier Eisklingen und Muck bleiben ein Team.' }),
  ]),
];
