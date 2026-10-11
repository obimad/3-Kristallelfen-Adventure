// Bildkoordinaten beziehen sich auf die logische Bühne von 1600 × 900.
// Zeichen liegen an den dargestellten Objekten, Laufziele bleiben davor.
import { storyPoint } from './story-navigation.js';
export const OBJECT_POSITIONS={
  explore_cirrus_clue:[1400,575],explore_cirrus_use:[1400,575],explore_cirrus_tool:[290,470],
  cirrus_clouds:[1170,415],cirrus_gap:[1455,445],cirrus_exit:[1200,360],
  kumulus_wind:[1170,300],kumulus_own:[440,720],kumulus_signal:[900,525],kumulus_exit:[1440,410],
  flight_secure:[1040,640],flight_landing:[1320,660],
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
  h2o_decision:[470,575],h2o_reunion:[645,500],free_support:[650,640],free_resonance:[800,420],free_restore:[800,440],free_mother:[1180,480],free_queen:[1420,460],
  final_spell:[810,420],final_muck:[1140,405],final_action:[1140,550],final_custody:[1340,570],
  honor_four:[780,660],honor_muck:[1190,405],honor_h2o:[1340,430],
  epilogue_friends:[760,485],epilogue_rings:[760,640],epilogue_promise:[940,660],
  explore_epilog_detail:[1380,575],
};
function objectPoint(h,scene,actors){
  const assigned=new Map(),occupied=[];
  const clear=(x,y)=>actors.every(a=>a.id==='muck'||Math.abs(x-a.x)>145||y+45<a.y-(a.height??280)||y-45>a.y)&&occupied.every(p=>Math.abs(x-p.x)>105||Math.abs(y-p.y)>85);
  for(const object of scene.hotspots??[h]){
    if(['talk','exit'].includes(object.type))continue;
    const key=`${object.x}:${object.y}`;
    if(!assigned.has(key)){
      const point=OBJECT_POSITIONS[object.artId??object.id];let x=point?.[0]??object.x,y=point?.[1]??object.y;
      if(!clear(x,y)){
        const candidates=[];
        for(const py of [300,400,500,600,690])for(const px of [155,330,510,690,870,1050,1230,1430])if(clear(px,py))candidates.push({x:px,y:py});
        const nearest=candidates.sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];if(nearest){x=nearest.x;y=nearest.y;}
      }
      assigned.set(key,{x,y});occupied.push({x,y});
    }
    if(object.id===h.id)return assigned.get(key);
  }
  return {x:OBJECT_POSITIONS[h.id]?.[0]??h.x,y:OBJECT_POSITIONS[h.id]?.[1]??h.y};
}
export function placedHotspot(h,scene){
  const point=OBJECT_POSITIONS[h.id];
  const actors=scene.layoutActors??scene.actors??[];
  if((h.artId??h.id)==='flight_wings'){
    const kian=actors.find(a=>a.id==='kian');
    if(kian){
      const height=kian.height??310;
      return {...h,x:kian.x+height*.22,y:kian.y-height*.51,width:height*.2,height:height*.27,attachedTo:'kian',approach:storyPoint({x:kian.x+130,y:kian.y+35})};
    }
  }
  const actor=actors.find(a=>a.id===h.actorId)??actors.find(a=>a.x===h.x)??actors.find(a=>a.id===scene.actors?.find(original=>original.x===h.x)?.id);
  if((h.type==='talk'||h.conversation)&&actor)return {...h,x:actor.x,y:actor.y-(actor.height??280)/2,width:105,height:actor.height??280,approach:storyPoint({x:actor.x-95,y:actor.y}),actorId:actor.id};
  if(!['talk','exit'].includes(h.type)){
    const {x,y}=objectPoint(h,scene,actors);
    return {...h,x,y,width:100,height:76,approach:storyPoint({x:x-100,y:800})};
  }
  if(point)return {...h,x:point[0],y:point[1],approach:h.type==='exit'?storyPoint({x:point[0],y:point[1]}):h.approach};
  if(h.type==='exit')return {...h,approach:storyPoint({x:h.x,y:h.y})};
  return h;
}

export function actorPose(actor,time,reduced=false){
  return {x:actor.x,y:actor.y,moving:false,facing:1};
}

export function sceneActors(scene,companions=[],flags=[]){
  const actors=(scene.actors??[]).filter(a=>!(scene.id==='stadttor'&&flags.includes('gate_protest')&&['h','o'].includes(a.id))).map(a=>({...a}));
  if(scene.id==='wolkenhain'&&flags.includes('grove_truth')&&!flags.includes('grove_team')){
    for(const [i,actor] of actors.entries())actor.x=[570,730,890][i]??actor.x;
    actors.push({id:'h',x:1190,y:730,height:260},{id:'o',x:1435,y:760,height:270},{id:'nebelwache',x:1055,y:660,height:235},{id:'nebelwache',x:1510,y:620,height:225});
  }
  for(const [id,arrival,departure] of [['kristallwerkstatt','workshop_flake','workshop_cold_hold'],['observatorium','observatory_door','observatory_powdery_hold'],['mondtaugarten','moon_route','moon_icy_hold']]){
    if(scene.id===id&&flags.includes(arrival)&&!flags.includes(departure))actors.push({id:'nebelwache',x:1450,y:755,height:285});
  }
  for(const [id,x] of [['cold',510],['powdery',700],['icy',890]])if(companions.includes(id)&&!actors.some(a=>a.id===id))actors.push({id,x,y:825,height:310});
  return actors;
}

export function fleeingGuards(scene,flags,departure,time,reduced=false){
  if(scene.id!=='stadttor'||!flags.includes('gate_protest')||!departure||reduced)return [];
  const elapsed=time-departure.startedAt;
  if(elapsed<0||elapsed>=2000)return [];
  return scene.actors.filter(a=>['h','o'].includes(a.id)).map((actor,i)=>{
    const p=Math.min(1,Math.max(0,(elapsed-i*100)/1800));
    return {...actor,x:actor.x+(800+i*32-actor.x)*p,y:actor.y+(550-actor.y)*p,height:actor.height*(1-p*.6),alpha:Math.max(0,1-(p-.65)/.35),facing:-1};
  }).filter(a=>a.alpha>0);
}

export function snowParticles(time,open,reduced=false){
  const particles=[];
  for(let i=0;i<52;i++){
    const p=((reduced?1800:time)/9000+i*.618)%1;
    particles.push({kind:'fall',x:100+(i*97)%1400+Math.sin(p*8+i)*18,y:130+p*650,radius:2+(i%3)});
  }
  if(open)for(let i=0;i<24;i++){
    const p=((reduced?1800:time)/4200+i/24)%1;
    // Follow the existing chute on the right-hand arch of the illustrated scene.
    particles.push({kind:'slide',x:(1-p)**2*1470+2*(1-p)*p*1430+p*p*1220,y:(1-p)**2*220+2*(1-p)*p*400+p*p*520,radius:4+(i%3)});
  }
  return particles;
}
