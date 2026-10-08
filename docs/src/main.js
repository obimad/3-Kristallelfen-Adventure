import { createAdventure, interact, mix, readyToLeave } from './adventure.js';
import { createBattle, act, ABILITIES, getBattleHint } from './battle.js';
import { isWalkable, move, findPath, advancePath } from './navigation.js';
import { ASSETS, HEROES, ITEMS, HOTSPOTS, VIVID_DIALOG, COLORIDA_DIALOG, FAREWELL_DIALOG } from './data.js';
import { loadImages, drawScene } from './renderer.js';
import { toggleSound, chime, loadMusic, playMusic, setMusicVolume } from './audio.js';
import { followFina } from './companion.js';
import { animationFrame, facingDirection, viewDirection } from './animation.js';
import { createCampaignUI } from './campaign-ui.js';
import { STORY_CHARACTERS } from './story-data.js';
import { drawStory } from './story-renderer.js';
import { storyPoint, storyMove } from './story-navigation.js';
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

const $=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d'),modal=$('modal');
const state={started:false,mode:'journey',position:{x:825,y:835},muck:{x:905,y:655},facing:1,view:'front',animationTime:0,walkFrame:0,moving:false,destination:null,adventure:createAdventure(),battle:createBattle(),selected:'icy',effect:null,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
let images,path=[],pending=null,keys=new Set(),toastTimer,dialogIndex=0,dialogLines=[],dialogDone=null,dialogView=null,selectedColors=[],hintLevel=0,returnFocus=null,story,chapterMusic,chapterCard,chapterMenu,modalPages;
const transitionVisible=()=>['opening-intro','chapter-card','flight-overlay','chase-overlay','chapter-picker'].some(id=>!$(id).hidden);
function syncSoundButton(){const on=soundEnabled();$('sound-button').setAttribute('aria-pressed',String(on));$('sound-button').setAttribute('aria-label',on?'Klang ausschalten':'Klang einschalten');$('sound-button').title=on?'Klang ausschalten':'Klang einschalten';}
function sceneControls(){return [canvas,$('hotspots'),$('scene-heading'),$('objective'),$('satchel'),document.querySelector('.journey-tools'),document.querySelector('.game-footer'),document.querySelector('.brand'),document.querySelector('nav'),$('help-button'),$('chapter-navigation')];}
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
function closeModal(){modal.close();if(returnFocus?.isConnected&&!returnFocus.closest('[hidden]'))returnFocus.focus();else canvas.focus();}
modal.addEventListener('close',()=>keys.clear());
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
function basicModal(title,text,extra=''){openModal(`<div class="modal-header"><span class="chapter">DAS HIMMELSREICH</span><button class="close-modal" aria-label="Schließen">×</button></div><h2 id="modal-title">${title}</h2><p>${text}</p>${extra}`);modal.querySelector('.close-modal').onclick=closeModal;}
function showDialog(lines,onDone=null,view=null){const budget=innerHeight<520?(view?110:190):view?250:innerWidth<650?360:540;dialogLines=lines.flatMap(line=>paginateDialogText(line.text,budget).map(text=>({...line,text})));dialogIndex=0;dialogDone=onDone;dialogView=view;dialogPage();}
function dialogPage(){
  const line=dialogLines[dialogIndex],portrait=Object.values(STORY_CHARACTERS).find(c=>c.name===line.speaker)?.portrait??ASSETS.fina;
  openModal(`${dialogView?`<figure class="story-inspection"><img src="${dialogView.src}" alt="${dialogView.alt}"><figcaption>${dialogView.alt}</figcaption></figure>`:''}<div class="dialog-layout"><div class="dialog-portrait" style="${portraitStyle(line.speaker)}"><img src="${portrait}" alt="${line.speaker}: Gesicht und Oberkörper"></div><div><span class="chapter">${state.mode==='campaign'?story.getScene().title:'EIN GESPRÄCH IN FARBENQUELL'}</span><h2 id="modal-title">${line.speaker}</h2><p>${line.text}</p></div></div><div class="dialog-footer"><span>${dialogIndex+1} / ${dialogLines.length} · Enter zum Weiterreden</span><button id="dialog-next" class="gold-button">${dialogIndex+1===dialogLines.length?'Weiterreisen':'Weiter'} ➜</button></div>`);
  $('dialog-next').onclick=()=>{if(++dialogIndex<dialogLines.length)dialogPage();else{const done=dialogDone;dialogDone=null;closeModal();done?.();if(state.mode==='campaign')story.update();else updateJourney();}};
  $('dialog-next').focus();
}
function updateJourney(){
  $('scene-heading').innerHTML='<span class="chapter">KAPITEL I</span><h1>Farbenquell</h1><span class="scene-subtitle">Wo die Farben des Himmels entstehen</span>';
  const s=state.adventure;
  $('satchel-counter').textContent=`${s.inventory.length} von 3 eingepackt`;
  $('inventory').innerHTML=Object.entries(ITEMS).filter(([id])=>s.inventory.includes(id)).map(([id,item])=>`<button class="item" data-item="${id}"><span class="item-icon">${item.icon}</span><span>${item.name}<small>Eingepackt ✓</small></span></button>`).join('');
  $('inventory').querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>{const id=b.dataset.item;state.adventure.inventory.includes(id)?basicModal(ITEMS[id].name,interact(state.adventure,'inspect:'+id)?ITEMS[id].description:'Das hast du schon untersucht. Hier gibt es nichts Neues zu entdecken.'):requestInteraction(HOTSPOTS.find(h=>h.id===(id==='letter'?'colorida':id)));});
  $('objective-text').textContent=s.completed?'Vivid hat sich verabschiedet. Deine Reise beginnt.':!s.talked?'Sprich mit Vivid, bevor du aufbrichst.':!s.inventory.includes('bag')?'Packe deine Reisetasche ein.':!s.inventory.includes('crystal')?'Nimm den Kristall deiner Mutter mit.':!s.inventory.includes('letter')?'Sprich mit Colorida über ihre Empfehlung.':'Alles eingepackt. Verabschiede dich am Wolkenweg.';
  $('objective-progress').textContent=`${s.inventory.length} / 3 Reisegegenstände`;
  $('hotspots').querySelectorAll('button').forEach(b=>b.classList.toggle('collected',s.inventory.includes(b.dataset.id==='colorida'?'letter':b.dataset.id)));
  const exitButton=$('hotspots').querySelector('[data-id="exit"]');if(exitButton)exitButton.hidden=!readyToLeave(s);
  if(state.started&&state.mode==='journey')story?.save();
}
function setMode(mode){
  stopMovement();if(modal.open)modal.close();state.mode=mode;
  if(mode==='campaign')state.started=true;
  $('journey-tab').classList.toggle('active',mode!=='battle');$('battle-tab').classList.toggle('active',mode==='battle');
  $('start-screen').hidden=state.started||mode==='battle';$('scene-heading').hidden=!state.started||mode==='battle';$('objective').hidden=!state.started||mode==='battle';$('hotspots').hidden=!state.started||mode==='battle';$('battle-ui').hidden=mode!=='battle';$('satchel').hidden=mode==='battle';
  $('battle-panel').hidden=mode!=='battle';
  $('context-label').textContent=mode==='battle'?'Kampfrätsel · separate Spieladaption · ohne Zeitdruck':'Farbenquell · Finas Aufbruch';
  $('hint-button').disabled=!state.started;
  for(const id of ['journal-button','chapters-button'])$(id).hidden=mode!=='campaign';
  $('save-button').hidden=!state.started||mode==='battle';
  if(mode==='battle')updateBattle();else if(mode==='campaign')story.update();else{buildJourneyHotspots();updateJourney();playMusic('01');chapterMenu?.update('farbenquell');if(!state.started&&chapterMusic){chapterMusic.play(['01'],{loop:true});syncSoundButton();}}
}
function buildJourneyHotspots(){
  $('hotspots').setAttribute('aria-label','Interaktionen in Farbenquell');
  $('hotspots').innerHTML=HOTSPOTS.map(h=>`<button class="hotspot" data-id="${h.id}" style="left:${h.x/16}%;top:${h.y/9}%" aria-label="${h.name}: ${h.verb}">${h.icon}<span class="hotspot-label">${h.name} · ${h.verb}</span></button>`).join('');
  $('hotspots').querySelectorAll('[data-id]').forEach(button=>button.onclick=()=>requestInteraction(HOTSPOTS.find(h=>h.id===button.dataset.id)));
}
function continueJourney(){
  basicModal('Auf Wiedersehen, Farbenquell','Vivid winkt vom Wolkenrand. Vor Fina liegt der Weg zu Cirrus’ Wolkenweide – und weiter zur Himmelsstadt.',`<button id="continue-story" class="gold-button">Zu Cirrus’ Wolkenweide ➜</button>`);
  $('continue-story').onclick=()=>{closeModal();story.start();};
}
function requestInteraction(h){
  if(state.mode==='campaign'){
    if(modal.open||transitionVisible()||!h)return;
    if(story.followingTarget(h.id)){story.act(h.id);return;}
    const approach=storyPoint(h.approach);
    if(Math.hypot(state.position.x-approach.x,state.position.y-approach.y)<18){story.act(h.id);return;}
    keys.clear();path=[approach];pending=h.id;state.destination=approach;canvas.focus();return;
  }
  if(!state.started||state.mode!=='journey'||modal.open||transitionVisible()||!h)return;
  keys.clear();
  if(Math.hypot(state.position.x-h.approach.x,state.position.y-h.approach.y)<18){handleInteraction(h.id);return;}
  path=findPath(state.position,h.approach);pending=h.id;state.destination=h.approach;
  if(!path.length){pending=null;state.destination=null;message('Gehe zunächst auf die Wolkenwege.');}
  canvas.focus();
}
function handleInteraction(id){
  stopMovement();
  if(id==='vivid'){
    if(state.adventure.talked){basicModal('Vivid','Das Gespräch hast du schon geführt. Vivid wartet auf deinen Abschied am Wolkenweg.');return;}
    showDialog(VIVID_DIALOG,()=>{interact(state.adventure,'vivid');updateJourney();});return;
  }
  if(id==='colorida'){
    if(state.adventure.inventory.includes('letter')){basicModal('Coloridas Empfehlung','Das hast du schon erledigt. Coloridas Schreiben für Meisterin Aria liegt sicher in deiner Reisetasche.');return;}
    showDialog(COLORIDA_DIALOG,()=>{interact(state.adventure,'colorida');updateJourney();chime();message('Colorida hat dir ihr Empfehlungsschreiben übergeben.');});return;
  }
  if(id==='colors'){
    if(state.adventure.mixed){basicModal('Die Farben des Abendhimmels','Das hast du schon gemacht. Das Violett ist fertig, und Vivid hat sich über deine Hilfe gefreut.');return;}
    showMixer();return;
  }
  if(ITEMS[id]){
    if(interact(state.adventure,id)){updateJourney();chime();message(`${ITEMS[id].name} eingepackt.`);}else basicModal(ITEMS[id].name,'Das hast du schon eingepackt. Du findest es in deiner Reisetasche.');
    return;
  }
  if(id==='stairs'||id==='clouds'){
    const title=id==='clouds'?'Das Wolkenmeer':'Die Wolkenwege';
    if(!interact(state.adventure,id)){basicModal(title,'Hier gibt es nichts mehr zu sehen.');return;}
    const detail=getInspection({id:'farbenquell'},{id});
    basicModal(title,id==='clouds'?'Wolken bis zum Horizont. Irgendwo dort wachsen Cirrus’ Wolkenschäfchen – und weiter dahinter liegt die Himmelsstadt.':'Weiche Wolkenstufen führen aus Farbenquell hinaus. Heute wird Fina diesen Weg zum ersten Mal allein gehen.',`<img class="inspection-image" src="${detail.src}" alt="${detail.alt}">`);
    return;
  }
  if(id==='exit'){
    if(state.adventure.completed){continueJourney();return;}
    if(!readyToLeave(state.adventure)){message('Noch nicht ganz bereit. Vivid wartet auf dich; Tasche, Mutters Kristall und Coloridas Empfehlung müssen mit.');return;}
    showDialog(FAREWELL_DIALOG,()=>{
      state.adventure.completed=true;updateJourney();story.save();chime('win');playMusic('02');continueJourney();
    });
  }
}
function showMixer(){
  selectedColors=[];
  basicModal('Die Farben des Abendhimmels','Hilf Vivid, wenn du magst: Welche zwei Farben ergeben Violett? Diese Aufgabe ist freiwillig.',`<div class="color-options">${[['red','Rot'],['blue','Blau'],['yellow','Gelb']].map(([id,name])=>`<button class="color-choice" data-color="${id}" aria-pressed="false">${name}</button>`).join('')}</div><p id="mix-result" class="mix-result" role="status">Zwei Farbtöpfe warten auf deine Wahl.</p><button id="mix-button" class="gold-button" disabled>Farben mischen ✧</button>`);
  modal.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{
    const c=b.dataset.color;
    if(selectedColors.includes(c))selectedColors=selectedColors.filter(x=>x!==c);else if(selectedColors.length<2)selectedColors.push(c);
    modal.querySelectorAll('[data-color]').forEach(x=>x.setAttribute('aria-pressed',String(selectedColors.includes(x.dataset.color))));$('mix-button').disabled=selectedColors.length!==2;
  });
  $('mix-button').onclick=()=>{
    if(mix(state.adventure,selectedColors)){
      chime();$('mix-result').textContent='Violett! Vivid: „Perfekt. Falls die Kristallelfen dich nicht nehmen: Deine Stelle am Farbkessel bleibt frei.“';$('mix-button').textContent='Zurück zu Farbenquell ➜';$('mix-button').onclick=()=>{closeModal();updateJourney();};updateJourney();
    }else{
      $('mix-result').textContent=selectedColors.includes('yellow')&&selectedColors.includes('blue')?'Grün! Vivid: „Schöne Farbe. Aber wenn der Abendhimmel so aussieht, habe ich den falschen Kessel erwischt.“':'Orange! Vivid: „Ein prima Sonnenuntergang. Gesucht war Violett – aber die Sonne ist bestimmt begeistert.“';selectedColors=[];modal.querySelectorAll('[data-color]').forEach(x=>x.setAttribute('aria-pressed','false'));$('mix-button').disabled=true;
    }
  };
}
function showHint(){
  if(state.mode==='campaign'){story.hint();return;}
  if(state.mode==='battle'){basicModal('Ein kühler Kopf hilft',getBattleHint(state.battle));return;}
  const hints=!state.adventure.talked?['Vivid wartet neben dem Reisetisch. Sprich zuerst mit ihr.']:!state.adventure.inventory.includes('letter')?['Colorida wartet rechts vom Wolkenweg. Sprich mit ihr über deinen Wunsch, Kristallelfe zu werden.','Nach dem Gespräch gibt Colorida dir ihre Empfehlung für Meisterin Aria.']:['Packe Tasche und Mutters Kristall ein. Mit Coloridas Empfehlung bist du bereit.','Der Pfeil auf den oberen Wolkenstufen beginnt den Abschied. Farben mischen ist freiwillig.'];
  basicModal('Ein kleiner Schubs',hints[Math.min(hintLevel++,hints.length-1)]);
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
function showHelp(){basicModal('So spielst du','Begleite Fina von Farbenquell bis zum Ende ihrer Reise. Die goldenen Zeichen führen zu Gesprächen, Fundstücken und Rätseln. Fina läuft selbst dorthin.',`<div class="help-rows"><strong>Pfeiltasten / WASD</strong><span>Fina auf den Wolkenwegen bewegen</span><strong>Mausklick</strong><span>Zum Bodenpunkt laufen oder ein Objekt benutzen</span><strong>Enter / Leertaste</strong><span>Ein nahes Objekt benutzen, im Gespräch weiterreden</span><strong>Reisetasche</strong><span>Gegenstände untersuchen; in einem passenden Rätsel kombinieren</span><strong>H / Hinweis</strong><span>Hilfe beim nächsten Schritt erhalten</span><strong>Reisebuch / Kapitel</strong><span>Hinweise nachlesen und euren Weg überblicken</span><strong>Tab + Enter</strong><span>Schaltflächen mit der Tastatur bedienen</span><strong>Escape</strong><span>Ein Fenster schließen</span></div><p style="font-size:12px">Rätsel haben kein Zeitlimit. Die Reise wird nach erledigten Aufgaben gespeichert. Mit „Gespeicherte Reise fortsetzen“ kannst du nach einer Pause weiterspielen. Musik schaltest du mit ♫ ein.</p>`);}
function initialize(){
  bindSatchel({toggle:$('satchel-toggle'),panel:$('satchel-panel'),inventory:$('inventory'),previous:$('satchel-previous'),next:$('satchel-next'),status:$('satchel-page')});
  modalPages=bindModalPagination({dialog:modal,content:$('modal-content')});
  chapterMenu=createChapterMenu({root:$('chapter-navigation'),onSelect:id=>{stopMovement();story.jumpTo(id);},onOpen:stopMovement});
  chapterMusic=createChapterMusic({onStatus:text=>$('chapter-card-music').textContent=text});
  chapterCard=createChapterCard({overlay:$('chapter-card'),image:$('chapter-card-image'),title:$('chapter-card-title'),label:$('chapter-card-label'),continueButton:$('chapter-card-next'),music:chapterMusic,controls:sceneControls()});
  story=createCampaignUI({state,showDialog,basicModal,closeModal,message,chime,stopMovement,setMode,onMusic:number=>{playMusic(number);loadMusic();},onSceneCard:(scene,done)=>{stopMovement();chapterCard.show(scene,done);syncSoundButton();},onFlight:playFlight,onChase:playChase,onChapterChange:id=>chapterMenu.update(id),onChapters:()=>chapterMenu.open()});
  $('resume-button').hidden=!story.hasSave();
  $('music-volume').oninput=e=>setMusicVolume(e.target.value/100);loadMusic();
  window.addEventListener('story-interaction',e=>requestInteraction(story.getTargets().find(h=>h.id===e.detail)));
  $('start-button').onclick=()=>{if(!soundEnabled())toggleSound();state.started=true;setMode('journey');chapterCard.show({id:'farbenquell',title:'Farbenquell – Finas Aufbruch',chapter:1,background:ASSETS.background},()=>{canvas.focus();message('Willkommen in Farbenquell. Vivid wartet bei deinem Reisetisch.');});syncSoundButton();};
  const resumeJourney=$('resume-button').onclick;
  $('resume-button').onclick=()=>{chapterMusic.stop();if(!soundEnabled())toggleSound();syncSoundButton();resumeJourney();};
  $('journey-tab').onclick=()=>setMode(state.campaign?'campaign':'journey');$('battle-tab').hidden=true;
  $('help-button').onclick=showHelp;$('hint-button').onclick=showHint;
  $('ability-button').onclick=()=>battleAction('ability');
  for(const action of ['valve','gate','escape'])$(action+'-button').onclick=()=>battleAction(action);
  $('battle-hint-button').onclick=showHint;$('reset-battle-button').onclick=resetBattle;
  $('sound-button').onclick=()=>{const on=toggleSound();syncSoundButton();if(on)chime();};
  $('restart-button').onclick=()=>{basicModal('Ganz von vorn?','Damit beginnt Fina wieder in Farbenquell. Deine zuletzt gespeicherte Reise kannst du auf dem Startbild fortsetzen.',`<button id="confirm-restart" class="gold-button">Neu beginnen ↻</button>`);$('confirm-restart').onclick=()=>{state.adventure=createAdventure();state.campaign=null;state.battle=createBattle();state.position={x:825,y:835};state.started=false;state.effect=null;hintLevel=0;closeModal();setMode('journey');$('resume-button').hidden=!story.hasSave();};};
  document.querySelector('.brand').onclick=e=>{e.preventDefault();setMode(state.campaign?'campaign':'journey');};
  canvas.addEventListener('click',e=>{
    if(!state.started||!['journey','campaign'].includes(state.mode)||modal.open||transitionVisible())return;
    canvas.focus();const r=canvas.getBoundingClientRect(),point={x:(e.clientX-r.left)/r.width*1600,y:(e.clientY-r.top)/r.height*900};
    if(state.mode==='campaign'){
      if(point.y<710){message('Gehe auf der tragfähigen Wolkenfläche im Vordergrund.');return;}
      keys.clear();pending=null;path=[storyPoint(point)];state.destination=path[0];return;
    }
    if(!isWalkable(point)){message('Hier kannst du nicht laufen. Bleib auf den Wolkenwege.');return;}
    keys.clear();pending=null;path=findPath(state.position,point);state.destination=path.length?point:null;
  });
  window.addEventListener('keydown',e=>{
    if(modal.open||transitionVisible())return;
    const key=e.key.toLowerCase();
    if(key==='h'&&!e.repeat&&!e.target.closest('input,select,textarea')){showHint();return;}
    if(e.target.closest('button,a,input,select,textarea'))return;
    if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)&&state.started&&['journey','campaign'].includes(state.mode)){
      e.preventDefault();keys.add(key);path=[];pending=null;state.destination=null;
    }
    if((key==='enter'||key===' ')&&!e.repeat&&state.started&&['journey','campaign'].includes(state.mode)){
      e.preventDefault();const targets=state.mode==='campaign'?story.getTargets():HOTSPOTS;
      const nearest=targets.toSorted((a,b)=>Math.hypot(a.approach.x-state.position.x,a.approach.y-state.position.y)-Math.hypot(b.approach.x-state.position.x,b.approach.y-state.position.y))[0];
      if(nearest&&Math.hypot(nearest.approach.x-state.position.x,nearest.approach.y-state.position.y)<32){if(state.mode==='campaign')story.act(nearest.id);else handleInteraction(nearest.id);}else message('Gehe näher an eine Figur oder einen Gegenstand heran.');
    }
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',stopMovement);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMovement();});
  setMode('journey');chapterMusic.play(['01'],{enable:true,loop:true});syncSoundButton();
}
let previous=0;
function frame(time){
  const dt=Math.min((time-previous)/1000,.05);previous=time;state.moving=false;
  const beforeMove={...state.position},hadPending=!!pending;
  if(state.started&&['journey','campaign'].includes(state.mode)&&!modal.open&&!transitionVisible()){
    let d={x:Number(keys.has('arrowright')||keys.has('d'))-Number(keys.has('arrowleft')||keys.has('a')),y:Number(keys.has('arrowdown')||keys.has('s'))-Number(keys.has('arrowup')||keys.has('w'))};
    if(d.x||d.y){const before=state.position;state.position=state.mode==='campaign'?storyMove(state.position,d,dt):move(state.position,d,dt);state.moving=Math.hypot(state.position.x-before.x,state.position.y-before.y)>.01;state.facing=facingDirection(d.x,state.facing);state.view=viewDirection(d,state.view);}
    else if(path.length){
      if(state.mode==='campaign'){
        const target=path[0],dx=target.x-state.position.x,dy=target.y-state.position.y,length=Math.hypot(dx,dy);
        state.position=length<=220*dt?target:storyMove(state.position,{x:dx,y:dy},dt);state.moving=length>.01;state.facing=facingDirection(dx,state.facing);state.view=viewDirection({x:dx,y:dy},state.view);
        if(length<=220*dt){path=[];state.destination=null;if(pending){const id=pending;pending=null;story.act(id);}}
      }else{
      const step=advancePath(state.position,path,dt);
      state.position=step.position;path=step.path;state.moving=step.moving;state.facing=facingDirection(step.dx,state.facing);state.view=viewDirection({x:step.dx,y:step.dy},state.view);
      if(!path.length){state.destination=null;if(pending){const id=pending;pending=null;handleInteraction(id);}}
      }
    }
  }
  if(state.moving&&!hadPending&&!modal.open&&!transitionVisible()){
    const campaign=state.mode==='campaign',targets=campaign?story.getTargets():HOTSPOTS.filter(h=>['vivid','colorida','exit'].includes(h.id)).filter(h=>h.id!=='exit'||readyToLeave(state.adventure)).map(h=>({...h,type:h.id==='exit'?'exit':'talk'}));
    const next=walkInteraction(beforeMove,state.position,targets,campaign?{flags:state.campaign.flags,inventory:state.campaign.inventory,rightEdge:1480,done:h=>state.campaign.viewed.includes(`${state.campaign.sceneId}:${h.id}`)}:{done:h=>h.id==='vivid'?state.adventure.talked:h.id==='colorida'?state.adventure.inventory.includes('letter'):false});
    if(next){stopMovement();if(campaign)story.act(next.id);else handleInteraction(next.id);}
  }
  state.muck=followFina(state.muck,state.position,dt);
  state.animationTime=state.moving?state.animationTime+dt:0;state.walkFrame=animationFrame(state.animationTime,state.moving,state.reducedMotion);
  canvas.dataset.finaX=state.position.x.toFixed(1);canvas.dataset.finaY=state.position.y.toFixed(1);canvas.dataset.facing=String(state.facing);canvas.dataset.walkFrame=String(state.walkFrame);canvas.dataset.moving=String(state.moving);canvas.dataset.view=state.view;
  // The scene remains a still backdrop while a minigame owns its own canvas.
  if($('flight-overlay').hidden&&$('chase-overlay').hidden){if(state.mode==='campaign'){drawStory(ctx,images,state,story.getScene(),time);story.updateMarkers();}else drawScene(ctx,images,state,time);}
  requestAnimationFrame(frame);
}
$('start-button').disabled=true;
try{images=await loadImages();initialize();$('start-button').disabled=false;requestAnimationFrame(frame);}catch(error){$('load-error').hidden=false;$('load-error').textContent=error.message+' Bitte prüfe die Bilddateien und lade die Seite neu.';}
