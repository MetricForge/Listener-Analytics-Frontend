import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false, // Set to true to auto-open in browser after build
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Naming patterns
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        // Manual code splitting
manualChunks(id) {
  if (id.includes('node_modules')) {
    // 1️⃣ Split Papaparse out
    if (id.includes('papaparse')) return 'papaparse';

    // 2️⃣ Group D3 submodules together
    if (id.includes('d3-')) return 'd3';

    // 3️⃣ Other existing chunks
    if (id.includes('recharts')) return 'charting';
    if (id.includes('react-select')) return 'filters';
    if (id.includes('dayjs')) return 'time';
    if (id.includes('xlsx')) return 'xlsx';
    if (id.includes('decimal.js-light')) return 'decimal';
    if (id.includes('lodash')) return 'lodash';

    // 4️⃣ Everything else
    return 'vendor';
  }

  // App-specific
  if (id.includes('GW2')) return 'gw2';
},
      },
    },
  },
});
