import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { offlinePlugin } from './scripts/pwa-plugin';

export default defineConfig({
  base: './',
  plugins: [react(), offlinePlugin()],
  optimizeDeps: { include: ['typescript', 'pyodide', 'sql.js', 'yaml'] },
  worker: { format: 'es' },
  build: { chunkSizeWarningLimit: 1200 },
});
