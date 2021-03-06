import { createApp } from 'vue'

import Notifications from 'notiwind'
import FloatingVue from 'floating-vue'

import App from './App.vue'
import router from './router'

import 'floating-vue/dist/style.css'
import 'virtual:windi.css'
import 'virtual:windi-devtools'

import { APP_PREFIX } from './utils'
import { Storage } from '@capacitor/storage'

import { VueQueryPlugin } from 'vue-query'
import { customClientOptions } from './client'

import defaultAppEvents, { AppEvents } from './event'
import { retrieve } from './composables/auth'

export async function startApp(initialize: () => Promise<void>, customAppEvents?: Partial<AppEvents>) {
  try {
    if (customAppEvents) {
      for (const event in customAppEvents) {
        defaultAppEvents[event] = customAppEvents[event];
      }
    }

    await Storage.configure({ group: APP_PREFIX });
    await retrieve();
    await initialize();
  } catch (e) {
    console.error(e);
  } finally {
    const app = createApp(App)
      .use(VueQueryPlugin, customClientOptions)
      .use(router)
      .use(Notifications)
      .use(FloatingVue);

    app.config.unwrapInjectedRef = true;
    app.mount('#app');
  }
}
