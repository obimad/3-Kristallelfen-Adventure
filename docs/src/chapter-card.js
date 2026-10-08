import { originalTracksForScene } from './soundtrack-data.js';

export function createChapterCard({overlay,image,title,label,continueButton,music,controls}){
  let continuation=null,previousControls=[];
  function show(scene,onContinue){
    if(continuation)return false;
    continuation=onContinue;previousControls=controls.map(control=>[control,control.inert]);
    controls.forEach(control=>control.inert=true);
    image.src=scene.background;image.alt=`Kapitelbild: ${scene.title}`;
    title.textContent=scene.title;label.textContent=`KAPITEL ${scene.chapter??1}`;
    overlay.hidden=false;music.play(originalTracksForScene(scene.id));continueButton.focus();return true;
  }
  function next(){
    if(!continuation)return;
    const done=continuation;continuation=null;overlay.hidden=true;music.stop();
    previousControls.forEach(([control,inert])=>control.inert=inert);done();
  }
  continueButton.addEventListener('click',next);
  return {show};
}
