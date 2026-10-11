import {translate} from './localization.js';
import {paginateDialogText} from './modal-pages.js';
import {STORY_CHARACTERS} from './story-data.js';
import {propSource} from './prop-art.js';
const escape=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function createComicPanel({state,stopMovement,getImages=()=>({}),onCancel=()=>{}}){
 const world=document.querySelector('.world'),panel=document.createElement('section');
 panel.className='comic-dialog';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');
 world.append(panel);let previousFocus;
 function close(cancel=false){panel.hidden=true;panel.innerHTML='';state.comicBusy=false;world.classList.remove('comic-speaking');if(cancel)onCancel();if(previousFocus?.isConnected)previousFocus.focus();}
 function open(title,text,extra=''){
  stopMovement();previousFocus=document.activeElement;state.comicBusy=true;world.classList.add('comic-speaking');panel.hidden=false;
  panel.innerHTML=`<div class="comic-dialog-copy"><div class="comic-dialog-heading"><h2>${escape(translate(title))}</h2><button class="comic-close" aria-label="${escape(translate('Schließen'))}">×</button></div><p>${escape(translate(text))}</p>${extra}</div>`;
  panel.querySelector('.comic-close').onclick=()=>close(true);panel.querySelector('button:not(.comic-close)')?.focus();
 }
 function dialog(lines,onDone,view){
  const budget=innerWidth<650?190:400,pages=lines.flatMap(line=>paginateDialogText(translate(line.text),budget).map(text=>({...line,text})));let index=0;
  if(!pages.length){onDone?.();return;}
  function page(){
   const line=pages[index],character=Object.values(STORY_CHARACTERS).find(c=>c.name===line.speaker);
   open(line.speaker,line.text,`<div class="comic-dialog-footer"><span>${index+1} / ${pages.length}</span><button id="dialog-next" class="gold-button">${escape(translate(index+1===pages.length?'Zur Szene':'Weiter'))} ➜</button></div>`);
   if(character){const img=document.createElement('img');img.src=character.portrait;img.alt=line.speaker;img.className='comic-portrait';panel.prepend(img);}
   if(view?.src&&!view.art){const img=document.createElement('img');img.src=view.src;img.alt=translate(view.alt);img.className='comic-detail';panel.prepend(img);}
   if(view?.art){const canvas=document.createElement('canvas');canvas.width=192;canvas.height=192;canvas.className='comic-detail';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',translate(view.alt));const atlas=getImages()[view.art.asset];if(atlas){const source=propSource(atlas,view.art),scale=Math.min(180/source[2],180/source[3]),w=source[2]*scale,h=source[3]*scale;canvas.getContext('2d').drawImage(atlas,...source,(192-w)/2,(192-h)/2,w,h);}panel.prepend(canvas);}
   panel.querySelector('#dialog-next').onclick=()=>{if(++index<pages.length)page();else{close();onDone?.();}};
  }page();
 }
 window.addEventListener('keydown',event=>{
  if(panel.hidden||event.target.closest('input,textarea,select'))return;
  if(event.key==='Escape'){event.preventDefault();close(true);}
  else if(event.key==='Enter'&&!event.target.closest('button')){const next=panel.querySelector('#dialog-next');if(next){event.preventDefault();next.click();}}
 });
 return {open,dialog,close,panel};
}
