import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base 使用相对路径 './' + HashRouter：兼容 GitHub Pages 任意子路径、自定义域名与本地 file:// 打开。
// 若你想固定仓库子路径（如 /HHQTsHOME/），可改为 base: '/HHQTsHOME/'，但仓库改名后会失效。
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 1600,
  },
});
