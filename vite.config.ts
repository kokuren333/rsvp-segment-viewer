import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'mecab-wasm/lib/mecab.js': path.resolve(__dirname, 'node_modules/mecab-wasm/lib/mecab.js'),
    },
  },
  assetsInclude: ['**/*.data'],
  optimizeDeps: {
    exclude: ['mecab-wasm', 'mecab-wasm/lib/mecab.js'],
  },
});
