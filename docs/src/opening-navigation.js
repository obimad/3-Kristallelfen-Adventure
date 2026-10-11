// Local walk mesh for the three opening shots. The table is a real obstacle.
export function openingWalkable(p,area='home'){
 if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
 const ground=p.x>=180&&p.x<=1420&&p.y>=650&&p.y<=880;
 const stairs=area==='square'&&p.x>=735&&p.x<=900&&p.y>=555&&p.y<=760;
 const table=area==='home'&&p.x>=300&&p.x<=610&&p.y>=625&&p.y<=820;
 return (ground||stairs)&&!table;
}
export function openingMove(p,d,dt,area){
 const len=Math.hypot(d.x,d.y);if(!len)return p;
 const distance=220*Math.min(Math.max(dt,0),.05),next={...p};
 const horizontal={x:next.x+d.x/len*distance,y:next.y};if(openingWalkable(horizontal,area))next.x=horizontal.x;
 const vertical={x:next.x,y:next.y+d.y/len*distance};if(openingWalkable(vertical,area))next.y=vertical.y;
 return next;
}
export function openingPath(start,goal,area){
 if(!openingWalkable(start,area)||!openingWalkable(goal,area))return [];
 const clear=(a,b)=>{const steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/8);for(let i=0;i<=steps;i++){const k=steps?i/steps:0;if(!openingWalkable({x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k},area))return false;}return true;};
 if(clear(start,goal))return [{...goal}];
 const nodes=[start,goal,{x:640,y:845},{x:270,y:845},{x:640,y:850},{x:270,y:850}],queue=[[0]],seen=new Set([0]);
 while(queue.length){const route=queue.shift(),from=route.at(-1);for(let i=1;i<nodes.length;i++){if(seen.has(i)||!clear(nodes[from],nodes[i]))continue;const next=[...route,i];if(i===1)return next.slice(1).map(index=>({...nodes[index]}));seen.add(i);queue.push(next);}}
 return [];
}

// Authored entrances follow doors and paths in the corresponding artwork.
export function openingStageRoute(from,to,phase){
 if(phase==='out'){
  if(from==='home')return [{x:1420,y:550}];
  if(from==='square'&&to==='edge')return [{x:820,y:590},{x:840,y:350}];
  if(from==='square')return [{x:220,y:735},{x:-170,y:760}];
  return [{x:380,y:840},{x:380,y:1070}];
 }
 if(to==='home')return [{x:1420,y:550}];
 if(to==='square'&&from==='edge')return [{x:840,y:350},{x:820,y:590}];
 if(to==='square')return [{x:-150,y:770},{x:220,y:770}];
 return [{x:800,y:1070}];
}
export function stageRoutePoint(points,progress){
 const lengths=points.slice(1).map((point,i)=>Math.hypot(point.x-points[i].x,point.y-points[i].y));
 let remaining=Math.max(0,Math.min(1,progress))*lengths.reduce((a,b)=>a+b,0);
 for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]){const f=lengths[i]?remaining/lengths[i]:1;return {x:points[i].x+(points[i+1].x-points[i].x)*f,y:points[i].y+(points[i+1].y-points[i].y)*f,dx:points[i+1].x-points[i].x,dy:points[i+1].y-points[i].y};}remaining-=lengths[i];}
 return {...points.at(-1),dx:0,dy:0};
}

export function advanceOpeningPath(start,route,seconds){
 const path=route.slice();let position={...start},remaining=220*Math.max(0,Math.min(seconds,.05));
 while(path.length&&remaining>0){const goal=path[0],distance=Math.hypot(goal.x-position.x,goal.y-position.y);if(distance<=remaining){position={...goal};path.shift();remaining-=distance;}else{position={x:position.x+(goal.x-position.x)*remaining/distance,y:position.y+(goal.y-position.y)*remaining/distance};remaining=0;}}
 return {position,path,dx:position.x-start.x,dy:position.y-start.y,moving:Math.hypot(position.x-start.x,position.y-start.y)>.00001};
}
