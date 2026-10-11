// Authored adaptation of the opening; optional tasks never block the letter.
export const OPENING_EN={};
export function openingText(de,en){OPENING_EN[de]=en;return de;}
const t=openingText;
export const OPENING_AREAS={
 home:{name:t('Finas Zuhause','Fina’s home'),subtitle:t('Ein vertrauter Ort. Ein großer Entschluss.','A familiar place. A big decision.'),spawn:{x:900,y:825}},
 square:{name:t('Der Dorfplatz','The village square'),subtitle:t('Colorida hat die Himmelsfärber zusammengerufen.','Colorida has called the sky painters together.'),spawn:{x:800,y:825}},
 edge:{name:t('Am Wolkenausgang','At the cloud path'),subtitle:t('Hinter dem Horizont beginnt das Unbekannte.','Beyond the horizon, the unknown awaits.'),spawn:{x:800,y:825}}
};
export const OPENING_ITEMS={
 crystal:{name:t('Silbas Kristall','Silba’s crystal'),icon:'◈',description:t('Silba ist Finas Mutter. Seit einem Jahr fehlt jede Spur von ihr. Ihr Kristall erinnert Fina daran, dass sie die Hoffnung nicht aufgeben will.','Silba is Fina’s mother. She has been missing for a year. Her crystal reminds Fina not to give up hope.')},
 letter:{name:t('Coloridas Empfehlung','Colorida’s recommendation'),icon:'✉',description:t('Das versiegelte Schreiben ist für Meisterin Aria in der Himmelsstadt. Colorida empfiehlt Fina als angehende Kristallelfe.','The sealed letter is for Mistress Aria in the Sky City. Colorida recommends Fina as an aspiring crystal elf.')},
 red:{name:t('Rote Himmelsfarbe','Red sky dye'),icon:'●',description:t('Eine kleine Portion aus dem roten Farbkessel. Zusammen mit Blau wird daraus Violett.','A small portion from the red dye vat. Mixed with blue, it makes violet.')},
 blue:{name:t('Blaue Himmelsfarbe','Blue sky dye'),icon:'●',description:t('Ein wenig Blau aus dem Himmelskessel. Die Farbe schimmert wie der Himmel über Farbenquell.','A little blue from the sky vat. It shimmers like the sky above Farbenquell.')},
 yellow:{name:t('Goldene Himmelsfarbe','Golden sky dye'),icon:'●',description:t('So warm wie ein Sonnenaufgang. Heute sucht Vivid eine andere Farbe für den Abendhimmel.','As warm as a sunrise. Today Vivid needs a different colour for the evening sky.')}
};
export const OPENING_COPY={
 explore:t('Sieh dich um. Heute fühlt sich dein Zuhause anders an.','Look around. Today your home feels different.'),
 friend:t('Vivid ist hier. Vielleicht tut ein Gespräch gut.','Vivid is here. Perhaps a conversation will help.'),
 gathering:t('Auf dem Dorfplatz wartet die Zusammenkunft.','The gathering awaits in the village square.'),
 prepare:t('Du willst zur Himmelsstadt. Was möchtest du noch mitnehmen?','You want to reach the Sky City. What else would you like to take?'),
 farewell:t('Du bist bereit. Am Wolkenausgang kannst du Abschied nehmen.','You are ready. You can say goodbye at the cloud path.'),
 bowl:t('Die Mischschale','The mixing bowl'),
 select:t('Benutzen','Use'),inspect:t('Untersuchen','Examine'),
 selected:t('Gegenstand in der Hand. Wähle sein Ziel in der Szene.','Item in hand. Choose its target in the scene.'),
 wrong:t('Damit kann ich hier nichts anfangen. Vielleicht passt es an einen anderen Ort.','I cannot use that here. Perhaps it belongs somewhere else.'),
 paint:t('Vivid braucht Violett für den Abendhimmel. Die Farbkessel und die Mischschale stehen hier bereit.','Vivid needs violet for the evening sky. The dye vats and mixing bowl are ready here.'),
 same:t('Diese Farbe ist schon in der Schale. Eine zweite Farbe würde sie verändern.','That colour is already in the bowl. A second colour would change it.'),
 first:t('Die Farbe fließt in die Schale. Jetzt fehlt noch eine zweite.','The dye flows into the bowl. Now it needs a second colour.'),
 violet:t('Violett! Der Abendhimmel kann kommen.','Violet! The evening sky is ready.'),
 retry:t('Eine schöne Farbe, aber kein Violett. Ich leere die Schale; wir können es noch einmal versuchen.','A lovely colour, but not violet. I will empty the bowl; we can try again.'),
 made:t('Das Violett ist fertig. Vivid kann damit weiterarbeiten.','The violet is ready. Vivid can get back to work.'),
 bag:t('Vivid hat Proviant eingepackt. Fina schließt die Tasche und nimmt sie mit.','Vivid packed some provisions. Fina closes the bag and takes it with her.'),
 packed:t('Die Tasche ist schon gepackt.','The bag is already packed.'),
 book:t('Reisegedanken','Travel thoughts'),
 hints:t('Ein kleiner Schubs','A little nudge'),
 next:t('Weiter','Continue'),skip:t('Intro überspringen','Skip intro'),
 continue:t('Die Reise beginnt','The journey begins'),
 journal:t('Du kannst zwischen den drei Orten zurückgehen. Die Farbaufgabe ist freiwillig.','You can return to any of the three locations. The colour task is optional.'),
 progress:t('Ein Abschied braucht Zeit.','Saying goodbye takes time.'),
 touch:t('Tippe auf einen Gegenstand, um seine Möglichkeiten zu entdecken.','Tap an object to discover what you can do with it.'),
 hover:t('Gegenstände entdecken · Anklicken zum Untersuchen · Tasche zum Benutzen','Discover objects · Click to examine · Use items from your bag'),
 completion:t('Kapitel 1 abgeschlossen','Chapter 1 complete'),
 end:t('Mutig tritt Fina auf den Wolkenweg. Noch einmal schaut sie zurück. Farbenquell wird kleiner hinter ihr. Was wird sie wohl hinter dem Horizont finden?','Fina steps bravely onto the cloud path. She looks back once more. Farbenquell grows smaller behind her. What will she find beyond the horizon?'),
 replay:t('Noch einmal durch Farbenquell gehen','Explore Farbenquell again'),
 travel:t('Zur Wolkenwiese weiterreisen','Continue to the cloud meadow'),
 leaveBlocked:t('Ich möchte Vivid nicht ohne Abschied zurücklassen. Und Coloridas Zusammenkunft steht noch bevor.','I do not want to leave without saying goodbye to Vivid. Colorida’s gathering is still ahead.'),
 preparationBlocked:t('Für meine Reise brauche ich die Tasche, Mutters Kristall und Coloridas Schreiben. Ich kann noch einmal ins Dorf zurückgehen.','For my journey I need the bag, Mother’s crystal and Colorida’s letter. I can return to the village.'),
 gift:t('Colorida legt das versiegelte Schreiben in Finas Hand.','Colorida places the sealed letter in Fina’s hand.'),
 label:t('Kapitel 1 · Farbenquell','Chapter 1 · Farbenquell'),
 uiHint:t('Hinweise einblenden','Show hotspots'),
 redVat:t('Roter Farbkessel','Red dye vat'),blueVat:t('Blauer Farbkessel','Blue dye vat'),yellowVat:t('Goldener Farbkessel','Golden dye vat'),
 crystalLook:t('Ein vertrautes Schimmern','A familiar shimmer'),
 choiceMother:t('Von Silba erzählen','Talk about Silba'),choiceMeeting:t('Nach der Zusammenkunft fragen','Ask about the gathering'),choiceHelp:t('Vivid beim Färben helfen','Help Vivid with the colours'),choiceJourney:t('Über den Aufbruch sprechen','Talk about leaving'),choiceBack:t('Zurück zur Szene','Back to the scene')
};
export const OPENING_INTRO=[
 {title:t('Über den Wolken','Above the clouds'),text:t('In Farbenquell mischen die Himmelsfärber die Farben des Himmels. Hier ist Fina zu Hause. Jeder Weg, jede Stimme ist ihr vertraut.','In Farbenquell, the sky painters mix the colours of the sky. This is Fina’s home. Every path and every voice is familiar.'),art:'background'},
 {title:t('Eine Spur von Silba','A trace of Silba'),text:t('Seit einem Jahr ist ihre Mutter Silba verschwunden. Sie war eine Kristallelfe. Zurück blieb ihr Kristall – und eine Frage, die Fina nicht loslässt.','Her mother Silba has been missing for a year. She was a crystal elf. Her crystal remains — and a question Fina cannot let go of.'),art:'cloudsea'},
 {title:t('Heute bricht Fina auf','Today Fina sets out'),text:t('Fina möchte selbst eine Kristallelfe werden. In der Himmelsstadt hofft sie, mehr über Silba zu erfahren. Doch zuerst wartet ein Abschied.','Fina wants to become a crystal elf herself. In the Sky City, she hopes to learn more about Silba. First, she must say goodbye.'),art:'background'}
];
const line=(speaker,de,en)=>({speaker,text:t(de,en)});
export const OPENING_DIALOG={
 crystal:[line('Fina','Mutter, wo bist du? Ein ganzes Jahr … und noch immer keine Nachricht.','Mother, where are you? A whole year … and still no word.'),line('Fina','Als Kristallelfe bist du durch den Himmel gereist. Vielleicht weiß in der Himmelsstadt jemand etwas. Deinen Kristall nehme ich mit.','As a crystal elf, you travelled through the sky. Perhaps someone in the Sky City knows something. I will take your crystal with me.')],
 arrival:[line('Vivid','Fina! Da bist du. Colorida hat alle zum Dorfplatz gerufen. Kommst du?','Fina! There you are. Colorida has called everyone to the village square. Are you coming?'),line('Fina','Gleich. Es ist seltsam, alles einzupacken. Wir kennen uns seit so lange ich denken kann … und morgen bist du nicht mehr gleich nebenan.','In a moment. Packing everything feels strange. We have known each other for as long as I can remember … and tomorrow you will not be right next door.'),line('Vivid','Ich bin immer noch deine Freundin, auch wenn ein paar Wolken zwischen uns liegen. Und deinen Proviant habe ich längst eingepackt.','I am still your friend, even with a few clouds between us. And I have already packed your provisions.')],
 mother:[line('Fina','Manchmal habe ich Angst, dass ich sie nie wiederfinde.','Sometimes I am afraid I will never find her.'),line('Vivid','Das verstehe ich. Aber du musst nicht heute schon auf jede Frage eine Antwort haben. Fang mit dem ersten Schritt an.','I understand. But you do not need to answer every question today. Start with the first step.')],
 meeting:[line('Vivid','Colorida ist unsere Anführerin. Sie möchte, dass wir alle dabei sind, wenn du von deinem Vorhaben erzählst.','Colorida is our leader. She wants us all to be there when you tell us about your plans.'),line('Fina','Dann soll sie es von mir hören. Ich will nicht einfach verschwinden.','Then she should hear it from me. I do not want to simply disappear.')],
 colorida:[line('Colorida','Da bist du, Fina. Ich habe die Himmelsfärber zusammengerufen. Du gehörst zu Farbenquell – und wir möchten hören, wohin es dich zieht.','There you are, Fina. I have called the sky painters together. You belong to Farbenquell — and we want to hear where your heart is leading you.'),line('Fina','Ich möchte eine Kristallelfe werden, so wie meine Mutter Silba. Deshalb will ich zur Himmelsstadt. Vielleicht finde ich dort auch eine Spur von ihr.','I want to become a crystal elf, like my mother Silba. That is why I want to go to the Sky City. Perhaps I will find a trace of her there.'),line('Colorida','Du könntest hier eine gute Himmelsfärberin werden. Aber ich sehe, wie viel dir diese Reise bedeutet.','You could become a fine sky painter here. But I can see how much this journey means to you.'),line('Fina','Ich habe Angst. Trotzdem möchte ich es versuchen.','I am afraid. Even so, I want to try.'),line('Colorida','Dann nimm mein Schreiben für Meisterin Aria mit. Sie bildet Kristallelfen aus. Erzähle ihr selbst, wer du bist und was du suchst.','Then take my letter for Mistress Aria. She trains crystal elves. Tell her yourself who you are and what you seek.'),line('Fina','Danke, Colorida. Farbenquell bleibt mein Zuhause.','Thank you, Colorida. Farbenquell will always be my home.')],
 repeatColorida:[line('Colorida','Aria wird dich selbst kennenlernen wollen. Ein Schreiben kann den ersten Schritt erleichtern; deinen Weg gehst du selbst.','Aria will want to get to know you herself. A letter can make the first step easier; the journey is yours.')],
 help:[line('Vivid','Für den Abendhimmel fehlt mir noch Violett. Wenn du magst, hilf mir ein letztes Mal.','I still need violet for the evening sky. If you like, help me one last time.'),line('Fina','Rot und Blau, wie früher? Die kleinen Portionen aus den Kesseln kann ich in der Schale mischen.','Red and blue, like before? I can mix small portions from the vats in the bowl.'),line('Vivid','Genau. Aber mach das nur, wenn du noch Zeit hast. Coloridas Schreiben bekommst du auch ohne meine Farbschale.','Exactly. But only if you have time. You will get Colorida’s letter even without helping with my bowl.')],
 repeatVivid:[line('Vivid','Deine Tasche wartet am Reisetisch. Ich komme mit bis zum Wolkenausgang.','Your bag is waiting at the travel table. I will come with you as far as the cloud path.')],
 farewell:[line('Vivid','Da geht er hin, unser letzter gemeinsamer Morgen vor dem Aufbruch.','There it goes, our last morning together before you leave.'),line('Fina','Kommst du wirklich nicht mit?','Are you really not coming with me?'),line('Vivid','Mein Platz ist bei den Farben. Aber ich möchte alles hören, wenn du zurückkommst. Auch die peinlichen Geschichten!','My place is with the colours. But I want to hear everything when you return. Even the embarrassing stories!'),line('Fina','Die erzähle ich dir wahrscheinlich zuerst. Pass auf Farbenquell auf.','I will probably tell you those first. Take care of Farbenquell.'),line('Vivid','Und du auf dich. Geh jetzt, bevor ich dich doch noch festhalte.','And you take care of yourself. Go now, before I decide to keep you here.')],
 clouds:[line('Fina','So weit habe ich mich noch nie von Farbenquell entfernt. Die Wolken sehen von hier aus wie ein Meer aus.','I have never been this far from Farbenquell. From here, the clouds look like a sea.'),line('Fina','Was wohl hinter dem Horizont auf mich wartet?','I wonder what is waiting beyond the horizon?')],
 portrait:[line('Fina','Mutter hat immer gesagt, dass ich beim Lachen die Augen genauso zusammenkneife wie sie. Manchmal bleibe ich vor diesem Bild stehen, damit ich ihre Stimme nicht vergesse.','Mother always said I narrow my eyes when I laugh, just like her. Sometimes I stand before this picture so I do not forget her voice.')],
 window:[line('Fina','Von diesem Fenster aus habe ich schon oft den Himmelsfärbern zugesehen. Morgen wird jemand anderes hier sitzen. Ob mir die vertrauten Dächer fehlen werden?','From this window I have often watched the sky painters. Tomorrow someone else will sit here. Will I miss these familiar rooftops?')],
 stairs:[line('Fina','Auf diesen Stufen habe ich als Kind gespielt. Heute führen sie mich aus dem Dorf hinaus.','I played on these steps as a child. Today they lead me out of the village.')]
};
export function createOpeningState(){return {version:1,area:'home',vividArrived:false,metVivid:false,motherTalk:false,meetingTalk:false,helpTalk:false,bowl:[],discoveries:[],introSeen:false};}
export function restoreOpeningState(raw,adventure){
 const s=createOpeningState();
 if(raw?.version===1){for(const key of ['vividArrived','metVivid','motherTalk','meetingTalk','helpTalk','introSeen'])s[key]=raw[key]===true;if(Object.hasOwn(OPENING_AREAS,raw.area))s.area=raw.area;s.bowl=Array.isArray(raw.bowl)?[...new Set(raw.bowl.filter(c=>['red','blue','yellow'].includes(c)))].slice(0,1):[];s.discoveries=Array.isArray(raw.discoveries)?[...new Set(raw.discoveries.filter(id=>['crystal','bag','clouds','stairs','colors','portrait','window'].includes(id)))]:[];}
 if(adventure.talked){s.vividArrived=true;s.metVivid=true;}
 return s;
}
export function openingObjective(adventure){const s=adventure.opening;if(!s?.vividArrived)return OPENING_COPY.explore;if(!adventure.talked)return OPENING_COPY.friend;if(!adventure.inventory.includes('letter'))return OPENING_COPY.gathering;if(!['bag','crystal'].every(id=>adventure.inventory.includes(id)))return OPENING_COPY.prepare;return OPENING_COPY.farewell;}
const target=(id,name,verb,x,y,approach,type='object',width=90,height=75)=>({id,name,verb,x,y,approach,type,width,height});
export function openingTargets(adventure){
 const s=adventure.opening??createOpeningState(),bag=adventure.inventory.includes('bag'),crystal=adventure.inventory.includes('crystal');
 if(s.area==='home')return [
  ...(!bag?[target('bag',t('Reisetasche','Travel bag'),t('Packen','Pack'),450,720,{x:640,y:820})]:[]),
  ...(!crystal?[target('crystal',OPENING_ITEMS.crystal.name,OPENING_COPY.inspect,555,697,{x:645,y:810},'object',60,75)]:[]),
  ...(s.vividArrived?[target('vivid','Vivid',t('Sprechen','Talk'),740,580,{x:925,y:805},'person',165,410)]:[]),
  target('portrait',t('Silba und Fina','Silba and Fina'),OPENING_COPY.inspect,180,200,{x:250,y:660},'object',120,150),
  target('window',t('Der vertraute Ausblick','The familiar view'),OPENING_COPY.inspect,935,285,{x:1020,y:685},'object',320,290),
  target('to_square',OPENING_AREAS.square.name,t('Hingehen','Go there'),1410,665,{x:1350,y:740},'exit',140,100)
 ];
 if(s.area==='square')return [target('colorida','Colorida',t('Sprechen','Talk'),1030,625,{x:920,y:810},'person',115,290),target('vivid','Vivid',t('Sprechen','Talk'),755,610,{x:855,y:800},'person',105,275),target('red',OPENING_COPY.redVat,t('Farbe nehmen','Take dye'),145,435,{x:625,y:710},'object',120,145),target('blue',OPENING_COPY.blueVat,t('Farbe nehmen','Take dye'),300,435,{x:650,y:700},'object',110,145),target('yellow',OPENING_COPY.yellowVat,t('Farbe nehmen','Take dye'),435,455,{x:665,y:700},'object',100,135),target('bowl',OPENING_COPY.bowl,OPENING_COPY.inspect,590,660,{x:665,y:765},'object',110,100),target('to_home',OPENING_AREAS.home.name,t('Zurückgehen','Go back'),350,800,{x:400,y:840},'exit',150,80),target('to_edge',OPENING_AREAS.edge.name,t('Hingehen','Go there'),840,395,{x:820,y:590},'exit',155,110)];
 return [target('vivid','Vivid',t('Sprechen','Talk'),650,645,{x:780,y:815},'person',110,285),target('clouds',t('Das Wolkenmeer','The sea of clouds'),OPENING_COPY.inspect,1230,470,{x:1120,y:720},'object',160,100),target('stairs',t('Die vertrauten Wolkenstufen','The familiar cloud steps'),OPENING_COPY.inspect,370,650,{x:480,y:760},'object',160,100),target('to_square',OPENING_AREAS.square.name,t('Zurückgehen','Go back'),290,805,{x:380,y:840},'exit',140,80),target('exit',t('Der erste Schritt','The first step'),t('Aufbrechen','Set out'),1350,730,{x:1300,y:815},'exit',130,110)];
}
export function pourOpeningColour(adventure,colour){
 const s=adventure.opening;
 if(!s||adventure.mixed)return {ok:false,text:OPENING_COPY.made};
 if(!['red','blue','yellow'].includes(colour)||!adventure.inventory.includes(colour))return {ok:false,text:OPENING_COPY.wrong};
 if(s.bowl.includes(colour))return {ok:false,text:OPENING_COPY.same};
 s.bowl.push(colour);
 if(s.bowl.length===1)return {ok:true,text:OPENING_COPY.first};
 const violet=s.bowl.includes('red')&&s.bowl.includes('blue');s.bowl=[];
 if(violet)adventure.mixed=true;
 return {ok:true,text:violet?OPENING_COPY.violet:OPENING_COPY.retry};
}
// Register all target labels before localization initializes.
for(const area of Object.keys(OPENING_AREAS))openingTargets({inventory:[],opening:{area,vividArrived:true}});

export function openingConversationTopics(opening){
 return ['mother','meeting',...(opening.area==='square'?['help']:[])].filter(topic=>!opening[`${topic}Talk`]);
}

export function openingExitArrow(id,area){
 if(id==='to_home'||(id==='to_square'&&area==='edge'))return '←';
 if(id==='to_edge')return '↑';
 return '→';
}
