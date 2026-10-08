import { SCENES } from './story-data.js';

export function createChapterMenu({root,onSelect,onOpen=()=>{}}){
  const chapters=[{id:'farbenquell',title:'Farbenquell – Finas Aufbruch'},...SCENES];
  const toggle=root.querySelector('#chapter-toggle'),panel=root.querySelector('#chapter-picker'),list=root.querySelector('#chapter-choices'),status=root.querySelector('#chapter-page');
  let page=0,current='farbenquell';
  function render(){
    list.innerHTML=chapters.slice(page*6,page*6+6).map((s,i)=>`<button data-chapter="${s.id}" aria-current="${s.id===current?'location':'false'}"><span>${String(page*6+i+1).padStart(2,'0')}</span>${s.title}</button>`).join('');
    list.querySelectorAll('[data-chapter]').forEach(button=>button.onclick=()=>{close();onSelect(button.dataset.chapter);});
    status.textContent=`${page+1} / ${Math.ceil(chapters.length/6)}`;
    root.querySelector('#chapter-previous').disabled=page===0;
    root.querySelector('#chapter-next').disabled=(page+1)*6>=chapters.length;
  }
  function close(){panel.hidden=true;toggle.setAttribute('aria-expanded','false');}
  function open(){onOpen();page=Math.floor(Math.max(0,chapters.findIndex(s=>s.id===current))/6);render();panel.hidden=false;toggle.setAttribute('aria-expanded','true');list.querySelector('button')?.focus();}
  toggle.onclick=()=>panel.hidden?open():close();
  root.querySelector('#chapter-close').onclick=()=>{close();toggle.focus();};
  root.querySelector('#chapter-previous').onclick=()=>{page--;render();};
  root.querySelector('#chapter-next').onclick=()=>{page++;render();};
  root.addEventListener('keydown',event=>{if(event.key==='Escape'){close();toggle.focus();}});
  return {open,close,update(id){current=id;root.querySelector('#chapter-current').textContent=chapters.find(s=>s.id===id)?.title??'';render();}};
}
