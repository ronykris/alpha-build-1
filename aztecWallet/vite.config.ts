import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
//import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
//import rollupNodePolyFill from 'rollup-plugin-node-polyfills'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'stream': 'rollup-plugin-node-polyfills/polyfills/stream',
      'events': 'rollup-plugin-node-polyfills/polyfills/events',
      'util': 'rollup-plugin-node-polyfills/polyfills/util',
      'process': 'rollup-plugin-node-polyfills/polyfills/process-es6'
    },
  },
  optimizeDeps: { 
    esbuildOptions: { 
      target: "esnext" 
    },
    /*plugins: [
      NodeGlobalsPolyfillPlugin({
        buffer: true,
        process: true,
      })
    ]*/
  },
  /*build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
    }
  },*/
  define: {
    'process.env': {
      NODE_DEBUG: false,
    },
    global: {},
  },
})
