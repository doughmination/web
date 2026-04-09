const fs = require('fs');
const path = require('path');

const dir = './assets/crafts';
const files = fs.readdirSync(dir).filter(f => /\.(png|jpe?g|gif|webp)$/i.test(f));
fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(files, null, 2));
console.log(`Manifest written with ${files.length} file(s).`);