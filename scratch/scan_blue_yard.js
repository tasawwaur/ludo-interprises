import fs from 'fs';
import { PNG } from 'pngjs';

const file = 'public/assets/images/backgrounds/luxury_ludo_board.png';
const data = fs.readFileSync(file);
const png = PNG.sync.read(data);

// Bottom-Left quadrant: X = [80, 270], Y = [630, 820]
// Golden circle slots have high R (> 210), high G (> 180), and moderate to high B (> 100).
let goldPixels = [];
for (let y = 630; y < 820; y++) {
  for (let x = 80; x < 270; x++) {
    const idx = (png.width * y + x) * 4;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    if (r > 210 && g > 180 && b > 100) {
      goldPixels.push({ x, y });
    }
  }
}

// Cluster these gold pixels to find the 4 distinct circles.
let clusters = [];
const clusterRadius = 35; // pixels

goldPixels.forEach(p => {
  let found = false;
  for (let c of clusters) {
    if (Math.hypot(c.centerX - p.x, c.centerY - p.y) < clusterRadius) {
      c.pixels.push(p);
      // Recalculate center
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

// Filter clusters that have too few pixels (noise) and sort them.
clusters = clusters.filter(c => c.pixels.length > 15);

// We want 4 clusters. Let's sort them: top-left, top-right, bottom-left, bottom-right.
// Sort by Y first, then by X.
clusters = clusters.sort((a, b) => {
  if (Math.abs(a.centerY - b.centerY) < 25) return a.centerX - b.centerX;
  return a.centerY - b.centerY;
});

console.log(`Found ${clusters.length} gold circles in the Bottom-Left (BLUE) yard:`);
clusters.forEach((c, idx) => {
  const leftPct = ((c.centerX / png.width) * 100).toFixed(2);
  const topPct = ((c.centerY / png.height) * 100).toFixed(2);
  console.log(`Circle ${idx + 1}: px=(${c.centerX.toFixed(1)}, ${c.centerY.toFixed(1)}) -> left: '${leftPct}%', top: '${topPct}%' (pixels count: ${c.pixels.length})`);
});
