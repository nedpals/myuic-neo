import { registerSW } from 'virtual:pwa-register';
import { isMock } from './client';
import { startApp } from './main.common';

import printJS from 'print-js';

async function initializeServer() {
  if (!import.meta.env.PROD || isMock) {
    (await import('./mockserver')).useMockServer();
  }
}

startApp(async () => {
  try {
    await initializeServer();
  } finally {
    await registerSW({ immediate: true })(true);
  }
}, {
  async onDownloadURL({ url, data, fileName }) {
    var link = document.createElement("a");
    link.download = fileName;

    if (data) {
      if (fileName.endsWith('.pdf')) {
        link.href = URL.createObjectURL(new Blob([data.buffer], { type: 'application/pdf' }));
      }
    } else if (url) {
      link.href = url;
    }

    link.click();
  },
  async onPrintPage({ url, data }) {
    if (data) {
      const blob = new Blob([data.buffer], { type: 'application/pdf' });
      printJS(URL.createObjectURL(blob));
    } else if (url) {
      printJS(url);
    }
    return false;
  }
});
