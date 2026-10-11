import { STORY_CHARACTERS } from './story-data.js';
import { drawQuietSprite, heroView } from './animation.js';
import {drawSpriteFrame} from './sprite-frames.js';
import { placedHotspot, actorPose, sceneActors, snowParticles, fleeingGuards } from './story-layout.js';
import { drawWorldLife, drawCloudGliders } from './world-life.js';
import { drawPaintedProp } from './prop-art.js';
import { sandWorkers, drawSandWorker } from './sand-workers.js';
import { stagedActors } from './story-staging.js';
import { drawMovingActor } from './actor-motion.js';
import { drawCloudSheep } from './cloud-sheep.js';
import {storyActorHeight} from './story-space.js';
import {storyTransitionPose} from './story-transitions.js';
import {stageRoutePoint} from './opening-navigation.js';
import {consequentialActors,drawConsequences,fleeingFunkel} from './story-consequences.js';

const cache=new Map();
export function storyImage(url){
  if(!url)return null;
  if(!cache.has(url)){
    const img=new Image();img.src=url;cache.set(url,img);
  }
  const img=cache.get(url);
  return img.complete&&img.naturalWidth?img:null;
}
function standing(ctx,img,x,y,height,time,phase,reduced,grounded=true,facing=1,angle=0){
  if(!img)return;
  const w=height*img.width/img.height;
  ctx.save();ctx.translate(x,y);ctx.scale(facing,1);
  if(angle){ctx.translate(0,-height/2);ctx.rotate(angle);ctx.translate(0,height/2);}
  if(grounded){ctx.fillStyle='#173b4b33';ctx.beginPath();ctx.ellipse(0,-3,w*.26,8,0,0,Math.PI*2);ctx.fill();}
  drawQuietSprite(ctx,img,-w/2,-height,w,height,time,phase,reduced);ctx.restore();
}
function ambience(ctx,scene,time,reduced){
  if(reduced)return;
  ctx.save();
  const moon=scene.background.includes('mondtaugarten'),water=scene.background.includes('wasserverlies');
  for(let i=0;i<14;i++){
    const p=(time/(water?9000:15000)+i/14)%1;
    const x=95+i*110+Math.sin(time/2400+i)*17,y=water?850-p*510:210+p*650;
    ctx.globalAlpha=water?.2:moon?.45:.11;ctx.fillStyle=moon?'#d8e8ff':'#fff';
    ctx.beginPath();ctx.arc(x,y,moon?2:water?5:18,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}
function snowScene(ctx,time,state){
  const open=state.campaign.flags.includes('sluice_order');
  ctx.save();ctx.strokeStyle='#b9efff30';ctx.lineWidth=20;ctx.beginPath();ctx.moveTo(1470,220);ctx.quadraticCurveTo(1430,400,1220,520);ctx.stroke();
  for(const p of snowParticles(time,open,state.reducedMotion)){ctx.globalAlpha=p.kind==='slide'?1:.8;ctx.strokeStyle='#fff';ctx.lineWidth=p.kind==='slide'?2:1;ctx.beginPath();for(let arm=0;arm<3;arm++){const a=arm*Math.PI/3,dx=Math.cos(a)*p.radius,dy=Math.sin(a)*p.radius;ctx.moveTo(p.x-dx,p.y-dy);ctx.lineTo(p.x+dx,p.y+dy);}ctx.stroke();}
  ctx.restore();
}
function transformed(ctx,img,actor,progress,time,reduced){
  const height=actor.height??280,w=img?height*img.width/img.height:100;
  if(img&&progress<1){ctx.save();const remaining=height*(1-progress),spread=w*(1+progress*.2);ctx.globalAlpha=1-progress*.65;ctx.drawImage(img,actor.x-spread/2,actor.y-remaining,spread,remaining);ctx.restore();}
  ctx.save();ctx.fillStyle='#95e9ffe0';ctx.strokeStyle='#ecfaff';ctx.lineWidth=3;
  const vesselY=actor.y-12;
  ctx.beginPath();ctx.moveTo(actor.x-48,vesselY-55);ctx.quadraticCurveTo(actor.x-60,vesselY+10,actor.x,vesselY+18);ctx.quadraticCurveTo(actor.x+60,vesselY+10,actor.x+48,vesselY-55);ctx.stroke();
  ctx.globalAlpha=progress;ctx.beginPath();ctx.ellipse(actor.x,vesselY,42,10+progress*10,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#edfbff';for(let i=0;i<8;i++){const p=((reduced?1200:time)/1200+i/8)%1;ctx.beginPath();ctx.arc(actor.x+Math.sin(i*2)*29,actor.y-height*(1-progress)-p*height*.3,3,0,Math.PI*2);ctx.fill();}ctx.restore();
}
export function drawStory(ctx,images,state,scene,time){
  const originalBackground=storyImage(scene.background);
  const sheepAtlas=scene.id==='cirrus'?storyImage('assets/cloud-sheep.png'):null;
  const meadow=scene.id==='cirrus'?storyImage('assets/story/weide-living.png'):null;
  // Switch both layers together to avoid missing or duplicated sheep during loading.
  const livingMeadow=Boolean(sheepAtlas&&meadow);
  const background=livingMeadow?meadow:originalBackground;
  ctx.clearRect(0,0,1600,900);
  if(background)ctx.drawImage(background,0,0,1600,900);
  else{
    ctx.fillStyle='#163d50';ctx.fillRect(0,0,1600,900);ctx.fillStyle='#d6e5e7';ctx.font='24px Georgia';ctx.fillText('Die Kulisse wird geladen …',620,450);
  }
  ambience(ctx,scene,time,state.reducedMotion);
  drawWorldLife(ctx,scene.id,time,state.reducedMotion);
  drawCloudGliders(ctx,images.cloudGlider,scene.id,time,state.reducedMotion,images.distantGliders);
  if(livingMeadow)drawCloudSheep(ctx,sheepAtlas,scene.id,time,state.reducedMotion,state.worldSequence,state.campaign.flags.includes('story_cirrus_act'));
  if(scene.id==='schneeschleusen')snowScene(ctx,time,state);
  const interlude=['regis_intrige','thronsturz'].includes(scene.id);
  const actors=consequentialActors(scene,stagedActors(scene,{...state.campaign,companions:interlude?[]:state.campaign.companions},state.staging,time,state.reducedMotion),state,time);
  const departure=state.campaignTransition?.phase==='out'?state.campaignTransition:null;
  if(departure&&!interlude)for(const actor of actors.filter(a=>state.campaign.companions.includes(a.id)&&a.id!=='muck')){
    const p=storyTransitionPose(departure,time,state.reducedMotion).progress;
    const route=[{x:actor.x,y:actor.y},...departure.route.slice(1)];
    const pose=stageRoutePoint(route,Math.max(0,(p-.07)/.93));
    actor.height=storyActorHeight(scene,{...actor,y:actor.y},pose.y);
    Object.assign(actor,{x:pose.x,y:pose.y,dx:pose.dx,dy:pose.dy,walking:p<1,facing:pose.dx>=0?1:-1});
  }
  if(!interlude){
    if(scene.id==='befreiung')actors.push({id:'silba',x:1180,y:810,height:295},{id:'kristallfee',x:1420,y:800,height:300});
    if(scene.id==='regis_finale')actors.push({id:'silba',x:1100,y:835,height:290},{id:'kristallfee',x:1420,y:800,height:310});
  }
  if(state.visualEffect&&['melt','dissolve'].includes(state.visualEffect.type)){
    const regis=actors.find(a=>a.id==='regis'),queen=actors.find(a=>a.id==='kristallfee');
    if(regis){ctx.save();ctx.strokeStyle='#89d9ffbb';ctx.lineWidth=9;ctx.shadowColor='#9eeaff';ctx.shadowBlur=state.reducedMotion?0:25;ctx.beginPath();ctx.moveTo(regis.x-50,regis.y-160);ctx.lineTo(state.visualEffect.type==='melt'?queen?.x??960:state.position.x,state.visualEffect.type==='melt'?queen?.y-160:state.position.y-120);ctx.stroke();ctx.restore();}
  }
  const workers=sandWorkers(scene.id);
  const layout={...scene,layoutActors:[...sceneActors(scene,state.campaign.companions,state.campaign.flags),...workers]};
  if(scene.id==='wolkenhain'&&state.campaign.flags.includes('grove_truth')&&!state.campaign.flags.includes('grove_team')){
    ctx.save();ctx.strokeStyle='#99ddffcc';ctx.lineWidth=6;ctx.lineCap='round';
    for(const [i,guard] of actors.filter(a=>a.id==='nebelwache').entries()){
      const p=state.reducedMotion?.55:(time/2400+i*.45)%1;
      if(p>.7)continue;
      const startX=guard.x-25,startY=guard.y-guard.height*.55,endX=890,endY=630;
      ctx.beginPath();ctx.moveTo(startX,startY);ctx.quadraticCurveTo((startX+endX)/2,startY-25,endX,endY);ctx.stroke();
    }
    ctx.restore();
  }
  const shown=new Set();
  for(const h of (scene.hotspots??[]).filter(h=>h.prop&&!h.nativeArtwork)){
    const target=placedHotspot(h,layout),key=`${target.x}:${target.y}`;
    if(shown.has(key)||h.type==='take'&&state.campaign.viewed.includes(`${scene.id}:${h.id}`))continue;
    shown.add(key);const done=state.campaign.flags.includes(`explore_${scene.id}_use`);drawPaintedProp(ctx,images,target,done);
  }
  const entities=actors.filter(actor=>actor.id!=='fina'&&(actor.id!=='muck'||!state.campaign.companions.includes('muck'))).map((actor,i)=>({y:actor.y,draw:()=>{
    ctx.save();ctx.globalAlpha=actor.alpha??1;
    const pose=actorPose(actor,time,state.reducedMotion||interlude),img=storyImage(STORY_CHARACTERS[actor.id]?.asset);
    const effect=state.visualEffect;
    if(scene.id==='befreiung'&&['silba','kristallfee'].includes(actor.id)&&(effect?.type==='restore'||!state.campaign.flags.includes('free_restore'))){transformed(ctx,img,actor,effect?.type==='restore'?1-effect.progress:1,time,state.reducedMotion);ctx.restore();return;}
    const melting=scene.id==='thronsturz'&&actor.id==='kristallfee'&&(effect?.type==='melt'||state.campaign.flags.includes('fall_trap'));
    const dissolving=scene.id==='regis_finale'&&['cold','powdery','icy','silba','kristallfee'].includes(actor.id)&&(effect?.type==='dissolve'||state.campaign.flags.includes('final_spell'))&&!state.campaign.flags.includes('final_action');
    if(melting||dissolving){transformed(ctx,img,actor,effect?effect.progress:1,time,state.reducedMotion);ctx.restore();return;}
    if(actor.walking&&!state.reducedMotion&&actor.id!=='muck'&&actor.id!=='funkel')drawMovingActor(ctx,images,img,actor,time);
    else standing(ctx,img,pose.x,pose.y+(actor.id==='muck'&&!state.reducedMotion?Math.sin(time/1600)*1.5:0),actor.height??280,time,i,state.reducedMotion,actor.id!=='muck',actor.walking?actor.facing:pose.facing,actor.id==='muck'&&actor.walking?Math.atan2(actor.dy,Math.abs(actor.dx)):0);
    ctx.restore();
  }}));
  const escaping=fleeingFunkel(scene,state,time);
  if(escaping)entities.push({y:escaping.y,draw:()=>{ctx.save();ctx.globalAlpha=escaping.alpha;standing(ctx,storyImage(STORY_CHARACTERS.funkel.asset),escaping.x,escaping.y,escaping.height,time,0,true,false,escaping.facing);ctx.restore();}});
  if(!interlude)entities.push({y:state.position.y,draw:()=>{
    const height=storyActorHeight(scene,{id:'fina'},state.position.y);
    ctx.save();ctx.translate(state.position.x,state.position.y);
    const view=heroView(state);
    if(view==='side')ctx.scale(state.facing,1);
    if(state.moving&&!state.reducedMotion){
      const sheet=view==='side'?images.finaWalk:images.finaDepthWalk;
      const frame=view==='side'?state.walkFrame:Math.floor(state.walkFrame/2),row=view==='side'?Math.floor(frame/4):view==='back'?1:0;
      if(!drawSpriteFrame(ctx,sheet,frame%4,row,height))standing(ctx,images.fina,0,0,height,time,4,true);
    }else if(scene.id==='regis_finale'&&(state.visualEffect?.type==='dissolve'||state.campaign.flags.includes('final_spell'))&&!state.campaign.flags.includes('final_action'))transformed(ctx,images.fina,{x:0,y:0,height},state.visualEffect?.progress??1,time,state.reducedMotion);
    else standing(ctx,images.fina,0,0,height,time,4,state.reducedMotion);
    ctx.restore();
  }});
  for(const worker of workers)entities.push({y:worker.y,draw:()=>drawSandWorker(ctx,images.sandWorkers,worker,time,state.reducedMotion)});
  for(const guard of fleeingGuards(scene,state.campaign.flags,state.guardDeparture,time,state.reducedMotion))entities.push({y:guard.y,draw:()=>{
    ctx.save();ctx.globalAlpha=guard.alpha;
    standing(ctx,storyImage(STORY_CHARACTERS[guard.id]?.asset),guard.x,guard.y,guard.height,time,0,true,true,guard.facing);
    ctx.restore();
  }});
  if(!interlude&&state.campaign.companions.includes('muck'))entities.push({y:state.muck.y,draw:()=>{
    const bob=state.reducedMotion?0:Math.sin(time/1600)*1.5;
    standing(ctx,images.muck,state.muck.x,state.muck.y+bob,110,time,0,true,false,state.muck.facing??1,state.muck.angle??0);
  }});
  entities.sort((a,b)=>a.y-b.y).forEach(entity=>entity.draw());
  drawConsequences(ctx,scene,state,time);
  if(state.destination){ctx.strokeStyle='#fff0be';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(state.destination.x,state.destination.y,12,5,0,0,Math.PI*2);ctx.stroke();}
  const hovered=state.hoveredId&&(scene.hotspots??[]).find(h=>h.id===state.hoveredId);
  if(hovered&&!['talk','exit'].includes(hovered.type)){
    const h=placedHotspot(hovered,layout);ctx.save();ctx.globalCompositeOperation='screen';
    const glow=ctx.createRadialGradient(h.x,h.y,3,h.x,h.y,62);glow.addColorStop(0,'#d3edff60');glow.addColorStop(.55,'#d3edff20');glow.addColorStop(1,'#d3edff00');ctx.fillStyle=glow;ctx.fillRect(h.x-62,h.y-62,124,124);ctx.restore();
  }
}
