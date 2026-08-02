import fs from 'fs';
import { PNG } from 'pngjs';

const file = 'public/assets/images/backgrounds/luxury_ludo_board.png';
const data = fs.readFileSync(file);
const png = PNG.sync.read(data);

console.log(`Image size: ${png.width} x ${png.height}`);

// Let's sample a grid of pixel colors in the top-left yard (RED)
// RED yard center is around (3, 3) in a 15x15 grid, which is 20% of image size.
// Let's print out the RGB values in a 50x50 grid of the top-left region to find the white/light circle slots.
// We'll look for clusters of high brightness (R+G+B) or specific patterns.
const stepX = png.width / 100;
const stepY = png.height / 100;

console.log(`Step size: X=${stepX}, Y=${stepY}`);

// We can output a simple ASCII map of brightness in the top-left quadrant (0% to 50% width and height)
let map = '';
for (let y = 10; y < 45; y++) {
  let row = '';
  for (let x = 10; x < 45; x++) {
    const px = Math.floor(x * stepX);
    const py = Math.floor(y * stepY);
    const idx = (png.width * py + px) * 4;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    const brightness = (r + g + b) / 3;
    // Show character based on brightness
    if (brightness > 200) {
      row += '#'; // Very bright (circle slot center/border)
    } else if (brightness > 150) {
      row += '+';
    } else if (brightness > 100) {
      row += '.';
    } else {
      row += ' ';
    }
  }
  map += row + '\n';
}

console.log('Brightness map of top-left yard (10% to 45%):');
console.log(map);
