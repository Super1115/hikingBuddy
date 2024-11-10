import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';  // Use named import


export default defineConfig({
  plugins: [
    nodePolyfills(),
    react()
  ],
  resolve: {
    alias: {
      http: 'node-polyfill-webpack-plugin'
    }
  },
  optimizeDeps: {
    include: ['@turf/turf'] // Make sure Vite includes turf in dependencies
  }
});

