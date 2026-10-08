// Deliberate object closeups. Unmapped details must never fall back to an entire scene.
const detail = (file, alt) => Object.freeze({ src: `assets/details/${file}.svg`, alt, fit: 'contain', kind: 'detail' });
export const INSPECTIONS = Object.freeze({
  cirrus_clouds: detail('cloud-sheep', 'Nahansicht: ein kleines Wolkenschäfchen mit dunklem Gewitterbauch'),
  cirrus_gap: detail('broken-cloud-path', 'Nahansicht: zwei Wolkenkanten und die offene Lücke dazwischen'),
  kumulus_wind: detail('wind-current', 'Detail: Windlinien tragen den Ruf über die offene Wolkenkante'),
  kumulus_own: detail('fina-crystal', 'Nahansicht: Finas eigener Schmuckkristall an seiner Kette'),
  flight_wings: detail('wing-joint', 'Nahansicht: Flügelgelenk, Streben und gespannte Membran'),
  muck_route: detail('net-route', 'Detail: eine breite Wolkenstraße führt zu den Sandfangnetzen'),
  sand_nets: detail('sand-net', 'Nahansicht: feine Netzmaschen fangen kleine Sandkörner ein'),
  sand_growth: detail('snowcrystal-model', 'Vergrößertes Schneekristallmodell: Sandkorn, sechseckige Mitte und sechs Arme'),
  sand_city: detail('silver-towers', 'Vergrößertes Fernsichtdetail: silberne Türme über der Wolkendecke'),
  gate_tracks: detail('wet-tracks', 'Nahansicht: zwei glänzende nasse Spuren biegen um eine Eissäule'),
  cold_column: detail('column-tracks', 'Detail: hinter einer Eissäule führt die nasse Spur um die Ecke'),
  powdery_hem: detail('stained-hem', 'Nahansicht: ein nasser Stiefelabdruck auf Powderys glitzerndem Mantelsaum'),
  icy_empty_lane: detail('empty-lane', 'Detail: die stille Seitengasse und die letzten versickernden Tropfen'),
  sluice_controls: detail('sluice-levers', 'Nahansicht: drei Schleusenhebel mit Zeichen für Sammeln, Ordnen und Rutschen'),
  grove_attacks: detail('water-and-ice', 'Detail: ein harter Wasserstrahl trifft auf Eis und bremsenden Pulverschnee'),
  aria_letter: detail('wet-letter', 'Nahansicht: Coloridas Zeichen auf dem aufgeweichten Empfehlungsschreiben'),
  plot_orders: detail('sealed-order', 'Detail: Regis’ Befehl zum Training mit verriegelten Ausgängen'),
  plot_arena: detail('arena-seal', 'Nahansicht: das geschlossene Arenator mit Schloss und magischem Siegel'),
  fall_trap: detail('magic-bowl', 'Nahansicht: die goldene Schale hält lebendig leuchtendes Wasser fest'),
  fall_escape_route: detail('ice-curtain-gap', 'Detail: ein schmaler Durchgang hinter dem gezackten Eisvorhang'),
  warning_patrol: detail('guarded-passage', 'Detail: gekreuzte Waffen und dichter Nebel sperren die Eisgasse'),
  observatory_mirrors: detail('mirror-map', 'Nahansicht: zwei Spiegel lenken einen Lichtstrahl auf die Wolkenkarte'),
  moon_drops: detail('moon-dew', 'Nahansicht: schwebende Tropfen aus Mondlicht über einer freien Wolkenbahn'),
  prison_life: detail('living-water', 'Nahansicht: Wassergefäße mit lebendigem Licht in ihrer Mitte'),
  prison_pendants: detail('vessel-pendants', 'Vergleichsdetail: Blitzfühler-Anhänger, Sandfänger-Anhänger und eine leere Kette'),
  prison_hide: detail('pillar-refuge', 'Detail: der geschützte Platz hinter der breiten Eissäule'),
  free_resonance: detail('crystal-resonance', 'Nahansicht: Silbas Kristall und das Wassergefäß leuchten im gleichen Takt'),
  final_muck: detail('muck-closeup', 'Nahansicht der unversehrten Muck: Brille, Rüssel und ihre eigenen Flügel'),
  final_custody: detail('custody-lock', 'Nahansicht: die Nebelwachen sichern den Zugang zum Eisverließ'),
  honor_h2o: detail('snow-logistics', 'Detail: H2Os Plan für Kristallkekse und kleine Schneemänner'),
  epilogue_rings: detail('idle-rings', 'Nahansicht: vier einzelne eisblaue Ringwaffen ohne magisches Leuchten'),
});

const OPENING_INSPECTIONS = Object.freeze({
  stairs: detail('cloud-steps', 'Nahansicht: weiche Wolkenstufen führen aus Farbenquell hinaus'),
  clouds: Object.freeze({ src: 'assets/wolkenmeer.png', alt: 'Das Wolkenmeer bis zum fernen Horizont', fit: 'cover', kind: 'detail' }),
});

export function getInspection(scene, hotspot) {
  if (!scene || !hotspot) return null;
  if (scene.id === 'farbenquell') return OPENING_INSPECTIONS[hotspot.id] ?? null;
  if (hotspot.type !== 'inspect') return null;
  return INSPECTIONS[hotspot.id] ?? null;
}
