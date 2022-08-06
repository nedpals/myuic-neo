import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';
import colorPalette from './color_palette';
import baseConfig from './vite.config';
import { resolve, join } from 'path';

const plugins = baseConfig instanceof Promise || typeof baseConfig !== 'object' ? [] : baseConfig.plugins;

export default defineConfig({
  ...baseConfig,
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      'main': resolve(__dirname, join('.', 'src', 'main.web.ts'))
    }
  },
  plugins: [
    ...plugins,
    VitePWA({
      registerType: 'autoUpdate',
      includeManifestIcons: true,
      manifest: {
        background_color: "#FFFFFF",
        theme_color: colorPalette.primary[500],
        name: "MyUIC Neo",
        short_name: 'MyUIC Neo',
        display: "standalone",
        icons: [
          { "src": "/icons/favicon.ico", "type": "image/x-icon", "sizes": "16x16 32x32" },
          { "src": "/icons/icon-192.png", "type": "image/png", "sizes": "192x192" },
          { "src": "/icons/icon-512.png", "type": "image/png", "sizes": "512x512" },
          { "src": "/icons/icon-192-maskable.png", "type": "image/png", "sizes": "192x192", "purpose": "maskable" },
          { "src": "/icons/icon-512-maskable.png", "type": "image/png", "sizes": "512x512", "purpose": "maskable" }
        ],
      },
    }),
  ]
});