import {createMiniGame,stepMiniGame,moveTile,turnMirror,mirrorPath} from './mini-games.js';
import {storyImage} from './story-renderer.js';

export function createMiniUI({canvas,overlay,kind,background}){
  const doc=canvas.ownerDocument,win=doc.defaultView,ctx=canvas.getContext('2d');let game=createMiniGame(kind),active=false,resolve,last=null,frameId,keys=new Set(),pointerX=null,listeners=[];
  overlay.innerHTML=`<div class="action-panel"><h2>${game.config.title}</h2><p>${game.config.goal}</p><p>${game.config.help}</p><p id="mini-status" role="status"></p><div class="action-buttons"><button data-mini="pause">Pause</button><button data-mini="help" aria-pressed="false">${kind==='slide'?'Zielansicht':kind==='mirror'?'Lichtweg erklären':'Leichter spielen'}</button><button data-mini="reset">Neu versuchen</button><button data-mini="leave">Zur Szene zurück</button></div></div><div class="mini-operate"></div>`;
  const operations=overlay.querySelector('.mini-operate'),status=overlay.querySelector('#mini-status'),pauseButton=overlay.querySelector('[data-mini="pause"]');
  let targetVisible=false;
  if(kind==='slide')operations.innerHTML=`<div class="slide-buttons">${Array.from({length:9},(_,i)=>`<button data-tile="${i}" aria-label="Feld ${i+1} verschieben"></button>`).join('')}</div>`;
  if(kind==='mirror')operations.innerHTML='<button data-mirror="0">Ersten Spiegel drehen ↻</button><button data-mirror="1">Zweiten Spiegel drehen ↻</button>';
  if(['sand','snow'].includes(kind))operations.innerHTML='<button data-move="left" aria-label="Nach links">←</button><button data-move="right" aria-label="Nach rechts">→</button>';
  const buttons=[...operations.querySelectorAll('[data-tile]')];
  function listen(target,event,fn,options){target.addEventListener(event,fn,options);listeners.push(()=>target.removeEventListener(event,fn,options));}
  function clear(){keys.clear();pointerX=null;}
  function pause(){game.paused=true;clear();last=null;pauseButton.textContent='Weiterspielen';}
  function toggle(){game.paused=!game.paused;clear();last=null;pauseButton.textContent=game.paused?'Weiterspielen':'Pause';if(!game.paused)canvas.focus();}
  function finish(completed){if(!active)return;active=false;win.cancelAnimationFrame(frameId);while(listeners.length)listeners.pop()();resolve({completed});}
  function flake(x,y,r){ctx.save();ctx.translate(x,y);ctx.strokeStyle='#d2f4ff';ctx.lineWidth=5;for(let arm=0;arm<6;arm++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-r);ctx.moveTo(0,-r*.6);ctx.lineTo(-r*.22,-r*.8);ctx.moveTo(0,-r*.6);ctx.lineTo(r*.22,-r*.8);ctx.stroke();}ctx.restore();}
  function puzzlePiece(tile,x,y,size){
    ctx.save();ctx.beginPath();ctx.rect(x+2,y+2,size-4,size-4);ctx.clip();ctx.fillStyle='#16435b';ctx.fillRect(x,y,size,size);
    const col=(tile-1)%3,row=Math.floor((tile-1)/3);flake(x+(1.5-col)*size,y+(1.5-row)*size,size*1.25);
    ctx.fillStyle='#fff0c0';ctx.font='20px Georgia';ctx.fillText(tile,x+10,y+28);ctx.restore();ctx.strokeStyle='#85acbc';ctx.lineWidth=2;ctx.strokeRect(x+2,y+2,size-4,size-4);
  }
  function draw(){
    const img=storyImage(background);if(img){ctx.drawImage(img,0,0,1600,900);ctx.fillStyle='#092a40b8';ctx.fillRect(0,0,1600,900);}else{ctx.fillStyle='#123d55';ctx.fillRect(0,0,1600,900);}
    if(kind==='sand'){
      ctx.strokeStyle='#e9deb0';ctx.lineWidth=5;ctx.strokeRect(game.paddle-100,710,200,28);
      ctx.lineWidth=1;for(let i=0;i<10;i++){ctx.beginPath();ctx.moveTo(game.paddle-100+i*22,710);ctx.lineTo(game.paddle-90+i*22,740);ctx.stroke();}
      for(const drop of game.drops){ctx.fillStyle=drop.kind==='sand'?'#ffd16a':'#728fa0';ctx.beginPath();ctx.arc(drop.x,drop.y,drop.kind==='sand'?9:17,0,Math.PI*2);ctx.fill();}
      ctx.font='24px Georgia';ctx.fillStyle='#fff0c0';ctx.fillText('FEINE KÖRNER ↓     STEINE LIEGEN LASSEN',390,275);
    }else if(kind==='snow'){
      for(const block of game.blocks)if(block.active){ctx.fillStyle='#b8e6fc';ctx.fillRect(block.x-block.w/2,block.y-block.h/2,block.w,block.h);ctx.strokeStyle='#effcff';ctx.strokeRect(block.x-block.w/2,block.y-block.h/2,block.w,block.h);}
      ctx.fillStyle='#fff0c0';ctx.beginPath();ctx.arc(game.ball.x,game.ball.y,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c1efff';ctx.fillRect(game.paddle-115,710,230,15);
    }else if(kind==='slide'){
      for(let i=0;i<9;i++)if(game.tiles[i])puzzlePiece(game.tiles[i],560+i%3*140,285+Math.floor(i/3)*140,140);
      if(targetVisible){ctx.fillStyle='#0f344be8';ctx.fillRect(1030,320,300,300);flake(1180,470,125);ctx.fillStyle='#fff0c0';ctx.font='20px Georgia';ctx.fillText('ZIEL',1150,650);}
    }else{
      ctx.fillStyle='#f9e5aa';ctx.beginPath();ctx.arc(460,270,18,0,Math.PI*2);ctx.fill();
      const path=mirrorPath(game);ctx.strokeStyle=path.connected?'#d4ff9f':'#fff0a0';ctx.lineWidth=7;ctx.beginPath();path.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
      for(const [i,x] of [460,950].entries()){ctx.save();ctx.translate(x,440);ctx.rotate(game.mirrors[i]*Math.PI/4);ctx.strokeStyle='#caf0ff';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(-60,0);ctx.lineTo(60,0);ctx.stroke();ctx.restore();}
      ctx.fillStyle='#ead8ac';ctx.fillRect(875,670,150,70);ctx.fillStyle='#527480';ctx.font='24px Georgia';ctx.fillText('KARTE',900,715);
      if(targetVisible){ctx.fillStyle='#fff0c0';ctx.font='22px Georgia';ctx.fillText('Der erste Strahl fällt von oben. Führe ihn nach rechts, dann nach unten zur Karte.',250,800);}
    }
    if(game.paused||game.status==='won'){ctx.fillStyle='#092638d9';ctx.fillRect(180,380,1240,120);ctx.font='36px Georgia';ctx.fillStyle='#fff0c0';ctx.textAlign='center';ctx.fillText(game.paused?'Pause':kind==='sand'?'Die Probe ist gefangen!':kind==='snow'?'Die Schneeflocken können reisen!':'Das Modell stimmt!',800,455);ctx.textAlign='start';}
  }
  function frame(time){if(!active)return;const dt=last===null?0:(time-last)/1000;last=time;stepMiniGame(game,{x:pointerX,left:keys.has('arrowleft')||keys.has('a'),right:keys.has('arrowright')||keys.has('d')},dt);draw();
    const text=game.paused?'Pause':game.status==='won'?'Geschafft! Weiter zur Geschichte.':kind==='sand'?`${game.score}/${game.target} feine Körner`:kind==='snow'?`${game.score}/${game.blocks.length} Kristalle freigegeben`:`${game.moves} Züge · ${game.config.goal}`;
    if(status.textContent!==text)status.textContent=text;
    overlay.querySelector('[data-mini="leave"]').textContent=game.status==='won'?'Weiter zur Geschichte':'Zur Szene zurück';
    buttons.forEach((button,i)=>{const value=game.tiles[i];button.disabled=game.paused||game.status!=='playing'||!value;button.setAttribute('aria-label',value?`Teil ${value} auf Feld ${i+1} verschieben`:`Leeres Feld ${i+1}`);});
    frameId=win.requestAnimationFrame(frame);
  }
  return {start(){active=true;canvas.style.touchAction='none';
    listen(win,'keydown',e=>{if(!active)return;const k=e.key.toLowerCase();if(k==='tab'){if(['sand','snow'].includes(kind))pause();return;}if(e.target.closest?.('button,input,textarea'))return;if(['arrowleft','arrowright','a','d','p','escape'].includes(k)){e.preventDefault();e.stopImmediatePropagation();if((k==='p'||k==='escape')&&!e.repeat)toggle();else keys.add(k);}},true);
    listen(win,'keyup',e=>keys.delete(e.key.toLowerCase()));listen(win,'blur',pause);listen(doc,'visibilitychange',()=>{if(doc.hidden)pause();});
    const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*1600,y:(e.clientY-r.top)/r.height*900};};
    listen(canvas,'pointermove',e=>{if(['sand','snow'].includes(kind))pointerX=point(e).x;});listen(canvas,'pointerdown',e=>{e.preventDefault();canvas.setPointerCapture?.(e.pointerId);pointerX=point(e).x;});
    for(const button of operations.querySelectorAll('[data-move]')){listen(button,'pointerdown',e=>{e.preventDefault();pointerX=null;button.setPointerCapture?.(e.pointerId);keys.add(button.dataset.move==='left'?'a':'d');});for(const event of ['pointerup','pointercancel','lostpointercapture'])listen(button,event,()=>keys.delete(button.dataset.move==='left'?'a':'d'));}
    buttons.forEach((button,i)=>button.onclick=()=>moveTile(game,i));
    operations.querySelectorAll('[data-mirror]').forEach(button=>button.onclick=()=>turnMirror(game,Number(button.dataset.mirror)));
    pauseButton.onclick=toggle;overlay.querySelector('[data-mini="help"]').onclick=e=>{if(['slide','mirror'].includes(kind))targetVisible=!targetVisible;else game.gentle=!game.gentle;e.currentTarget.setAttribute('aria-pressed',String(['slide','mirror'].includes(kind)?targetVisible:game.gentle));};
    overlay.querySelector('[data-mini="reset"]').onclick=()=>{game=createMiniGame(kind);last=null;clear();pauseButton.textContent='Pause';canvas.focus();};
    overlay.querySelector('[data-mini="leave"]').onclick=()=>finish(game.status==='won');canvas.focus();frameId=win.requestAnimationFrame(frame);return new Promise(r=>resolve=r);
  },destroy(){finish(false);overlay.innerHTML='';}};
}
