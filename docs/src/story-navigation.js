// Die neuen Kulissen haben eine freie Wolkenfläche im Vordergrund.
export function storyPoint(point){
  return {x:Math.min(1480,Math.max(120,point.x)),y:Math.min(875,Math.max(710,point.y))};
}
export function storyMove(position,direction,dt){
  const length=Math.hypot(direction.x,direction.y);
  if(!length)return position;
  return storyPoint({x:position.x+direction.x/length*220*dt,y:position.y+direction.y/length*220*dt});
}
