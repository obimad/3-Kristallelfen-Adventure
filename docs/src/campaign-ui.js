import { createCampaign, getScene, requestAction, finishDialog, cancelDialog, solvePuzzle, nextHint, restoreCampaign } from './campaign.js';
import { SCENES, STORY_ITEMS } from './story-data.js';
import { createAdventure, readyToLeave } from './adventure.js';
import { isWalkable } from './navigation.js';
import { storyPoint } from './story-navigation.js';
import { placedHotspot } from './story-layout.js';
import { campaignAt } from './chapter-navigation.js';
import { availableInteraction } from './proximity.js';
import { getInspection } from './inspection-data.js';

const $=id=>document.getElementById(id);
const SAVE_KEY='kristallelfen-adventure-v1';
const FOLLOWING_TARGETS=new Set(['final_muck','final_action','honor_muck']);
// Farbenquell is completed before this controller starts. The epilogue is a
// closing reflection, rather than an additional station of the journey.
const TRAVEL_STATIONS=SCENES.filter(scene=>scene.id!=='epilog');
const STATION_COUNT=1+TRAVEL_STATIONS.length;
export function createCampaignUI({state,showDialog,basicModal,closeModal,message,chime,stopMovement,setMode,onMusic,onSceneCard,onFlight,onChase,onChapterChange=()=>{},onChapters}){
  let seenIntros=[],inspectedItems=[];
  function save(){
    try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,campaign:state.campaign?{...state.campaign,pending:null}:null,adventure:state.adventure,position:state.position,seenIntros,inspectedItems}));$('save-status').textContent='Automatisch gespeichert';}catch{$('save-status').textContent='Speichern in diesem Browser nicht möglich';}
  }
  function start(){if(!state.campaign){state.campaign=createCampaign();seenIntros=[];inspectedItems=[];}setMode('campaign');enter();save();}
  function jumpTo(id){
    const campaign=id==='farbenquell'?null:campaignAt(id);
    if(id!=='farbenquell'&&!campaign)return false;
    closeModal();stopMovement();seenIntros=[];inspectedItems=[];state.campaign=campaign;state.started=true;
    state.adventure={...createAdventure(),...(campaign?{inventory:['bag','crystal','letter'],talked:true,completed:true}:{})};
    if(campaign){seenIntros=SCENES.slice(0,SCENES.findIndex(s=>s.id===id)).map(s=>s.id);setMode('campaign');enter();}
    else{state.position={x:825,y:835};setMode('journey');onChapterChange(id);onSceneCard?.({id,title:'Farbenquell – Finas Aufbruch',chapter:1,background:'assets/farbenquell-animierbar.png'},()=>{});}
    save();return true;
  }
  function resume(){
    let raw;try{raw=JSON.parse(localStorage.getItem(SAVE_KEY));}catch{return false;}
    if(raw?.version!==1){message('Hier ist noch kein gültiger Spielstand gespeichert.');return false;}
    if(raw.campaign===null){
      const opening=raw.adventure;
      if(!opening||!Array.isArray(opening.inventory)||opening.inventory.some(id=>!['bag','crystal','letter'].includes(id))||typeof opening.talked!=='boolean')return false;
      state.campaign=null;state.adventure={...createAdventure(),inventory:[...new Set(opening.inventory)],talked:opening.talked,mixed:opening.mixed===true,viewed:Array.isArray(opening.viewed)?opening.viewed.filter(id=>['clouds','stairs','inspect:bag','inspect:crystal','inspect:letter'].includes(id)):[]};
      state.adventure.completed=opening.completed===true&&readyToLeave(state.adventure);state.started=true;stopMovement();
      state.position=raw.position&&Number.isFinite(raw.position.x)&&Number.isFinite(raw.position.y)&&isWalkable(raw.position)?raw.position:{x:825,y:835};setMode('journey');message('Dein Aufbruch aus Farbenquell ist geladen.');return true;
    }
    const restored=restoreCampaign(raw.campaign);
    if(!restored){message('Hier ist noch kein gültiger Spielstand gespeichert.');return false;}
    state.campaign=restored;
    seenIntros=Array.isArray(raw.seenIntros)?raw.seenIntros.filter(id=>SCENES.some(s=>s.id===id)):[];
    inspectedItems=Array.isArray(raw.inspectedItems)?raw.inspectedItems.filter(id=>Object.hasOwn(STORY_ITEMS,id)):[];
    state.adventure={...createAdventure(),inventory:['bag','crystal','letter'],talked:true,completed:true};
    setMode('campaign');enter();
    if(raw.position&&Number.isFinite(raw.position.x)&&Number.isFinite(raw.position.y))state.position=storyPoint(raw.position);
    state.muck={x:state.position.x+80,y:state.position.y-180};save();
    message('Dein letzter Spielstand ist geladen.');return true;
  }
  function enter(){
    stopMovement();const scene=getScene(state.campaign);if(!scene)return;
    state.started=true;state.position=scene.spawn??{x:820,y:835};state.view='front';state.muck={x:state.position.x+80,y:state.position.y-180};
    update();onMusic(scene.music);onChapterChange(scene.id);save();
    const introduce=()=>{if(scene.intro?.length&&!seenIntros.includes(scene.id))showDialog(scene.intro,()=>{seenIntros.push(scene.id);update();save();});};
    if(onSceneCard&&!seenIntros.includes(scene.id))onSceneCard(scene,introduce);else introduce();
  }
  function update(){
    const s=state.campaign,scene=getScene(s);if(!scene)return;
    $('scene-heading').innerHTML=`<span class="chapter">KAPITEL ${scene.chapter}</span><h1>${scene.title}</h1><span class="scene-subtitle">${scene.subtitle??''}</span>`;
    const stationIndex=TRAVEL_STATIONS.findIndex(x=>x.id===scene.id);
    $('context-label').textContent=`${scene.title} · ${stationIndex<0?'Nachklang':`${stationIndex+2} / ${STATION_COUNT} Reisestationen`}`;
    $('objective-text').textContent=s.ended?'Finas Geschichte ist abgeschlossen.':nextHint(s);
    const completedStations=1+TRAVEL_STATIONS.filter(scene=>s.completedScenes.includes(scene.id)).length;
    $('objective-progress').textContent=`${completedStations}/${STATION_COUNT} Stationen abgeschlossen`;
    $('satchel-counter').textContent=`${s.inventory.length} Gegenstände · ${s.companions.includes('muck')?'Muck begleitet dich':'Fina unterwegs'}`;
    $('inventory').innerHTML=s.inventory.map(id=>{const item=STORY_ITEMS[id];return item?`<button class="item" data-story-item="${id}"><span class="item-icon">${item.icon}</span><span>${item.name}<small>Untersuchen / kombinieren</small></span></button>`:'';}).join('');
    $('inventory').querySelectorAll('[data-story-item]').forEach(button=>button.onclick=()=>{
      const id=button.dataset.storyItem,item=STORY_ITEMS[id],seen=inspectedItems.includes(id);
      basicModal(item.name,seen?'Das hast du schon untersucht. Zum Kombinieren wählst du ein passendes Objekt oder Rätsel in der Szene.':item.description+' Zum Kombinieren wählst du ein passendes Objekt oder Rätsel in der Szene.');
      if(!seen)inspectedItems.push(id);save();
    });
    $('hotspots').setAttribute('aria-label',`Interaktionen: ${scene.title}`);
    $('hotspots').innerHTML=getTargets().map(h=>`<button class="hotspot ${s.viewed.includes(`${scene.id}:${h.id}`)?'collected':''}" data-id="${h.id}" style="left:${h.x/16}%;top:${h.y/9}%" aria-label="${h.name}: ${h.verb??'Ansehen'}">${h.icon??'✧'}<span class="hotspot-label">${h.name} · ${h.verb??'Ansehen'}</span></button>`).join('');
    $('hotspots').querySelectorAll('[data-id]').forEach(button=>button.onclick=()=>window.dispatchEvent(new CustomEvent('story-interaction',{detail:button.dataset.id})));
    $('hint-button').disabled=false;$('journal-button').hidden=false;$('save-button').hidden=false;$('chapters-button').hidden=false;
  }
  function getTargets(){
    const s=state.campaign,scene=getScene(s);if(!scene)return [];
    const groups=new Map();
    for(const h of scene.hotspots){const key=`${h.x}:${h.y}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(h);}
    const seen=h=>s.viewed.includes(`${scene.id}:${h.id}`);
    const available=h=>(h.requiresFlags??[]).every(flag=>s.flags.includes(flag))&&(h.requiresItems??[]).every(item=>s.inventory.includes(item));
    return [...groups.values()].map(group=>{
      const h=placedHotspot(group.find(h=>!seen(h)&&available(h))??group.find(h=>!seen(h))??group.at(-1),scene);
      return followingTarget(h.id)&&state.muck?{...h,x:state.muck.x,y:state.muck.y-125,approach:state.position}:h;
    }).filter(h=>h.type!=='exit'||availableInteraction(h,s));
  }
  function followingTarget(id){return state.campaign?.companions.includes('muck')&&FOLLOWING_TARGETS.has(id);}
  function updateMarkers(){
    if(!state.muck||!state.campaign?.companions.includes('muck'))return;
    for(const button of $('hotspots').querySelectorAll('[data-id]'))if(FOLLOWING_TARGETS.has(button.dataset.id)){button.style.left=`${state.muck.x/16}%`;button.style.top=`${(state.muck.y-125)/9}%`;}
  }
  function act(id){
    const response=requestAction(state.campaign,id);
    if(!response)return;
    if(response.type==='dialog'){
      const scene=getScene(state.campaign),hotspot=scene.hotspots.find(h=>h.id===id);
      const present=()=>showDialog(response.pages,()=>{finishDialog(state.campaign);update();save();chime();},hotspot.type==='inspect'?getInspection(scene,hotspot):null);
      if(scene.id==='wolkenseglerflug'&&id==='flight_landing'&&onFlight){
        const campaign=state.campaign,pending=campaign.pending;
        return Promise.resolve(onFlight()).then(result=>{
          if(state.campaign!==campaign||campaign.pending!==pending)return;
          if(result?.completed)present();else{cancelDialog(campaign);update();save();message('Der Flug ist noch offen. Kian wartet auf den nächsten Versuch.');}
        }).catch(()=>{if(state.campaign===campaign){cancelDialog(campaign);update();save();message('Der Flug konnte nicht starten. Du kannst ihn bei Kian erneut versuchen.');}});
      }
      present();
    }
    else if(response.type==='puzzle'){
      if(state.campaign.sceneId==='stadttor'&&id==='gate_path'&&onChase){
        const campaign=state.campaign;
        return Promise.resolve(onChase()).then(result=>{
          if(state.campaign!==campaign||campaign.sceneId!=='stadttor')return;
          if(result?.completed){const solved=solvePuzzle(campaign,id,response.puzzle.solution);update();save();chime();showDialog([{speaker:'Fina',text:solved.message}]);}
          else message('Die Verfolgung ist noch offen. H und O warten auf einen neuen Versuch.');
        }).catch(()=>message('Die Verfolgung konnte nicht starten. Versuche es erneut.'));
      }
      puzzle(id,response);
    }
    else if(response.type==='scene'){enter();save();}
    else if(response.type==='ending'){
      update();save();basicModal('Eine für alle – und alle für eine!',response.text??'Fina gehört zu den vier Eisklingen. Silba ist gerettet, und Muck hat ihren Platz im Himmelsreich gefunden.',`<button id="ending-journal" class="gold-button">Eure Reise ansehen</button>`);$('ending-journal').onclick=journal;
    }else{basicModal(response.title??'Finas Reise',response.text??response.message??'Das hast du schon erledigt.');update();save();}
  }
  function puzzle(id,response){
    const p=response.puzzle,selected=[];
    basicModal(response.title,p.question,`<div class="story-puzzle-options">${p.options.map(o=>`<button data-answer="${o.id}" aria-pressed="false">${o.label}</button>`).join('')}</div><p class="puzzle-sequence" id="puzzle-sequence">${p.kind==='order'?'Wähle die Schritte in der richtigen Reihenfolge.':p.kind==='combine'?'Wähle die passenden Dinge zum Kombinieren.':'Wähle eine Antwort.'}</p><p id="puzzle-result" role="status"></p><button id="solve-story-puzzle" class="gold-button" disabled>Ausprobieren ✧</button> <button id="clear-story-puzzle">Auswahl zurücksetzen</button>`);
    function refresh(){
      $('solve-story-puzzle').disabled=!selected.length;
      document.querySelectorAll('[data-answer]').forEach(b=>b.setAttribute('aria-pressed',String(selected.includes(b.dataset.answer))));
      $('puzzle-sequence').textContent=selected.map(answer=>p.options.find(o=>o.id===answer).label).join(p.kind==='order'?' → ':' + ')||'Noch nichts ausgewählt.';
    }
    document.querySelectorAll('[data-answer]').forEach(button=>button.onclick=()=>{
      const answer=button.dataset.answer;
      if(p.kind==='choice')selected.splice(0,selected.length,answer);
      else if(selected.includes(answer))selected.splice(selected.indexOf(answer),1);else selected.push(answer);
      refresh();
    });
    $('clear-story-puzzle').onclick=()=>{selected.length=0;refresh();};
    $('solve-story-puzzle').onclick=()=>{
      const result=solvePuzzle(state.campaign,id,selected);
      $('puzzle-result').textContent=result.message;
      if(result.success){update();save();chime();$('solve-story-puzzle').textContent='Weiterreisen ➜';$('solve-story-puzzle').onclick=closeModal;document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=true);$('clear-story-puzzle').disabled=true;}
    };
  }
  function journal(){
    const entries=state.campaign.viewed.map(key=>{const [sceneId,id]=key.split(':'),scene=SCENES.find(s=>s.id===sceneId),h=scene?.hotspots.find(h=>h.id===id);if(!h)return '';
      return `<li><details><summary>${scene.title}: ${h.name}</summary>${h.pages?.length?h.pages.map(line=>`<p><strong>${line.speaker}:</strong> ${line.text}</p>`).join(''):`<p>${h.puzzle?.successText??h.description??'Dieser Schritt ist erledigt.'}</p>`}</details></li>`;
    }).join('');
    basicModal('Finas Reisebuch','Öffne einen Eintrag, um das Gespräch oder den gefundenen Hinweis nachzulesen.',`<ol class="journal-entries">${entries||'<li>Die Reise beginnt.</li>'}</ol>`);
  }
  function chapters(){
    if(onChapters){onChapters();return;}
    const epilogue=SCENES.find(scene=>scene.id==='epilog');
    basicModal('Durch das Himmelsreich','Dein Weg vom Abschied bis zu den vier Eisklingen.',`<ol class="chapter-list"><li class="done">✓ Farbenquell</li>${TRAVEL_STATIONS.map(scene=>`<li class="${state.campaign.completedScenes.includes(scene.id)?'done':''}">${state.campaign.completedScenes.includes(scene.id)?'✓':state.campaign.sceneId===scene.id?'➜':'○'} ${scene.title}</li>`).join('')}</ol>${epilogue?`<p class="${state.campaign.ended?'done':''}">${state.campaign.ended?'✓':state.campaign.sceneId===epilogue.id?'➜':'○'} Nachklang: ${epilogue.title}</p>`:''}`);
  }
  function hint(){basicModal('Ein kleiner Schubs',nextHint(state.campaign));}
  function hasSave(){try{return !!localStorage.getItem(SAVE_KEY);}catch{return false;}}
  $('modal').addEventListener('close',()=>{if(!$('modal').open&&state.campaign)cancelDialog(state.campaign);});
  $('journal-button').onclick=journal;$('chapters-button').onclick=chapters;$('save-button').onclick=()=>{save();message('Deine Reise ist gespeichert.');};$('resume-button').onclick=resume;
  return {start,jumpTo,resume,enter,update,act,hint,save,hasSave,getTargets,followingTarget,updateMarkers,getScene:()=>getScene(state.campaign)};
}
