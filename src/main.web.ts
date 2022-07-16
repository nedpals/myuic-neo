import { registerSW } from 'virtual:pwa-register';
import { isMock } from './client';
import { startApp } from './main.common'

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
  async onPrintPage({ url, data}) {
    const newTab = window.open(url, '_blank');
    return !!newTab;
  }
});
