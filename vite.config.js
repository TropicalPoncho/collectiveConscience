import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  resolve: {
    alias: [
      { find: /^three$/, replacement: path.resolve(__dirname, './src/client/three-patch.js') },
      { find: '@', replacement: path.resolve(__dirname, './src/client') },
    ],
  },
  build: {
    outDir: 'dist',
  },
});