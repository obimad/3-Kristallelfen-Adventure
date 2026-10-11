import {drawStory} from './story-renderer.js';
const CAPTIONS={
  paper:['Fina zeigt H und O Coloridas Empfehlung für Meisterin Aria.','H und O übergießen den Papierbrief mit Wasser. Die Tinte verläuft.','Das Papier ist aufgeweicht. Coloridas Empfehlung ist nicht mehr lesbar.'],
  melt:['Regis trifft die Kristallfee mit seinem Zauber.','Ihre feste Gestalt schmilzt. Ihr Leben bleibt im Wasser erhalten.','Das leuchtende Wasser wird im Gefäß gefangen. Funkel muss Hilfe holen.'],
  restore:['Fina hält Silbas Kristall an das lebendige Wasser. Die Eisklingen verbinden ihre Magie.','Aus dem Wasser wachsen wieder die vertrauten Gestalten.','Silba und die Kristallfee sind frei.'],
  dissolve:['Regis richtet seinen letzten Auflösungszauber auf die Elfen.','Ihre Körper verlieren die feste Gestalt. Die Ringwaffen sinken zu Boden.','Muck bleibt in der Luft: Der Elfenzauber kann einer Mücke nichts anhaben.'],
};
export function playVisualSequence({canvas,overlay,state,scene,images,type}){
  const win=canvas.ownerDocument.defaultView,ctx=canvas.getContext('2d');let frameId,start=null,progress=0,finished=false,resolve;
  overlay.innerHTML='<div class="visual-caption"><p role="status"></p><button>Szene überspringen</button></div>';
  const caption=overlay.querySelector('p'),button=overlay.querySelector('button');
  const captions=CAPTIONS[type],duration=state.reducedMotion?2800:6500;
  function render(time){if(finished)return;if(start===null)start=time;progress=Math.min(1,(time-start)/duration);
    drawStory(ctx,images,{...state,hoveredId:null,visualEffect:{type,progress}},scene,time);
    if(type==='paper')drawLetterDrenching(ctx,images,progress,time,state.reducedMotion);
    const text=captions[Math.min(2,Math.floor(progress*3))];if(caption.textContent!==text)caption.textContent=text;
    if(progress===1)button.textContent='Weiter zur Geschichte';frameId=win.requestAnimationFrame(render);
  }
  function finish(){if(finished)return;finished=true;win.cancelAnimationFrame(frameId);overlay.innerHTML='';resolve({completed:true});}
  button.onclick=()=>{if(progress<1){start=performance.now()-duration;progress=1;button.textContent='Weiter zur Geschichte';}else finish();};
  button.focus();frameId=win.requestAnimationFrame(render);return new Promise(r=>resolve=r);
}

export function drawLetterDrenching(ctx,images,progress,time,reduced=false){
  const sheet=images.letterSequence;if(!sheet)return;
  const cellWidth=sheet.width/2,height=350,width=height*cellWidth/sheet.height;
  const soaked=Math.min(1,Math.max(0,(progress-.3)/.5)),x=800-width/2,y=390;
  ctx.save();ctx.globalAlpha=1-soaked;ctx.drawImage(sheet,0,0,cellWidth,sheet.height,x,y,width,height);
  ctx.globalAlpha=soaked;ctx.drawImage(sheet,cellWidth,0,cellWidth,sheet.height,x,y,width,height);
  ctx.globalAlpha=1;
  if(progress>.25&&progress<.87){
    ctx.strokeStyle='#a3dfff';ctx.lineWidth=9;ctx.lineCap='round';
    for(const source of [{x:910,y:600},{x:1170,y:590}]){
      ctx.beginPath();ctx.moveTo(source.x,source.y);ctx.quadraticCurveTo(830,310,800,530);ctx.stroke();
    }
    ctx.fillStyle='#d0f1ff';
    for(let i=0;i<22;i++){const p=((reduced?0:time)/1200+i/22)%1;ctx.beginPath();ctx.arc(760+(i*29)%95,450+p*220,2+i%3,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
}
