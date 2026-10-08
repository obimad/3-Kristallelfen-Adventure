let enabled=false,context,music,sceneSoundtrack,tracks={},trackNumber='01',volume=.35;
export async function loadMusic(){
  for(const path of ['Musik/manifest.json','/api/music']){
    try{const response=await fetch(path);if(response.ok){tracks=await response.json();break;}}catch{}
  }
  if(enabled&&!sceneSoundtrack)playMusic(trackNumber);
}
export function playMusic(number='01'){
  trackNumber=String(number).padStart(2,'0');
  if(sceneSoundtrack)return;
  const src=tracks[trackNumber];
  if(!src){music?.pause();return;}
  if(music?.dataset.track!==trackNumber){
    music?.pause();music?.remove();music=new Audio(src);music.id='background-music';music.hidden=true;music.dataset.track=trackNumber;music.loop=true;music.volume=volume;document.body.appendChild(music);
  }
  if(enabled)music.play().catch(()=>{});
}
export function setMusicVolume(value){volume=Math.min(1,Math.max(0,Number(value)||0));if(music)music.volume=volume;if(sceneSoundtrack)sceneSoundtrack.volume=volume;}
export function soundEnabled(){return enabled;}
export function beginSceneSoundtrack(audio,{enable=false}={}){if(enable)enabled=true;music?.pause();sceneSoundtrack=audio;audio.volume=volume;if(enabled)audio.play().catch(()=>{});}
export function endSceneSoundtrack(audio){if(sceneSoundtrack!==audio)return;audio.pause();sceneSoundtrack=null;if(enabled)playMusic(trackNumber);}
export function toggleSound(){enabled=!enabled;if(enabled){if(sceneSoundtrack)sceneSoundtrack.play().catch(()=>{});else{loadMusic();playMusic(trackNumber);}}else{music?.pause();sceneSoundtrack?.pause();}return enabled;}
export function chime(kind='item'){
  if(!enabled)return;
  try{
    context??=new(window.AudioContext||window.webkitAudioContext)();
    if(context.state==='suspended')context.resume();
    const notes=kind==='win'?[523,659,784,1047]:kind==='attack'?[330,440]:[659,880];
    notes.forEach((f,i)=>{
      const oscillator=context.createOscillator(),gain=context.createGain(),start=context.currentTime+i*.11;
      oscillator.type='sine';oscillator.frequency.value=f;
      gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.045,start+.02);gain.gain.exponentialRampToValueAtTime(.001,start+.4);
      oscillator.connect(gain);gain.connect(context.destination);oscillator.start(start);oscillator.stop(start+.42);
    });
  }catch{enabled=false;}
}
