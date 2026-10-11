// Logical stage coordinates, calibrated per illustrated location (1600 × 900).
const profile = (horizon, height, entry, exit, lanes = []) => ({horizon,height,entry,exit,ground:[120,650,1480,875],lanes});
export const STORY_SPACES = {
 cirrus:profile(220,325,[{x:-120,y:810}],[{x:1220,y:720},{x:1260,y:590}]),
 kumulus:profile(190,325,[{x:300,y:1020}],[{x:950,y:790},{x:950,y:1050}]),
 wolkenseglerflug:profile(210,325,[{x:450,y:1020}],[{x:430,y:650},{x:350,y:380}],[[280,370,510,750]]),
 muck:profile(180,330,[{x:790,y:1020}],[{x:1380,y:640},{x:1440,y:385}],[[1280,375,1480,750]]),
 sandfaenger:profile(170,330,[{x:450,y:1050}],[{x:1300,y:790},{x:1650,y:790}]),
 stadttor:profile(210,330,[{x:350,y:1020}],[{x:800,y:700},{x:810,y:555}],[[700,550,915,750]]),
 cold:profile(200,335,[{x:430,y:1020}],[{x:1360,y:790},{x:1670,y:790}]),
 powdery:profile(180,335,[{x:430,y:1020}],[{x:880,y:660},{x:795,y:500}],[[720,495,995,750]]),
 icy:profile(170,335,[{x:510,y:1020}],[{x:995,y:650},{x:1010,y:410}],[[920,405,1080,750]]),
 schneeschleusen:profile(130,345,[{x:450,y:1020}],[{x:1270,y:790},{x:1650,y:790}]),
 wolkenhain:profile(180,330,[{x:800,y:530},{x:800,y:720}],[{x:800,y:780},{x:800,y:1050}],[[710,520,900,750]]),
 aria:profile(-130,370,[{x:430,y:1050}],[{x:430,y:790},{x:430,y:1050}]),
 regis_intrige:profile(-100,370,[{x:450,y:1050}],[{x:450,y:790},{x:450,y:1050}]),
 thronsturz:profile(-180,365,[{x:450,y:1050}],[{x:450,y:790},{x:450,y:1050}]),
 funkels_warnung:profile(190,335,[{x:-120,y:775}],[{x:1260,y:715},{x:1540,y:640}]),
 kristallwerkstatt:profile(-180,365,[{x:470,y:1050}],[{x:470,y:790},{x:470,y:1050}]),
 observatorium:profile(-180,365,[{x:470,y:1050}],[{x:470,y:790},{x:470,y:1050}]),
 mondtaugarten:profile(170,330,[{x:450,y:1050}],[{x:800,y:660},{x:800,y:510}],[[710,500,900,750]]),
 wasserverlies:profile(-220,370,[{x:430,y:1050}],[{x:430,y:790},{x:430,y:1050}]),
 h2o_wende:profile(-220,370,[{x:430,y:1050}],[{x:430,y:790},{x:430,y:1050}]),
 befreiung:profile(-150,375,[{x:150,y:550},{x:260,y:700}],[{x:1380,y:700},{x:1460,y:540}],[[120,535,350,750],[1320,535,1480,750]]),
 regis_finale:profile(-220,375,[{x:430,y:1050}],[{x:790,y:720},{x:800,y:1050}]),
 ehrung:profile(-180,365,[{x:450,y:1050}],[{x:450,y:790},{x:450,y:1050}]),
 epilog:profile(120,340,[{x:430,y:1050}],[{x:430,y:790},{x:430,y:1050}]),
};
export const storySpace=id=>STORY_SPACES[typeof id==='string'?id:id?.id]??STORY_SPACES.cirrus;
export function storyActorHeight(scene,actor,feetY){
 const space=storySpace(scene),reference=actor.id==='fina'?785:actor.y??785;
 const height=actor.id==='fina'?space.height:actor.height??310;
 return height*Math.max(.2,Math.min(1.45,(feetY-space.horizon)/(reference-space.horizon)));
}
export function storyWalkable(p,scene){
 if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
 const space=storySpace(scene);
 return [space.ground,...space.lanes].some(([l,t,r,b])=>p.x>=l&&p.x<=r&&p.y>=t&&p.y<=b);
}
export const storyPortal=(scene,direction='exit')=>storySpace(scene)[direction].map(p=>({...p}));
