// Generated atlases do not necessarily obey a rectangular grid. Isolate connected
// silhouettes before drawing so neighbouring heads, capes and feet cannot leak in.
export function spriteComponents(rgba,width,height,columns,rows){
 const visited=new Uint8Array(width*height),components=[];
 for(let p=0;p<visited.length;p++){
  if(visited[p]||rgba[p*4+3]<120)continue;
  const queue=[p],pixels=[];visited[p]=1;let left=width,top=height,right=0,bottom=0;
  while(queue.length){
   const i=queue.pop(),x=i%width,y=Math.floor(i/width);pixels.push(i);
   left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
   for(const n of [x>0?i-1:-1,x<width-1?i+1:-1,y>0?i-width:-1,y<height-1?i+width:-1]){
    if(n>=0&&!visited[n]&&rgba[n*4+3]>=120){visited[n]=1;queue.push(n);}
   }
  }
  components.push({pixels,left,top,right,bottom});
 }
 const count=columns*rows,largest=components.sort((a,b)=>b.pixels.length-a.pixels.length).slice(0,count);
 if(largest.length!==count||largest.at(-1).pixels.length<largest[0].pixels.length*.12)return [];
 largest.sort((a,b)=>(a.top+a.bottom)-(b.top+b.bottom));
 return Array.from({length:rows},(_,r)=>largest.slice(r*columns,(r+1)*columns).sort((a,b)=>(a.left+a.right)-(b.left+b.right))).flat();
}
const prepared=new WeakMap();
export function prepareSpriteFrames(image,columns,rows){
 const surface=document.createElement('canvas');surface.width=image.width;surface.height=image.height;
 const ctx=surface.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const source=ctx.getImageData(0,0,image.width,image.height),parts=spriteComponents(source.data,image.width,image.height,columns,rows);
 if(!parts.length){console.warn('Sprite atlas rejected: overlapping or missing figures',image.src);return false;}
 const frames=parts.map(part=>{
  const padding=3,left=Math.max(0,part.left-padding),top=Math.max(0,part.top-padding);
  const width=Math.min(image.width-1,part.right+padding)-left+1,height=Math.min(image.height-1,part.bottom+padding)-top+1;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const c=canvas.getContext('2d'),output=c.createImageData(width,height),mask=new Uint8Array(width*height);
  for(const pixel of part.pixels){const x=pixel%image.width-left,y=Math.floor(pixel/image.width)-top;
   for(let dy=-padding;dy<=padding;dy++)for(let dx=-padding;dx<=padding;dx++){
    const u=x+dx,v=y+dy;if(u>=0&&u<width&&v>=0&&v<height)mask[v*width+u]=1;
   }
  }
  for(let i=0;i<mask.length;i++)if(mask[i]){
   const p=((Math.floor(i/width)+top)*image.width+i%width+left)*4;
   output.data.set(source.data.subarray(p,p+4),i*4);
  }
  c.putImageData(output,0,0);return canvas;
 });
 prepared.set(image,{columns,frames});return true;
}
export function spriteFrame(image,column,row=0){const atlas=image&&prepared.get(image);return atlas?.frames[row*atlas.columns+column];}
export function drawSpriteFrame(ctx,image,column,row,height){
 const frame=spriteFrame(image,column,row);if(!frame)return false;
 const width=height*frame.width/frame.height;ctx.drawImage(frame,-width/2,-height,width,height);return true;
}
