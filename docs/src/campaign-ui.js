import {restoreOpeningState} from './opening-chapter.js';
import {openingWalkable} from './opening-navigation.js';
import { createCampaign, getScene, requestAction, finishDialog, cancelDialog, solvePuzzle, nextHint, restoreCampaign } from './campaign.js';
import { SCENES, STORY_ITEMS } from './story-data.js';
import { createAdventure, readyToLeave } from './adventure.js';
import { isWalkable } from './navigation.js';
import { storyPoint } from './story-navigation.js';
import { placedHotspot, sceneActors, actorPose } from './story-layout.js';
import { campaignAt } from './chapter-navigation.js';
import { availableInteraction } from './proximity.js';
import { getInspection } from './inspection-data.js';
import { propArtwork } from './prop-art.js';
import { ASSETS } from './data.js';
import { sandWorkers } from './sand-workers.js';
import { storyObjective } from './story-adventure.js';
import { createStaging, syncStaging, stagedActors, introDelay } from './story-staging.js';
import {createStoryTransition,storyTransitionPose,isInterlude} from './story-transitions.js';

const $=id=>document.getElementById(id);
const SAVE_KEY='kristallelfen-adventure-v1';
const FOLLOWING_TARGETS=new Set(['final_muck','final_action','honor_muck']);
// Farbenquell is completed before this controller starts. The epilogue is a
// closing reflection, rather than an additional station of the journey.
const TRAVEL_STATIONS=SCENES.filter(scene=>scene.id!=='epilog');
const STATION_COUNT=1+TRAVEL_STATIONS.length;
const ACTIONS={grove_team:'grove',workshop_cold_hold:'cold',observatory_powdery_hold:'powdery',moon_icy_hold:'icy',final_action:'muck'};
const MINIS={sand_sort:'sand',sluice_order:'snow',workshop_flake:'slide',observatory_light:'mirror'};
export function createCampaignUI({state,showDialog,basicModal,closeModal,message,chime,stopMovement,setMode,onMusic,onSceneCard,onFlight,onChase,onAction,onVisual,onMini,onWorldTask,onInventoryUse=()=>{},onChapterChange=()=>{},onChapters,stageScenes=false}){
  let seenIntros=[],inspectedItems=[];
  const world=document.querySelector('.world'),fade=document.createElement('div');fade.className='scene-fade';fade.setAttribute('aria-hidden','true');world.append(fade);
  const reveal=document.createElement('button');reveal.className='campaign-explore';reveal.textContent='Entdeckungen anzeigen';reveal.setAttribute('aria-pressed','false');world.append(reveal);
  reveal.onclick=()=>{const visible=world.classList.toggle('campaign-reveal');reveal.setAttribute('aria-pressed',String(visible));reveal.textContent=visible?'Entdeckungen ausblenden':'Entdeckungen anzeigen';};
  let nextCampaign=null;
  function suspend(){state.campaignBusy=false;state.campaignTransition=null;nextCampaign=null;fade.style.opacity='0';world.classList.remove('campaign-reveal');}
  function tick(time){
    const transition=state.campaignTransition;if(!transition)return;
    const pose=storyTransitionPose(transition,time,state.reducedMotion);
    state.position={x:pose.x,y:pose.y};state.moving=!pose.finished;state.facing=pose.dx<0?-1:pose.dx>0?1:state.facing;state.view=Math.abs(pose.dy)>Math.abs(pose.dx)?pose.dy<0?'back':'front':'side';fade.style.opacity=String(pose.fade);
    if(pose.finished){state.campaignTransition=null;state.campaignBusy=false;fade.style.opacity='0';if(transition.phase==='out'&&nextCampaign){state.campaign=nextCampaign;nextCampaign=null;enter();}else{state.moving=false;update();save();}}
  }
  function depart(scene,previousCampaign){
    const destination=state.campaign;
    if(!stageScenes||isInterlude(scene)||state.reducedMotion){enter();return;}
    nextCampaign=destination;state.campaign=previousCampaign;stopMovement();state.campaignBusy=true;
    state.campaignTransition=createStoryTransition(scene,state.position,performance.now(),'out');
  }
  function leave(id,instant=false){const scene=getScene(state.campaign),previousCampaign=structuredClone(state.campaign),response=requestAction(state.campaign,id);if(response.type==='scene'){if(instant)enter();else depart(scene,previousCampaign);}return response;}
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
      if(!opening||!Array.isArray(opening.inventory)||opening.inventory.some(id=>!['bag','crystal','letter','red','blue','yellow'].includes(id))||typeof opening.talked!=='boolean')return false;
      state.campaign=null;state.adventure={...createAdventure(),inventory:[...new Set(opening.inventory)],talked:opening.talked,mixed:opening.mixed===true,viewed:Array.isArray(opening.viewed)?opening.viewed.filter(id=>['clouds','stairs','inspect:bag','inspect:crystal','inspect:letter'].includes(id)):[]};
      state.adventure.opening=restoreOpeningState(opening.opening,state.adventure);
      state.adventure.completed=opening.completed===true&&readyToLeave(state.adventure);state.started=true;stopMovement();
      state.position=raw.position&&Number.isFinite(raw.position.x)&&Number.isFinite(raw.position.y)&&openingWalkable(raw.position,state.adventure.opening.area)?raw.position:{x:825,y:835};setMode('journey');message('Dein Aufbruch aus Farbenquell ist geladen.');return true;
    }
    const restored=restoreCampaign(raw.campaign);
    if(!restored){message('Hier ist noch kein gültiger Spielstand gespeichert.');return false;}
    state.campaign=restored;
    seenIntros=Array.isArray(raw.seenIntros)?raw.seenIntros.filter(id=>SCENES.some(s=>s.id===id)):[];
    inspectedItems=Array.isArray(raw.inspectedItems)?raw.inspectedItems.filter(id=>Object.hasOwn(STORY_ITEMS,id)):[];
    state.adventure={...createAdventure(),inventory:['bag','crystal','letter'],talked:true,completed:true};
    setMode('campaign');enter();
    if(raw.position&&Number.isFinite(raw.position.x)&&Number.isFinite(raw.position.y))state.position=storyPoint(raw.position,getScene(state.campaign));
    state.muck={x:state.position.x-120*(state.facing??1),y:state.position.y-180,facing:state.facing??1};save();
    message('Dein letzter Spielstand ist geladen.');return true;
  }
  function enter(){
    suspend();stopMovement();const scene=getScene(state.campaign);if(!scene)return;
    state.worldSequence=null;state.storyReaction=null;
    state.guardDeparture=null;
    state.staging=null;
    state.selectedItem=null;state.hoveredId=null;$('toast').hidden=true;
    state.started=true;state.position=scene.spawn??{x:820,y:835};state.view='front';state.muck={x:state.position.x-120*(state.facing??1),y:state.position.y-180,facing:state.facing??1};
    update();onMusic(scene.music);onChapterChange(scene.id);save();
    const showIntro=()=>{if(!seenIntros.includes(scene.id)){if(scene.intro?.length)showDialog(scene.intro,()=>{seenIntros.push(scene.id);update();save();});else{seenIntros.push(scene.id);save();}}};
    const introduce=()=>{
      if(stageScenes&&!seenIntros.includes(scene.id)&&!isInterlude(scene)&&!state.reducedMotion){state.campaignBusy=true;state.campaignTransition=createStoryTransition(scene,state.position,performance.now(),'in');state.position={...state.campaignTransition.route[0]};}
      if(stageScenes){const now=performance.now();state.staging=createStaging(scene,state.campaign,now,seenIntros.includes(scene.id));syncStaging(scene,state.campaign,state.staging,now);state.staging.introPending=!seenIntros.includes(scene.id);update();}
      else showIntro();
    };
    if(onSceneCard&&!seenIntros.includes(scene.id))onSceneCard(scene,introduce);else introduce();
  }
  function update(){
    const s=state.campaign,scene=getScene(s);if(!scene)return;
    $('scene-heading').innerHTML=`<span class="chapter">KAPITEL ${scene.chapter}</span><h1>${scene.title}</h1><span class="scene-subtitle">${scene.subtitle??''}</span>`;
    const stationIndex=TRAVEL_STATIONS.findIndex(x=>x.id===scene.id);
    $('context-label').textContent=`${scene.title} · ${stationIndex<0?'Nachklang':`${stationIndex+2} / ${STATION_COUNT} Reisestationen`}`;
    $('objective-text').textContent=s.ended?'Finas Geschichte ist abgeschlossen.':storyObjective(scene,s)??'Erkunde den Ort und sprich mit den Anwesenden.';
    const completedStations=1+TRAVEL_STATIONS.filter(scene=>s.completedScenes.includes(scene.id)).length;
    $('objective-progress').textContent=`${completedStations}/${STATION_COUNT} Stationen abgeschlossen`;
    const carriedItems=s.inventory.filter(id=>id!=='bag');
    $('satchel-counter').textContent=`${carriedItems.length} Gegenstände · ${s.companions.includes('muck')?'Muck begleitet dich':'Fina unterwegs'}`;
    $('inventory').innerHTML=carriedItems.map(id=>{
      const item=STORY_ITEMS[id];if(!item)return '';
      const art=id.startsWith('tool_')?propArtwork(`explore_${id.slice(5)}_tool`):null;
      let icon=`<span class="item-icon">${item.icon}</span>`;
      if(art){const [x,y,w,h]=art.bounds;icon=`<span class="item-icon painted-item" aria-hidden="true" style="background-image:url('${ASSETS[art.asset]}');background-size:${1280/w*100}% ${1280/h*100}%;background-position:${x/(1280-w)*100}% ${y/(1280-h)*100}%"></span>`;}
      return `<button class="item" data-story-item="${id}">${icon}<span>${item.name}<small>Untersuchen / kombinieren</small></span></button>`;
    }).join('');
    $('inventory').querySelectorAll('[data-story-item]').forEach(button=>button.onclick=()=>{
      const id=button.dataset.storyItem,item=STORY_ITEMS[id],seen=inspectedItems.includes(id);
      basicModal(item.name,(seen?'Das hast du schon untersucht. ':'')+item.description,`<button id="use-inventory-item" class="gold-button">In der Szene benutzen</button>`);
      if(id==='ownCrystal'&&scene.id==='kumulus'){
        $('use-inventory-item').textContent='Kristall auf der Rufplattform benutzen';
        $('use-inventory-item').onclick=()=>{
          closeModal();onInventoryUse();
          const target=!s.flags.includes('kumulus_own')?'kumulus_own':!s.flags.includes('kumulus_wind')?'kumulus_wind':'kumulus_signal';
          window.dispatchEvent(new CustomEvent('story-interaction',{detail:target}));
        };
        if(!seen)inspectedItems.push(id);save();return;
      }
      $('use-inventory-item').onclick=()=>{state.selectedItem=id;closeModal();onInventoryUse();message(`${item.name} ausgewählt. Klicke auf den Gegenstand, an dem du es benutzen möchtest. Escape legt es zurück.`);};
      if(!seen)inspectedItems.push(id);save();
    });
    $('hotspots').setAttribute('aria-label',`Interaktionen: ${scene.title}`);
    $('hotspots').innerHTML=getTargets().map(h=>{
      const seen=s.viewed.includes(`${scene.id}:${h.id}`),newTalk=(h.type==='talk'||h.conversation)&&!seen&&availableInteraction(h,s);
      return `<button class="hotspot discoverable ${seen?'collected':''} ${h.type==='talk'||h.conversation?'person-target':''} ${newTalk?'new-talk':''}" data-id="${h.id}" style="left:${h.x/16}%;top:${h.y/9}%;width:${(h.width??82)/16}%;height:${(h.height??70)/9}%" aria-label="${h.name}: ${h.verb??'Ansehen'}"><span class="hotspot-label">${newTalk?'Neues Gespräch · ':''}${h.name} · ${h.verb??'Ansehen'}</span></button>`;
    }).join('');
    $('hotspots').querySelectorAll('[data-id]').forEach(button=>button.onclick=()=>window.dispatchEvent(new CustomEvent('story-interaction',{detail:button.dataset.id})));
    $('hint-button').disabled=false;$('journal-button').hidden=false;$('save-button').hidden=false;$('chapters-button').hidden=false;
  }
  function getTargets(){
    const s=state.campaign,scene=getScene(s);if(!scene)return [];
    const seen=h=>s.viewed.includes(`${scene.id}:${h.id}`);
    const groups=new Map();
    for(const h of scene.hotspots){
      if(stageScenes&&h.arrivalTrigger&&!s.flags.includes(h.arrivalTrigger)&&!seen(h))continue;
      if(stageScenes&&(h.type==='talk'||h.conversation)&&h.actorId&&!stagedActors(scene,s,state.staging,performance.now(),state.reducedMotion).some(a=>a.id===h.actorId&&!a.walking))continue;
      if(scene.id==='stadttor'&&s.flags.includes('gate_protest')&&h.type==='talk')continue;
      if(h.revision&&h.type==='take'&&seen(h))continue;
      if(seen(h)&&(h.type==='talk'||h.conversation||h.type==='puzzle'||h.type==='encounter'))continue;
      if(!seen(h)&&!availableInteraction(h,s))continue;
      const key=`${h.x}:${h.y}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(h);
    }
    return [...groups.values()].map(group=>{
      const h=placedHotspot(group.find(h=>!seen(h))??group.at(-1),{...scene,layoutActors:[...sceneActors(scene,s.companions,s.flags),...sandWorkers(scene.id)]});
      return followingTarget(h.id)&&state.muck?{...h,x:state.muck.x,y:state.muck.y-125,approach:state.position}:h;
    }).filter(h=>!stageScenes||!h.attachedTo||stagedActors(scene,s,state.staging,performance.now(),state.reducedMotion).some(a=>a.id===h.attachedTo&&!a.walking));
  }
  function followingTarget(id){return state.campaign?.companions.includes('muck')&&FOLLOWING_TARGETS.has(id);}
  function updateMarkers(time=0){
    if(!state.campaign)return;const scene=getScene(state.campaign);
    if(stageScenes&&state.staging){
      if(syncStaging(scene,state.campaign,state.staging,time))update();
      if(state.staging.introPending&&!state.campaignBusy&&!state.comicBusy&&time>=state.staging.startedAt+(state.reducedMotion?0:introDelay(scene,state.campaign))&&!$('modal').open){
        state.staging.introPending=false;
        if(scene.intro?.length)showDialog(scene.intro,()=>{seenIntros.push(scene.id);update();save();});
        else{seenIntros.push(scene.id);save();}
      }
    }
    const actors=stageScenes?stagedActors(scene,state.campaign,state.staging,time,state.reducedMotion):sceneActors(scene,state.campaign.companions,state.campaign.flags);
    for(const button of $('hotspots').querySelectorAll('[data-id]')){
      if(FOLLOWING_TARGETS.has(button.dataset.id)&&state.muck&&state.campaign.companions.includes('muck')){button.style.left=`${state.muck.x/16}%`;button.style.top=`${(state.muck.y-125)/9}%`;}
      const h=getScene(state.campaign).hotspots.find(h=>h.id===button.dataset.id),actor=actors.find(a=>a.id===h?.actorId);
      if(actor){const pose=actorPose(actor,time,state.reducedMotion);button.style.left=`${pose.x/16}%`;button.style.top=`${(pose.y-actor.height/2)/9}%`;button.style.height=`${actor.height/9}%`;}
    }
  }
  function act(id){
    if(state.campaignBusy)return;
    const exit=getScene(state.campaign)?.hotspots.find(h=>h.id===id&&h.type==='exit');
    if(exit){const result=leave(id);if(result.type==='scene'){save();return;}if(result.type==='ending'){update();save();basicModal('Eine für alle – und alle für eine!',result.text,`<button id="ending-journal" class="gold-button">Eure Reise ansehen</button>`);$('ending-journal').onclick=journal;return;}basicModal(result.title??exit.name,result.text??result.message);return;}
    if(state.selectedItem){
      const scene=getScene(state.campaign),h=scene.hotspots.find(h=>h.id===id);
      if(h?.revision&&!h.narrative&&h.type==='puzzle'){
        const result=solvePuzzle(state.campaign,id,[state.selectedItem]);
        if(result.success){state.selectedItem=null;update();save();chime();showDialog([{speaker:'Fina',text:result.message}]);}
        else message(result.message);return;
      }
      if(h?.type==='inspect'&&h.revision&&!h.narrative){message('Untersuche den Gegenstand zunächst ohne Werkzeug. Escape legt das Werkzeug zurück.');return;}
      if(h?.type!=='puzzle'){message('Fina: Hier hilft dieser Gegenstand nicht. Escape legt ihn zurück.');return;}
      state.selectedItem=null;
    }
    const response=requestAction(state.campaign,id);
    if(!response)return;
    if(response.type==='dialog'){
      const scene=getScene(state.campaign),hotspot=scene.hotspots.find(h=>h.id===id);
      const present=()=>showDialog(response.pages,()=>{
        const finished=finishDialog(state.campaign);
        if(finished&&id==='gate_protest')state.guardDeparture={startedAt:performance.now()};
        update();save();chime();
      },hotspot.type==='inspect'?getInspection(scene,hotspot):null);
      if((ACTIONS[id]&&onAction||['fall_trap','final_spell','gate_recommendation'].includes(id)&&onVisual)){
        const campaign=state.campaign,pending=campaign.pending;
        const play=ACTIONS[id]?onAction(ACTIONS[id]):onVisual(id==='fall_trap'?'melt':id==='gate_recommendation'?'paper':'dissolve');
        return Promise.resolve(play).then(result=>{
          if(state.campaign!==campaign||campaign.pending!==pending)return;
          if(result?.completed){
            const exitId={workshop_cold_hold:'workshop_exit',observatory_powdery_hold:'observatory_exit',moon_icy_hold:'moon_exit'}[id];
            if(exitId){
              finishDialog(campaign);
              const departure=leave(exitId,true);
              if(departure.type==='scene'){save();chime();}
              else{update();save();message(departure.text??'Der Weg ist frei.');}
            }else present();
          }else{cancelDialog(campaign);update();save();message('Die Aufgabe bleibt offen. Du kannst es erneut versuchen.');}
        }).catch(()=>{if(state.campaign===campaign){cancelDialog(campaign);update();save();message('Die Szene konnte nicht starten. Versuche es erneut.');}});
      }
      if(scene.id==='wolkenseglerflug'&&id==='flight_landing'&&onFlight){
        const campaign=state.campaign,pending=campaign.pending;
        return Promise.resolve(onFlight()).then(result=>{
          if(state.campaign!==campaign||campaign.pending!==pending)return;
          if(result?.completed){
            finishDialog(campaign);
            const departure=leave('flight_exit',true);
            if(departure.type==='scene'){save();}
            else{update();save();message(departure.text??'Der Flug ist abgeschlossen.');}
          }else{cancelDialog(campaign);update();save();message('Der Flug ist noch offen. Kian wartet auf den nächsten Versuch.');}
        }).catch(()=>{if(state.campaign===campaign){cancelDialog(campaign);update();save();message('Der Flug konnte nicht starten. Du kannst ihn bei Kian erneut versuchen.');}});
      }
      present();
    }
    else if(response.type==='puzzle'){
      if(id.startsWith('story_')&&onWorldTask){
        const campaign=state.campaign,scene=getScene(campaign);
        return Promise.resolve(onWorldTask(scene,response)).then(result=>{
          if(state.campaign!==campaign||campaign.sceneId!==scene.id)return;
          if(result?.completed){const solved=solvePuzzle(campaign,id,result.answers);if(solved.success){state.storyReaction={id,startedAt:performance.now()};update();save();chime();showDialog([{speaker:scene.storyBeat.speaker,text:solved.message}]);}else message(solved.message);}
        });
      }
      if(MINIS[id]&&onMini){
        const campaign=state.campaign,sceneId=campaign.sceneId;
        return Promise.resolve(onMini(MINIS[id])).then(result=>{if(state.campaign!==campaign||campaign.sceneId!==sceneId)return;if(result?.completed){const solved=solvePuzzle(campaign,id,response.puzzle.solution);update();save();chime();showDialog([{speaker:'Erzählung',text:solved.message}]);}else message('Die Aufgabe bleibt offen. Du kannst später weiterspielen.');}).catch(()=>message('Das Minispiel konnte nicht starten. Versuche es erneut.'));
      }
      if(ACTIONS[id]&&onAction){
        const campaign=state.campaign,sceneId=campaign.sceneId;
        return Promise.resolve(onAction(ACTIONS[id])).then(result=>{if(state.campaign!==campaign||campaign.sceneId!==sceneId)return;if(result?.completed){const solved=solvePuzzle(campaign,id,response.puzzle.solution);update();save();showDialog([{speaker:'Erzählung',text:solved.message}]);}else message('Der Weg ist noch nicht gesichert. Du kannst es erneut versuchen.');}).catch(()=>message('Die Kampfszene konnte nicht starten. Versuche es erneut.'));
      }
      if(state.campaign.sceneId==='stadttor'&&id==='gate_path'&&onChase){
        const campaign=state.campaign;
        return Promise.resolve(onChase()).then(result=>{
          if(state.campaign!==campaign||campaign.sceneId!=='stadttor')return;
          if(result?.completed){
            const solved=solvePuzzle(campaign,id,response.puzzle.solution);
            if(!solved.success){update();save();message(solved.message);return;}
            const departure=leave('gate_exit',true);
            if(departure.type==='scene'){save();chime();}
            else{update();save();message(departure.text??'Die Verfolgung ist abgeschlossen.');}
          }
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
    const p=response.puzzle,selected=[],options=[...p.options];
    // The authored option order often was the complete solution. Mix its display
    // deterministically; hints and the engine still retain their original meaning.
    let seed=[...id].reduce((s,c)=>s+c.charCodeAt(0),0);
    for(let i=options.length-1;i>0;i--){seed=(seed*1664525+1013904223)>>>0;const j=seed%(i+1);[options[i],options[j]]=[options[j],options[i]];}
    basicModal(response.title,p.question,`<div class="story-puzzle-options">${options.map(o=>`<button data-answer="${o.id}" aria-pressed="false">${o.label}</button>`).join('')}</div><p class="puzzle-sequence" id="puzzle-sequence">${p.kind==='order'?'Klicke die Schritte nacheinander in der richtigen Reihenfolge an.':p.kind==='combine'?'Du kannst mehrere Möglichkeiten auswählen. Klicke alle passenden an und anschließend auf „Ausprobieren“.':'Wähle eine Antwort.'}</p><p id="puzzle-result" role="status"></p><button id="solve-story-puzzle" class="gold-button" disabled>Ausprobieren ✧</button> <button id="clear-story-puzzle">Auswahl zurücksetzen</button>`);
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
      if(result.success){
        if(id.startsWith('story_'))state.storyReaction={id,startedAt:performance.now()};
        update();save();chime();$('solve-story-puzzle').textContent='Weiter zur Szene ➜';$('solve-story-puzzle').onclick=()=>{closeModal();if(id==='free_restore'&&onVisual)onVisual('restore');};document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=true);$('clear-story-puzzle').disabled=true;
      }
      else{
        selected.length=0;refresh();
        document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=false);
        $('solve-story-puzzle').textContent='Erneut ausprobieren ✧';
        $('puzzle-sequence').textContent=p.kind==='order'?'Neuer Versuch: Wähle die Schritte erneut in der richtigen Reihenfolge.':'Neuer Versuch: Wähle die passenden Möglichkeiten erneut aus.';
        $('clear-story-puzzle').disabled=false;
        document.querySelector('[data-answer]')?.focus();
      }
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
  return {start,jumpTo,resume,enter,update,act,hint,save,hasSave,getTargets,followingTarget,updateMarkers,tick,suspend,getScene:()=>getScene(state.campaign)};
}
