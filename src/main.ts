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
import { IS_ANDROID } from './utils'

async function showSplashScreen() {
  if (IS_ANDROID) {
    await SplashScreen.show();
  }
}



function startApp() {
  (async () => {
    if (IS_ANDROID)
      await SplashScreen.hide();
  })().finally(() => {
    registerSW({ immediate: true });
  
    createApp(App)
      .use(createPinia())
      .use(router)
      .use(Notifications)
      .use(FloatingVue)
      .mount('#app');
  });
}

if (!import.meta.env.PROD || !import.meta.env.VITE_API_URL) {
  showSplashScreen()
    .then(() => import('./mockserver'))
    .then(({ useMockServer }) => useMockServer())
    .finally(startApp);
} else {
  showSplashScreen()
    .then(() => {
      if (IS_ANDROID)
        return new Promise(resolve => setTimeout(resolve, 1000));
    })
    .finally(startApp);
}

