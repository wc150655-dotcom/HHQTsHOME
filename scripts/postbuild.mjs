/** 构建后处理：复制 index.html 为 404.html（GitHub Pages 未匹配路径时回退到应用） */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve(process.cwd(), 'dist');
if (!existsSync(dist)) {
  mkdirSync(dist, { recursive: true });
}
copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
console.log('[postbuild] dist/404.html 已生成');
