import {OPENING_EN} from './opening-chapter.js';
import {COMIC_EN} from './story-moments.js';
let language='de',dictionary=new Map(),fragmentPattern=null;
const cache=new Map();
const STORAGE_KEY='kristallelfen-language';
export const untranslated=new Set();
export function getLanguage(){return language;}
export function setLanguage(value){if(!['de','en'].includes(value))return;try{localStorage.setItem(STORAGE_KEY,value);}catch{};language=value;cache.clear();}
export function configureLocalization(source,english,ui={},locale='en'){
  dictionary=new Map();language=locale;cache.clear();untranslated.clear();
  for(const [index,en] of Object.entries(english))if(source[index])dictionary.set(source[index],en);
  for(const [de,en] of Object.entries({...ui,...OPENING_EN,...COMIC_EN}))dictionary.set(de.trim(),en.trim());
  const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const fragments=[...dictionary].filter(([de,en])=>de!==en&&de.length>2).sort((a,b)=>b[0].length-a[0].length);
  fragmentPattern=fragments.length?new RegExp('(?<![\\p{L}\\p{N}_])(?:'+fragments.map(([de])=>escape(de)).join('|')+')(?![\\p{L}\\p{N}_])','gu'):null;
}
export function translate(text,depth=0){
  if(language==='de'||typeof text!=='string'||depth>5)return text;
  if(cache.has(text))return cache.get(text);
  const source=text.trim();if(dictionary.has(source))return text.replace(source,dictionary.get(source));
  if(!source)return text;
  let output=text;
  const inner=value=>translate(value,depth+1);
  output=output
    .replace(/^Für „(.+)“ fehlt noch ein vorheriger Schritt oder ein Gegenstand\.$/s,(_,name)=>`A previous step or item is still needed for “${inner(name)}”.`)
    .replace(/^(.+) ausgewählt\. Klicke auf den Gegenstand, an dem du es benutzen möchtest\. Escape legt es zurück\.$/s,(_,name)=>`${inner(name)} selected. Click the object you want to use it on. Escape puts it away.`)
    .replace(/^(.+) ist nun in deiner Tasche\.$/s,(_,name)=>`${inner(name)} is now in your bag.`)
    .replace(/^Untersuche „(.+)“ noch einmal\. (.+) hat dort einen konkreten Hinweis\.$/s,(_,name,speaker)=>`Examine “${inner(name)}” again. ${inner(speaker)} has a specific clue there.`)
    .replace(/^Mit (.+) durch das Wolkenmeer$/s,(_,name)=>`Across the sea of clouds with ${name}`)
    .replace(/^(.+) hält euch auf einer ruhigen Flugbahn\. Du kannst weiterhin lenken\.$/s,(_,name)=>`${name} keeps you on a calm flight path. You can still steer.`)
    .replace(/^Ein kleiner Luftstoß! (.+) fängt euch sicher ab\. Gleich geht es weiter\.$/s,(_,name)=>`A little gust! ${name} steadies you safely. You’ll carry on in a moment.`)
    .replace(/^Fina fliegt mit (.+)\. Pfeile oder WASD zum Ausweichen; P zum Pausieren\.$/s,(_,name)=>`Fina flies with ${name}. Arrow keys or WASD to dodge; P to pause.`)
    .replace(/^Fina und (.+) starten\. Die Hindernisse kommen vom Horizont auf euch zu\.$/s,(_,name)=>`Fina and ${name} take off. Obstacles approach from the horizon.`)
    .replace(/^Fina und (.+) im Anflug …$/s,(_,name)=>`Fina and ${name} approaching…`)
    .replace(/^Pause · (\d+)\/2 gefangen\. H und O warten, bis du weiterläufst\.$/s,'Pause · $1/2 caught. H and O wait until you continue.')
    .replace(/(\d+)\/2 gefangen/g,'$1/2 caught')
    .replace(/([HO]) ist gefangen!/g,'$1 is caught!')
    .replace(/^Frost oder Schnee hält die Wache zurück\. Noch (\d+) geschützte Züge\.$/s,'Frost or snow holds the guard back. $1 protected turns remaining.')
    .replace(/^Nahansicht: (.+)\. Untersuche die Form, die Spuren und die zugänglichen Teile\.$/s,(_,name)=>`Close-up: ${inner(name)}. Examine the shape, traces and accessible parts.`)
    .replace(/Feld (\d+) verschieben/g,'Move tile $1')
    .replace(/Teil (\d+) auf Feld (\d+) verschieben/g,'Move piece $1 on tile $2')
    .replace(/Leeres Feld (\d+)/g,'Empty tile $1')
    .replace(/Vorsprung: (\d+)\/28 Sekunden/g,'Head start: $1/28 seconds')
    .replace(/(\d+) Züge ·/g,'$1 moves ·')
    .replace(/Nach (links|rechts|oben|unten) laufen/g,(_,direction)=>`Move ${({links:'left',rechts:'right',oben:'up',unten:'down'})[direction]}`)
    .replace(/ist gefangen/g,'is caught');
  output=output.replace(/KAPITEL\s+(\d+|I)/g,'CHAPTER $1')
    .replace(/(\d+)\/(\d+) Stationen abgeschlossen/g,'$1/$2 locations completed')
    .replace(/(\d+) Gegenstände ·/g,'$1 items ·')
    .replace(/(\d+) von (\d+) Gegenständen eingepackt/g,'$1 of $2 items packed')
    .replace(/(\d+) von (\d+) eingepackt/g,'$1 of $2 packed')
    .replace(/(\d+) \/ (\d+) Reisestationen/g,'$1 / $2 locations')
    .replace(/Enter zum Weiterreden/g,'Enter to continue')
    .replace(/ZUG (\d+)/g,'TURN $1')
    .replace(/hast du bereits abgeschlossen\./g,'has already been completed.')
    .replace(/ abgeschlossen\./g,' completed.')
    .replace(/ eingepackt\./g,' packed.')
    .replace(/^(Als Nächstes:|Für|Untersuche) /g,(_,p)=>({'Als Nächstes:':'Next:','Für':'For','Untersuche':'Examine'}[p]+' '));
  if(fragmentPattern)output=output.replace(fragmentPattern,match=>dictionary.get(match));
  if(/[äöüß]|\b(der|die|das|und|ist|nicht|noch|mit|zum|zur|kann|wird)\b/i.test(output))untranslated.add(source);
  cache.set(text,output);
  return output;
}
export async function initLocalization(){
  try{language=localStorage.getItem(STORAGE_KEY)==='en'?'en':'de';}catch{}
  if(language==='en'){
    const [source,english,ui]=await Promise.all(['locales-source.json','locales-en.json','locales-ui-en.json'].map(file=>fetch(new URL(file,import.meta.url)).then(r=>{if(!r.ok)throw new Error(`Translation file missing: ${file}`);return r.json();})));
    configureLocalization(source,english,ui,language);
  }
  document.documentElement.lang=language;document.title=translate('Die 3 Kristallelfen');
  const apply=node=>{
    if(node.nodeType===3){const value=translate(node.nodeValue);if(value!==node.nodeValue)node.nodeValue=value;return;}
    if(node.nodeType!==1||['SCRIPT','STYLE'].includes(node.tagName))return;
    for(const attr of ['aria-label','title','alt'])if(node.hasAttribute(attr)){const old=node.getAttribute(attr),next=translate(old);if(next!==old)node.setAttribute(attr,next);}
    if(node.tagName==='CANVAS')return;
    for(const child of node.childNodes)apply(child);
  };
  apply(document.body);
  const observer=new MutationObserver(records=>{for(const record of records){if(record.type==='characterData')apply(record.target);else if(record.type==='attributes')apply(record.target);else for(const node of record.addedNodes)apply(node);}});
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','alt']});
  const original=CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText=function(text,...args){return original.call(this,translate(text),...args);};
  const picker=document.getElementById('language-select');if(picker){picker.value=language;picker.addEventListener('change',()=>{setLanguage(picker.value);location.reload();});}
  window.translationMissing=untranslated;
}
