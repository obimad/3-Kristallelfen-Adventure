/** Existing inventory renderers keep their buttons and click handlers. */
export function bindSatchel({toggle,panel,inventory,previous,next,status,pageSize=()=>globalThis.innerWidth<650?2:3,Observer=globalThis.MutationObserver,resizeTarget=globalThis}){
  let page=0;
  const countPerPage=()=>Math.max(1,Math.floor(typeof pageSize==='function'?pageSize():pageSize));
  function refresh(){
    const items=[...inventory.children],size=countPerPage(),pages=Math.max(1,Math.ceil(items.length/size));
    page=Math.min(page,pages-1);
    items.forEach((item,index)=>item.hidden=index<page*size||index>=(page+1)*size);
    previous.disabled=page===0;next.disabled=page===pages-1;
    status.textContent=items.length?`${page+1} / ${pages}`:'Noch nichts eingepackt';
  }
  function open(){refresh();panel.hidden=false;toggle.setAttribute('aria-expanded','true');}
  function close(){panel.hidden=true;toggle.setAttribute('aria-expanded','false');}
  const toggleClick=()=>panel.hidden?open():close();
  const previousClick=()=>{page=Math.max(0,page-1);refresh();};
  const nextClick=()=>{if(!next.disabled)page++;refresh();};
  const escape=event=>{if(event.key==='Escape'&&!panel.hidden){close();toggle.focus();event.stopPropagation?.();}};
  toggle.addEventListener('click',toggleClick);previous.addEventListener('click',previousClick);next.addEventListener('click',nextClick);
  panel.addEventListener('keydown',escape);resizeTarget.addEventListener?.('resize',refresh);
  const observer=Observer?new Observer(refresh):null;observer?.observe(inventory,{childList:true});
  close();refresh();
  return {open,close,refresh,destroy(){observer?.disconnect();toggle.removeEventListener('click',toggleClick);previous.removeEventListener('click',previousClick);next.removeEventListener('click',nextClick);panel.removeEventListener('keydown',escape);resizeTarget.removeEventListener?.('resize',refresh);}};
}
