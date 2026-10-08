// Bildkoordinaten beziehen sich auf die logische Bühne von 1600 × 900.
// Zeichen liegen an den dargestellten Objekten, Laufziele bleiben davor.
import { storyPoint } from './story-navigation.js';
export const OBJECT_POSITIONS={
  cirrus_clouds:[1170,415],cirrus_gap:[1455,445],cirrus_exit:[1200,360],
  kumulus_wind:[1170,300],kumulus_own:[440,720],kumulus_signal:[900,525],kumulus_exit:[1440,410],
  flight_wings:[1010,500],flight_secure:[1040,640],flight_landing:[1320,660],
  muck_route:[1270,380],muck_agreement:[660,660],
  sand_nets:[145,445],sand_growth:[1080,535],sand_sort:[315,550],sand_city:[1180,255],
  gate_tracks:[1120,570],gate_path:[760,535],gate_exit:[850,570],
  cold_column:[190,480],powdery_hem:[1040,720],powdery_response:[790,650],icy_empty_lane:[1230,440],icy_schedule:[650,650],
  sluice_controls:[310,390],sluice_order:[700,390],sluice_purpose:[1170,380],sluice_exit:[180,280],
  aria_letter:[470,685],aria_oath:[790,620],
  plot_water:[680,415],plot_arena:[420,355],plot_understand:[940,590],
  fall_trap:[800,470],fall_escape_route:[1330,445],fall_escape:[1390,610],
  warning_patrol:[1290,380],warning_route:[770,580],warning_hide:[280,540],
  workshop_parts:[600,405],workshop_flake:[810,350],workshop_cold_hold:[1330,560],
  observatory_mirrors:[255,395],observatory_light:[530,425],observatory_door:[245,485],observatory_powdery_hold:[1370,585],
  moon_drops:[910,465],moon_route:[950,565],moon_icy_hold:[1310,575],
  prison_life:[775,260],prison_pendants:[1130,320],prison_identity:[780,460],prison_hide:[80,540],
  h2o_decision:[470,575],h2o_reunion:[645,500],free_support:[650,640],free_resonance:[780,290],free_restore:[800,440],free_mother:[1180,480],free_queen:[1420,460],
  final_spell:[810,420],final_muck:[1140,405],final_action:[1140,550],final_custody:[1340,570],
  honor_four:[780,660],honor_muck:[1190,405],honor_h2o:[1340,430],
  epilogue_friends:[760,485],epilogue_rings:[760,640],epilogue_promise:[940,660],
};
export function placedHotspot(h,scene){
  const point=OBJECT_POSITIONS[h.id];
  const actor=(scene.actors??[]).find(a=>a.x===h.x);
  if(point)return {...h,x:point[0],y:point[1],approach:h.type==='exit'?storyPoint({x:point[0],y:point[1]}):h.approach};
  if(h.type==='exit')return {...h,approach:storyPoint({x:h.x,y:h.y})};
  if(h.type==='talk'&&actor)return {...h,y:actor.y-(actor.height??280)-40};
  return h;
}
