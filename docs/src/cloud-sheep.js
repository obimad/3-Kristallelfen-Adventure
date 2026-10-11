// Each animal has its own long rhythm: stand, graze, look up, take a few steps.
const HERD = [
  { x: 1030, y: 477, height: 112, period: 29000, offset: 0 },
  { x: 1170, y: 440, height: 95, period: 33000, offset: 11000 },
  { x: 1290, y: 475, height: 106, period: 37000, offset: 22000 },
];

export function cloudSheep(sceneId, time, reduced = false, sequence = null, gathered = false) {
  if (sceneId !== 'cirrus') return [];
  return HERD.map((original, index) => {
    const steps=sequence?.sceneId===sceneId?sequence.selected:[];
    const movingToHerd=gathered||steps.includes('group')||steps.includes(index===1?'little':'edge')&&index!==0;
    const progress=gathered||reduced?1:Math.min(1,Math.max(0,(time-(sequence?.startedAt??time))/1500));
    const sheep=movingToHerd?{...original,x:original.x+(1020+index*90-original.x)*progress,y:original.y+(500-original.y)*progress}:original;
    if (reduced) return { ...sheep, frame: 0, facing: 1, activity: 'rest' };
    if(movingToHerd&&progress<1)return {...sheep,frame:Math.floor(time/240)%2?3:0,facing:-1,activity:'walk'};
    const phase = ((time + sheep.offset) % sheep.period + sheep.period) % sheep.period;
    let frame = 0, activity = 'rest', offset = 0;
    if (phase >= 7000 && phase < 7600) { frame = 1; activity = 'lower'; }
    else if (phase >= 7600 && phase < 12600) {
      frame = Math.floor((phase - 7600) / 900) % 4 === 3 ? 1 : 2;
      activity = 'graze';
    } else if (phase >= 12600 && phase < 13200) { frame = 1; activity = 'raise'; }
    else if (phase >= 19000 && phase < 23000) {
      const progress = (phase - 19000) / 4000;
      // Out and back within a small patch; only move while stepping.
      offset = Math.sin(progress * Math.PI) * (index === 1 ? 12 : 18);
      frame = Math.floor((phase - 19000) / 300) % 2 ? 3 : 0;
      activity = 'walk';
    }
    return { ...sheep, x: sheep.x + offset, frame, activity,
      facing: activity === 'walk' && phase >= 21000 ? -1 : 1 };
  });
}

export function drawCloudSheep(ctx, atlas, sceneId, time, reduced, sequence, gathered) {
  if (!atlas) return;
  const cellWidth = atlas.naturalWidth / 4;
  // Shared crop retains identical feet and body placement in all four poses.
  const sourceY = atlas.naturalHeight * .24, cellHeight = atlas.naturalHeight * .55;
  for (const sheep of cloudSheep(sceneId, time, reduced, sequence, gathered)) {
    const width = sheep.height * cellWidth / cellHeight;
    ctx.save(); ctx.translate(sheep.x, sheep.y); ctx.scale(sheep.facing, 1);
    ctx.fillStyle = '#39516a18'; ctx.beginPath();
    ctx.ellipse(0, -4, width * .3, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.drawImage(atlas, sheep.frame * cellWidth, sourceY, cellWidth, cellHeight,
      -width / 2, -sheep.height, width, sheep.height);
    ctx.restore();
  }
}
