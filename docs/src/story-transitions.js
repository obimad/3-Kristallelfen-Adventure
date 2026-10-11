import {storyPortal} from './story-space.js';
import {stageRoutePoint} from './opening-navigation.js';

export const isInterlude=scene=>['regis_intrige','thronsturz'].includes(scene.id);
export function createStoryTransition(scene,position,time,phase='out'){
 const route=phase==='out'?[{...position},...storyPortal(scene,'exit')]:[...storyPortal(scene,'entry'),{...position}];
 const distance=route.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-route[i].x,p.y-route[i].y),0);
 return {sceneId:scene.id,phase,route,startedAt:time,duration:Math.max(1500,Math.min(3500,distance/240*1000)),origin:{...position}};
}
export function storyTransitionPose(transition,time,reduced=false){
 const progress=reduced?1:Math.min(1,Math.max(0,(time-transition.startedAt)/transition.duration));
 const pose=progress===1?{...transition.route.at(-1),dx:0,dy:0}:stageRoutePoint(transition.route,progress);
 const fade=transition.phase==='out'?Math.max(0,(progress-.72)/.28):Math.max(0,1-progress*5);
 return {...pose,progress,fade,finished:progress===1};
}
