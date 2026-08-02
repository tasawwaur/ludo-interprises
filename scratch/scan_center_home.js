import fs from 'fs';
import { PNG } from 'pngjs';

const file = 'public/assets/images/backgrounds/luxury_ludo_board.png';
const data = fs.readFileSync(file);
const png = PNG.sync.read(data);

// Bottom home triangle (belongs to GREEN in code, which is blue visually at bottom).
// The center of the board is at columns 6, 7, 8 and rows 6, 7, 8.
// In pixels, x is around 280 to 400, y is around 480 to 600.
// Let's scan this region for golden/dark circular slots or target points.
// Let's print out the RGB colors in a grid in this area.
for (let y = 480; y < 600; y += 10) {
  let line = `y=${y}: `;
  for (let x = 280; x < 400; x += 10) {
    const idx = (png.width * y + x) * 4;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    line += `(${r},${g},${b}) `;
  }
  console.log(line);
}
