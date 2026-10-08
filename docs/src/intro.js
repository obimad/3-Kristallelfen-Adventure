export function createOpeningIntro({overlay,skip,startScreen,controls,reducedMotion,onFinish,schedule=setTimeout,cancel=clearTimeout}){
  let active=false,timer,previousControls=[];
  function finish(){
    if(!active)return false;
    active=false;cancel(timer);overlay.hidden=true;overlay.classList.remove('is-playing');
    previousControls.forEach(([control,inert])=>control.inert=inert);
    onFinish();return true;
  }
  function play(){
    if(active)return false;
    active=true;previousControls=controls.map(control=>[control,control.inert]);
    controls.forEach(control=>control.inert=true);
    startScreen.hidden=true;overlay.dataset.motion=reducedMotion?'reduced':'full';
    overlay.hidden=false;overlay.classList.add('is-playing');
    timer=schedule(finish,reducedMotion?1600:5600);skip.focus();return true;
  }
  skip.addEventListener('click',finish);
  overlay.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();finish();}});
  return {play};
}
