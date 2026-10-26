import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// O app roda em rafaeltavarescorretor.com.br/corretores
// O build é gerado direto na pasta ../corretores (que o site já serve).
export default defineConfig({
  base: '/corretores/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {'@': path.resolve(__dirname, '.')},
  },
  build: {
    outDir: '../corretores',
    emptyOutDir: true,
  },
  server: {
    proxy: {'/corretores/api': 'http://localhost:3000'},
  },
});
