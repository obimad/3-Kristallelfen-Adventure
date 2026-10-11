import { facingDirection } from './animation.js';

export function followFina(muck,fina,seconds){
  const amount=1-Math.exp(-7*Math.max(0,Math.min(seconds,.05)));
  const trailingX=fina.x-120*(fina.facing??1);
  const dx=(trailingX-muck.x)*amount;
  const dy=(fina.y-180-muck.y)*amount;
  const angle=Math.hypot(dx,dy)>.1?Math.atan2(dy,Math.abs(dx)):(muck.angle??0)*(1-amount);
  return {x:muck.x+dx,y:muck.y+dy,angle,facing:facingDirection(dx,muck.facing??1)};
}
