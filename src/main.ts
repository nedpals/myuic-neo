import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Notifications from 'notiwind'
import FloatingVue from 'floating-vue'

import App from './App.vue'
import router from './router'

import 'floating-vue/dist/style.css'
import 'virtual:windi.css'
import 'virtual:windi-devtools'
import { registerSW } from 'virtual:pwa-register'

import { SplashScreen } from '@capacitor/splash-screen'
import { APP_PREFIX, IS_NATIVE } from './utils'
import { Storage } from '@capacitor/storage'

import { VueQueryPlugin } from 'vue-query'

Storage.configure({
  group: APP_PREFIX
});

async function startApp() {
  try {
    await SplashScreen.hide();
    await registerSW({ immediate: true })(true);
  } catch (e) {
    console.error(e);
  } finally {
    const app = createApp(App)
      .use(VueQueryPlugin)
      .use(createPinia())
      .use(router)
      .use(Notifications)
      .use(FloatingVue);

    app.config.unwrapInjectedRef = true;
    app.mount('#app');
  }
}

async function initializeServer() {
  if (!import.meta.env.PROD || !import.meta.env.VITE_API_URL) {
    (await import('./mockserver')).useMockServer();
  } else if (IS_NATIVE) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}


SplashScreen.show()
  .then(initializeServer)
  .finally(() => {
    startApp();
  });
