import { defineConfig } from 'vite'
import baseConfig from './vite.config'
import { resolve, join } from 'path'
import legacy from '@vitejs/plugin-legacy'

const plugins = baseConfig instanceof Promise || typeof baseConfig !== 'object' ? [] : baseConfig.plugins;

export default defineConfig({
  ...baseConfig,
  resolve: {
    alias: {
      '/src/main.ts': resolve(__dirname, join('.', 'src', 'mobile', 'main.ts')),
      './composables/sw': resolve(__dirname, join('.', 'src', 'mobile', 'sw_shim.ts'))
    }
  },
  build: {
    outDir: 'dist_mobile_app'
  },
  plugins: [
    ...plugins,
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
});
