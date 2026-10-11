const OUTDOORS=new Set(['farbenquell','cirrus','kumulus','wolkenseglerflug','muck','sandfaenger','stadttor','cold','powdery','icy','schneeschleusen','wolkenhain','funkels_warnung','mondtaugarten','epilog']);
const BIRDS=new Set(['farbenquell','cirrus','kumulus','sandfaenger','stadttor','schneeschleusen','mondtaugarten','epilog']);
export function cloudGliders(sceneId,time,reduced=false){
  if(sceneId!=='kumulus')return [];
  const t=reduced?0:time;
  return [{variant:0,offset:1000,y:285,width:110,speed:.018,direction:1},{variant:1,offset:1350,y:235,width:78,speed:.013,direction:1},{variant:2,offset:700,y:270,width:68,speed:.011,direction:-1},{variant:3,offset:1520,y:195,width:54,speed:.009,direction:1},{variant:4,offset:1000,y:180,width:44,speed:.007,direction:-1}].map((g,i)=>{
    const p=(t*g.speed+g.offset)%1920;
    return {...g,x:g.direction===1?p-160:1760-p,y:g.y+Math.sin(t/4200+i*2)*9,bank:reduced?0:Math.sin(t/5800+i)*.045,alpha:.76+i*.06};
  });
}
export function drawCloudGliders(ctx,image,sceneId,time,reduced=false,distant=null){
  if(!image)return;
  for(const glider of cloudGliders(sceneId,time,reduced)){
    const bounds=[[0,35,740,607],[681,65,589,607],[0,681,748,521],[680,686,590,544]];
    const source=glider.variant&&distant?bounds[glider.variant-1].map((n,i)=>n*(i%2?distant.height:distant.width)/1280):[0,0,image.width,image.height];
    const sprite=glider.variant&&distant?distant:image,height=glider.width*source[3]/source[2],nativeDirection=[0,2,4].includes(glider.variant)?(glider.variant===0?1:-1):1;
    ctx.save();ctx.translate(glider.x,glider.y);ctx.rotate(glider.bank);ctx.scale(glider.direction*nativeDirection,1);ctx.globalAlpha=Math.min(.92,glider.alpha);
    ctx.drawImage(sprite,...source,-glider.width/2,-height/2,glider.width,height);ctx.restore();
  }
}
export function worldLife(sceneId,time,reduced=false){
  if(reduced)return {clouds:[],birds:[]};
  const clouds=[],birds=[];
  if(OUTDOORS.has(sceneId))for(let i=0;i<4;i++){
    clouds.push({x:((time/(80+i*35)+i*470)%2100)-240,y:90+i*65+Math.sin(time/19000+i)*7,width:155+i*25,alpha:.12+i*.018});
  }
  // Flocks visit intermittently; they do not endlessly loop across every room.
  if(BIRDS.has(sceneId)){
    const phase=[...sceneId].reduce((n,c)=>n+c.charCodeAt(0),0)*37;
    const p=((time+phase)%41000)/1000;
    if(p<12)for(let i=0;i<5;i++)birds.push({x:-90+p*155-i*23,y:110+Math.sin(p*.7)*16+i*11,wing:Math.sin(time/95+i)*5,size:8+i%2});
  }
  return {clouds,birds};
}
export function drawWorldLife(ctx,sceneId,time,reduced=false){
  const life=worldLife(sceneId,time,reduced);ctx.save();
  for(const cloud of life.clouds){
    const gradient=ctx.createRadialGradient(cloud.x,cloud.y,5,cloud.x,cloud.y,cloud.width);
    gradient.addColorStop(0,'#fbffff');gradient.addColorStop(.65,'#d7eef9aa');gradient.addColorStop(1,'#d7eef900');
    ctx.globalAlpha=cloud.alpha;ctx.fillStyle=gradient;ctx.beginPath();ctx.ellipse(cloud.x,cloud.y,cloud.width,cloud.width*.2,0,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=.65;ctx.strokeStyle='#3f677c';ctx.lineWidth=2.2;
  for(const bird of life.birds){ctx.beginPath();ctx.moveTo(bird.x-bird.size,bird.y-bird.wing);ctx.quadraticCurveTo(bird.x-bird.size/2,bird.y-3,bird.x,bird.y);ctx.quadraticCurveTo(bird.x+bird.size/2,bird.y-3,bird.x+bird.size,bird.y-bird.wing);ctx.stroke();}
  if(!reduced&&!life.clouds.length){
    if(['kristallwerkstatt','observatorium'].includes(sceneId)){
      for(let i=0;i<6;i++){const alpha=Math.max(0,Math.sin(time/1700+i*2))*.25;ctx.globalAlpha=alpha;ctx.strokeStyle='#e1f7ff';ctx.lineWidth=2;const x=200+i*220,y=320+(i%3)*35;ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke();}
    }
    if(['wasserverlies','h2o_wende','befreiung','regis_finale'].includes(sceneId)){
      ctx.globalAlpha=.12;ctx.strokeStyle='#b2e5ff';ctx.lineWidth=4;
      for(let i=0;i<5;i++){ctx.beginPath();for(let x=40;x<1560;x+=20){const y=330+i*68+Math.sin(x/140+time/2200+i)*12;x===40?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}
    }
  }
  ctx.restore();
}
