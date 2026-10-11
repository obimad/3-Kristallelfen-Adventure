// Four by four painted atlases. Every scene object has its own recognizable art.
const OBJECTS=[
  'cirrus_clue','kumulus_clue','wolkenseglerflug_clue','sandfaenger_clue',
  'stadttor_clue','powdery_clue','schneeschleusen_clue','kristallwerkstatt_clue',
  'observatorium_clue','mondtaugarten_clue','wasserverlies_clue','muck_detail',
  'cold_detail','icy_detail','wolkenhain_detail','aria_detail',
];
const TOOLS=[
  'funkels_warnung_detail','h2o_wende_detail','befreiung_detail','ehrung_detail',
  'epilog_detail','cirrus_tool','kumulus_tool','wolkenseglerflug_tool',
  'sandfaenger_tool','powdery_tool','schneeschleusen_tool','kristallwerkstatt_tool',
  'observatorium_tool','mondtaugarten_tool','wasserverlies_tool',
];
// Bounds in the generated 1280-pixel sheets, including soft painted edges.
// Individual bounds preserve tall banners and wide maps across nominal gutters.
const OBJECT_BOUNDS=[[40,10,278,310],[369,43,215,276],[638,10,294,310],[936,88,318,210],[10,322,315,315],[330,357,311,268],[637,325,333,298],[994,315,244,320],[57,621,223,313],[350,626,251,305],[633,645,295,285],[941,695,318,229],[25,942,277,295],[300,944,331,290],[638,944,296,292],[942,948,320,284]];
const TOOL_BOUNDS=[[17,35,342,315],[371,63,259,295],[636,83,302,246],[985,0,254,402],[8,383,366,270],[382,414,266,223],[683,431,273,200],[955,382,323,287],[8,664,349,279],[350,676,299,262],[657,659,284,292],[975,684,271,255],[8,969,338,257],[365,988,285,216],[652,944,290,294],[953,935,296,321]];
export function propArtwork(id){
  let key=id.replace(/^explore_/,'').replace(/_use$/,'_clue');
  if(key==='stadttor_tool')key='kumulus_tool';
  const index=OBJECTS.indexOf(key);
  if(index>=0)return {asset:'adventureProps',column:index%4,row:Math.floor(index/4),bounds:OBJECT_BOUNDS[index]};
  const tool=TOOLS.indexOf(key);
  return tool>=0?{asset:'adventureTools',column:tool%4,row:Math.floor(tool/4),bounds:TOOL_BOUNDS[tool]}:null;
}
export function propSource(atlas,art){const scaleX=atlas.width/1280,scaleY=atlas.height/1280;return art.bounds.map((n,i)=>n*(i%2?scaleY:scaleX));}
export function drawPaintedProp(ctx,images,h,done){
  const art=propArtwork(h.artId??h.id),atlas=images[art?.asset];
  if(!atlas)return;
  const source=propSource(atlas,art),onSpool=h.id==='explore_cirrus_tool',scale=Math.min((onSpool?46:112)/source[2],(onSpool?36:115)/source[3]),width=source[2]*scale;
  ctx.save();
  if(!onSpool){ctx.fillStyle='#183d4f22';ctx.beginPath();ctx.ellipse(h.x,h.y+35,34,6,0,0,Math.PI*2);ctx.fill();}
  const height=h.id==='explore_stadttor_tool'?30:source[3]*scale;
  ctx.drawImage(atlas,...source,h.x-width/2,h.y-height/2,width,height);
  if(done&&h.type!=='take'){
    // A small magical gleam acknowledges repairs without hiding the illustration.
    ctx.strokeStyle='#ecfaffaa';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(h.x+30,h.y-35);ctx.lineTo(h.x+30,h.y-25);ctx.moveTo(h.x+25,h.y-30);ctx.lineTo(h.x+35,h.y-30);ctx.stroke();
  }
  ctx.restore();
}
