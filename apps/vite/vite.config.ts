import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  // VITE_BASE_PATH is set by CI to the repo name (e.g. "assisted-forms-designer").
  // Wrap with slashes so Vite gets the correct sub-path for GitHub Pages.
  base: process.env.VITE_BASE_PATH ? `/${process.env.VITE_BASE_PATH}/` : '/',
  resolve: {
    // zod-to-json-schema 3.25.x imports from "zod/v3" (a Zod v4 compat subpath that
    // doesn't exist in Zod v3). Alias it back to the installed "zod" so the build succeeds.
    alias: {
      'zod/v3': 'zod',
    },
    // Force Vite to resolve these packages to the single copy at the workspace root,
    // preventing duplicate instances when a dependency (e.g. @graviola/agent-chat-components)
    // has a nested node_modules copy of MUI that differs from the workspace version.
    // This is the immediate consumer-side fix; the proper long-term fix is in the
    // library source (moving MUI from dependencies → peerDependencies).
    dedupe: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@mui/system',
      '@mui/utils',
      '@emotion/react',
      '@emotion/styled',
      '@emotion/cache',
    ],
  },
  optimizeDeps: {
    include: ['i18next', 'react-i18next'],
  },
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