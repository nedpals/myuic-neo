import { createApp } from 'vue'

import Notifications from 'notiwind'
import FloatingVue from 'floating-vue'

import App from './App.vue'
import router, { initRouter } from './router'

import 'floating-vue/dist/style.css'
import './assets/style.css'

import { APP_PREFIX, feedbackUrl } from './utils'
import { Preferences } from '@capacitor/preferences'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { customClientOptions } from './client'

import defaultAppEvents, { AppEvents } from './event'
import { retrieve } from './composables/auth'
import { defaultNavLinkEntries } from './composables/nav'

import IconFeedback from '~icons/ion/chatbox-ellipses-outline'

export async function startApp(initialize: () => Promise<void>, customAppEvents?: Partial<AppEvents>) {
  try {
    if (customAppEvents) {
      for (const event in customAppEvents) {
        defaultAppEvents[event] = customAppEvents[event];
      }
    }

    // THIS IS SUPER UGLY. find another way in the future
    defaultNavLinkEntries.push({
      icon: IconFeedback,
      title: 'Feedback',
      group: '_meta',
      subtitle: 'We would like to hear your feedback!',
      link: true,
      to: feedbackUrl.value,
      class: 'md:!hidden',
      children: [],
      isCurrent: false,
      order: 10
    });

    await Preferences.configure({ group: APP_PREFIX });
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
