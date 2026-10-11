import {openingStageRoute,stageRoutePoint} from './opening-navigation.js';
import {OPENING_AREAS,OPENING_ITEMS,OPENING_COPY as C,OPENING_DIALOG as D,OPENING_INTRO,openingTargets,openingObjective,createOpeningState,restoreOpeningState,pourOpeningColour,openingConversationTopics,openingExitArrow} from './opening-chapter.js';
import {readyToLeave} from './adventure.js';
import {ASSETS} from './data.js';
import {translate} from './localization.js';

const $=id=>document.getElementById(id);
export function createOpeningUI({state,stopMovement,save,message,chime,travel,closeSatchel,request,playMusic}){
 let dialogueDone=null,sequence=null,index=0,hint=0,lastGoal='',arrival=null;
 const s=()=>state.adventure.opening??=restoreOpeningState(null,state.adventure);
 const panel=document.createElement('section');panel.id='opening-dialog';panel.className='opening-dialog';panel.setAttribute('aria-label','Gespräch');panel.hidden=true;$('scene').parentElement.append(panel);
 const toolbar=document.createElement('div');toolbar.id='opening-toolbar';toolbar.className='opening-toolbar';$('scene').parentElement.append(toolbar);
 const fade=document.createElement('div');fade.className='opening-scene-fade';fade.setAttribute('aria-hidden','true');fade.style.opacity='0';$('scene').parentElement.append(fade);
 function lockControls(){const busy=state.mode==='journey'&&!!state.openingBusy;for(const id of ['hotspots','satchel','chapter-navigation'])if($(id))$(id).inert=busy;}
 function finishDialog(){panel.hidden=true;state.openingBusy=false;const done=dialogueDone;dialogueDone=null;done?.();update();save();if(!state.openingBusy)$('scene').focus();}
 function dialogue(lines,done=null){stopMovement();state.openingBusy=true;sequence=lines;index=0;dialogueDone=done;page();}
 function page(){
  const line=sequence[index],portrait=line.speaker==='Vivid'?ASSETS.vividSprite:line.speaker==='Colorida'?ASSETS.coloridaSprite:ASSETS.fina;
  panel.hidden=false;panel.innerHTML=`<div class="opening-speaker"><div class="opening-portrait"><img src="${portrait}" alt="${line.speaker}"></div><strong>${line.speaker}</strong></div><div class="opening-speech"><p>${translate(line.text)}</p><button class="gold-button" id="opening-next">${translate(C.next)} ➜</button><small>${index+1} / ${sequence.length}</small></div>`;
  $('opening-next').onclick=()=>{if(++index<sequence.length)page();else finishDialog();};$('opening-next').focus();
 }
 function choices(speaker,text,options){
  stopMovement();state.openingBusy=true;panel.hidden=false;
  panel.innerHTML=`<div class="opening-choice"><strong>${speaker}</strong><p>${translate(text)}</p><div>${options.map((o,i)=>`<button data-choice="${i}">${translate(o.label)}</button>`).join('')}</div></div>`;
  panel.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{panel.hidden=true;state.openingBusy=false;options[Number(button.dataset.choice)].run();});panel.querySelector('button')?.focus();
 }
 function begin(){s();s().introSeen=true;state.openingBusy=true;state.position={x:1420,y:550};s().area='home';state.openingArrival=null;state.openingTransition={area:'home',phase:'in',started:performance.now(),duration:state.reducedMotion?0:1900,from:{...state.position},vividFrom:{x:1420,y:550}};update();save();$('scene').focus();}
 function intro(){
  stopMovement();state.openingBusy=true;const overlay=$('opening-intro');overlay.hidden=false;overlay.className='opening-intro comic-intro';
  let beat=0;
  function finish(){overlay.hidden=true;state.openingBusy=false;begin();}
  function show(){const scene=OPENING_INTRO[beat];overlay.innerHTML=`<img class="comic-backdrop" src="${ASSETS[scene.art]}" alt=""><div class="comic-shade"></div><div class="comic-hero"><img src="${ASSETS.fina}" alt="Fina"></div><div class="comic-copy"><span class="chapter">${translate(C.label)} · ${beat+1} / 3</span><h2>${translate(scene.title)}</h2><p>${translate(scene.text)}</p><button class="gold-button" id="intro-next">${translate(beat===2?C.continue:C.next)} ➜</button></div><button id="skip-intro" class="intro-skip">${translate(C.skip)} ➜</button>`;$('intro-next').onclick=()=>{if(++beat<OPENING_INTRO.length)show();else finish();};$('skip-intro').onclick=finish;$('intro-next').focus();}
  overlay.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();finish();}};show();playMusic('01');
 }
 function ensureArrival(done){
  if(s().vividArrived){if(!state.adventure.talked)dialogue(D.arrival,()=>{state.adventure.talked=true;s().metVivid=true;done();});else done();return;}
  stopMovement();s().vividArrived=true;state.openingBusy=true;state.openingArrival={started:performance.now(),duration:state.reducedMotion?0:2400};arrival=()=>dialogue(D.arrival,()=>{state.adventure.talked=true;s().metVivid=true;done();});update();
 }
 function tick(time){
  lockControls();
  if(state.mode!=='journey'){toolbar.hidden=true;panel.hidden=true;return;}
  toolbar.hidden=!state.started||state.openingBusy||!$('opening-intro').hidden;
  panel.hidden=panel.hidden||!state.started;
  if(state.openingTransition){advanceTransition(time);return;}
  if(arrival&&state.openingArrival&&time-state.openingArrival.started>=state.openingArrival.duration){const done=arrival;arrival=null;state.openingArrival=null;done();}
 }
 function walkTogether(area){
  stopMovement();closeSatchel();state.openingBusy=true;panel.hidden=true;
  state.openingTransition={area,source:s().area,phase:'out',started:performance.now(),duration:state.reducedMotion?0:2200,from:{...state.position},vividFrom:{x:s().area==='square'?755:s().area==='edge'?650:740,y:s().area==='square'?750:785}};
  update();
 }
 function advanceTransition(time){
  const t=state.openingTransition,p=Math.min(1,(time-t.started)/Math.max(1,t.duration));
  fade.style.opacity=String(state.reducedMotion?0:t.phase==='out'?Math.max(0,(p-.72)/.28):Math.max(0,1-(time-t.started)/400));
  const route=openingStageRoute(t.source??'home',t.area,t.phase);
  const end=t.phase==='out'?route.at(-1):OPENING_AREAS[t.area].spawn;
  const points=t.phase==='out'?[t.from,...route]:[...route,end];
  const step=stageRoutePoint(points,p);state.position={x:step.x,y:step.y};state.moving=p<1;
  state.facing=step.dx===0?state.facing:step.dx>0?1:-1;state.view=Math.abs(step.dy)>Math.abs(step.dx)*1.2?(step.dy<0?'back':'front'):'side';
  const target=t.phase==='out'?{x:end.x-(t.source==='home'?40:75),y:end.y}:{x:t.area==='square'?755:t.area==='edge'?650:740,y:t.area==='square'?750:785};
  const companion=stageRoutePoint(t.phase==='out'?[t.vividFrom,...route.slice(0,-1),target]:[...route.map(point=>({x:point.x-(t.area==='home'?40:110),y:point.y})),target],p);
  t.vivid={...companion};
  if(p<1)return;
  if(t.phase==='out'){fade.style.opacity=state.reducedMotion?'0':'1';s().area=t.area;t.phase='in';t.started=time;t.from={...openingStageRoute(t.source,t.area,'in')[0]};t.vividFrom={x:t.from.x-110,y:t.from.y};state.position={...t.from};t.vivid={...t.vividFrom};update();}
  else{fade.style.opacity='0';state.openingTransition=null;state.openingBusy=false;state.moving=false;state.view='front';update();save();$('scene').focus();}
 }
 function enter(area){if(!Object.hasOwn(OPENING_AREAS,area))return;stopMovement();state.selectedItem=null;s().area=area;state.position={...OPENING_AREAS[area].spawn};state.view='front';state.openingArrival=null;hint=0;update();save();}
 function update(){
  if(state.mode!=='journey'){toolbar.hidden=true;panel.hidden=true;return;}
  const area=OPENING_AREAS[s().area];$('scene').parentElement.classList.add('opening-chapter');
  $('scene-heading').innerHTML=`<span class="chapter">${translate(C.label)}</span><h1>${translate(area.name)}</h1><span class="scene-subtitle">${translate(area.subtitle)}</span>`;
  $('objective-text').textContent=translate(openingObjective(state.adventure));$('objective-progress').textContent=translate(C.progress);
  const targets=openingTargets(state.adventure);
  $('hotspots').innerHTML=targets.map(h=>`<button class="hotspot discoverable ${h.type==='person'?'person-target':''} ${h.type==='exit'?'opening-exit':''} ${(h.id==='vivid'&&!state.adventure.talked||h.id==='colorida'&&!state.adventure.inventory.includes('letter'))?'new-talk':''}" data-id="${h.id}" aria-label="${translate(h.name)}: ${translate(h.verb)}" style="left:${(h.x-h.width/2)/16}%;top:${(h.y-h.height/2)/9}%;width:${h.width/16}%;height:${h.height/9}%"><span class="hotspot-label">${translate(h.name)} · ${translate(h.verb)}</span>${h.type==='exit'?`<span class="opening-arrow" aria-hidden="true">${openingExitArrow(h.id,s().area)}</span>`:''}</button>`).join('');
  $('hotspots').querySelectorAll('[data-id]').forEach(button=>button.onclick=()=>{if(!state.openingBusy)request(targets.find(h=>h.id===button.dataset.id));});
  const inventory=state.adventure.inventory.filter(id=>OPENING_ITEMS[id]);$('satchel-counter').textContent=`${inventory.length} · ${translate(area.name)}`;
  $('inventory').innerHTML=inventory.map(id=>{const item=OPENING_ITEMS[id];return `<div class="opening-item"><strong><span class="opening-item-symbol ${id}">${item.icon}</span>${translate(item.name)}</strong><div><button data-inspect="${id}">${translate(C.inspect)}</button><button data-use="${id}" aria-pressed="${state.selectedItem===id}">${translate(C.select)}</button></div></div>`;}).join('');
  $('inventory').querySelectorAll('[data-inspect]').forEach(button=>button.onclick=()=>{closeSatchel();dialogue([{speaker:'Fina',text:OPENING_ITEMS[button.dataset.inspect].description}]);});
  $('inventory').querySelectorAll('[data-use]').forEach(button=>button.onclick=()=>{state.selectedItem=button.dataset.use;closeSatchel();message(translate(C.selected));update();$('scene').focus();});
  toolbar.innerHTML=`<span>${translate(C.hover)}</span><button id="opening-discover" aria-pressed="${!!state.openingReveal}">✧ ${translate(C.uiHint)}</button>`;
  $('opening-discover').onclick=()=>{state.openingReveal=!state.openingReveal;$('hotspots').classList.toggle('opening-reveal',state.openingReveal);$('opening-discover').setAttribute('aria-pressed',String(state.openingReveal));};
  $('hotspots').classList.toggle('opening-reveal',!!state.openingReveal);toolbar.hidden=!state.started||state.openingBusy;
 }
 function vivid(){
  if(!state.adventure.talked){ensureArrival(()=>{});return;}
  if(s().area==='edge'){
   if(!readyToLeave(state.adventure)){dialogue(D.repeatVivid);return;}
   dialogue(D.farewell,()=>{state.adventure.completed=true;chime('win');save();ending();});return;
  }
  choices('Vivid',s().area==='home'?D.arrival.at(-1).text:D.repeatVivid[0].text,[
   ...openingConversationTopics(s()).map(topic=>({label:{mother:C.choiceMother,meeting:C.choiceMeeting,help:C.choiceHelp}[topic],run:()=>dialogue(D[topic],()=>{s()[`${topic}Talk`]=true;vivid();})})),
   {label:C.choiceBack,run:update}
  ]);
 }
 function act(id){
  if(state.openingBusy)return;stopMovement();
  if(state.selectedItem){const item=state.selectedItem;state.selectedItem=null;closeSatchel();
   if(id==='bowl'){const result=pourOpeningColour(state.adventure,item);if(result.ok){state.openingPour={colour:item,started:performance.now()};chime();}message(translate(result.text));update();save();return;}
   if(item==='crystal'&&['vivid','colorida'].includes(id)){dialogue(D.mother,()=>{s().motherTalk=true;});return;}
   if(item==='letter'&&id==='colorida'){dialogue(D.repeatColorida);return;}
   message(translate(C.wrong));update();return;
  }
  if(id.startsWith('to_')){
   const area=id.slice(3);
   if(area==='square'&&!state.adventure.talked){ensureArrival(()=>walkTogether(area));return;}
   walkTogether(area);return;
  }
  if(id==='vivid'){vivid();return;}
  if(id==='colorida'){dialogue(state.adventure.inventory.includes('letter')?D.repeatColorida:D.colorida,()=>{if(!state.adventure.inventory.includes('letter')){state.adventure.inventory.push('letter');state.openingGift={started:performance.now()};chime();message(translate(C.gift));}});return;}
  if(id==='crystal'){dialogue(D.crystal,()=>{if(!state.adventure.inventory.includes('crystal'))state.adventure.inventory.push('crystal');s().discoveries.push('crystal');chime();ensureArrival(()=>{});});return;}
  if(id==='bag'){if(!state.adventure.inventory.includes('bag'))state.adventure.inventory.push('bag');message(translate(C.bag));chime();ensureArrival(()=>{});update();save();return;}
  if(['red','blue','yellow'].includes(id)){
   if(!state.adventure.inventory.includes(id)){state.adventure.inventory.push(id);chime();}
   choices('Fina',OPENING_ITEMS[id].description,[{label:C.select,run:()=>{state.selectedItem=id;message(translate(C.selected));update();save();}},{label:C.choiceBack,run:()=>{update();save();}}]);return;
  }
  if(id==='bowl'){dialogue([{speaker:'Fina',text:state.adventure.mixed?C.made:C.paint}]);return;}
  if(['clouds','stairs','portrait','window'].includes(id)){if(!s().discoveries.includes(id))s().discoveries.push(id);dialogue(D[id]);return;}
  if(id==='exit'){
   if(state.adventure.completed){ending();return;}
   if(!readyToLeave(state.adventure)){message(translate(C.preparationBlocked));return;}
   vivid();return;
  }
 }
 function ending(){playMusic('02');choices('Fina',C.end,[{label:C.travel,run:()=>{toolbar.hidden=true;panel.hidden=true;travel();}},{label:C.replay,run:()=>enter('home')}]);}
 function showHint(){
  const goal=openingObjective(state.adventure);if(goal!==lastGoal){lastGoal=goal;hint=0;}
  const hints=!state.adventure.talked?[C.explore,C.friend,D.meeting[0].text]:!state.adventure.inventory.includes('letter')?[C.gathering,D.meeting[0].text,D.colorida.at(-2).text]:!readyToLeave(state.adventure)?[C.prepare,C.preparationBlocked,D.repeatVivid[0].text]:[C.farewell,D.repeatVivid[0].text,C.farewell];
  dialogue([{speaker:'Fina',text:hints[Math.min(hint++,2)]}]);
 }
 function suspend(){fade.style.opacity='0';$('scene').parentElement.classList.remove('opening-chapter');arrival=null;state.openingTransition=null;state.openingArrival=null;state.openingBusy=false;panel.hidden=true;toolbar.hidden=true;$('opening-intro').hidden=true;lockControls();}
 function reset(){suspend();arrival=null;state.openingArrival=null;state.openingBusy=false;state.selectedItem=null;state.openingReveal=false;panel.hidden=true;state.adventure.opening=createOpeningState();}
 return {suspend,intro,begin,update,act,tick,targets:()=>openingTargets(state.adventure),hint:showHint,reset,restore:()=>{state.adventure.opening=restoreOpeningState(state.adventure.opening,state.adventure);update();}};
}
