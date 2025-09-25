import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/forms-designer',
  plugins: [
    react(),
    // Generate multiple visualization files
    visualizer({
      filename: './dist/analysis/flamegraph.html',
      template: 'sunburst', // This generates the flamegraph-style visualization
      title: 'Bundle Flamegraph',
    }),
    visualizer({
      filename: './dist/analysis/network.html',
      template: 'network',
      title: 'Bundle Network',
    }),
    visualizer({
      filename: './dist/analysis/sunburst.html',
      template: 'sunburst',
      title: 'Bundle Sunburst',
    }),
    visualizer({
      filename: './dist/analysis/treemap.html',
      template: 'treemap',
      title: 'Bundle Treemap',
    }),
  ],
})