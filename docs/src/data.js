export const HEROES = [
  {id:'icy',name:'Icy',color:'#ff8093',symbol:'✧',ring:'Rosarot',subtitle:'Die Gefühlvolle'},
  {id:'powdery',name:'Powdery',color:'#9ee978',symbol:'❋',ring:'Grün',subtitle:'Die Tollpatschige'},
  {id:'cold',name:'Cold',color:'#8cdfff',symbol:'❄',ring:'Eisblau',subtitle:'Die Anführerin'},
  {id:'fina',name:'Fina',color:'#e2b0ff',symbol:'✦',ring:'Farbwechsel',subtitle:'Die Mutige'}
];
export const ASSETS = {
  background:'assets/farbenquell-animierbar.png',trainingBackground:'Bilder/freepik__a-highquality-digital-comic-book-illustration-in-1__61026.png',finaWalk:'assets/fina-walk.png',finaDepthWalk:'assets/fina-depth-walk.png',cloudsea:'assets/wolkenmeer.png',
  fina:'assets/fina.png',icy:'assets/icy.png',powdery:'assets/powdery.png',cold:'assets/cold.png',
  muck:'assets/muck.png',
  colorida:'Bilder/freepik__img1-mach-die-frau-jnger-18-jahre-jung__9913.png',coloridaSprite:'assets/colorida.png',
  vivid:'Bilder/freepik__a-highquality-digital-comic-book-illustration-in-1__4917.png',vividSprite:'assets/vivid.png',
  group:'Bilder/freepik__entferne-die-elefenohren-der-linken-blonden-person__33837.png'
};
export const ITEMS={bag:{name:'Reisetasche',icon:'♧',description:'Alles für einen großen Aufbruch. Vivid hat sogar etwas Proviant eingepackt.'},crystal:{name:'Mutters Kristall',icon:'◈',description:'Silbas Kristall. Fina trägt ihn bei sich – und die Hoffnung, ihre Mutter wiederzufinden.'},letter:{name:'Empfehlungsschreiben',icon:'✉',description:'Coloridas Empfehlung für Meisterin Aria in der Himmelsstadt.'}};
export const HOTSPOTS=[
  {id:'vivid',name:'Vivid',verb:'Sprechen',x:595,y:400,approach:{x:690,y:725},icon:'…'},
  {id:'bag',name:'Reisetasche',verb:'Einpacken',x:447,y:720,approach:{x:635,y:825},icon:'♧'},
  {id:'crystal',name:'Mutters Kristall',verb:'Mitnehmen',x:560,y:700,approach:{x:650,y:795},icon:'◈'},
  {id:'colors',name:'Farbtöpfe',verb:'Farben mischen',x:480,y:655,approach:{x:645,y:775},icon:'◌'},
  {id:'colorida',name:'Colorida',verb:'Empfehlung erbitten',x:1070,y:420,approach:{x:990,y:755},icon:'✉'},
  {id:'stairs',name:'Wolkenwege',verb:'Ansehen',x:830,y:465,approach:{x:815,y:620},icon:'✧'},
  {id:'clouds',name:'Wolkenmeer',verb:'Ansehen',x:1280,y:625,approach:{x:1080,y:790},icon:'☁'},
  {id:'exit',name:'Aufbruch',verb:'Farbenquell verlassen',x:830,y:325,approach:{x:800,y:585},icon:'➜'}
];
export const VIVID_DIALOG=[
  {speaker:'Vivid',text:'Fina! Hast du deine Tasche? Und den Kristall deiner Mutter? Du würdest ohne deinen Kopf losziehen, wenn er nicht festgewachsen wäre.'},
  {speaker:'Fina',text:'Ich bin bereit! Also … fast. Ich will eine Kristallelfe werden. Und ich will herausfinden, was mit meiner Mutter geschehen ist.'},
  {speaker:'Vivid',text:'Dann nimm ihren Kristall mit. Colorida wartet dort drüben. Sie kann dir eine Empfehlung für Meisterin Aria geben.'},
  {speaker:'Fina',text:'Tasche, Mutters Kristall, Empfehlungsschreiben. Und dann: Himmelsstadt!'},
  {speaker:'Vivid',text:'Vergiss uns nicht, wenn du eine berühmte Kristallelfe bist. Und schau unterwegs nach den Wolkenschäfchen!'}
];
// Dialoge sind kurze Spieladaptionen der Romanhandlung, keine wörtlichen Buchzitate.
export const COLORIDA_DIALOG=[
  {speaker:'Colorida',text:'Fina, du willst Farbenquell wirklich verlassen? Als Himmelsfärberin könntest du hier viel bewirken.'},
  {speaker:'Fina',text:'Ich möchte eine Kristallelfe werden. So wie meine Mutter. Mein Entschluss steht fest.'},
  {speaker:'Colorida',text:'Dann werde ich dich nicht aufhalten. Hier ist mein Empfehlungsschreiben für Meisterin Aria in der Himmelsstadt. Bewahre es gut auf.'},
  {speaker:'Fina',text:'Danke, Colorida. Ich werde euch nicht vergessen.'}
];
export const FAREWELL_DIALOG=[
  {speaker:'Vivid',text:'Alles dabei? Deine Tasche, Mutters Kristall und Coloridas Schreiben? Dann ist es wohl so weit.'},
  {speaker:'Fina',text:'Kommst du wirklich nicht mit?'},
  {speaker:'Vivid',text:'Mein Platz ist hier bei den Farben. Deiner wartet irgendwo dort draußen. Aber Farbenquell bleibt dein Zuhause.'},
  {speaker:'Fina',text:'Ich komme zurück. Und dann habe ich dir viel zu erzählen.'},
  {speaker:'Vivid',text:'Das will ich hoffen! Pass auf dich auf, Fina.'}
];
