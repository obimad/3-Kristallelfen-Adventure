import { STORY_CHARACTERS } from './story-data.js';
import { idlePose } from './animation.js';

const cache=new Map();
export function storyImage(url){
  if(!url)return null;
  if(!cache.has(url)){
    const img=new Image();img.src=url;cache.set(url,img);
  }
  const img=cache.get(url);
  return img.complete&&img.naturalWidth?img:null;
}
function standing(ctx,img,x,y,height,time,phase,reduced,grounded=true,facing=1){
  if(!img)return;
  const w=height*img.width/img.height,pose=idlePose(time,phase,reduced);
  ctx.save();ctx.translate(x,y);ctx.rotate(pose.tilt);ctx.scale(facing,pose.scaleY);
  if(grounded){ctx.fillStyle='#173b4b33';ctx.beginPath();ctx.ellipse(0,-3,w*.26,8,0,0,Math.PI*2);ctx.fill();}
  ctx.drawImage(img,-w/2,-height,w,height);ctx.restore();
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
export function drawStory(ctx,images,state,scene,time){
  const background=storyImage(scene.background);
  ctx.clearRect(0,0,1600,900);
  if(background)ctx.drawImage(background,0,0,1600,900);
  else{
    ctx.fillStyle='#163d50';ctx.fillRect(0,0,1600,900);ctx.fillStyle='#d6e5e7';ctx.font='24px Georgia';ctx.fillText('Die Kulisse wird geladen …',620,450);
  }
  ambience(ctx,scene,time,state.reducedMotion);
  const interlude=['regis_intrige','thronsturz'].includes(scene.id);
  const actors=[...(scene.actors??[])];
  if(!interlude){
    for(const [id,x] of [['cold',475],['powdery',645],['icy',815]])if(state.campaign.companions.includes(id)&&!actors.some(a=>a.id===id))actors.push({id,x,y:810,height:275});
    if(scene.id==='befreiung'&&state.campaign.flags.includes('free_restore'))actors.push({id:'silba',x:1180,y:810,height:295},{id:'kristallfee',x:1420,y:800,height:300});
  }
  const entities=actors.filter(actor=>actor.id!=='fina'&&(actor.id!=='muck'||!state.campaign.companions.includes('muck'))).map((actor,i)=>({y:actor.y,draw:()=>standing(ctx,storyImage(STORY_CHARACTERS[actor.id]?.asset),actor.x,actor.y+(actor.id==='muck'&&!state.reducedMotion?Math.sin(time/210)*5:0),actor.height??280,time,i,state.reducedMotion,actor.id!=='muck')}));
  if(!interlude)entities.push({y:state.position.y,draw:()=>{
    const height=245+(state.position.y-710)*.12;
    ctx.save();ctx.translate(state.position.x,state.position.y);
    if(state.view==='side')ctx.scale(state.facing,1);
    if(state.moving&&!state.reducedMotion){
      const sheet=state.view==='side'?images.finaWalk:images.finaDepthWalk;
      const cellW=sheet.width/4,cellH=sheet.height/2,frame=state.view==='side'?state.walkFrame:Math.floor(state.walkFrame/2);
      const row=state.view==='side'?Math.floor(frame/4):state.view==='back'?1:0;
      ctx.drawImage(sheet,(frame%4)*cellW,row*cellH,cellW,cellH,-height*cellW/cellH/2,-height,height*cellW/cellH,height);
    }else if(state.view==='back'){
      const sheet=images.finaDepthWalk,w=sheet.width/4,h=sheet.height/2;
      ctx.drawImage(sheet,0,h,w,h,-height*w/h/2,-height,height*w/h,height);
    }else standing(ctx,images.fina,0,0,height,time,4,state.reducedMotion);
    ctx.restore();
  }});
  entities.sort((a,b)=>a.y-b.y).forEach(entity=>entity.draw());
  if(!interlude&&state.campaign.companions.includes('muck')){
    const bob=state.reducedMotion?0:Math.sin(time/190)*5;
    standing(ctx,images.muck,state.muck.x,state.muck.y+bob,110,time,0,true,false,state.muck.facing??1);
  }
  if(state.destination){ctx.strokeStyle='#fff0be';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(state.destination.x,state.destination.y,12,5,0,0,Math.PI*2);ctx.stroke();}
}
