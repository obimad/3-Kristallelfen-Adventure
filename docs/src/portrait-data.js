// Visually checked against the existing character PNGs. Face position differs
// from the geometric image center, especially for H and Lord Regis.
export const PORTRAIT_FRAMING=Object.freeze({
  Fina:{center:52,width:220},Muck:{center:54,width:210},
  Cold:{center:54,width:220},Powdery:{center:54,width:220},Icy:{center:52,width:210},
  Vivid:{center:50,width:220},Colorida:{center:50,width:220},
  Cirrus:{center:48,width:210},Kian:{center:47,width:220},Funkel:{center:54,width:220},
  H:{center:70,width:220},'2':{center:51,width:220},O:{center:43,width:220},
  Chrysta:{center:48,width:190},Chrystel:{center:53,width:200},Christi:{center:53,width:210},
  Silba:{center:53,width:220},'Lord Regis':{center:43,width:200},
  'Meisterin Aria':{center:50,width:220},Kristallfee:{center:51,width:205},
});
export function portraitStyle(speaker){
  const framing=PORTRAIT_FRAMING[speaker]??PORTRAIT_FRAMING.Fina;
  return `--portrait-center:${framing.center}%;--portrait-width:${framing.width}%`;
}
