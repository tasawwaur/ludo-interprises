import fs from 'fs';
import path from 'path';

function findFiles(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, filter));
    } else {
      if (file.toLowerCase().includes(filter)) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const tokenFiles = findFiles('public/assets/images', 'token');
console.log('Found Token Files:');
tokenFiles.forEach(f => console.log(f));
