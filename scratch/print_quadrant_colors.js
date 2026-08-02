import fs from 'fs';
import { PNG } from 'pngjs';

const file = 'public/assets/images/backgrounds/luxury_ludo_board.png';
const data = fs.readFileSync(file);
const png = PNG.sync.read(data);

// Print colors in a grid in the Bottom-Left yard area
for (let y = 650; y < 800; y += 15) {
  let line = `y=${y}: `;
  for (let x = 100; x < 250; x += 15) {
    const idx = (png.width * y + x) * 4;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    line += `(${r},${g},${b}) `;
  }
  console.log(line);
}
