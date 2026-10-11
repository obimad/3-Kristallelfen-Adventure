import { ASSETS, HEROES, HOTSPOTS } from './data.js';
import { idlePose, drawQuietSprite, heroView } from './animation.js';
import {prepareSpriteFrames,drawSpriteFrame} from './sprite-frames.js';
import { drawWorldLife } from './world-life.js';
import {drawPaintedProp} from './prop-art.js';
import {openingTargets} from './opening-chapter.js';
import {openingActorHeight} from './opening-perspective.js';

export async function loadImages(){
  const images={};
  await Promise.all(Object.entries(ASSETS).map(([id,url])=>new Promise((resolve,reject)=>{
    const img=new Image();img.onload=()=>{images[id]=img;resolve();};img.onerror=()=>reject(new Error(`Das Bild „${id}“ konnte nicht geladen werden (${url}).`));img.src=url;
  })));
  for(const id of ['finaWalk','finaDepthWalk','vividWalk','castTravelWalk','castH2oWalk','castRoyalWalk','castMastersWalk','elfWalkFull'])prepareSpriteFrames(images[id],4,id.startsWith('fina')?2:3);
  return images;
}
function shadow(ctx,x,y,w){ctx.save();ctx.fillStyle='#153f5744';ctx.beginPath();ctx.ellipse(x,y,w,9,0,0,Math.PI*2);ctx.fill();ctx.restore();}
function sprite(ctx,img,x,y,height,bob=0){
  if(!img)return;
  const width=height*img.width/img.height;
  shadow(ctx,x,y-5,width*.27);
  ctx.drawImage(img,x-width/2,y-height+bob,width,height);
}
function waitingSprite(ctx,img,x,y,height,time,phase,reducedMotion){
  if(!img)return;
  const width=height*img.width/img.height;
  shadow(ctx,x,y-5,width*.27);
  drawQuietSprite(ctx,img,x-width/2,y-height,width,height,time,phase,reducedMotion);
}
function walkingVivid(ctx,images,x,y,height,time,dx,dy,reduced){
 if(reduced||!images.vividWalk){waitingSprite(ctx,images.vividSprite,x,y,height,time,0,true);return;}
 const sheet=images.vividWalk;
 const vertical=Math.abs(dy)>Math.abs(dx)*1.2,row=vertical?(dy<0?2:1):0,frame=Math.floor(time/150)%4;
 ctx.save();ctx.translate(x,y);if(!vertical&&dx<0)ctx.scale(-1,1);shadow(ctx,0,-5,height*.16);
 if(!drawSpriteFrame(ctx,sheet,frame,row,height))waitingSprite(ctx,images.vividSprite,0,0,height,time,0,true);ctx.restore();
}
function table(ctx,adventure,atlas){
  if(!atlas)return;
  const cellW=atlas.width/2,cellH=atlas.height/2;
  const layer=(column,row,x,y,width,height)=>ctx.drawImage(atlas,column*cellW,row*cellH,cellW,cellH,x,y,width,height);
  // Separate painted sprites: collected objects leave the tabletop clear.
  layer(0,0,310,610,300,220);
  layer(1,0,405,625,120,70);
  if(!adventure.inventory.includes('bag'))layer(0,1,405,683,90,85);
  if(!adventure.inventory.includes('crystal'))layer(1,1,531,665,55,70);
}
function battleEnvironment(ctx,b,time,reducedMotion){
  const wave=reducedMotion?0:Math.sin(time/700)*5;
  ctx.save();
  // Ein gezeichnetes Schleusentor steht auf einer tragfähigen Wolkenterrasse.
  ctx.fillStyle='#eaf7fb';ctx.strokeStyle='#39596d';ctx.lineWidth=4;
  ctx.beginPath();ctx.ellipse(1020,755,165,30,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  const frame=ctx.createLinearGradient(865,0,1125,0);frame.addColorStop(0,'#699ab6');frame.addColorStop(.4,'#effcff');frame.addColorStop(1,'#6094b0');ctx.fillStyle=frame;
  for(const x of [875,1100]){ctx.beginPath();ctx.moveTo(x,730);ctx.lineTo(x,380);ctx.lineTo(x+20,345);ctx.lineTo(x+40,380);ctx.lineTo(x+40,730);ctx.closePath();ctx.fill();ctx.stroke();}
  ctx.beginPath();ctx.moveTo(895,380);ctx.quadraticCurveTo(1007,255,1120,380);ctx.lineTo(1120,400);ctx.quadraticCurveTo(1007,295,895,400);ctx.closePath();ctx.fill();ctx.stroke();
  if(!b.gateOpen){
    ctx.fillStyle=b.waterFlow?'#86c8e077':'#d7f4fa88';ctx.fillRect(918,385,180,345);
    ctx.strokeStyle=b.waterFlow?'#b8eafa':'#e9fcff';ctx.lineWidth=6;
    for(let x=932;x<1100;x+=32){ctx.beginPath();ctx.moveTo(x,390);ctx.bezierCurveTo(x+wave,495,x-wave,625,x,730);ctx.stroke();}
    ctx.strokeStyle='#294c64';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(922,555);ctx.lineTo(1090,555);ctx.stroke();
  }else{
    ctx.fillStyle='#d8f4fc44';ctx.beginPath();ctx.moveTo(920,400);ctx.lineTo(944,425);ctx.lineTo(944,695);ctx.lineTo(920,730);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(1095,400);ctx.lineTo(1075,425);ctx.lineTo(1075,695);ctx.lineTo(1095,730);ctx.closePath();ctx.fill();ctx.stroke();
  }
  // Ventil und sichtbarer Wasserzufluss: eingefroren bleibt der Strahl still.
  ctx.strokeStyle='#476b80';ctx.lineWidth=25;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(1515,735);ctx.lineTo(1460,610);ctx.lineTo(1398,590);ctx.stroke();
  ctx.strokeStyle='#b4dae7';ctx.lineWidth=15;ctx.stroke();
  ctx.strokeStyle=b.waterFlow?'#edd09a':'#bdefff';ctx.lineWidth=8;ctx.beginPath();ctx.arc(1430,625,30,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<4;i++){const angle=i*Math.PI/2;ctx.beginPath();ctx.moveTo(1430,625);ctx.lineTo(1430+Math.cos(angle)*25,625+Math.sin(angle)*25);ctx.stroke();}
  if(b.waterFlow){ctx.strokeStyle='#9ae1f7b0';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(1398,590);ctx.bezierCurveTo(1380,700+wave,1215,745,1090,715);ctx.stroke();}
  else{ctx.fillStyle='#cff4ff';ctx.beginPath();ctx.moveTo(1405,579);ctx.lineTo(1380,601);ctx.lineTo(1401,651);ctx.lineTo(1420,619);ctx.closePath();ctx.fill();ctx.strokeStyle='#5789a6';ctx.lineWidth=2;ctx.stroke();}
  ctx.restore();
}
function waterGuard(ctx,b,time,reducedMotion){
  const sway=reducedMotion||b.guardFrozenTurns>0?0:Math.sin(time/1400)*4;
  ctx.save();ctx.translate(1260+sway,710);if(b.status==='won')ctx.globalAlpha=.5;
  shadow(ctx,0,5,78);
  const water=ctx.createLinearGradient(-65,-250,65,0);water.addColorStop(0,'#d5f2fb');water.addColorStop(.4,'#87c7e0cc');water.addColorStop(1,'#356687');ctx.fillStyle=water;ctx.strokeStyle='#20465d';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-42,-210);ctx.quadraticCurveTo(-82,-163,-72,-65);ctx.lineTo(-58,-12);ctx.lineTo(-14,0);ctx.lineTo(0,-72);ctx.lineTo(17,0);ctx.lineTo(63,-14);ctx.quadraticCurveTo(79,-100,39,-210);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-49,-224);ctx.quadraticCurveTo(-25,-288,0,-310);ctx.quadraticCurveTo(36,-278,48,-224);ctx.quadraticCurveTo(0,-180,-49,-224);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#163f59';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-24,-236);ctx.lineTo(-9,-231);ctx.moveTo(10,-231);ctx.lineTo(25,-236);ctx.stroke();
  ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-13,-215);ctx.lineTo(14,-215);ctx.stroke();
  ctx.strokeStyle='#e0f7ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-29,-193);ctx.quadraticCurveTo(-50,-109,-30,-32);ctx.stroke();
  if(b.waterFlow&&b.guardFrozenTurns===0){ctx.strokeStyle='#aadcf3';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-55,-143);ctx.bezierCurveTo(-190,-280+sway,-238,-182,-167,-92);ctx.stroke();}
  if(b.guardFrozenTurns>0){
    ctx.fillStyle='#c8edfa88';ctx.strokeStyle='#eafaff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-80,-280);ctx.lineTo(-15,-343);ctx.lineTo(80,-281);ctx.lineTo(96,-36);ctx.lineTo(50,22);ctx.lineTo(-68,10);ctx.lineTo(-101,-49);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-80,-280);ctx.lineTo(30,-120);ctx.lineTo(50,22);ctx.moveTo(80,-281);ctx.lineTo(-45,-151);ctx.lineTo(-68,10);ctx.stroke();
  }
  if(b.coverTurns>0){
    for(let i=0;i<7;i++){const x=Math.sin(i*1.9)*100,y=-50-i*38;const fog=ctx.createRadialGradient(x,y,0,x,y,85);fog.addColorStop(0,'#eefaffdd');fog.addColorStop(1,'#eefaff00');ctx.fillStyle=fog;ctx.fillRect(x-85,y-85,170,170);}
    ctx.fillStyle='#fff';for(let i=0;i<24;i++){const p=reducedMotion?i/24:(time/2400+i/24)%1;ctx.beginPath();ctx.arc(Math.sin(i*3.7)*130,-330+p*355,2+i%3,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
}
function drawBattle(ctx,images,state,time){
  const b=state.battle,positions=[175,360,550,735],height=355,feet=810;
  ctx.fillStyle='#0c2e4338';ctx.fillRect(0,0,1600,900);
  battleEnvironment(ctx,b,time,state.reducedMotion);
  HEROES.forEach((hero,i)=>{
    const casting=state.effect?.hero===hero.id&&time-state.effect.time<1100;
    const p=casting?(time-state.effect.time)/1100:0;
    ctx.save();ctx.translate(positions[i],feet);ctx.rotate(casting&&!state.reducedMotion?Math.sin(p*Math.PI)*.025:0);
    waitingSprite(ctx,images[hero.id],0,0,height,time,i,casting||state.reducedMotion);ctx.restore();
  });
  waterGuard(ctx,b,time,state.reducedMotion);
  if(b.shieldTurns>0){ctx.save();ctx.strokeStyle='#d5f5ff99';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(810,800);ctx.lineTo(824,558);ctx.lineTo(850,517);ctx.lineTo(870,560);ctx.lineTo(883,795);ctx.stroke();ctx.restore();}
  if(!state.effect||time-state.effect.time>=1100)return;
  const p=(time-state.effect.time)/1100,i=HEROES.findIndex(h=>h.id===state.effect.hero),img=images[state.effect.hero],width=height*img.width/img.height;
  // Leuchten liegt auf dem vorhandenen Ring, kein zweiter Ring um den Körper.
  const ring=[{u:.382,v:.575,rx:.125,ry:.078},{u:.226,v:.55,rx:.143,ry:.105},{u:.29,v:.56,rx:.14,ry:.088},{u:.37,v:.505,rx:.118,ry:.105}][i];
  const x=positions[i]+(ring.u-.5)*width,y=feet-height+ring.v*height;
  ctx.save();ctx.globalAlpha=state.reducedMotion?.8:Math.sin(p*Math.PI);ctx.shadowBlur=23;ctx.shadowColor=state.effect.color;ctx.strokeStyle=state.effect.color;ctx.lineWidth=5;
  ctx.beginPath();ctx.ellipse(x,y,width*ring.rx,height*ring.ry,i===3?.25:0,0,Math.PI*2);ctx.stroke();
  const target=state.effect.hero==='cold'?{x:1400,y:592}:state.effect.hero==='fina'?{x:1000,y:550}:{x:1260,y:500};
  ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo((x+target.x)/2,y-150,target.x,target.y);ctx.stroke();
  ctx.restore();
}
function banner(ctx,x,y,w,h,color,time,phase,reducedMotion,emblem=true){
  const offset=row=>reducedMotion?0:Math.sin(time/1050+row/38+phase)*6*(row/h);
  ctx.save();ctx.translate(x,y);
  const cloth=ctx.createLinearGradient(0,0,w,0);cloth.addColorStop(0,color);cloth.addColorStop(.45,'#b4b4cf');cloth.addColorStop(.6,color);cloth.addColorStop(1,'#343a6688');
  ctx.fillStyle=cloth;ctx.strokeStyle=emblem?'#edc679':'#526786';ctx.lineWidth=emblem?3:1.5;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w,0);
  for(let row=8;row<=h;row+=8)ctx.lineTo(w+offset(row),row);
  ctx.lineTo(w+offset(h),h);ctx.lineTo(w/2+offset(h-12),h-12);ctx.lineTo(offset(h),h);
  for(let row=h-8;row>0;row-=8)ctx.lineTo(offset(row),row);
  ctx.closePath();ctx.fill();ctx.stroke();
  if(emblem){
    const cx=w/2+offset(h*.4),cy=h*.4,r=w*.17;ctx.fillStyle='#f3cc75';ctx.strokeStyle='#f3cc75';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
    for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*(r+3),cy+Math.sin(a)*(r+3));ctx.lineTo(cx+Math.cos(a)*(r+8),cy+Math.sin(a)*(r+8));ctx.stroke();}
  }
  ctx.restore();
}
function atmosphere(ctx,background,time,reducedMotion){
  // Eigene Fahnenebene vor der bereinigten Hintergrundplatte: auch Ränder bewegen sich.
  banner(ctx,246,93,53,171,'#596aaf',time,0,reducedMotion);
  banner(ctx,1289,246,46,140,'#9164a2',time,2,reducedMotion);
  banner(ctx,34,678,62,176,'#44649a',time,4,reducedMotion);
  banner(ctx,820,160,35,161,'#9671b0',time,1,reducedMotion);
  for(const [i,color] of ['#db657b','#e8b755','#5b9dc5'].entries())banner(ctx,48+i*38,214,31,110,color,time,i,reducedMotion,false);
  for(const [i,color] of ['#d77795','#67a6c5','#e8bd68','#bd85b5'].entries())banner(ctx,863+i*25,244+i*2,22,34,color,time,i,reducedMotion,false);
  if(reducedMotion)return;
  for(const [i,vat] of [{x:132,y:383,color:'#ffacc3'},{x:312,y:378,color:'#a5d9ff'},{x:447,y:402,color:'#ffdfa1'}].entries()){
    for(let puff=0;puff<5;puff++){
      const progress=((time/4500+puff/5+i*.19)%1),x=vat.x+Math.sin(progress*6+i)*17,y=vat.y-progress*145,r=13+progress*29;
      ctx.save();ctx.globalAlpha=Math.sin(progress*Math.PI)*.2;
      const fog=ctx.createRadialGradient(x,y,0,x,y,r);fog.addColorStop(0,vat.color);fog.addColorStop(1,'#ffffff00');ctx.fillStyle=fog;
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();
    }
  }
}
export function drawScene(ctx,images,state,time){
  const area=state.adventure.opening?.area??'home';
  ctx.clearRect(0,0,1600,900);
  if(state.mode==='battle')ctx.drawImage(images.trainingBackground,0,0,1600,900);
  else if(state.started&&area==='edge')ctx.drawImage(images.cloudsea,0,0,1600,900);
  else if(state.started&&area==='home')ctx.drawImage(images.finaHome,0,0,1600,900);
  else ctx.drawImage(images.background,0,0,1600,900);
  if(state.mode==='journey'&&(!state.started||area==='square'))atmosphere(ctx,images.background,time,state.reducedMotion);
  if(state.mode==='journey'&&area!=='home')drawWorldLife(ctx,area==='edge'?'kumulus':'farbenquell',time,state.reducedMotion);
  if(state.mode==='battle'){
    drawBattle(ctx,images,state,time);
    return;
  }
  if(!state.started)return;
  const vividX=area==='square'?755:area==='edge'?650:740,vividY=area==='square'?750:785;
  const arrival=state.openingArrival,progress=arrival?Math.min(1,(time-arrival.started)/Math.max(1,arrival.duration)):1;
  const vx=state.openingTransition?.vivid?.x??(arrival?1420+(vividX-1420)*progress:vividX);
  const vy=state.openingTransition?.vivid?.y??(arrival&&area==='home'?550+(vividY-550)*progress:vividY);
  const entities=[
   ...(area==='home'?[{y:760,draw:()=>table(ctx,state.adventure,images.departureProps)}]:[]),
   ...(state.adventure.opening?.vividArrived?[{y:vy,draw:()=>{const height=openingActorHeight(area,'vivid',vy);const transition=state.openingTransition;if(arrival||transition)walkingVivid(ctx,images,vx,vy,height,time,transition?.vivid?.dx??-680,transition?.vivid?.dy??180,state.reducedMotion);else waitingSprite(ctx,images.vividSprite,vx,vy,height,time,0,state.reducedMotion);}}]:[]),
   ...(area==='square'?[{y:770,draw:()=>waitingSprite(ctx,images.coloridaSprite,1030,770,openingActorHeight(area,'colorida',770),time,2,state.reducedMotion)},{y:695,draw:()=>{
    drawPaintedProp(ctx,images,{id:'sandfaenger_tool',x:590,y:660},false);
    const first=state.adventure.opening?.bowl?.[0];
    if(first||state.adventure.mixed){ctx.save();ctx.fillStyle=state.adventure.mixed?'#ad68d7':first==='red'?'#e86b8a':first==='blue'?'#72b9e5':'#f5cd75';ctx.globalAlpha=.8;ctx.beginPath();ctx.ellipse(590,643,32,9,0,0,Math.PI*2);ctx.fill();ctx.restore();}
    const pour=state.openingPour;
    if(pour&&time-pour.started<1000){ctx.save();ctx.strokeStyle=pour.colour==='red'?'#e86b8a':pour.colour==='blue'?'#72b9e5':'#f5cd75';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(588,605);ctx.lineTo(590,645);ctx.stroke();ctx.restore();}
   }}]:[]),
   {y:state.position.y,draw:()=>{
    const height=openingActorHeight(area,'fina',state.position.y);
    ctx.save();ctx.translate(state.position.x,state.position.y);
    const view=heroView(state);
    if(view==='side')ctx.scale(state.facing,1);
    if(state.moving&&!state.reducedMotion){
      const side=view==='side',frame=side?state.walkFrame:Math.floor(state.walkFrame/2);
      shadow(ctx,0,-5,height*.16);
      if(!drawSpriteFrame(ctx,side?images.finaWalk:images.finaDepthWalk,frame%4,side?Math.floor(frame/4):view==='back'?1:0,height))waitingSprite(ctx,images.fina,0,0,height,time,4,true);
    }else waitingSprite(ctx,images.fina,0,0,height,time,4,state.reducedMotion);
    ctx.restore();
  }}];
  entities.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
  const hovered=openingTargets(state.adventure).find(h=>h.id===state.hoveredId&&h.type!=='person');
  if(hovered){ctx.save();ctx.globalCompositeOperation='screen';const glow=ctx.createRadialGradient(hovered.x,hovered.y,4,hovered.x,hovered.y,58);glow.addColorStop(0,'#d2f3ff66');glow.addColorStop(1,'#d2f3ff00');ctx.fillStyle=glow;ctx.fillRect(hovered.x-58,hovered.y-58,116,116);ctx.restore();}
  // Muck trifft Fina erst auf der Reise, nicht im Abschiedskapitel Farbenquell.
  if(state.destination){ctx.save();ctx.strokeStyle='#fff0be';ctx.lineWidth=2;ctx.globalAlpha=.8;ctx.beginPath();ctx.ellipse(state.destination.x,state.destination.y,12,5,0,0,7);ctx.stroke();ctx.restore();}
}
