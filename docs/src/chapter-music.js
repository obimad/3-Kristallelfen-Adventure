import { beginSceneSoundtrack, endSceneSoundtrack } from './audio.js';

export function createChapterMusic({onStatus=()=>{},audioFactory=()=>new Audio()}={}){
  let audio,playlist=[],index=0,active=false;
  function current(enable=false){
    if(!active||!playlist[index])return;
    const track=playlist[index],original=/^\d{2}$/.test(track);
    audio.src=original?`Musik/Original/${track}.mp3`:track;
    onStatus(original?`Originalsoundtrack · Stück ${track}${playlist.length>1?` · ${index+1}/${playlist.length}`:''}`:'Spielmusik · Mucks Begegnung');
    beginSceneSoundtrack(audio,{enable});
  }
  function play(numbers,{enable=false,loop=false}={}){
    playlist=numbers.filter(number=>/^\d{2}$/.test(number)||/^Musik\/\d{2}[-_ ][^/\\]+\.mp3$/.test(number));index=0;
    if(!playlist.length){stop();return;}
    if(!audio){
      audio=audioFactory();audio.id='chapter-music';audio.hidden=true;audio.loop=false;
      document.body.appendChild(audio);
      audio.addEventListener('ended',()=>{if(active&&++index<playlist.length)current();});
      audio.addEventListener('error',()=>{if(active)onStatus('Originalstück nicht verfügbar. Mit Weiter beginnt die Szene.');});
    }
    audio.loop=loop;active=true;current(enable);
  }
  function stop(){active=false;if(audio)endSceneSoundtrack(audio);}
  return {play,stop};
}
