/**
 * 把课程里用到的汉字笔顺数据从 hanzi-writer-data 复制到 public/hanzi-data
 * 这样笔顺动画和书写练习可以离线使用，不再依赖 CDN。
 */
import { readFileSync, readdirSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const levelsDir = join(root, 'src/data/levels');
const sourceDir = join(root, 'node_modules/hanzi-writer-data');
const targetDir = join(root, 'public/hanzi-data');

if (!existsSync(sourceDir)) {
  console.warn('[hanzi-data] 未找到 hanzi-writer-data，跳过复制');
  process.exit(0);
}

const chars = new Set();
for (const file of readdirSync(levelsDir)) {
  if (!file.endsWith('.ts')) continue;
  const source = readFileSync(join(levelsDir, file), 'utf8');
  for (const match of source.matchAll(/char:\s*'([^']+)'/g)) {
    // 只处理单字汉字，英文字母/单词没有笔顺数据
    if (/^\p{Script=Han}$/u.test(match[1])) {
      chars.add(match[1]);
    }
  }
}

mkdirSync(targetDir, { recursive: true });

let copied = 0;
let missing = 0;
for (const char of chars) {
  const from = join(sourceDir, `${char}.json`);
  if (!existsSync(from)) {
    missing++;
    continue;
  }
  copyFileSync(from, join(targetDir, `${char}.json`));
  copied++;
}

console.log(`[hanzi-data] 已复制 ${copied} 个字的笔顺数据${missing ? `，${missing} 个缺失` : ''}`);
