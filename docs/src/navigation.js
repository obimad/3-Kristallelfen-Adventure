export const WALK_POLYGON = [[440,760],[670,600],[700,550],[875,550],[965,650],[1235,800],[1150,898],[450,898]];
const TABLE={left:310,right:610,top:640,bottom:812};
// Exakte Intervallüberschneidung: Auch ein sehr kurzer Eckenschnitt zählt.
function hitsTable(start,end){
  let enter=0,leave=1;
  for(const [axis,min,max] of [['x',TABLE.left,TABLE.right],['y',TABLE.top,TABLE.bottom]]){
    const delta=end[axis]-start[axis];
    if(delta===0){if(start[axis]<min||start[axis]>max)return false;continue;}
    const a=(min-start[axis])/delta,b=(max-start[axis])/delta;
    enter=Math.max(enter,Math.min(a,b));leave=Math.min(leave,Math.max(a,b));
    if(enter>leave)return false;
  }
  return true;
}
export function isWalkable(p) {
  if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return false;
  // Tischplatte und Beine einschließlich Platz für Finas Füße.
  if(p.x>=TABLE.left&&p.x<=TABLE.right&&p.y>=TABLE.top&&p.y<=TABLE.bottom)return false;
  let inside=false;
  for(let i=0,j=WALK_POLYGON.length-1;i<WALK_POLYGON.length;j=i++) {
    const [xi,yi]=WALK_POLYGON[i], [xj,yj]=WALK_POLYGON[j];
    if(((yi>p.y)!==(yj>p.y)) && p.x<(xj-xi)*(p.y-yi)/(yj-yi)+xi) inside=!inside;
  }
  return inside;
}
export function move(p,d,seconds) {
  const length=Math.hypot(d.x,d.y);
  if(!length) return {...p};
  const distance=220*Math.max(0,Math.min(seconds,.05));
  const step={x:d.x/length*distance,y:d.y/length*distance};
  const next={...p};
  const horizontal={x:next.x+step.x,y:next.y};
  if(isWalkable(horizontal)&&!hitsTable(p,horizontal)) next.x=horizontal.x;
  const vertical={x:next.x,y:next.y+step.y};
  // Die sichtbare Bewegung verbindet Anfang und Ende direkt, auch beim Gleiten.
  if(isWalkable(vertical)&&!hitsTable(p,vertical)) next.y=vertical.y;
  return next;
}
export function advancePath(start,route,seconds){
  const path=route.slice();let position={...start},remaining=220*Math.max(0,Math.min(seconds,.05)),dx=0;
  while(path.length&&remaining>.00001){
    const goal=path[0],distance=Math.hypot(goal.x-position.x,goal.y-position.y);
    if(distance<.00001){path.shift();continue;}
    const before=position,step=Math.min(distance,remaining);
    position=move(position,{x:goal.x-position.x,y:goal.y-position.y},step/220);
    const travelled=Math.hypot(position.x-before.x,position.y-before.y);
    if(travelled<.00001)break;
    if(Math.abs(position.x-before.x)>.01)dx=position.x-before.x;
    remaining-=travelled;
    if(Math.hypot(goal.x-position.x,goal.y-position.y)<.00001){position={...goal};path.shift();}
  }
  return {position,path,dx,dy:position.y-start.y,moving:Math.hypot(position.x-start.x,position.y-start.y)>.00001};
}
export function findPath(start,goal) {
  if(!isWalkable(start)||!isWalkable(goal)) return [];
  const grid=24;
  const key=p=>`${p.x},${p.y}`;
  const snap=p=>({x:Math.round(p.x/grid)*grid,y:Math.round(p.y/grid)*grid});
  const nearest=p=>{
    const s=snap(p);
    for(let r=0;r<4;r++) for(let dx=-r;dx<=r;dx++) for(let dy=-r;dy<=r;dy++) {
      const q={x:s.x+dx*grid,y:s.y+dy*grid};if(isWalkable(q)) return q;
    }
    return null;
  };
  const first=nearest(start),last=nearest(goal);
  if(!first||!last) return [];
  const open=[first],came=new Map(),cost=new Map([[key(first),0]]),points=new Map([[key(first),first]]);
  let n=0;
  while(open.length&&n++<3000) {
    open.sort((a,b)=>(cost.get(key(a))+Math.hypot(a.x-last.x,a.y-last.y))-(cost.get(key(b))+Math.hypot(b.x-last.x,b.y-last.y)));
    const current=open.shift(),ck=key(current);
    if(ck===key(last)) {
      const result=[];let k=ck;
      while(k){result.unshift(points.get(k));k=came.get(k);}
      if(isWalkable(goal)) result.push({...goal});
      // Lange freie Abschnitte direkt gehen, statt an jedem Rasterpunkt abzubiegen.
      const compact=[];let anchor=start,index=0;
      while(index<result.length){
        let furthest=index;
        for(let j=result.length-1;j>=index;j--){
          const target=result[j],steps=Math.max(1,Math.ceil(Math.hypot(target.x-anchor.x,target.y-anchor.y)/4));
          let clear=!hitsTable(anchor,target);
          for(let k=1;k<=steps;k++)if(!isWalkable({x:anchor.x+(target.x-anchor.x)*k/steps,y:anchor.y+(target.y-anchor.y)*k/steps})){clear=false;break;}
          if(clear){furthest=j;break;}
        }
        compact.push(result[furthest]);anchor=result[furthest];index=furthest+1;
      }
      return compact;
    }
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const next={x:current.x+dx*grid,y:current.y+dy*grid},nk=key(next);
      if(!isWalkable(next)) continue;
      const g=cost.get(ck)+grid;
      if(g>=(cost.get(nk)??Infinity)) continue;
      came.set(nk,ck);cost.set(nk,g);points.set(nk,next);
      if(!open.some(p=>key(p)===nk))open.push(next);
    }
  }
  return [];
}
