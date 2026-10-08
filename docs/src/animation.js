export function animationFrame(elapsed,moving,reducedMotion){return moving&&!reducedMotion?Math.floor(elapsed*8)%8:0;}
export function facingDirection(dx,previous){return dx<-.01?-1:dx>.01?1:previous;}
export function viewDirection(delta,previous){
  if(Math.hypot(delta.x,delta.y)<.01)return previous;
  return Math.abs(delta.y)>Math.abs(delta.x)?(delta.y<0?'back':'front'):'side';
}
export function idlePose(time,phase=0,reducedMotion=false){
  if(reducedMotion)return {scaleY:1,tilt:0};
  return {scaleY:1+.009*Math.sin(time/3200*Math.PI*2+phase),tilt:.006*Math.sin(time/5500*Math.PI*2+phase)};
}
