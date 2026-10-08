import { facingDirection } from './animation.js';

export function followFina(muck,fina,seconds){
  const amount=1-Math.exp(-7*Math.max(0,Math.min(seconds,.05)));
  const dx=(fina.x+80-muck.x)*amount;
  return {x:muck.x+dx,y:muck.y+(fina.y-180-muck.y)*amount,facing:facingDirection(dx,muck.facing??1)};
}
