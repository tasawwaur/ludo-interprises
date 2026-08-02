import fs from 'fs';
import { PNG } from 'pngjs';

const file = 'public/assets/images/backgrounds/luxury_ludo_board.png';
const data = fs.readFileSync(file);
const png = PNG.sync.read(data);

// Let's find the boundaries of the colored corner yards.
// A yard is a 6x6 area of the 15x15 board.
// Top-Left yard is RED. Let's find pixels where R > 150, G < 50, B < 50.
// Top-Right yard is GREEN. Let's find pixels where G > 120, R < 80, B < 80.
// Bottom-Left yard is BLUE. Let's find pixels where B > 150, R < 80, G < 120.
// Bottom-Right yard is YELLOW. Let's find pixels where R > 150, G > 120, B < 80.

let redMinX = Infinity, redMaxX = -Infinity, redMinY = Infinity, redMaxY = -Infinity;
let greenMinX = Infinity, greenMaxX = -Infinity, greenMinY = Infinity, greenMaxY = -Infinity;
let blueMinX = Infinity, blueMaxX = -Infinity, blueMinY = Infinity, blueMaxY = -Infinity;
let yellowMinX = Infinity, yellowMaxX = -Infinity, yellowMinY = Infinity, yellowMaxY = -Infinity;

for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const idx = (png.width * y + x) * 4;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];

    // Red (Top-Left on luxury board? Wait! In the screenshot, Top-Left yard is RED!)
    if (r > 150 && g < 40 && b < 40) {
      if (x < redMinX) redMinX = x;
      if (x > redMaxX) redMaxX = x;
      if (y < redMinY) redMinY = y;
      if (y > redMaxY) redMaxY = y;
    }
    // Green (Top-Right on luxury board? In the screenshot, Top-Right yard is GREEN!)
    if (g > 120 && r < 50 && b < 80) {
      if (x < greenMinX) greenMinX = x;
      if (x > greenMaxX) greenMaxX = x;
      if (y < greenMinY) greenMinY = y;
      if (y > greenMaxY) greenMaxY = y;
    }
    // Blue (Bottom-Left on luxury board? In the screenshot, Bottom-Left yard is BLUE!)
    if (b > 150 && r < 60 && g < 120) {
      if (x < blueMinX) blueMinX = x;
      if (x > blueMaxX) blueMaxX = x;
      if (y < blueMinY) blueMinY = y;
      if (y > blueMaxY) blueMaxY = y;
    }
    // Yellow (Bottom-Right on luxury board? In the screenshot, Bottom-Right yard is YELLOW!)
    if (r > 160 && g > 110 && b < 50) {
      if (x < yellowMinX) yellowMinX = x;
      if (x > yellowMaxX) yellowMaxX = x;
      if (y < yellowMinY) yellowMinY = y;
      if (y > yellowMaxY) yellowMaxY = y;
    }
  }
}

console.log('Detected Yard bounding boxes (pixels):');
console.log(`RED (Top-Left): X=[${redMinX}, ${redMaxX}], Y=[${redMinY}, ${redMaxY}]`);
console.log(`GREEN (Top-Right): X=[${greenMinX}, ${greenMaxX}], Y=[${greenMinY}, ${greenMaxY}]`);
console.log(`BLUE (Bottom-Left): X=[${blueMinX}, ${blueMaxX}], Y=[${blueMinY}, ${blueMaxY}]`);
console.log(`YELLOW (Bottom-Right): X=[${yellowMinX}, ${yellowMaxX}], Y=[${yellowMinY}, ${yellowMaxY}]`);

// Let's calculate the grid size and offsets based on these yards.
// The whole board area contains:
// Left edge = min(redMinX, blueMinX)
// Right edge = max(greenMaxX, yellowMaxX)
// Top edge = min(redMinY, greenMinY)
// Bottom edge = max(blueMaxY, yellowMaxY)

const leftEdge = Math.min(redMinX, blueMinX);
const rightEdge = Math.max(greenMaxX, yellowMaxX);
const topEdge = Math.min(redMinY, greenMinY);
const bottomEdge = Math.max(blueMaxY, yellowMaxY);

console.log(`\nWhole Ludo Board Grid Box:`);
console.log(`X = [${leftEdge}, ${rightEdge}], Width = ${rightEdge - leftEdge}`);
console.log(`Y = [${topEdge}, ${bottomEdge}], Height = ${bottomEdge - topEdge}`);
