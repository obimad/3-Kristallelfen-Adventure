// Four human workers, in the costumes from the supplied stage reference.
const WORKERS=[
  {id:'sand_worker_1',x:460,y:660,height:230,source:[185,0,420,635],stream:[.72,.36,.12,.2]},
  {id:'sand_worker_2',x:1020,y:685,height:245,source:[740,15,385,620],stream:[.45,.42,.1,.13]},
  {id:'sand_worker_3',x:1240,y:760,height:175,source:[90,685,470,525],stream:[.62,.58,.25,.25]},
  {id:'sand_worker_4',x:680,y:725,height:255,source:[775,630,390,615],stream:[.82,.4,.12,.24]},
];
export function sandWorkers(sceneId){return sceneId==='sandfaenger'?WORKERS:[];}
export function sandGrains(worker,time,reduced=false){
  const [x,y,spread,length]=worker.stream;
  return Array.from({length:14},(_,i)=>({
    x:x+Math.sin(i*2.4)*spread/2,
    y:y+(((reduced?0:time)/1900+i/14)%1)*length,
    radius:1+i%2*.3,
  }));
}
export function drawSandWorker(ctx,image,worker,time,reduced=false){
  if(!image)return;
  const [sx,sy,sw,sh]=worker.source,width=worker.height*sw/sh;
  const x=worker.x-width/2,y=worker.y-worker.height;
  ctx.save();
  ctx.fillStyle='#173b4b24';ctx.beginPath();ctx.ellipse(worker.x,worker.y-2,width*.28,6,0,0,Math.PI*2);ctx.fill();
  ctx.drawImage(image,sx*image.width/1280,sy*image.height/1280,sw*image.width/1280,sh*image.height/1280,x,y,width,worker.height);
  ctx.fillStyle='#fff0a7';
  for(const grain of sandGrains(worker,time,reduced)){
    ctx.beginPath();ctx.arc(x+grain.x*width,y+grain.y*worker.height,grain.radius,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}
