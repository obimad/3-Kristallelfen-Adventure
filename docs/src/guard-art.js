export function drawGuardSprite(ctx,image,enemy,playerX){
  if(!image)return;
  const height=enemy.h*1.3,width=height*image.width/image.height;
  ctx.save();ctx.translate(enemy.x,enemy.y);ctx.scale(playerX<enemy.x?1:-1,1);
  ctx.drawImage(image,-width/2,-height,width,height);
  if(enemy.frozen){ctx.fillStyle='#b9efff55';ctx.strokeStyle='#e6fbff';ctx.lineWidth=2;ctx.fillRect(-width/2,-height,width,height);ctx.strokeRect(-width/2,-height,width,height);}
  ctx.restore();
}
