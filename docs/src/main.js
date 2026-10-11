import {createOpeningUI} from './opening-ui.js';
import {openingWalkable,openingMove,openingPath,advanceOpeningPath} from './opening-navigation.js';
import { createAdventure, interact, mix, readyToLeave } from './adventure.js';
import { createBattle, act, ABILITIES, getBattleHint } from './battle.js';
import { isWalkable, move, findPath, advancePath } from './navigation.js';
import { ASSETS, HEROES, ITEMS, HOTSPOTS, VIVID_DIALOG, COLORIDA_DIALOG, FAREWELL_DIALOG } from './data.js';
import { loadImages, drawScene } from './renderer.js';
import { propSource } from './prop-art.js';
import { toggleSound, chime, loadMusic, playMusic, setMusicVolume, autoplaySound } from './audio.js';
import { followFina } from './companion.js';
import { animationFrame, facingDirection, viewDirection } from './animation.js';
import { createCampaignUI } from './campaign-ui.js';
import { STORY_CHARACTERS } from './story-data.js';
import { drawStory } from './story-renderer.js';
import {initLocalization,translate} from './localization.js';
import { storyPoint, storyMove, storyPath } from './story-navigation.js';
import {storyWalkable} from './story-space.js';
import {createComicPanel} from './comic-panel.js';
import {createWorldTasks} from './world-tasks.js';
import { createChapterMusic } from './chapter-music.js';
import { createChapterCard } from './chapter-card.js';
import { createFlightUI } from './flight-ui.js';
import { soundEnabled } from './audio.js';
import { walkInteraction } from './proximity.js';
import { createChapterMenu } from './chapter-menu.js';
import { createChaseUI } from './chase-ui.js';
import { bindSatchel } from './satchel.js';
import { portraitStyle } from './portrait-data.js';
import { bindModalPagination, paginateDialogText } from './modal-pages.js';
import { getInspection } from './inspection-data.js';
import { createActionUI } from './action-ui.js';
import { playVisualSequence } from './visual-sequence.js';
import { createMiniUI } from './mini-ui.js';

const $=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d'),modal=$('modal');
const state={started:false,mode:'journey',position:{x:825,y:835},muck:{x:905,y:655},facing:1,view:'front',animationTime:0,walkFrame:0,moving:false,destination:null,adventure:createAdventure(),battle:createBattle(),selected:'icy',effect:null,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
let opening,images,path=[],pending=null,keys=new Set(),toastTimer,dialogIndex=0,dialogLines=[],dialogDone=null,dialogView=null,selectedColors=[],hintLevel=0,returnFocus=null,story,chapterMusic,chapterCard,chapterMenu,modalPages;
const comicPanel=createComicPanel({state,stopMovement,getImages:()=>images??{},onCancel:()=>{if(state.campaign){state.campaign.pending=null;story?.update();}}});
const worldTasks=createWorldTasks({state,stopMovement});
const transitionVisible=()=>state.openingBusy||state.comicBusy||state.campaignBusy||['opening-intro','chapter-card','flight-overlay','chase-overlay','action-overlay','chapter-picker'].some(id=>!$(id).hidden);
function syncSoundButton(){const on=soundEnabled();$('sound-button').setAttribute('aria-pressed',String(on));$('sound-button').setAttribute('aria-label',on?'Klang ausschalten':'Klang einschalten');$('sound-button').title=on?'Klang ausschalten':'Klang einschalten';}
function sceneControls(){return [canvas,$('hotspots'),$('scene-heading'),$('objective'),$('satchel'),document.querySelector('.journey-tools'),document.querySelector('.game-footer'),document.querySelector('.brand'),document.querySelector('nav'),$('help-button'),$('chapter-navigation')];}
async function playAction(mission){
  stopMovement();state.hoveredId=null;const controls=sceneControls(),previous=controls.map(control=>[control,control.inert]);controls.forEach(control=>control.inert=true);
  $('action-overlay').hidden=false;
  const action=createActionUI({canvas:$('action-scene'),overlay:$('action-controls'),mission,background:story.getScene().background,reducedMotion:state.reducedMotion});
  try{return await action.start();}finally{action.destroy();$('action-overlay').hidden=true;previous.forEach(([control,inert])=>control.inert=inert);canvas.focus();}
}
async function playVisual(type){
  stopMovement();state.hoveredId=null;const controls=sceneControls(),previous=controls.map(control=>[control,control.inert]);controls.forEach(control=>control.inert=true);$('action-overlay').hidden=false;
  try{return await playVisualSequence({canvas:$('action-scene'),overlay:$('action-controls'),type,state,images,scene:story.getScene()});}
  finally{$('action-overlay').hidden=true;previous.forEach(([control,inert])=>control.inert=inert);canvas.focus();}
}
async function playMini(kind){
  stopMovement();state.hoveredId=null;const controls=sceneControls(),previous=controls.map(control=>[control,control.inert]);controls.forEach(control=>control.inert=true);$('action-overlay').hidden=false;
  const game=createMiniUI({canvas:$('action-scene'),overlay:$('action-controls'),kind,background:story.getScene().background});
  try{return await game.start();}finally{game.destroy();$('action-overlay').hidden=true;previous.forEach(([control,inert])=>control.inert=inert);canvas.focus();}
}
async function playChase(){
  stopMovement();const controls=sceneControls(),previous=controls.map(control=>[control,control.inert]);controls.forEach(control=>control.inert=true);
  $('chase-overlay').hidden=false;
  const chase=createChaseUI({canvas:$('chase-scene'),overlay:$('chase-controls'),reducedMotion:state.reducedMotion});
  try{return await chase.start();}finally{chase.destroy();$('chase-overlay').hidden=true;previous.forEach(([control,inert])=>control.inert=inert);canvas.focus();}
}
async function playFlight(){
  stopMovement();const controls=sceneControls(),previous=controls.map(control=>[control,control.inert]);controls.forEach(control=>control.inert=true);
  $('flight-overlay').hidden=false;
  const flight=createFlightUI({canvas:$('flight-scene'),overlay:$('flight-controls'),reducedMotion:state.reducedMotion,pilotName:'Kian'});
  try{return await flight.start();}finally{flight.destroy();$('flight-overlay').hidden=true;previous.forEach(([control,inert])=>control.inert=inert);canvas.focus();}
}
function stopMovement(){keys.clear();path=[];pending=null;state.destination=null;state.moving=false;}
function message(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4300);}
function openModal(content){
  stopMovement();returnFocus=document.activeElement;$('modal-content').innerHTML=content;if(!modal.open)modal.showModal();
  modalPages?.refresh();
  modal.querySelector('button')?.focus();
}
function closeModal(){comicPanel.close();if(modal.open)modal.close();if(returnFocus?.isConnected&&!returnFocus.closest('[hidden]'))returnFocus.focus();else canvas.focus();}
modal.addEventListener('close',()=>keys.clear());
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
function basicModal(title,text,extra=''){if(state.mode==='campaign'){comicPanel.open(title,text,extra);return;}openModal(`<div class="modal-header"><span class="chapter">DAS HIMMELSREICH</span><button class="close-modal" aria-label="Schließen">×</button></div><h2 id="modal-title">${title}</h2><p>${text}</p>${extra}`);modal.querySelector('.close-modal').onclick=closeModal;}
function showDialog(lines,onDone=null,view=null){if(state.mode==='campaign'){comicPanel.dialog(lines,onDone,view);return;}const budget=innerHeight<520?(view?110:190):view?250:innerWidth<650?360:540;dialogLines=lines.flatMap(line=>paginateDialogText(translate(line.text),budget).map(text=>({...line,text})));dialogIndex=0;dialogDone=onDone;dialogView=view;dialogPage();}
function dialogPage(){
  const line=dialogLines[dialogIndex],portrait=Object.values(STORY_CHARACTERS).find(c=>c.name===line.speaker)?.portrait??ASSETS.fina;
  openModal(`${dialogView?`<figure class="story-inspection">${dialogView.art?`<canvas id="painted-inspection" width="512" height="512" role="img" aria-label="${dialogView.alt}"></canvas>`:`<img src="${dialogView.src}" alt="${dialogView.alt}">`}<figcaption>${dialogView.alt}</figcaption></figure>`:''}<div class="dialog-layout"><div class="dialog-portrait" style="${portraitStyle(line.speaker)}"><img src="${portrait}" alt="${line.speaker}: Gesicht und Oberkörper"></div><div><span class="chapter">${state.mode==='campaign'?story.getScene().title:'EIN GESPRÄCH IN FARBENQUELL'}</span><h2 id="modal-title">${line.speaker}</h2><p>${line.text}</p></div></div><div class="dialog-footer"><span>${dialogIndex+1} / ${dialogLines.length} · Enter zum Weiterreden</span><button id="dialog-next" class="gold-button">${dialogIndex+1===dialogLines.length?'Weiterreisen':'Weiter'} ➜</button></div>`);
  if(dialogView?.art){
    const art=dialogView.art,atlas=images[art.asset],detailCanvas=$('painted-inspection');
    if(atlas&&detailCanvas){const source=propSource(atlas,art),scale=Math.min(448/source[2],448/source[3]),w=source[2]*scale,h=source[3]*scale;detailCanvas.getContext('2d').drawImage(atlas,...source,(512-w)/2,(512-h)/2,w,h);}
  }
  $('dialog-next').onclick=()=>{if(++dialogIndex<dialogLines.length)dialogPage();else{const done=dialogDone;dialogDone=null;closeModal();done?.();if(state.mode==='campaign')story.update();else updateJourney();}};
  $('dialog-next').focus();
}
function updateJourney(){if(opening){opening.update();if(state.started&&state.mode==='journey')story?.save();}}
function setMode(mode){
  stopMovement();comicPanel.close();worldTasks.close();story?.suspend();if(modal.open)modal.close();if(mode!=='journey')opening?.suspend();state.mode=mode;document.querySelector('.world').classList.toggle('campaign-comic',mode==='campaign');
  if(mode==='campaign')state.started=true;
  $('journey-tab').classList.toggle('active',mode!=='battle');$('battle-tab').classList.toggle('active',mode==='battle');
  $('start-screen').hidden=state.started||mode==='battle';$('scene-heading').hidden=!state.started||mode==='battle';$('objective').hidden=!state.started||mode==='battle';$('hotspots').hidden=!state.started||mode==='battle';$('battle-ui').hidden=mode!=='battle';$('satchel').hidden=mode==='battle';
  $('battle-panel').hidden=mode!=='battle';
  $('context-label').textContent=mode==='battle'?'Kampfrätsel · separate Spieladaption · ohne Zeitdruck':'Farbenquell · Finas Aufbruch';
  $('hint-button').disabled=!state.started;
  for(const id of ['journal-button','chapters-button'])$(id).hidden=mode!=='campaign';
  $('save-button').hidden=!state.started||mode==='battle';
  if(mode==='battle')updateBattle();else if(mode==='campaign')story.update();else{opening?.restore();buildJourneyHotspots();updateJourney();playMusic('01');chapterMenu?.update('farbenquell');if(!state.started&&chapterMusic){chapterMusic.play(['01'],{loop:true});syncSoundButton();}}
}
function buildJourneyHotspots(){opening?.update();}
function continueJourney(){
  basicModal('Auf Wiedersehen, Farbenquell','Vivid winkt vom Wolkenrand. Vor Fina liegt der Weg zu Cirrus’ Wolkenweide – und weiter zur Himmelsstadt.',`<button id="continue-story" class="gold-button">Zu Cirrus’ Wolkenweide ➜</button>`);
  $('continue-story').onclick=()=>{closeModal();story.start();};
}
function requestInteraction(h){
  if(state.mode==='campaign'){
    if(modal.open||transitionVisible()||!h)return;
    if(story.followingTarget(h.id)){story.act(h.id);return;}
    if(h.type==='exit'){stopMovement();story.act(h.id);return;}
    const approach=storyPoint(h.approach,story.getScene());
    if(Math.hypot(state.position.x-approach.x,state.position.y-approach.y)<18){story.act(h.id);return;}
    keys.clear();path=storyPath(state.position,approach,story.getScene());pending=path.length?h.id:null;state.destination=path.length?approach:null;canvas.focus();return;
  }
  if(!state.started||state.mode!=='journey'||modal.open||transitionVisible()||!h)return;
  if(h.type==='exit'||['portrait','window','clouds','stairs'].includes(h.id)){stopMovement();handleInteraction(h.id);return;}
  keys.clear();
  if(Math.hypot(state.position.x-h.approach.x,state.position.y-h.approach.y)<18){handleInteraction(h.id);return;}
  path=openingPath(state.position,h.approach,state.adventure.opening?.area);pending=h.id;state.destination=h.approach;
  if(!path.length){pending=null;state.destination=null;message('Gehe zunächst auf die Wolkenwege.');}
  canvas.focus();
}
function handleInteraction(id){opening?.act(id);}
function showHint(){
  if(state.mode==='campaign'){story.hint();return;}
  if(state.mode==='battle'){basicModal('Ein kühler Kopf hilft',getBattleHint(state.battle));return;}
  opening?.hint();
}
function updateBattle(){
  const b=state.battle;
  const hero=HEROES.find(h=>h.id===state.selected);
  const protectedNow=b.coverTurns>0||b.guardFrozenTurns>0||b.shieldTurns>0;
  $('pressure-meter').value=b.pressure;$('pressure-points').textContent=`${b.pressure} / 4 · ${b.pressure===0?'Unbemerkt':b.pressure===3?'Gleich entdeckt!':'Die Wache wird aufmerksam'}`;
  $('round-label').textContent=`ZUG ${b.round}`;
  const protectedTurns=Math.max(b.coverTurns,b.guardFrozenTurns,b.shieldTurns);
  $('threat-text').textContent=b.status==='won'?'Ihr seid sicher auf dem Wolkenweg!':protectedNow?`Frost oder Schnee hält die Wache zurück. Noch ${protectedTurns} geschützte Züge.`:b.waterFlow?'Die Wache holt mit ihrer Wasserpeitsche aus. Ein ungeschützter Zug macht sie aufmerksamer.':'Die Wasserpeitsche ist gestoppt. Die Wache kommt näher – lenkt sie ab oder haltet sie fest.';
  $('battle-progress').innerHTML=[[!b.waterFlow,'Wasser gestoppt'],[b.gateOpen,'Tor geöffnet'],[b.status==='won','Entkommen']].map(([done,label])=>`<span class="${done?'done':''}">${done?'✓':'○'} ${label}</span>`).join('');
  $('frost-knowledge').textContent=b.learnedFrost?'✧ Fina hat Frostmagie beobachtet':'Fina: „Zeigt mir, wie ihr das macht!“';
  $('battle-selection').innerHTML=HEROES.map(h=>`<button class="hero-card" data-hero="${h.id}" aria-label="${h.name}: ${ABILITIES[h.id].name}" aria-pressed="${state.selected===h.id}" style="--ring:${h.color}" ${b.status!=='playing'?'disabled':''}><strong>${h.name}</strong><span class="ring-label">${h.symbol} ${h.ring}</span><span class="hero-skill">${ABILITIES[h.id].name}</span></button>`).join('');
  $('battle-selection').querySelectorAll('[data-hero]').forEach(button=>button.onclick=()=>{state.selected=button.dataset.hero;updateBattle();$('battle-selection').querySelector(`[data-hero="${state.selected}"]`)?.focus();});
  $('selected-name').textContent=hero.name;$('selected-description').textContent=ABILITIES[hero.id].description;
  $('ability-button').textContent=`${hero.symbol} ${ABILITIES[hero.id].name}`;
  for(const id of ['ability-button','valve-button','gate-button','escape-button'])$(id).disabled=b.status!=='playing';
  $('valve-state').textContent=b.waterFlow?'Zufluss stoppen':'Zufluss gestoppt ✓';
  $('gate-state').textContent=b.gateOpen?'Offen ✓':b.waterFlow?'Wasserdruck blockiert das Tor':'Verriegelung lösen';
  $('escape-state').textContent=b.status==='won'?'Entkommen ✓':b.gateOpen?'Flucht versuchen':'Erst das Tor öffnen';
  $('escape-button').classList.toggle('ready',b.gateOpen&&protectedNow);
  $('battle-log').textContent=b.last?.message??'Wähle eine Heldin und ihre Fähigkeit – oder klicke auf das Ventil, das Tor und den Wolkenweg.';
}
function battleAction(action){
  const b=state.battle,id=state.selected,h=HEROES.find(h=>h.id===id);
  const previousLast=b.last;
  if(!act(b,id,action)){
    if(b.last!==previousLast){state.effect=null;updateBattle();}
    return;
  }
  const magic=b.last.success&&(action==='ability'||(action==='valve'&&id==='cold'));
  state.effect=magic&&!b.last.restarted?{hero:id,action,time:performance.now(),color:id==='fina'?['#94e8ff','#ffe497','#cfa1ff'][b.round%3]:h.color}:null;
  if(b.last.success)chime(b.status==='won'?'win':'attack');
  updateBattle();
  if(b.status==='won'){
    basicModal('Ein Weg für alle!','Die Wasserwache stapft durch den Schnee: „Wer hat hier den Winter bestellt?“ Die vier sind längst durch das Tor. Die kurze Kampfprobe ist geschafft.',`<button id="retry-battle" class="gold-button">Noch einen Lösungsweg ausprobieren ↻</button> <button id="back-journey">Zurück nach Farbenquell</button>`);
    $('retry-battle').onclick=()=>{closeModal();resetBattle();};$('back-journey').onclick=()=>{closeModal();setMode('journey');};
  }
}
function resetBattle(){state.battle=createBattle();state.effect=null;state.selected='icy';updateBattle();$('battle-selection').querySelector('[data-hero="icy"]')?.focus();}
function showHelp(){basicModal('So spielst du','Begleite Fina von Farbenquell bis zum Ende ihrer Reise. Erkunde die Kulisse: Gegenstände leuchten auf, wenn du darüber zeigst. Die kleine Sprechblase über einer Figur zeigt ein neues verfügbares Gespräch. Klicke auf die Figur oder die Blase; Fina läuft hin und spricht sie an. Nach dem Gespräch verschwindet die Blase. Sprich mit den Figuren, sammle Werkzeuge und verbinde Hinweise. Fina läuft zum angeklickten Ort.',`<div class="help-rows"><strong>Pfeiltasten / WASD</strong><span>Fina auf den Wolkenwegen bewegen</span><strong>Mausklick</strong><span>Zum Bodenpunkt laufen oder ein Objekt benutzen</span><strong>Enter / Leertaste</strong><span>Ein nahes Objekt benutzen, im Gespräch weiterreden</span><strong>Reisetasche</strong><span>Gegenstände untersuchen, zum Benutzen auswählen und anschließend ein Szenenobjekt anklicken</span><strong>H / Hinweis</strong><span>Hilfe beim nächsten Schritt erhalten</span><strong>Reisebuch / Kapitel</strong><span>Hinweise nachlesen und euren Weg überblicken</span><strong>Tab + Enter</strong><span>Schaltflächen mit der Tastatur bedienen</span><strong>Escape</strong><span>Ein Fenster schließen oder einen ausgewählten Gegenstand ablegen</span></div><p style="font-size:12px">Denkaufgaben haben kein Zeitlimit. In Actionspielen schießt J Eiszauber aus dem Ring, K nutzt die Spezialfähigkeit. Minispiele erklären ihre Steuerung beim Start; du kannst sie pausieren und erneut versuchen. Die Reise wird nach erledigten Aufgaben gespeichert. Mit „Gespeicherte Reise fortsetzen“ kannst du nach einer Pause weiterspielen. Musik schaltest du mit ♫ ein.</p>`);}
function initialize(){
  const satchel=bindSatchel({toggle:$('satchel-toggle'),panel:$('satchel-panel'),inventory:$('inventory'),previous:$('satchel-previous'),next:$('satchel-next'),status:$('satchel-page')});
  modalPages=bindModalPagination({dialog:modal,content:$('modal-content')});
  chapterMenu=createChapterMenu({root:$('chapter-navigation'),onSelect:id=>{stopMovement();story.jumpTo(id);},onOpen:stopMovement});
  chapterMusic=createChapterMusic({onStatus:text=>$('chapter-card-music').textContent=text});
  chapterCard=createChapterCard({overlay:$('chapter-card'),image:$('chapter-card-image'),title:$('chapter-card-title'),label:$('chapter-card-label'),narrative:$('chapter-card-story'),continueButton:$('chapter-card-next'),music:chapterMusic,controls:sceneControls(),onSceneMusic:scene=>playMusic(scene.music??'01')});
  story=createCampaignUI({state,showDialog,basicModal,closeModal,message,chime,stopMovement,setMode,onMusic:number=>{playMusic(number);loadMusic();},onSceneCard:(scene,done)=>{stopMovement();chapterCard.show(scene,done);syncSoundButton();},onFlight:playFlight,onChase:playChase,onAction:playAction,onVisual:playVisual,onMini:playMini,onWorldTask:(scene,response)=>worldTasks.play(scene,response),onInventoryUse:()=>satchel.close(),onChapterChange:id=>chapterMenu.update(id),onChapters:()=>chapterMenu.open(),stageScenes:true});
  const hover=e=>{const button=e.target.closest?.('[data-id]');state.hoveredId=button?.dataset.id??null;};
  for(const event of ['pointerover','focusin'])$('hotspots').addEventListener(event,hover);
  for(const event of ['pointerleave','focusout'])$('hotspots').addEventListener(event,()=>state.hoveredId=null);
  $('resume-button').hidden=!story.hasSave();
  $('music-volume').oninput=e=>setMusicVolume(e.target.value/100);loadMusic();
  window.addEventListener('story-interaction',e=>requestInteraction(story.getTargets().find(h=>h.id===e.detail)));
  opening=createOpeningUI({state,stopMovement,save:()=>story.save(),message,chime,travel:()=>story.start(),closeSatchel:()=>satchel.close(),request:requestInteraction,playMusic});
  $('start-button').onclick=()=>{if(!soundEnabled())toggleSound();opening.reset();state.started=true;setMode('journey');opening.intro();syncSoundButton();};
  const resumeJourney=$('resume-button').onclick;
  $('resume-button').onclick=()=>{chapterMusic.stop();if(!soundEnabled())toggleSound();syncSoundButton();resumeJourney();};
  $('journey-tab').onclick=()=>setMode(state.campaign?'campaign':'journey');$('battle-tab').hidden=true;
  $('help-button').onclick=showHelp;$('hint-button').onclick=showHint;
  $('ability-button').onclick=()=>battleAction('ability');
  for(const action of ['valve','gate','escape'])$(action+'-button').onclick=()=>battleAction(action);
  $('battle-hint-button').onclick=showHint;$('reset-battle-button').onclick=resetBattle;
  $('sound-button').onclick=()=>{const on=toggleSound();syncSoundButton();if(on)chime();};
  $('restart-button').onclick=()=>{basicModal('Ganz von vorn?','Damit beginnt Fina wieder in Farbenquell. Deine zuletzt gespeicherte Reise kannst du auf dem Startbild fortsetzen.',`<button id="confirm-restart" class="gold-button">Neu beginnen ↻</button>`);$('confirm-restart').onclick=()=>{state.adventure=createAdventure();opening.reset();state.campaign=null;state.battle=createBattle();state.position={x:825,y:835};state.started=false;state.effect=null;hintLevel=0;closeModal();setMode('journey');$('resume-button').hidden=!story.hasSave();};};
  document.querySelector('.brand').onclick=e=>{e.preventDefault();setMode(state.campaign?'campaign':'journey');};
  canvas.addEventListener('click',e=>{
    if(!state.started||!['journey','campaign'].includes(state.mode)||modal.open||transitionVisible())return;
    canvas.focus();const r=canvas.getBoundingClientRect(),point={x:(e.clientX-r.left)/r.width*1600,y:(e.clientY-r.top)/r.height*900};
    if(state.mode==='campaign'){
      if(!storyWalkable(point,story.getScene())){message('Gehe auf der tragfähigen Wolkenfläche im Vordergrund.');return;}
      keys.clear();pending=null;path=storyPath(state.position,point,story.getScene());state.destination=path.at(-1)??null;return;
    }
    if(!openingWalkable(point,state.adventure.opening?.area)){message('Hier kannst du nicht laufen. Bleib auf den Wolkenwege.');return;}
    keys.clear();pending=null;path=openingPath(state.position,point,state.adventure.opening?.area);state.destination=path.length?point:null;
  });
  window.addEventListener('keydown',e=>{
    if(modal.open||transitionVisible())return;
    const key=e.key.toLowerCase();
    if(key==='escape'&&state.selectedItem){state.selectedItem=null;message('Der Gegenstand liegt wieder in deiner Tasche.');return;}
    if(key==='h'&&!e.repeat&&!e.target.closest('input,select,textarea')){showHint();return;}
    if(e.target.closest('button,a,input,select,textarea'))return;
    if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)&&state.started&&['journey','campaign'].includes(state.mode)){
      e.preventDefault();keys.add(key);path=[];pending=null;state.destination=null;
    }
    if((key==='enter'||key===' ')&&!e.repeat&&state.started&&['journey','campaign'].includes(state.mode)){
      e.preventDefault();const targets=state.mode==='campaign'?story.getTargets():opening.targets();
      const nearest=targets.toSorted((a,b)=>Math.hypot(a.approach.x-state.position.x,a.approach.y-state.position.y)-Math.hypot(b.approach.x-state.position.x,b.approach.y-state.position.y))[0];
      if(nearest&&Math.hypot(nearest.approach.x-state.position.x,nearest.approach.y-state.position.y)<32){if(state.mode==='campaign')story.act(nearest.id);else handleInteraction(nearest.id);}else message('Gehe näher an eine Figur oder einen Gegenstand heran.');
    }
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',stopMovement);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMovement();});
  setMode('journey');autoplaySound({onChange:syncSoundButton});syncSoundButton();
}
let previous=0;
function frame(time){
  const dt=Math.min((time-previous)/1000,.05);previous=time;state.moving=false;
  const beforeMove={...state.position},hadPending=!!pending;
  if(state.started&&['journey','campaign'].includes(state.mode)&&!modal.open&&!transitionVisible()){
    let d={x:Number(keys.has('arrowright')||keys.has('d'))-Number(keys.has('arrowleft')||keys.has('a')),y:Number(keys.has('arrowdown')||keys.has('s'))-Number(keys.has('arrowup')||keys.has('w'))};
    if(d.x||d.y){const before=state.position;state.position=state.mode==='campaign'?storyMove(state.position,d,dt,story.getScene()):openingMove(state.position,d,dt,state.adventure.opening?.area);state.moving=Math.hypot(state.position.x-before.x,state.position.y-before.y)>.01;state.facing=facingDirection(d.x,state.facing);state.view=viewDirection(d,state.view);}
    else if(path.length){
      if(state.mode==='campaign'){
        const step=advanceOpeningPath(state.position,path,dt);
        state.position=step.position;path=step.path;state.moving=step.moving;state.facing=facingDirection(step.dx,state.facing);state.view=viewDirection({x:step.dx,y:step.dy},state.view);
        if(!path.length){state.destination=null;if(pending){const id=pending;pending=null;story.act(id);}}
      }else{
      const step=advanceOpeningPath(state.position,path,dt);
      state.position=step.position;path=step.path;state.moving=step.moving;state.facing=facingDirection(step.dx,state.facing);state.view=viewDirection({x:step.dx,y:step.dy},state.view);
      if(!path.length){state.destination=null;if(pending){const id=pending;pending=null;handleInteraction(id);}}
      }
    }
  }
  if(state.mode==='campaign'&&state.moving&&!hadPending&&!modal.open&&!transitionVisible()){
    const campaign=state.mode==='campaign',targets=campaign?story.getTargets().filter(h=>h.type==='exit'):HOTSPOTS.filter(h=>['vivid','colorida','exit'].includes(h.id)).filter(h=>h.id!=='exit'||readyToLeave(state.adventure)).map(h=>({...h,type:h.id==='exit'?'exit':'talk'}));
    const next=walkInteraction(beforeMove,state.position,targets,campaign?{flags:state.campaign.flags,inventory:state.campaign.inventory,rightEdge:1480,done:h=>state.campaign.viewed.includes(`${state.campaign.sceneId}:${h.id}`)}:{done:h=>h.id==='vivid'?state.adventure.talked:h.id==='colorida'?state.adventure.inventory.includes('letter'):false});
    if(next){stopMovement();if(campaign)story.act(next.id);else handleInteraction(next.id);}
  }
  opening?.tick(time);
  if(state.mode==='campaign')story?.tick(time);
  if(!state.moving)state.view='front';
  state.muck=followFina(state.muck,{...state.position,facing:state.facing},dt);
  state.animationTime=state.moving?state.animationTime+dt:0;state.walkFrame=animationFrame(state.animationTime,state.moving,state.reducedMotion);
  canvas.dataset.finaX=state.position.x.toFixed(1);canvas.dataset.finaY=state.position.y.toFixed(1);canvas.dataset.facing=String(state.facing);canvas.dataset.walkFrame=String(state.walkFrame);canvas.dataset.moving=String(state.moving);canvas.dataset.view=state.view;
  canvas.dataset.muckFacing=String(state.muck.facing);canvas.dataset.muckAngle=String(state.muck.angle);
  // The scene remains a still backdrop while a minigame owns its own canvas.
  if($('flight-overlay').hidden&&$('chase-overlay').hidden&&$('action-overlay').hidden){if(state.mode==='campaign'){drawStory(ctx,images,state,story.getScene(),time);story.updateMarkers(time);}else drawScene(ctx,images,state,time);}
  requestAnimationFrame(frame);
}
$('start-button').disabled=true;
try{await initLocalization();images=await loadImages();initialize();$('start-button').disabled=false;requestAnimationFrame(frame);}catch(error){$('load-error').hidden=false;$('load-error').textContent=error.message+' Bitte prüfe die Bilddateien und lade die Seite neu.';}
