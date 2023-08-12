import { defineConfig } from 'vite'
import baseConfig from './vite.config'
import { resolve, join } from 'path'

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
  }
});
