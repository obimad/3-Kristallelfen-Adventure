export function createAdventure() { return {inventory:[],talked:false,mixed:false,completed:false,viewed:[]}; }
export function interact(s,id) {
  if(id.startsWith('inspect:')&&!s.inventory.includes(id.slice(8)))return false;
  if(['clouds','stairs'].includes(id)||id.startsWith('inspect:')){
    if(s.viewed.includes(id))return false;
    s.viewed.push(id);return true;
  }
  if(id==='vivid'){s.talked=true;return true;}
  if(id==='colorida')id='letter';
  else if(!['bag','crystal'].includes(id))return false;
  if(s.inventory.includes(id))return false;
  s.inventory.push(id);return true;
}
export function mix(s,colors) {
  if(colors.length!==2||!colors.includes('red')||!colors.includes('blue'))return false;
  s.mixed=true;return true;
}
export function readyToLeave(s) { return s.talked&&['bag','crystal','letter'].every(id=>s.inventory.includes(id)); }
