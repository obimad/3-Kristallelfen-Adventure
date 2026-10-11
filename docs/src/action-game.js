export const ACTION_MISSIONS={
  grove:{hero:'fina',title:'Vier gegen die Nebelwache',goal:'Öffne drei Frostsiegel und erreiche den Ausgang.',length:3000},
  cold:{hero:'cold',title:'Cold hält den Gang',goal:'Halte die Wachen zurück, bis die anderen entkommen sind.',length:2200,hold:28},
  powdery:{hero:'powdery',title:'Powderys Schneeschleier',goal:'Sichere drei Türsiegel und erreiche den Kartengang.',length:2600},
  icy:{hero:'icy',title:'Icys letzter Vorsprung',goal:'Überwinde die Wasserstrahlen und öffne den Weg für Fina.',length:2800},
  muck:{hero:'muck',title:'Muck gegen Regis',goal:'Fliege durch die Lücken zu Regis und unterbrich seinen Zauber.',length:2600},
};
const overlap=(a,b)=>Math.abs(a.x-b.x)<(a.w+b.w)/2&&Math.abs(a.y-a.h/2-(b.y-b.h/2))<(a.h+b.h)/2;
export function ringOrigin(s){return {x:s.player.x+s.player.facing*({fina:-17,cold:-28,powdery:-26,icy:-28}[s.config.hero]??0),y:s.player.y-55};}
export function createActionGame(mission='grove'){
  const config=ACTION_MISSIONS[mission]??ACTION_MISSIONS.grove;
  return {mission,config,length:config.length,elapsed:0,paused:false,status:'playing',gentle:false,
    player:{x:100,y:730,w:48,h:100,vy:0,facing:1,hp:5,invulnerable:0,attack:0,magic:0,onGround:true},
    enemies:[620,1080,1620,2050,2420].filter(x=>x<config.length-150).map((x,i)=>({x,y:730,w:52,h:95,hp:2,shot:1+i*.35,frozen:0,home:x})),
    platforms:[{x:880,y:590,w:240,h:25},{x:1530,y:540,w:240,h:25},{x:2150,y:610,w:200,h:25}],
    seals:config.hero==='muck'?[]:[700,1450,config.length-450].map(x=>({x,y:680,w:55,h:65,open:false})),
    hazards:config.hero==='muck'?[{x:740,gap:440},{x:1260,gap:620},{x:1850,gap:400}]:[],rings:[],shots:[],snow:0,lastJump:false,lastAttack:false,lastMagic:false};
}
export function stepActionGame(s,input,dt){
  if(s.paused||s.status!=='playing')return;
  dt=Math.min(.05,Math.max(0,dt));s.elapsed+=dt;
  const p=s.player,fly=s.config.hero==='muck';
  const dx=Number(!!input.right)-Number(!!input.left);if(dx)p.facing=dx;
  p.moving=dx!==0;
  p.x=Math.max(35,Math.min(s.length-35,p.x+dx*310*dt));
  if(fly){p.y=Math.max(300,Math.min(730,p.y+(Number(!!input.down)-Number(!!input.up))*320*dt));}
  else{
    if(input.jump&&!s.lastJump&&p.onGround){p.vy=-650;p.onGround=false;}
    const previousY=p.y;p.vy+=1550*dt;p.y+=p.vy*dt;p.onGround=false;
    const surfaces=[{x:s.length/2,y:730,w:s.length},...s.platforms];
    for(const surface of surfaces)if(p.vy>=0&&previousY<=surface.y&&p.y>=surface.y&&Math.abs(p.x-surface.x)<surface.w/2+p.w/2){p.y=surface.y;p.vy=0;p.onGround=true;break;}
  }
  for(const key of ['invulnerable','attack','magic'])p[key]=Math.max(0,p[key]-dt);
  if(input.attack&&p.attack===0&&!fly){const origin=ringOrigin(s);s.rings.push({...origin,y:origin.y+15,w:30,h:30,vx:p.facing*650,life:1.2});p.attack=.32;}
  if(input.magic&&!s.lastMagic&&p.magic===0){
    p.magic=4.5;
    if(s.config.hero==='powdery'){s.snow=2.5;s.shots=[];}
    else if(fly){p.invulnerable=1.2;p.x=Math.min(s.length-35,p.x+p.facing*150);}
    else{for(const enemy of s.enemies)if(Math.abs(enemy.x-p.x)<420)enemy.frozen=2.8;s.shots=s.shots.filter(b=>Math.abs(b.x-p.x)>420);}
    for(const seal of s.seals)if(Math.abs(seal.x-p.x)<240)seal.open=true;
  }
  s.lastJump=!!input.jump;s.lastAttack=!!input.attack;s.lastMagic=!!input.magic;s.snow=Math.max(0,s.snow-dt);
  for(const enemy of s.enemies){
    if(enemy.hp<=0)continue;enemy.frozen=Math.max(0,enemy.frozen-dt);if(enemy.frozen)continue;
    enemy.x=enemy.home+Math.sin(s.elapsed*.9+enemy.home)*55;
    enemy.shot-=dt;
    if(enemy.shot<=0){enemy.shot=s.gentle?2.8:1.7;const vx=p.x<enemy.x?-270:270;s.shots.push({x:enemy.x,y:enemy.y-45,w:24,h:24,vx,life:4});}
  }
  for(const ring of s.rings){
    ring.x+=ring.vx*dt;ring.life-=dt;
    for(const enemy of s.enemies)if(enemy.hp>0&&overlap(ring,enemy)){enemy.hp--;ring.life=0;break;}
    for(const seal of s.seals)if(!seal.open&&overlap(ring,seal)){seal.open=true;ring.life=0;break;}
  }
  const hurt=()=>{if(!p.invulnerable&&s.snow===0){if(!s.gentle)p.hp--;p.invulnerable=1.3;if(p.hp<=0)s.status='lost';}};
  for(const shot of s.shots){shot.x+=shot.vx*dt;shot.life-=dt;if(overlap(shot,p)){hurt();shot.life=0;}}
  for(const enemy of s.enemies)if(enemy.hp>0&&!enemy.frozen&&overlap(enemy,p))hurt();
  if(fly)for(const hazard of s.hazards)if(Math.abs(p.x-hazard.x)<35&&Math.abs(p.y-45-hazard.gap)>85)hurt();
  s.rings=s.rings.filter(b=>b.life>0);s.shots=s.shots.filter(b=>b.life>0);
  if(s.config.hold){if(s.elapsed>=s.config.hold)s.status='won';}
  else if(fly){if(p.x>=s.length-130&&p.y>=650&&input.attack)s.status='won';}
  else if(p.x>=s.length-100&&s.seals.every(seal=>seal.open)&&s.enemies.every(enemy=>enemy.hp<=0))s.status='won';
}
