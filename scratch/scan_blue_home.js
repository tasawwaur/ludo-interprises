import fs from 'fs';
import { PNG } from 'pngjs';

const file = 'public/assets/images/backgrounds/luxury_ludo_board.png';
const data = fs.readFileSync(file);
const png = PNG.sync.read(data);

// Scan region for the bottom home triangle (X = [290, 390], Y = [485, 560])
// Look for golden/yellow pixels: R > 200, G > 150, B < 150.
let goldPixels = [];
for (let y = 485; y < 560; y++) {
  for (let x = 290; x < 390; x++) {
    const idx = (png.width * y + x) * 4;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    if (r > 200 && g > 150 && b < 150) {
      goldPixels.push({ x, y });
    }
  }
}

// Cluster these pixels
let clusters = [];
const clusterRadius = 15; // smaller clusters

goldPixels.forEach(p => {
  let found = false;
  for (let c of clusters) {
    if (Math.hypot(c.centerX - p.x, c.centerY - p.y) < clusterRadius) {
      c.pixels.push(p);
      c.centerX = c.pixels.reduce((sum, pix) => sum + pix.x, 0) / c.pixels.length;
      c.centerY = c.pixels.reduce((sum, pix) => sum + pix.y, 0) / c.pixels.length;
      found = true;
      break;
    }
  }
  if (!found) {
    clusters.push({
      centerX: p.x,
      centerY: p.y,
      pixels: [p]
    });
  }
});

clusters = clusters.filter(c => c.pixels.length > 5);

// Sort clusters: top-left, top-right, bottom-left, bottom-right
clusters = clusters.sort((a, b) => {
  if (Math.abs(a.centerY - b.centerY) < 10) return a.centerX - b.centerX;
  return a.centerY - b.centerY;
});

console.log(`Found ${clusters.length} gold slots in the Bottom (BLUE) Home Triangle:`);
clusters.forEach((c, idx) => {
  const leftPct = ((c.centerX / png.width) * 100).toFixed(2);
  const topPct = ((c.centerY / png.height) * 100).toFixed(2);
  console.log(`Slot ${idx + 1}: px=(${c.centerX.toFixed(1)}, ${c.centerY.toFixed(1)}) -> left: '${leftPct}%', top: '${topPct}%' (pixels count: ${c.pixels.length})`);
});
