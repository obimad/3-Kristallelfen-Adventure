/** Words remain intact; every source word appears on exactly one page. */
export function paginateDialogText(text,maxChars=400){
  const words=String(text).trim().split(/\s+/);if(!String(text).trim())return [''];
  const pages=[];let page='';
  for(const word of words){
    if(page&&page.length+word.length+1>maxChars){pages.push(page);page='';}
    page=page?`${page} ${word}`:word;
  }
  if(page)pages.push(page);return pages;
}

export function helpRowGroups(children){
  const pairs=[];for(let index=0;index<children.length;index+=2)pairs.push(children.slice(index,index+2));return pairs;
}

/** Page original DOM nodes rather than copies, preserving puzzle click handlers.
 * Dialogue lines use paginateDialogText in the main dialogue controller instead.
 */
export function bindModalPagination({dialog,content,windowObject=globalThis.window}){
  const doc=content.ownerDocument,nav=doc.createElement('div');nav.className='modal-pages';nav.hidden=true;
  nav.innerHTML='<button type="button" aria-label="Vorherige Seite">← Zurück</button><span role="status"></span><button type="button" aria-label="Nächste Seite">Weiter →</button>';
  dialog.append(nav);
  const [previous,next]=nav.querySelectorAll('button'),status=nav.querySelector('span');
  let page=0,pages=[[]],entries=[],wrappers=[],scheduled=null,contentAnchor=null;
  function display(indices){
    entries.forEach(entry=>entry.node.hidden=true);wrappers.forEach(wrapper=>wrapper.hidden=true);
    indices.forEach(index=>{const entry=entries[index];entry.node.hidden=false;entry.parents.forEach(parent=>parent.hidden=false);});
  }
  function showPage(){
    page=Math.max(0,Math.min(page,pages.length-1));display(pages[page]);
    previous.disabled=page===0;next.disabled=page===pages.length-1;status.textContent=`${page+1} / ${pages.length}`;nav.hidden=pages.length<2;
  }
  function splitParagraphs(){
    const maximum=windowObject.innerHeight<520?140:windowObject.innerWidth<650?260:480;
    content.querySelectorAll('p:not([id])').forEach(paragraph=>{
      if(paragraph.querySelector('button,input,select,a'))return;
      const chunks=paginateDialogText(paragraph.textContent,maximum);if(chunks.length<2)return;
      chunks.forEach(chunk=>{const part=doc.createElement('p');part.className=paragraph.className;part.dataset.modalSplit='true';part.textContent=chunk;paragraph.before(part);});
      paragraph.remove();
    });
  }
  function collect(){
    entries=[];wrappers=[];
    function entry(node,parents=[]){entries.push({node,parents});}
    function list(parent,parents=[]){
      wrappers.push(parent);
      [...parent.children].forEach(node=>{
        const details=node.querySelector('details[open]');
        if(details){
          wrappers.push(node);
          const paragraphs=[...details.querySelectorAll('p')];
          if(paragraphs.length)paragraphs.forEach(paragraph=>entry(paragraph,[...parents,parent,node]));else entry(node,[...parents,parent]);
        }else entry(node,[...parents,parent]);
      });
    }
    [...content.children].forEach(node=>{
      if(node.matches('.modal-header,#modal-title'))return;
      if(node.matches('.help-rows')){
        if(!node.firstElementChild?.matches('.help-entry')){
          helpRowGroups([...node.children]).forEach(pair=>{const row=doc.createElement('div');row.className='help-entry';pair[0].before(row);pair.forEach(child=>row.append(child));});
        }
        list(node);return;
      }
      if(node.matches('.journal-entries,.chapter-list,.story-puzzle-options'))list(node);else entry(node);
    });
  }
  function refresh(){
    scheduled=null;observer.disconnect();
    // A newly written modal starts at its first page. Existing puzzle updates
    // keep their page so an answer button does not disappear on selection.
    if(content.firstElementChild!==contentAnchor){page=0;contentAnchor=content.firstElementChild;}
    if(content.querySelector('.dialog-layout')){nav.hidden=true;observe();return;}
    entries.forEach(entry=>{if(entry.node.isConnected)entry.node.hidden=false;});wrappers.forEach(wrapper=>{if(wrapper.isConnected)wrapper.hidden=false;});
    splitParagraphs();collect();
    const all=entries.map((_,index)=>index);display(all);nav.hidden=true;
    const limit=windowObject.innerHeight-24;
    if(dialog.scrollHeight<=limit){pages=[all];showPage();observe();return;}
    nav.hidden=false;pages=[];let current=[];
    for(const index of all){
      display([...current,index]);
      if(current.length&&dialog.scrollHeight>limit){pages.push(current);current=[index];}else current.push(index);
    }
    if(current.length)pages.push(current);if(!pages.length)pages=[[]];showPage();observe();
  }
  function schedule(){if(scheduled===null)scheduled=windowObject.requestAnimationFrame(refresh);}
  function observe(){observer.observe(content,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['open']});}
  const observer=new windowObject.MutationObserver(schedule);observe();
  const previousClick=()=>{page--;showPage();},nextClick=()=>{page++;showPage();};
  previous.addEventListener('click',previousClick);next.addEventListener('click',nextClick);
  content.addEventListener('toggle',schedule,true);content.addEventListener('load',schedule,true);windowObject.addEventListener('resize',schedule);
  return {refresh:schedule,destroy(){observer.disconnect();if(scheduled!==null)windowObject.cancelAnimationFrame(scheduled);previous.removeEventListener('click',previousClick);next.removeEventListener('click',nextClick);content.removeEventListener('toggle',schedule,true);content.removeEventListener('load',schedule,true);windowObject.removeEventListener('resize',schedule);nav.remove();}};
}
