import fs from 'fs';
import { PNG } from 'pngjs';

const file = 'public/assets/images/backgrounds/luxury_ludo_board.png';
const data = fs.readFileSync(file);
const png = PNG.sync.read(data);

console.log(`Image size: ${png.width} x ${png.height}`);

// We will scan the four quadrant regions corresponding to the 4 yards.
// Top-Left (RED yard): x from 80 to 280, y from 220 to 420
// Top-Right (GREEN yard): x from 400 to 600, y from 220 to 420
// Bottom-Left (BLUE yard): x from 80 to 280, y from 600 to 800
// Bottom-Right (YELLOW yard): x from 400 to 600, y from 600 to 800

// In each quadrant, we will find local brightness peaks that correspond to the 4 circular slots.
// Since the slots have a white/light background, they are local maxima of brightness.
function findSlotsInQuadrant(xMin, xMax, yMin, yMax, name) {
  let peaks = [];
  const minDistance = 25; // Minimum distance between circular slots

  for (let y = yMin; y < yMax; y++) {
    for (let x = xMin; x < xMax; x++) {
      const idx = (png.width * y + x) * 4;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const brightness = (r + g + b) / 3;

      // Check if this pixel is a local maximum in a 15x15 window
      let isMax = true;
      for (let dy = -7; dy <= 7; dy++) {
        for (let dx = -7; dx <= 7; dx++) {
          const nidx = (png.width * (y + dy) + (x + dx)) * 4;
          const nr = png.data[nidx];
          const ng = png.data[nidx + 1];
          const nb = png.data[nidx + 2];
          const nbr = (nr + ng + nb) / 3;
          if (nbr > brightness) {
            isMax = false;
            break;
          }
        }
        if (!isMax) break;
      }

      if (isMax && brightness > 150) {
        // Check distance to existing peaks to avoid duplicates
        let tooClose = false;
        for (const p of peaks) {
          if (Math.hypot(p.x - x, p.y - y) < minDistance) {
            tooClose = true;
            if (brightness > p.brightness) {
              p.x = x;
              p.y = y;
              p.brightness = brightness;
            }
            break;
          }
        }
        if (!tooClose) {
          peaks.push({ x, y, brightness });
        }
      }
    }
  }

  // Sort peaks by brightness and get the top 4
  peaks = peaks.sort((a, b) => b.brightness - a.brightness).slice(0, 4);

  // Sort the 4 peaks: top-left, top-right, bottom-left, bottom-right
  // We can sort them by y, then by x
  peaks = peaks.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 15) return a.x - b.x;
    return a.y - b.y;
  });

  console.log(`\nSlots in ${name}:`);
  peaks.forEach((p, i) => {
    const leftPct = ((p.x / png.width) * 100).toFixed(2);
    const topPct = ((p.y / png.height) * 100).toFixed(2);
    console.log(`  Slot ${i + 1}: px=(${p.x}, ${p.y}) -> left: '${leftPct}%', top: '${topPct}%' (brightness: ${p.brightness.toFixed(1)})`);
  });
}

findSlotsInQuadrant(70, 290, 220, 440, 'Top-Left (RED Yard)');
findSlotsInQuadrant(390, 610, 220, 440, 'Top-Right (GREEN Yard)');
findSlotsInQuadrant(70, 290, 580, 800, 'Bottom-Left (BLUE Yard)');
findSlotsInQuadrant(390, 610, 580, 800, 'Bottom-Right (YELLOW Yard)');
