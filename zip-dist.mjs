import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { zipSync } from 'fflate';

const files = {};
function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collect(path);
    else files[relative('dist', path).split('\\').join('/')] = readFileSync(path);
  }
}
collect('dist');
writeFileSync('dist.zip', zipSync(files));
console.log('已生成 dist.zip');
