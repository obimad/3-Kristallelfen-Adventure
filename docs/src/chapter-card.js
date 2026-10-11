import { chapterTracksForScene } from './soundtrack-data.js';

export function createChapterCard({overlay,image,title,label,narrative,continueButton,music,controls,onSceneMusic=()=>{}}){
  let continuation=null,previousControls=[];
  function show(scene,onContinue){
    if(continuation)return false;
    continuation=()=>{onSceneMusic(scene);onContinue();};previousControls=controls.map(control=>[control,control.inert]);
    controls.forEach(control=>control.inert=true);
    image.src=scene.background;image.alt=`Kapitelbild: ${scene.title}`;
    title.textContent=scene.title;label.textContent=`KAPITEL ${scene.chapter??1}`;
    if(narrative)narrative.textContent=scene.chapterText??'In Farbenquell werden die Farben des Himmels vorbereitet. Hier lebt Fina. Colorida, die Anführerin von Farbenquell, hat alle zusammengerufen. Auch Finas Freundin Vivid ist dabei. Fina steht vor einem großen Aufbruch: Seit einem Jahr ist ihre Mutter Silba verschwunden. Sie möchte wie ihre Mutter eine Kristallelfe werden und hofft, in der Himmelsstadt eine Spur von ihr zu finden. Bevor sie ihr Zuhause verlässt, spricht sie mit Vivid und Colorida und nimmt Abschied.';
    overlay.hidden=false;music.play(chapterTracksForScene(scene.id));continueButton.focus();return true;
  }
  function next(){
    if(!continuation)return;
    const done=continuation;continuation=null;overlay.hidden=true;music.stop();
    previousControls.forEach(([control,inert])=>control.inert=inert);done();
  }
  continueButton.addEventListener('click',next);
  return {show};
}
