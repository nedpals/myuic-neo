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
    initializeServer();
  } finally {
    await registerSW({ immediate: true })(true);
  }
});
