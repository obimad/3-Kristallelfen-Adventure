export function availableInteraction(h,{flags=[],inventory=[]}={}){
  return (h.requiresFlags??[]).every(id=>flags.includes(id))&&(h.requiresItems??[]).every(id=>inventory.includes(id));
}

export function walkInteraction(before,after,targets,{done=()=>false,flags=[],inventory=[],rightEdge=null,radius=32}={}){
  if(Math.hypot(after.x-before.x,after.y-before.y)<.01)return null;
  for(const h of targets){
    if(!['talk','exit'].includes(h.type)||done(h)||!availableInteraction(h,{flags,inventory}))continue;
    const distance=p=>Math.hypot(p.x-h.approach.x,p.y-h.approach.y);
    if(distance(before)>radius&&distance(after)<=radius)return h;
    if(h.type==='exit'&&rightEdge!==null&&after.x>=rightEdge&&after.x>before.x)return h;
  }
  return null;
}
