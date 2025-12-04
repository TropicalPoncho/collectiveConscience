import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client'),
    },
  },
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    host: true, // Necesario para Docker
    open: false, // No intentar abrir navegador en Docker
    proxy: {
      '/neurons': process.env.API_URL || 'http://localhost:3000',
      '/network': process.env.API_URL || 'http://localhost:3000',
      '/synapses': process.env.API_URL || 'http://localhost:3000',
      '/soma': process.env.API_URL || 'http://localhost:3000',
      '/submit-form': process.env.API_URL || 'http://localhost:3000',
      '/users': process.env.API_URL || 'http://localhost:3000',
    }
  }
});