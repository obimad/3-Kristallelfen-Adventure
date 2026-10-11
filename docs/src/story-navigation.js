import {storySpace,storyWalkable} from './story-space.js';
export function storyPoint(point,scene){
  const [left,top,right,bottom]=storySpace(scene).ground;
  if(storyWalkable(point,scene))return {...point};
  return {x:Math.min(right,Math.max(left,point.x)),y:Math.min(bottom,Math.max(top,point.y))};
}
export function storyMove(position,direction,dt,scene){
  const length=Math.hypot(direction.x,direction.y);
  if(!length)return position;
  const distance=220*Math.max(0,Math.min(dt,.05)),next={...position};
  const x={x:position.x+direction.x/length*distance,y:position.y};if(storyWalkable(x,scene))next.x=x.x;
  const y={x:next.x,y:position.y+direction.y/length*distance};if(storyWalkable(y,scene))next.y=y.y;
  return next;
}
export function storyPath(start,goal,scene){
 goal=storyPoint(goal,scene);if(!storyWalkable(start,scene))return [];
 const clear=(a,b)=>{const n=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/10));for(let i=0;i<=n;i++)if(!storyWalkable({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},scene))return false;return true;};
 if(clear(start,goal))return [goal];
 const space=storySpace(scene),nodes=[start,goal];for(const [l,t,r,b] of [space.ground,...space.lanes])nodes.push({x:(l+r)/2,y:(t+b)/2},{x:(l+r)/2,y:Math.min(b,740)});
 const queue=[[0]],seen=new Set([0]);while(queue.length){const route=queue.shift();for(let i=1;i<nodes.length;i++){if(seen.has(i)||!clear(nodes[route.at(-1)],nodes[i]))continue;const next=[...route,i];if(i===1)return next.slice(1).map(j=>nodes[j]);seen.add(i);queue.push(next);}}return [];
}
