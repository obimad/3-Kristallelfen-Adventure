import {drawSpriteFrame} from './sprite-frames.js';
const ELF_ROWS={cold:0,powdery:1,icy:2};
const CAST_ROWS={cirrus:['castTravelWalk',0],kian:['castTravelWalk',1],aria:['castTravelWalk',2],h:['castH2oWalk',0],two:['castH2oWalk',1],o:['castH2oWalk',2],regis:['castRoyalWalk',0],silba:['castRoyalWalk',1],kristallfee:['castRoyalWalk',2],chrysta:['castMastersWalk',0],chrystel:['castMastersWalk',1],christi:['castMastersWalk',2]};
export function actorFrame(actor,time){return actor.walking?Math.floor(time/160)%4:0;}
export function drawMovingActor(ctx,images,img,actor,time){
  if(!img)return;
  const height=actor.height??280,frame=actorFrame(actor,time);
  const elf=ELF_ROWS[actor.id];
  const cast=CAST_ROWS[actor.id],sheet=cast?images[cast[0]]:elf!==undefined?(images.elfWalkFull??images.elfWalk):null;
  ctx.save();ctx.translate(actor.x,actor.y);ctx.scale(actor.facing??1,1);
  const drawn=sheet&&drawSpriteFrame(ctx,sheet,frame,cast?cast[1]:elf,height);
  if(!drawn){
    // Supporting cast keeps its own artwork; footsteps only move the lower leg silhouettes.
    const width=height*img.width/img.height,split=img.height*.72,upperHeight=height*.72;
    ctx.drawImage(img,0,0,img.width,split,-width/2,-height,width,upperHeight);
    for(let leg=0;leg<2;leg++){
      const stride=Math.sin(time/180+leg*Math.PI)*3;
      ctx.drawImage(img,leg*img.width/2,split,img.width/2,img.height-split,-width/2+leg*width/2+stride,-height+upperHeight,width/2,height-upperHeight);
    }
  }
  ctx.restore();
}
