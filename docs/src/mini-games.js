export const MINI_GAMES={
  sand:{title:'Hilf den Sandfängern',goal:'Fange zwölf feine goldene Körner. Graue Steine gehören nicht in die Probe.',help:'← → / A D oder das Netz mit Maus und Finger verschieben.'},
  snow:{title:'Freie Bahn für die Glitzerlinge',goal:'Löse den Flockenstau: Der Frostfunke befreit alle festgefrorenen Kristalle.',help:'Bewege die Wolkenkelle mit ← → / A D, Maus oder Finger. Lass den Frostfunken nicht fallen.'},
  slide:{title:'Chrystels Schneekristallmodell',goal:'Setze die neun Felder zur Schneeflocke zusammen. Unten rechts bleibt das freie Feld.',help:'Klicke ein Feld neben der Lücke. Die Zielansicht zeigt das fertige Modell.'},
  mirror:{title:'Licht für Christis Wolkenkarte',goal:'Lenke das Himmelslicht über beide Spiegel auf die Karte.',help:'Drehe die beiden Spiegel. Beobachte, wohin der Strahl nach jeder Drehung läuft.'},
};
export function createMiniGame(kind){
  const s={kind,config:MINI_GAMES[kind],paused:false,status:'playing',elapsed:0,gentle:false,score:0,target:12,paddle:800,drops:[],spawn:0,serial:0,
    ball:{x:800,y:650,vx:240,vy:-290},blocks:[],mirrors:[0,2],tiles:[1,2,3,4,5,6,7,8,0],moves:0};
  if(kind==='snow')for(let row=0;row<2;row++)for(let col=0;col<6;col++)s.blocks.push({x:340+col*180,y:310+row*70,w:145,h:40,active:true});
  if(kind==='slide')for(const index of [7,4,3,6,7,8,5,4,7,6,3,4]){const empty=s.tiles.indexOf(0);if(Math.abs(index%3-empty%3)+Math.abs(Math.floor(index/3)-Math.floor(empty/3))===1)[s.tiles[index],s.tiles[empty]]=[s.tiles[empty],s.tiles[index]];}
  return s;
}
export function moveTile(s,index){
  if(s.kind!=='slide'||s.paused||s.status!=='playing'||index<0||index>8)return false;
  const empty=s.tiles.indexOf(0);
  if(Math.abs(index%3-empty%3)+Math.abs(Math.floor(index/3)-Math.floor(empty/3))!==1)return false;
  [s.tiles[index],s.tiles[empty]]=[s.tiles[empty],s.tiles[index]];s.moves++;
  if(s.tiles.every((value,i)=>value===(i+1)%9))s.status='won';return true;
}
export function mirrorPath(s){
  const points=[[460,280],[460,440]];
  const first=s.mirrors[0],second=s.mirrors[1];
  // Incoming vertical beam; 45-degree mirror reflects it right to the next one.
  if(first!==1){points.push(first===3?[240,440]:first===0?[460,280]:[460,650]);return {points,connected:false};}
  points.push([950,440]);
  if(second!==1){points.push(second===3?[950,260]:second===2?[700,440]:[1270,440]);return {points,connected:false};}
  points.push([950,680]);return {points,connected:true};
}
export function turnMirror(s,index){
  if(s.kind!=='mirror'||s.paused||s.status!=='playing'||![0,1].includes(index))return false;
  s.mirrors[index]=(s.mirrors[index]+1)%4;s.moves++;
  if(mirrorPath(s).connected)s.status='won';return true;
}
export function stepMiniGame(s,input,dt){
  if(s.paused||s.status!=='playing')return;dt=Math.max(0,Math.min(.05,dt));s.elapsed+=dt;
  if(Number.isFinite(input.x))s.paddle=Math.max(170,Math.min(1430,input.x));
  else s.paddle=Math.max(170,Math.min(1430,s.paddle+(Number(!!input.right)-Number(!!input.left))*650*dt));
  if(s.kind==='sand'){
    s.spawn-=dt;if(s.spawn<=0){s.spawn=s.gentle?.8:.6;s.serial++;s.drops.push({x:250+(s.serial*173)%1100,y:240,kind:s.serial%4===0?'stone':'sand'});}
    for(const drop of s.drops){drop.y+=(s.gentle?130:210)*dt;
      if(drop.y>=710&&drop.y<=760&&Math.abs(drop.x-s.paddle)<(s.gentle?160:95)){if(drop.kind==='sand')s.score++;drop.y=950;}
    }
    s.drops=s.drops.filter(drop=>drop.y<850);if(s.score>=s.target)s.status='won';
  }else if(s.kind==='snow'){
    const b=s.ball,previous={x:b.x,y:b.y};b.x+=b.vx*dt*(s.gentle?.7:1);b.y+=b.vy*dt*(s.gentle?.7:1);
    if(b.x<160||b.x>1440){b.x=Math.max(160,Math.min(1440,b.x));b.vx=-b.vx;}
    if(b.y<245){b.y=245;b.vy=Math.abs(b.vy);}
    if(b.vy>0&&previous.y<710&&b.y>=710&&Math.abs(b.x-s.paddle)<(s.gentle?175:115)){b.y=710;b.vy=-Math.abs(b.vy);const vx=(b.x-s.paddle)*2.5;b.vx=Math.sign(vx||b.vx||1)*Math.max(120,Math.abs(vx));}
    if(b.y>810)s.ball={x:s.paddle,y:650,vx:180,vy:-290};
    for(const block of s.blocks)if(block.active&&Math.abs(b.x-block.x)<block.w/2+12&&Math.abs(b.y-block.y)<block.h/2+12){block.active=false;s.score++;if(Math.abs(previous.x-block.x)>=block.w/2+12)b.vx=-b.vx;else b.vy=-b.vy;break;}
    if(s.blocks.every(block=>!block.active))s.status='won';
  }
}
