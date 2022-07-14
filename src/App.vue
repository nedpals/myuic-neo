<template>
  <div v-if="feedbackUrl" class="fixed bottom-[9%] md:bottom-[7%] right-[5%] z-10">
    <v-tooltip>
      <a 
        :href="feedbackUrl" 
        target="_blank"
        class="button is-primary <md:rounded-full <md:h-16 <md:w-16 md:is-medium flex items-center justify-center space-x-2">
        <icon-feedback class="<md:text-xl" />
        <span class="hidden md:inline">Feedback</span>
      </a>

      <template #popper>
        We would like to hear your feedback!
      </template>
    </v-tooltip>
  </div>

  <dialog-manager />

  <notification-group>
    <div class="fixed inset-x-0 flex flex-col" style="z-index: 9999999; top: var(--safe-area-inset-top);">
      <notification
        v-slot="{ notifications, close }"
        enter="transform ease-out transition-transform"
        enter-from="scale-y-0 opacity-0"
        enter-to="scale-y-100 opacity-100"
        leave="transition ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
        move="transition duration-500"
        move-delay="delay-300">
        <notification-container
          v-for="notification in notifications"
          :key="notification.id"
          :type="notification.type"
          :text="notification.text"
          :actions="[
            ...(notification.data?.actions ?? []),
            { label: 'Close', onClick: () => close(notification.id) }
          ]" />
      </notification>
    </div>
  </notification-group>
  <main class="dark:bg-primary-900">
    <router-view></router-view>
  </main>
</template>

<script lang="ts">
import { subscribeAuth } from './composables/auth';
import { useTitle } from '@vueuse/core';
import { useDarkMode } from './composables/ui';
import { computed, onBeforeUnmount } from 'vue';
import useReloadPrompt from './composables/sw';
import NotificationContainer from './components/ui/NotificationContainer.vue';
import IconFeedback from '~icons/ion/chatbox-ellipses';
import { useRouter } from 'vue-router';
import { useModalManager } from './composables/modal';
import DialogManager from './components/ui/DialogManager.vue';
import appEvents from './event';

export default {
  components: { NotificationContainer, IconFeedback, DialogManager },
  setup() {
    const router = useRouter();
    const feedbackUrl = computed(() => import.meta.env.VITE_FEEDBACK_URL ?? null);
    const { subscribeDarkMode } = useDarkMode();
    const unsubscribeDarkMode = subscribeDarkMode();
    const unsubscribeAuth = subscribeAuth();
    const { modalCount, closeLastModal, subscribeModalChange } = useModalManager();
    const unsubscribeModalChange = subscribeModalChange();

    useReloadPrompt();
    useTitle('MyUIC Neo');

    const destroyPopNavigation = appEvents.onNavigationPop?.({ 
      modalCount,
      closeModal: closeLastModal, 
      goBack: router.back 
    });

    onBeforeUnmount(() => {
      unsubscribeModalChange();
      unsubscribeDarkMode();
      unsubscribeAuth();
      if (destroyPopNavigation)
        destroyPopNavigation();
    });

    return { feedbackUrl }
  }
}
</script>

<style lang="postcss">
/* commissioner-regular - latin */
@font-face {
  font-family: 'Commissioner';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('/fonts/commissioner-v11-latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('/fonts/commissioner-v11-latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* commissioner-600 - latin */
@font-face {
  font-family: 'Commissioner';
  font-style: normal;
  font-weight: 600;
  src: local(''),
       url('/fonts/commissioner-v11-latin-600.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('/fonts/commissioner-v11-latin-600.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* commissioner-700 - latin */
@font-face {
  font-family: 'Commissioner';
  font-style: normal;
  font-weight: 700;
  src: local(''),
       url('/fonts/commissioner-v11-latin-700.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('/fonts/commissioner-v11-latin-700.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* commissioner-900 - latin */
@font-face {
  font-family: 'Commissioner';
  font-style: normal;
  font-weight: 900;
  src: local(''),
       url('/fonts/commissioner-v11-latin-900.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('/fonts/commissioner-v11-latin-900.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

body {
  @apply text-gray-700 font-sans-2 dark:text-white;
}

b {
  @apply font-bold;
}

/* Skeleton */
/* TODO: fix this */

.skeleton {
  @apply animate-pulse h-8 w-8 rounded-lg bg-gray-300;
}

/* Button */
.button {
  @apply px-3 py-2 rounded-lg font-semibold;
}

.button:disabled {
  @apply pointer-events-none opacity-50;
}

.button.is-medium {
  @apply px-8 py-4;
}

@variants md {
  .button.md\:is-medium {
    @apply px-8 py-4;
  }
}

.button.is-primary,
.button.is-light {
  @apply shadow border;
}

.button.is-primary,
.dark .button.dark\:is-primary {
  @apply bg-gradient-to-tr border-primary-500 hover:border-primary-700 text-white from-primary-500 to-primary-400 hover:from-primary-700 hover:to-primary-700;
}

.button.is-light {
  @apply bg-gradient-to-t from-gray-100 to-white hover:from-gray-200 hover:to-gray-200 text-gray-900;
}

/* Form Utilities */
.form-group-info + .sub-form-group-title {
  @apply mt-0;
}

.sub-form-group-title {
  @apply text-xl font-semibold mt-4;
}

.form-group {
  @apply flex flex-wrap -mx-2;
}

.form-group-info {
  @apply w-full pb-4;
}

.form-group-info > .title {
  @apply text-2xl font-bold;
}

.form-group-info > .description {
  @apply text-gray-600 dark:text-primary-400;
}

.form-control {
  @apply flex flex-col px-2 py-2;
}

.form-control > label {
  @apply mb-2 text-gray-600 dark:text-primary-400;
}

.form-control > .hint-text {
  @apply text-gray-500 dark:text-primary-300 text-sm mt-2 inline-block;
}

.form-control.is-horizontal {
  @apply flex-row items-center space-x-3;
}

.form-control.form-control.is-horizontal > label {
  @apply mb-0;
}

input[type='text'],
input[type='password'],
input[type='email'],
input[type='number'],
input[type='url'] {
  @apply !px-4 rounded-lg border border-gray-300 dark:border-primary-500 dark:bg-primary-900;
}

textarea {
  @apply !px-4 !py-2 !rounded-lg border !border-gray-300 !dark:border-primary-500 dark:bg-primary-900; 
}

select {
  @apply !px-4 !py-2 !rounded-lg border !border-gray-300 !dark:border-primary-500 dark:bg-primary-900;
}
</style>