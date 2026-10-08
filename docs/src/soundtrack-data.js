export const ORIGINAL_CHAPTER_TRACKS={
  farbenquell:['02'],cirrus:['04'],kumulus:['05'],wolkenseglerflug:['06'],muck:['03'],sandfaenger:['07'],
  stadttor:['08'],cold:['09'],powdery:['09'],icy:['09'],schneeschleusen:['10'],wolkenhain:['11','12','13'],
  aria:['15'],regis_intrige:['16'],thronsturz:['14'],funkels_warnung:['16'],
  kristallwerkstatt:['17','18'],observatorium:['19'],mondtaugarten:['21','22'],
  wasserverlies:['23'],h2o_wende:['12'],befreiung:['24'],regis_finale:['20'],ehrung:['25','26'],epilog:['27'],
};
export function originalTracksForScene(sceneId){return ORIGINAL_CHAPTER_TRACKS[sceneId]??[];}
