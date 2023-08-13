import { createApp } from 'vue'

import Notifications from 'notiwind'
import FloatingVue from 'floating-vue'

import App from './App.vue'
import router, { initRouter } from './router'

import 'floating-vue/dist/style.css'
import './assets/style.css'

import { APP_PREFIX } from './utils'
import { Storage } from '@capacitor/storage'

import { VueQueryPlugin } from '@tanstack/vue-query'
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
    initRouter();

    const app = createApp(App)
      .use(VueQueryPlugin, customClientOptions)
      .use(router)
      .use(Notifications)
      .use(FloatingVue);

    app.mount('#app');
  }
}
