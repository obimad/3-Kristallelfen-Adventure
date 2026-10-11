import {translate} from './localization.js';
// Targets sit on the subject of the action, instead of a quiz in a separate window.
export const WORLD_TASK_SPOTS={
 cirrus:{little:[1170,390],edge:[1300,430],group:[1020,430]},
 kumulus:{up:[940,540],down:[1150,690],back:[200,400],mother:[440,690]},
 wolkenseglerflug:{space:[770,765],test:[1080,630],signal:[1320,680]},
 muck:{shoulder:[330,590],sweet:[670,650],water:[1120,520]},
 sandfaenger:{bowl:[315,600],edge:[170,420],sieve:[470,520]},
 stadttor:{paired:[850,550],fountain:[1250,410],sky:[1070,230]},
 cold:{own:[1030,560],guards:[1370,540],rush:[1300,700]},
 powdery:{stop:[1060,520],foot:[1040,745],check:[1200,690]},
 icy:{page:[1120,580],shout:[1000,450],leave:[1320,680]},
 schneeschleusen:{clear:[1250,510],collect:[340,410],all:[700,400]},
 wolkenhain:{signal:[1370,460],cover:[680,620],gap:[1160,760]},
 aria:{seal:[470,680],truth:[1150,580],invent:[810,550]},
 regis_intrige:{lure:[950,430],close:[200,520],water:[420,355]},
 thronsturz:{curtain:[1330,445],gap:[1390,610],help:[1550,700]},
 funkels_warnung:{side:[770,600],main:[1290,380],queen:[350,470]},
 kristallwerkstatt:{arms:[810,350],model:[600,460],parts:[440,560]},
 observatorium:{route:[530,425],cross:[310,630],cover:[1300,650]},
 mondtaugarten:{stables:[1230,450],silver:[950,565],enter:[1340,720]},
 wasserverlies:{life:[775,280],empty:[1130,340],pour:[530,460]},
 h2o_wende:{snow:[1050,540],force:[700,580],regis:[430,440]},
 befreiung:{vessel:[800,460],crystal:[470,620],circle:[1030,720]},
 regis_finale:{gap:[900,560],fly:[1190,490],sting:[1400,560]},
 ehrung:{muck:[1190,430],h2o:[1350,580],rings:[760,620]},
 epilog:{safe:[1050,560],friends:[1370,620],rank:[700,550]},
};
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function taskStep(puzzle,selected,id){
 if(selected.includes(id))return {selected,success:false,wrong:false};
 const expected=puzzle.kind==='order'?puzzle.solution[selected.length]:id;
 if(!puzzle.solution.includes(id)||id!==expected)return {selected:[],success:false,wrong:true};
 const next=[...selected,id];return {selected:next,success:next.length===puzzle.solution.length,wrong:false};
}
export function worldTaskSpots(scene,state){
 const spots={...WORLD_TASK_SPOTS[scene.id]};
 if(scene.id==='muck')spots.shoulder=[state.position.x-120*(state.facing??1),state.position.y-180];
 return spots;
}
export function createWorldTasks({state,stopMovement}){
 const world=document.querySelector('.world'),overlay=document.createElement('section');overlay.className='world-task';overlay.hidden=true;world.append(overlay);let resolveTask;
 function close(completed=false,answers=[]){overlay.hidden=true;overlay.innerHTML='';world.classList.remove('world-task-active');state.campaignBusy=false;state.worldTask=null;const resolve=resolveTask;resolveTask=null;resolve?.({completed,answers});}
 function play(scene,response){
  close();stopMovement();state.campaignBusy=true;overlay.hidden=false;world.classList.add('world-task-active');
  const spots=worldTaskSpots(scene,state),p=response.puzzle;let selected=[];const center={...state.position};
  return new Promise(resolve=>{resolveTask=resolve;
   overlay.innerHTML=`<div class="world-task-guide"><strong>${escape(translate(response.title))}</strong><p>${escape(translate('Handle direkt im Bild. Die Beschriftung erscheint beim Berühren oder Darüberfahren.'))}</p><span class="world-task-status" role="status"></span><button class="world-task-close">${escape(translate('Zur Szene'))}</button></div>`;
   overlay.querySelector('.world-task-close').onclick=()=>close();
   const status=overlay.querySelector('.world-task-status');
   const refresh=()=>{state.worldTask={sceneId:scene.id,selected:[...selected],spots};state.worldSequence={sceneId:scene.id,selected:[...selected],spots,center,startedAt:performance.now()};status.textContent=`${selected.length} / ${p.solution.length}`;overlay.querySelectorAll('[data-step]').forEach(b=>{b.disabled=selected.includes(b.dataset.step);b.classList.toggle('task-done',b.disabled);});};
   p.options.forEach((option,index)=>{
    const [x,y]=spots[option.id]??[520+index*340,540],button=document.createElement('button');button.className='world-task-target';button.dataset.step=option.id;button.style.left=`${x/16}%`;button.style.top=`${y/9}%`;button.setAttribute('aria-label',translate(option.label));button.innerHTML=`<span>${escape(translate(option.label))}</span>`;
    button.onclick=()=>{const step=taskStep(p,selected,option.id);selected=step.selected;refresh();if(step.wrong){status.textContent=translate(p.failureText);}if(step.success)close(true,selected);};overlay.append(button);
   });refresh();overlay.querySelector('[data-step]')?.focus();
  });
 }
 window.addEventListener('keydown',event=>{if(!overlay.hidden&&event.key==='Escape'){event.preventDefault();close();}});
 return {play,close};
}

