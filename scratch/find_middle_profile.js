import fs from 'fs';
import { PNG } from 'pngjs';

const file = 'public/assets/images/backgrounds/luxury_ludo_board.png';
const data = fs.readFileSync(file);
const png = PNG.sync.read(data);

// Let's print out the colors along y = 512 (middle of the image height-wise)
const y = Math.floor(png.height / 2);
console.log(`Scan along y = ${y}:`);
for (let x = 0; x < png.width; x += 10) {
  const idx = (png.width * y + Math.floor(x)) * 4;
  const r = png.data[idx];
  const g = png.data[idx + 1];
  const b = png.data[idx + 2];
  console.log(`x=${x}: R=${r}, G=${g}, B=${b}`);
}
