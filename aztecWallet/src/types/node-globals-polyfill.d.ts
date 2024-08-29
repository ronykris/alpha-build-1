declare module '@esbuild-plugins/node-globals-polyfill' {
    import { Plugin } from 'esbuild'
    export function NodeGlobalsPolyfillPlugin(options?: { buffer?: boolean; process?: boolean }): Plugin
  }