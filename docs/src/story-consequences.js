import {stageRoutePoint} from './opening-navigation.js';
// One-shot changes caused by the player's actions, retained by campaign flags.
export function fleeingFunkel(scene,state,time){
 if(scene.id!=='thronsturz'||state.reducedMotion||state.storyReaction?.id!==scene.storyBeat.actionId)return null;
 const actor=scene.actors.find(a=>a.id==='funkel');if(!actor)return null;
 const p=Math.min(1,Math.max(0,(time-state.storyReaction.startedAt)/1800));if(p===1)return null;
 const pose=stageRoutePoint([{x:actor.x,y:actor.y},{x:1330,y:600},{x:1660,y:560}],p);
 return {...actor,...pose,alpha:Math.min(1,(1-p)*5),facing:pose.dx>=0?1:-1};
}
export function storySteps(scene,state){
 if(state.campaign.flags.includes(scene.storyBeat?.actionId))return scene.storyBeat.solution;
 return state.worldSequence?.sceneId===scene.id?state.worldSequence.selected:[];
}
export function consequentialActors(scene,actors,state,time){
 const steps=storySteps(scene,state),result=actors.map(actor=>({...actor}));
 const sequence=state.worldSequence?.sceneId===scene.id?state.worldSequence:null;
 const progress=state.reducedMotion||!sequence?1:Math.min(1,Math.max(0,(time-sequence.startedAt)/1400));
 const shift=(id,x,y)=>{const actor=result.find(a=>a.id===id);if(actor){actor.x+=(x-actor.x)*progress;actor.y+=(y-actor.y)*progress;actor.walking=progress<1;actor.facing=x>=actor.x?1:-1;}};
 if(scene.id==='befreiung'&&steps.includes('circle')){
  const center=sequence?.center??{x:800,y:800};
  shift('cold',center.x-170,center.y-35);
  shift('powdery',center.x+170,center.y-35);
  shift('icy',center.x+60,center.y+30);
 }
 if(scene.id==='ehrung'&&steps.includes('h2o')){
  for(const [id,x,height] of [['h',1190,300],['two',1290,190],['o',1400,300]]){
   if(!result.some(a=>a.id===id))result.push({id,x:1650+(x-1650)*progress,y:800,height,walking:progress<1,facing:-1});
  }
 }
 return result;
}
export function drawConsequences(ctx,scene,state,time){
 const steps=storySteps(scene,state);
 const selected=steps.at(-1),spot=state.worldSequence?.sceneId===scene.id?state.worldSequence.spots?.[selected]:null;
 if(spot&&state.worldTask){
  ctx.save();ctx.strokeStyle='#f4dfa0';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(spot[0],spot[1]+25,40,10,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 }
 if(['wasserverlies','befreiung'].includes(scene.id)&&steps.length){
  const x=scene.id==='befreiung'?800:775,y=scene.id==='befreiung'?460:280;
  ctx.save();ctx.globalCompositeOperation='screen';ctx.shadowColor='#99e8ff';ctx.shadowBlur=22;ctx.strokeStyle='#bff5ff';ctx.lineWidth=3;
  ctx.beginPath();ctx.ellipse(x,y,48,65,0,0,Math.PI*2);ctx.stroke();
  if(steps.includes('crystal')){ctx.beginPath();ctx.moveTo(state.position.x-18,state.position.y-180);ctx.quadraticCurveTo((state.position.x+x)/2,y-75,x,y);ctx.stroke();}
  ctx.restore();
 }
 if(scene.id==='sandfaenger'&&steps.includes('edge')){
  ctx.save();ctx.fillStyle='#dfb965';for(let i=0;i<24;i++){const p=state.reducedMotion?.4:(time/1800+i/24)%1;ctx.beginPath();ctx.arc(315+Math.sin(i*13)*22,470+p*130,2,0,Math.PI*2);ctx.fill();}ctx.restore();
 }
}
