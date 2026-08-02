import fs from 'fs';
import { PNG } from 'pngjs';

const file = 'public/assets/images/backgrounds/luxury_ludo_board.png';
const data = fs.readFileSync(file);
const png = PNG.sync.read(data);

console.log(`Image: ${png.width} x ${png.height}`);

// Let's print out the brightness profile along the vertical center (x = width / 2)
// to see if we can find the top and bottom borders of the board.
// The board grid usually has white/yellow cells in the middle (row 7 has home corridor etc.).
// Let's scan along x = width / 2 (which is col 7.5, the center corridor).
const x = Math.floor(png.width / 2);
let profile = [];
for (let y = 0; y < png.height; y++) {
  const idx = (png.width * y + x) * 4;
  const r = png.data[idx];
  const g = png.data[idx + 1];
  const b = png.data[idx + 2];
  const brightness = (r + g + b) / 3;
  profile.push({ y, r, g, b, brightness });
}

// Write the profile data to a file for inspect or analyze it here.
// Let's find vertical lines: Ludo board typically has horizontal border lines at y_start and y_end.
// Let's look for sharp color/brightness changes at the top and bottom.
let transitions = [];
for (let i = 1; i < profile.length; i++) {
  const diff = Math.abs(profile[i].brightness - profile[i - 1].brightness);
  if (diff > 30) {
    transitions.push({ y: i, diff, c1: profile[i-1], c2: profile[i] });
  }
}

// Let's print the top 20 transitions
console.log('Top transitions:');
console.log(transitions.sort((a, b) => b.diff - a.diff).slice(0, 30));
