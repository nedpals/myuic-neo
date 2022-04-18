// @ts-check
const run = require('cordova-res');

run({
  errstream: process.stderr,
  logstream: process.stdout,
  resourcesDirectory: 'resources',
  copy: true,
  platforms: {
    android: {
      "adaptive-icon": {
        background: {
          sources: ['resources/icon-background.png']
        },
        foreground: {
          sources: ['resources/icon-foreground.png']
        }
      },
      icon: {
        sources: ['resources/icon.png']
      },
      splash: {
        sources: ['resources/splash.jpg']
      },
    },
    ios: {
      icon: {
        sources: ['resources/icon-square.png']
      },
      splash: {
        sources: ['resources/splash.jpg']
      },
    },
  }
});