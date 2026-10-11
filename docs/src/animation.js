export function animationFrame(elapsed,moving,reducedMotion){return moving&&!reducedMotion?Math.floor(elapsed*8)%8:0;}
export function facingDirection(dx,previous){return dx<-.01?-1:dx>.01?1:previous;}
export function viewDirection(delta,previous){
  if(Math.hypot(delta.x,delta.y)<.01)return previous;
  return Math.abs(delta.y)>Math.abs(delta.x)?(delta.y<0?'back':'front'):'side';
}
export const heroView=state=>state.moving?state.view:'front';
export function idlePose(time,phase=0,reducedMotion=false){
  return {scaleY:1,tilt:0};
}
/** Keep head and feet fixed; only a small part of the clothing shifts below a pixel. */
export function drawQuietSprite(ctx,img,x,y,width,height,time,phase=0,reduced=false){
  if(reduced){ctx.drawImage(img,x,y,width,height);return;}
  const bands=24,swing=Math.sin(time/6000+phase)*.65;
  for(let band=0;band<bands;band++){
    const p=(band+.5)/bands,envelope=p>.42&&p<.84?Math.sin((p-.42)/.42*Math.PI):0;
    const sy=band*img.height/bands,sh=img.height/bands;
    ctx.drawImage(img,0,sy,img.width,sh,x+envelope*swing,y+band*height/bands,width,height/bands);
  }
}
