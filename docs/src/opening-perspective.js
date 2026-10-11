// Foot position determines depth. Both axes of a sprite scale together,
// keeping its feet on the path and its body proportions unchanged.
const planes = {
  home: {horizon:-200, fina:{height:436,feet:825}, vivid:{height:410,feet:785}},
  square: {horizon:240, fina:{height:311,feet:825}, vivid:{height:280,feet:750}, colorida:{height:290,feet:770}},
  edge: {horizon:220, fina:{height:311,feet:825}, vivid:{height:290,feet:785}}
};

export function openingActorHeight(area,actor,feetY){
  const plane=planes[area]??planes.square;
  const figure=plane[actor]??plane.fina;
  const depth=(feetY-plane.horizon)/(figure.feet-plane.horizon);
  return figure.height*Math.max(.16,Math.min(1.4,depth));
}
