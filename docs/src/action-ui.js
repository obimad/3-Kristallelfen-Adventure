import {createActionGame,stepActionGame,ringOrigin} from './action-game.js';
import {storyImage} from './story-renderer.js';
import {STORY_CHARACTERS} from './story-data.js';
import {prepareSpriteFrames,spriteFrame,drawSpriteFrame} from './sprite-frames.js';
import {drawGuardSprite} from './guard-art.js';

export function createActionUI({canvas,overlay,mission,background,reducedMotion=false}){
  const ctx=canvas.getContext('2d'),win=canvas.ownerDocument.defaultView,doc=canvas.ownerDocument;
  let game=createActionGame(mission),active=false,resolve,frameId,last=null,keys=new Set(),listeners=[];
  const input={};let previousFocus;
  overlay.innerHTML=`<div class="action-panel"><h2>${game.config.title}</h2><p>${game.config.goal}</p><p>← → / A D: bewegen · Leertaste / W: springen · J: Eiszauber aus dem Ring · K: Spezialmagie${game.config.hero==='muck'?' · ↑ ↓: fliegen':''}</p><p role="status" id="action-status"></p><div class="action-buttons"><button data-action="pause">Pause</button><button data-action="gentle" aria-pressed="false">Leichter spielen</button><button data-action="retry" hidden>Noch einmal</button><button data-action="leave">Zur Szene zurück</button></div></div><div class="action-touch"><button data-hold="left" aria-label="Links">←</button><button data-hold="right" aria-label="Rechts">→</button><button data-hold="up" aria-label="Aufwärts fliegen">↑</button><button data-hold="down" aria-label="Abwärts fliegen">↓</button><button data-hold="jump">Sprung</button><button data-hold="attack">Eiszauber</button><button data-hold="magic">Magie</button></div>`;
  const status=overlay.querySelector('#action-status'),pauseButton=overlay.querySelector('[data-action="pause"]'),retry=overlay.querySelector('[data-action="retry"]');
  if(game.config.hero==='muck'){
    overlay.querySelector('.action-panel p:nth-of-type(2)').textContent='← ↑ ↓ →: fliegen · J: bei Regis stechen · K: kurzer Ausweichflug. Muck kann keine Elfenmagie wirken.';
    overlay.querySelector('[data-hold="attack"]').textContent='Stechen';overlay.querySelector('[data-hold="magic"]').textContent='Ausweichen';overlay.querySelector('[data-hold="jump"]').hidden=true;
  }else{overlay.querySelector('[data-hold="up"]').hidden=true;overlay.querySelector('[data-hold="down"]').hidden=true;}
  function listen(target,type,fn,opts){target.addEventListener(type,fn,opts);listeners.push(()=>target.removeEventListener(type,fn,opts));}
  function clear(){keys.clear();for(const key of Object.keys(input))input[key]=false;}
  function pause(){game.paused=true;clear();last=null;pauseButton.textContent='Weiterspielen';}
  function toggle(){if(game.paused){game.paused=false;last=null;pauseButton.textContent='Pause';canvas.focus();}else pause();}
  function finish(completed){if(!active)return;active=false;win.cancelAnimationFrame(frameId);while(listeners.length)listeners.pop()();clear();resolve({completed});previousFocus?.isConnected&&previousFocus.focus();}
  function draw(time){
    ctx.clearRect(0,0,1600,900);const bg=storyImage(background);
    if(bg){ctx.drawImage(bg,0,0,1600,900);ctx.fillStyle='#09263d88';ctx.fillRect(0,0,1600,900);}else{ctx.fillStyle='#143e58';ctx.fillRect(0,0,1600,900);}
    const camera=Math.max(0,Math.min(game.length-1500,game.player.x-620));
    ctx.save();ctx.translate(50-camera,0);
    ctx.fillStyle='#d2f3ff';ctx.fillRect(0,730,game.length,28);ctx.fillStyle='#649cbccc';ctx.fillRect(0,758,game.length,140);
    for(const platform of game.platforms){ctx.fillStyle='#c0e7fa';ctx.fillRect(platform.x-platform.w/2,platform.y,platform.w,15);ctx.fillStyle='#6da5cb';ctx.fillRect(platform.x-platform.w/2,platform.y+15,platform.w,12);}
    for(const hazard of game.hazards){ctx.fillStyle='#7acdf0cc';ctx.fillRect(hazard.x-15,245,30,hazard.gap-85-245);ctx.fillRect(hazard.x-15,hazard.gap+85,30,745-hazard.gap-85);}
    for(const seal of game.seals){ctx.fillStyle=seal.open?'#a3eda2':'#72d9ff';ctx.strokeStyle='#e7fbff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(seal.x,seal.y-70);ctx.lineTo(seal.x+24,seal.y-35);ctx.lineTo(seal.x,seal.y);ctx.lineTo(seal.x-24,seal.y-35);ctx.closePath();ctx.fill();ctx.stroke();if(!seal.open){ctx.font='22px sans-serif';ctx.fillText('❄',seal.x-11,seal.y-24);}}
    for(const enemy of game.enemies){if(enemy.hp>0)drawGuardSprite(ctx,storyImage(STORY_CHARACTERS.nebelwache.asset),enemy,game.player.x);}
    const p=game.player,img=storyImage(STORY_CHARACTERS[game.config.hero].asset),height=game.config.hero==='muck'?95:150;
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.facing,1);if(p.invulnerable)ctx.globalAlpha=.55+Math.sin(time/65)*.25;
    const walk=game.config.hero==='fina'&&p.moving&&p.attack===0&&p.magic<3.8?storyImage('assets/fina-walk.png'):null;
    if(walk&&!reducedMotion){if(!spriteFrame(walk,0))prepareSpriteFrames(walk,4,2);const frame=Math.floor(game.elapsed*10)%8;drawSpriteFrame(ctx,walk,frame%4,Math.floor(frame/4),height);}
    else if(img){const w=height*img.width/img.height;ctx.drawImage(img,-w/2,-height+(p.moving&&!reducedMotion?Math.sin(time/80)*2:0),w,height);}ctx.restore();
    if(game.config.hero!=='muck'&&(p.attack>0||p.magic>3.8)){
      const {x,y}=ringOrigin(game);ctx.save();const glow=ctx.createRadialGradient(x,y,2,x,y,31);glow.addColorStop(0,'#bcf2ffa0');glow.addColorStop(1,'#8ddfff00');ctx.fillStyle=glow;ctx.fillRect(x-31,y-31,62,62);ctx.shadowColor='#a0edff';ctx.shadowBlur=reducedMotion?0:18;ctx.strokeStyle='#b6efff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+p.facing*60,y);ctx.stroke();ctx.restore();
    }
    for(const bolt of game.rings){ctx.save();ctx.translate(bolt.x,bolt.y-15);ctx.scale(Math.sign(bolt.vx),1);ctx.fillStyle='#bdefff';ctx.strokeStyle='#f1fcff';ctx.lineWidth=2;ctx.shadowColor='#8ee5ff';ctx.shadowBlur=reducedMotion?0:15;ctx.beginPath();ctx.moveTo(23,0);ctx.lineTo(0,-13);ctx.lineTo(-17,0);ctx.lineTo(0,13);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#83ccec';ctx.beginPath();ctx.moveTo(-17,0);ctx.lineTo(-45,0);ctx.stroke();ctx.restore();}
    for(const shot of game.shots){ctx.fillStyle='#61c4ef';ctx.beginPath();ctx.ellipse(shot.x,shot.y-12,16,9,0,0,Math.PI*2);ctx.fill();}
    if(game.snow>0){ctx.fillStyle='#fff';for(let i=0;i<60;i++){ctx.beginPath();ctx.arc(p.x-330+i*11,p.y-190+((reducedMotion?i*13:time/5+i*13)%230),3,0,Math.PI*2);ctx.fill();}}
    ctx.strokeStyle='#e0e6b1';ctx.lineWidth=6;ctx.strokeRect(game.length-90,510,70,220);ctx.font='24px Georgia';ctx.fillStyle='#fff0c0';ctx.fillText(game.config.hero==='muck'?'REGIS':'AUSGANG',game.length-155,485);
    if(game.config.hero==='muck'){const regis=storyImage(STORY_CHARACTERS.regis.asset);if(regis)ctx.drawImage(regis,game.length-210,490,140,240);}
    ctx.restore();
    ctx.fillStyle='#102a3cee';ctx.fillRect(25,220,275,100);ctx.fillStyle='#fff0c0';ctx.font='24px Georgia';ctx.fillText(`Mut: ${'♥'.repeat(Math.max(0,p.hp))}`,45,260);ctx.font='18px sans-serif';ctx.fillText(`Magie: ${p.magic>0?Math.ceil(p.magic)+' s':'bereit'}`,45,295);
    if(game.paused||game.status!=='playing'){ctx.fillStyle='#071d36ba';ctx.fillRect(0,325,1600,185);ctx.fillStyle='#fff0c0';ctx.font='40px Georgia';ctx.textAlign='center';ctx.fillText(game.paused?'Pause':game.status==='won'?'Der Weg ist gesichert!':'Die Wachen waren schneller. Noch einmal?',800,420);ctx.textAlign='start';}
  }
  function frame(time){if(!active)return;const dt=last===null?0:Math.min((time-last)/1000,.05);last=time;
    const current={...input,left:input.left||keys.has('arrowleft')||keys.has('a'),right:input.right||keys.has('arrowright')||keys.has('d'),up:input.up||keys.has('arrowup'),down:input.down||keys.has('arrowdown'),jump:input.jump||keys.has(' ')||keys.has('w'),attack:input.attack||keys.has('j'),magic:input.magic||keys.has('k')};
    stepActionGame(game,current,dt);draw(time);
    const text=game.paused?'P / Escape zum Weiterspielen':game.status==='lost'?'Du kannst neu versuchen oder zur Szene zurückkehren.':game.status==='won'?'Geschafft! Kehre zur Geschichte zurück.':game.config.hold?`Vorsprung: ${Math.min(28,Math.floor(game.elapsed))}/28 Sekunden`:`Frostsiegel: ${game.seals.filter(s=>s.open).length}/${game.seals.length} · Wachen: ${game.enemies.filter(e=>e.hp<=0).length}/${game.enemies.length}`;
    if(status.textContent!==text)status.textContent=text;
    retry.hidden=game.status!=='lost';
    overlay.querySelector('[data-action="leave"]').textContent=game.status==='won'?'Zur Geschichte weiter':'Zur Szene zurück';
    frameId=win.requestAnimationFrame(frame);
  }
  return {start(){previousFocus=doc.activeElement;active=true;canvas.style.touchAction='none';
    listen(win,'keydown',e=>{if(!active)return;const k=e.key.toLowerCase();if(k==='tab'){pause();return;}if(e.target.closest?.('button,input,textarea'))return;if(['arrowleft','arrowright','arrowup','arrowdown','a','d','w',' ','j','k','p','escape'].includes(k)){e.preventDefault();e.stopImmediatePropagation();if((k==='p'||k==='escape')&&!e.repeat)toggle();else keys.add(k);}},true);
    listen(win,'keyup',e=>keys.delete(e.key.toLowerCase()));listen(win,'blur',pause);listen(doc,'visibilitychange',()=>{if(doc.hidden)pause();});
    for(const button of overlay.querySelectorAll('[data-hold]')){
      listen(button,'pointerdown',e=>{e.preventDefault();button.setPointerCapture?.(e.pointerId);input[button.dataset.hold]=true;});
      for(const event of ['pointerup','pointercancel','lostpointercapture'])listen(button,event,()=>input[button.dataset.hold]=false);
    }
    pauseButton.onclick=toggle;retry.onclick=()=>{const gentle=game.gentle;game=createActionGame(mission);game.gentle=gentle;last=null;clear();canvas.focus();};
    overlay.querySelector('[data-action="gentle"]').onclick=e=>{game.gentle=!game.gentle;e.currentTarget.setAttribute('aria-pressed',String(game.gentle));};
    overlay.querySelector('[data-action="leave"]').onclick=()=>finish(game.status==='won');canvas.focus();frameId=win.requestAnimationFrame(frame);return new Promise(r=>resolve=r);
  },destroy(){finish(false);overlay.innerHTML='';}};
}
