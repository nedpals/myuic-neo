import { registerSW } from 'virtual:pwa-register';
import { startApp } from './main.common'

async function initializeServer() {
  if (!import.meta.env.PROD || !import.meta.env.VITE_API_URL) {
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
