import { SCENES } from './story-data.js';
import { createCampaign, requestAction, finishDialog, solvePuzzle } from './campaign.js';

// Replaying previous chapters produces an ordinary, restorable save, including
// the equipment and companions that Fina would have collected along the way.
export function campaignAt(sceneId){
  const index=SCENES.findIndex(scene=>scene.id===sceneId);
  if(index<0)return null;
  const state=createCampaign();
  for(const scene of SCENES.slice(0,index)){
    const remaining=scene.hotspots.filter(h=>h.type!=='exit');
    for(let pass=0;pass<scene.hotspots.length&&remaining.length;pass++){
      let progress=false;
      for(let i=0;i<remaining.length;){
        const h=remaining[i];
        if(!(h.requiresFlags??[]).every(id=>state.flags.includes(id))||!(h.requiresItems??[]).every(id=>state.inventory.includes(id))){i++;continue;}
        const result=requestAction(state,h.id);
        if(result.type==='dialog')finishDialog(state);
        if(result.type==='puzzle')solvePuzzle(state,h.id,h.puzzle.solution);
        remaining.splice(i,1);progress=true;
      }
      if(!progress)return null;
    }
    const exit=scene.hotspots.find(h=>h.type==='exit');
    if(!exit||requestAction(state,exit.id).type!=='scene')return null;
  }
  return state;
}
