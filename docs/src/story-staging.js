import {sceneActors} from './story-layout.js';
import {storyActorHeight,storyPortal} from './story-space.js';
import {stageRoutePoint} from './opening-navigation.js';

// Entrances are one-shot, caused by arrival or a completed story action.
// No character paces indefinitely; walking ends at a meaningful destination.
export const ENTRANCES={
  cirrus:{cirrus:{portal:'entry'}},
  wolkenseglerflug:{kian:{portal:'exit'}},
  muck:{muck:{from:{x:1700,y:450},delay:300}},
  stadttor:{h:{portal:'exit'},o:{portal:'exit',delay:400}},
  cold:{cold:{portal:'entry'}},
  powdery:{powdery:{portal:'entry'}},
  icy:{icy:{portal:'entry'}},
  schneeschleusen:{chrysta:{portal:'entry'}},
  wolkenhain:{icy:{portal:'entry'},cold:{portal:'entry',delay:400},powdery:{portal:'entry',delay:800},h:{trigger:'grove_truth',portal:'entry'},o:{trigger:'grove_truth',portal:'entry',delay:350},nebelwache:{trigger:'grove_truth',portal:'entry',delay:700}},
  aria:{aria:{trigger:'aria_letter',portal:'entry'}},
  regis_intrige:{two:{trigger:'plot_orders',portal:'entry'}},
  thronsturz:{regis:{portal:'entry'}},
  funkels_warnung:{funkel:{from:{x:1700,y:620}}},
  kristallwerkstatt:{chrystel:{trigger:'explore_kristallwerkstatt_clue',portal:'entry'},nebelwache:{trigger:'workshop_flake',portal:'entry'}},
  observatorium:{christi:{trigger:'explore_observatorium_clue',portal:'entry'},nebelwache:{trigger:'observatory_door',portal:'entry'}},
  mondtaugarten:{nebelwache:{trigger:'moon_route',portal:'entry'}},
  h2o_wende:{h:{portal:'entry'},two:{portal:'entry',delay:450},o:{portal:'entry',delay:900}},
  befreiung:{h:{portal:'entry'},two:{portal:'entry',delay:450},o:{portal:'entry',delay:900}},
  regis_finale:{regis:{portal:'entry'}},
  ehrung:{kristallfee:{portal:'entry'}},
  epilog:{silba:{portal:'entry'}},
};
/** Move a delayed visitor's opening conversation to the first available talk. */
export function prepareStagedStory(scenes){
  for(const [id,talkId] of [['aria','aria_story'],['kristallwerkstatt','workshop_master'],['observatorium','observatory_help']]){
    const scene=scenes.find(s=>s.id===id),talk=scene.hotspots.find(h=>h.id===talkId);
    talk.pages=[...scene.intro,...talk.pages];scene.intro=[];
  }
  for(const [id,triggerId,talkId,speaker] of [['aria','aria_letter','aria_story','Meisterin Aria'],['regis_intrige','plot_orders','plot_water','2']]){
    const scene=scenes.find(s=>s.id===id),trigger=scene.hotspots.find(h=>h.id===triggerId),talk=scene.hotspots.find(h=>h.id===talkId);
    talk.arrivalTrigger=triggerId;
    const delayed=[...scene.intro.filter(line=>line.speaker===speaker),...trigger.pages.filter(line=>line.speaker===speaker)];
    scene.intro=scene.intro.filter(line=>line.speaker!==speaker);trigger.pages=trigger.pages.filter(line=>line.speaker!==speaker);
    talk.pages=[...delayed,...talk.pages];
  }
}
const actorKey=(actor,index,actors)=>`${actor.id}:${actors.slice(0,index).filter(other=>other.id===actor.id).length}`;
const entranceRule=(scene,actor,index,campaign)=>ENTRANCES[scene.id]?.[actor.id]??(campaign.companions.includes(actor.id)&&actor.id!=='muck'?{from:storyPortal(scene,'entry')[0],portal:'entry',delay:index*160}:null);
const REACTIONS={cirrus:{cirrus:70},wolkenseglerflug:{kian:120},cold:{cold:-60},powdery:{powdery:80},icy:{icy:-70},schneeschleusen:{chrysta:-90},aria:{aria:-80},regis_intrige:{two:85},funkels_warnung:{funkel:-100},h2o_wende:{h:-80,two:-80,o:-80},ehrung:{kristallfee:-60},epilog:{silba:-100}};
export function createStaging(scene,campaign,time=0,resumed=false){
  return {sceneId:scene.id,startedAt:time,arrivals:{},settled:new Set(),resumed,knownFlags:new Set(campaign.flags),introPending:false};
}
export function syncStaging(scene,campaign,staging,time){
  if(!staging||staging.sceneId!==scene.id)return false;
  let changed=false;
  if(campaign.flags.includes(`story_${scene.id}_act`)&&staging.reaction===undefined){staging.reaction=staging.resumed&&staging.knownFlags.has(`story_${scene.id}_act`)?-Infinity:time;changed=true;}
  if(staging.reaction!==undefined&&!staging.reactionSettled&&time>=staging.reaction+1100){staging.reactionSettled=true;changed=true;}
  const actors=sceneActors(scene,campaign.companions,campaign.flags);
  for(const [index,actor] of actors.entries()){
    const rule=entranceRule(scene,actor,index,campaign);
    if(!rule)continue;
    const key=actorKey(actor,index,actors),available=!rule.trigger||campaign.flags.includes(rule.trigger);
    if(available&&staging.arrivals[key]===undefined){
      // Saved entrances have already happened; resuming never replays an old event.
      staging.arrivals[key]=staging.resumed&&(!rule.trigger||staging.knownFlags.has(rule.trigger))?-Infinity:time+(rule.delay??0);
      changed=true;
    }
    const start=staging.arrivals[key];
    if(start!==undefined&&time>=start+1800&&!staging.settled.has(key)){staging.settled.add(key);changed=true;}
  }
  return changed;
}
export function stagedActors(scene,campaign,staging,time,reduced=false){
  const actors=sceneActors(scene,campaign.companions,campaign.flags);
  return actors.flatMap((actor,index)=>{
    if(scene.id==='thronsturz'&&actor.id==='funkel'&&campaign.flags.includes('story_thronsturz_act'))return [];
    if(scene.id==='funkels_warnung'&&actor.id==='funkel'&&campaign.flags.includes('warning_hide'))return [];
    const rule=entranceRule(scene,actor,index,campaign);
    if(rule?.trigger&&!campaign.flags.includes(rule.trigger))return [];
    if(!staging||!rule||reduced)return [{...actor,x:actor.x+(campaign.flags.includes(`story_${scene.id}_act`)?REACTIONS[scene.id]?.[actor.id]??0:0),walking:false}];
    const start=staging.arrivals[actorKey(actor,index,actors)];
    if(start===undefined||time<start)return [];
    const p=Math.min(1,Math.max(0,(time-start)/1800));
    const route=actorEntranceRoute(scene,actor,rule);
    const reaction=staging.reaction,shift=REACTIONS[scene.id]?.[actor.id]??0;
    if(p===1&&campaign.flags.includes(`story_${scene.id}_act`)&&shift){
      const q=reaction===undefined||staging.resumed?1:Math.min(1,Math.max(0,(time-reaction)/1100));
      return [{...actor,x:actor.x+shift*q,walking:q<1,facing:shift>0?1:-1,walkProgress:q}];
    }
    const pose=stageRoutePoint(route,p);
    return [{...actor,x:pose.x,y:pose.y,dx:pose.dx,dy:pose.dy,walking:p<1,facing:pose.dx>=0?1:-1,alpha:Math.min(1,p/.12),walkProgress:p}];
  }).map(actor=>({...actor,height:storyActorHeight(scene,actors.find(a=>a.id===actor.id)??actor,actor.y)}));
}
export function actorEntranceRoute(scene,actor,rule){
 const portal=rule.portal==='exit'?storyPortal(scene,'exit').reverse():rule.portal==='entry'?storyPortal(scene,'entry'):[rule.from];
 return [...portal,{x:actor.x,y:actor.y}];
}
export function introDelay(scene,campaign){
  const rules=Object.values(ENTRANCES[scene.id]??{}).filter(r=>!r.trigger);
  return rules.length?1800+Math.max(...rules.map(r=>r.delay??0)):0;
}
