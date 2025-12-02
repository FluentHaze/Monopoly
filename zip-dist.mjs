// zip-dist.mjs
import { zip } from 'zip-a-folder';
import { rmSync } from 'node:fs';

// 删除旧的 zip（可选）
try {
  rmSync('./dist.zip');
  console.log('已删除旧的 dist.zip');
} catch { }

const run = async () => {
  await zip('./dist', './dist.zip');
  console.log('✅ 成功打包 dist 为 dist.zip');
};

run();
