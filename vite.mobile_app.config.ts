import { defineConfig } from 'vite'
import baseConfig from './vite.config'
import { resolve, join } from 'path'

export default defineConfig({
  ...baseConfig,
  resolve: {
    alias: {
      'main': resolve(__dirname, join('.', 'src', 'main.mobile_app.ts')),
      './composables/sw': resolve(__dirname, join('.', 'src', 'composables', 'sw_shim.ts'))
    }
  },
  build: {
    outDir: 'dist_mobile_app'
  }
});