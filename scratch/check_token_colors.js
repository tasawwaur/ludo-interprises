import fs from 'fs';
import { PNG } from 'pngjs';

const dir = 'public/assets/images/icons/';
const files = ['token_red_3d.png', 'token_green_3d.png', 'token_yellow_3d.png', 'token_blue_3d.png'];

files.forEach(f => {
  const path = dir + f;
  if (!fs.existsSync(path)) {
    console.log(`File not found: ${path}`);
    return;
  }
  const data = fs.readFileSync(path);
  const png = PNG.sync.read(data);

  // Calculate average color of non-transparent pixels
  let totalR = 0, totalG = 0, totalB = 0, count = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const a = png.data[i + 3];
    if (a > 100) {
      totalR += r;
      totalG += g;
      totalB += b;
      count++;
    }
  }

  const avgR = (totalR / count).toFixed(1);
  const avgG = (totalG / count).toFixed(1);
  const avgB = (totalB / count).toFixed(1);

  console.log(`File: ${f} -> Avg RGB = (${avgR}, ${avgG}, ${avgB})`);
});
