<template>
  <div v-if="feedbackUrl" class="hidden md:block fixed bottom-[9%] md:bottom-[7%] right-[5%] z-10">
    <v-tooltip>
      <Button
        as="a"
        :href="feedbackUrl"
        target="_blank"
        theme="primary"
        class="rounded-full md:rounded-none h-16 w-16 md:h-[unset] md:w-full md:is-medium flex items-center justify-center space-x-2">
        <icon-feedback class="text-xl md:text-base" />
        <span class="hidden md:inline">Feedback</span>
      </Button>

      <template #popper>
        We would like to hear your feedback!
      </template>
    </v-tooltip>
  </div>

  <dialog-manager />

  <notification-group>
    <div class="max-w-7xl mx-auto fixed inset-x-0 flex flex-col" style="z-index: 9999999; top: var(--safe-area-inset-top);">
      <notification
        v-slot="{ notifications, close }"
        enter="translate ease transition-all"
        enter-from="-translate-y-6 opacity-0"
        enter-to="translate-y-0 opacity-100"
        leave="transition ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
        move="transition duration-500"
        move-delay="delay-100">
        <notification-container
          v-for="notification in notifications"
          class="rounded-lg mx-2 md:mx-0 my-2 origin-center"
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
  <main>
    <div v-if="!isGloballyEnabled" class="flex flex-col space-y-32 items-center justify-center max-w-xl mx-auto h-screen">
      <icon-logo class="text-primary-400 h-48 w-48 mb-4" />
      <loader v-if="isLoading" class="w-16" />
      <p v-else class="text-2xl text-center" v-html="healthErrorMessage"></p>

      <div v-if="isLoading" class="text-center rounded-lg p-2">
        <p class="text-lg">Connecting to UIC servers...</p>
        <p class="text-sm text-zinc-500 dark:text-primary-200">Please be patient as they might be busy at the moment.</p>
      </div>
    </div>

    <router-view v-else />
  </main>
</template>

<script setup lang="ts">
import { subscribeAuth } from './composables/auth';
import { useTitle } from '@vueuse/core';
import { useDarkMode } from './composables/ui';
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import useReloadPrompt from './composables/sw';
import NotificationContainer from './components/ui/NotificationContainer.vue';
import IconFeedback from '~icons/ion/chatbox-ellipses';
import { useRouter } from 'vue-router';
import { useModalManager } from './composables/modal';
import DialogManager from './components/ui/DialogManager.vue';
import appEvents from './event';
import Button from './components/ui/Button.vue';
import Loader from './components/ui/Loader.vue';
import IconLogo from '~icons/custom/logo';
import { useQuery } from '@tanstack/vue-query';
import { client, isGloballyEnabled } from './client';
import { feedbackUrl } from './utils';

const router = useRouter();
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

const { data, isLoading, status, error: healthError } = useQuery(['health'], async () => {
  const status = await client.checkHealth();
  if (!status.isAlive) {
    if (status.status >= 500 || status.status == 404) {
      throw new Error('Something is wrong when talking to UIC servers. Please try again later. Visit <a href="https://facebook.com/uicph">UIC Facebook Page</a> for more details.');
    } else if (status.status >= 400) {
      throw new Error('Might be a problem on our side. Please report this issue and try again later.');
    }

    throw new Error('Unknown error. Please report this issue and try again later.');
  }

  return status;
}, {
  enabled: true
});

const healthErrorMessage = computed(() => {
  if (!healthError.value || !(healthError.value instanceof Error)) {
    return 'Unknown error. Please report this issue and try again later.';
  }

  return healthError.value.message;
});

const unsubscribeHealthWatch = watch(status, (newStatus, _) => {
  if (newStatus === 'success') {
    isGloballyEnabled.value = data.value?.isAlive ?? false;
  } else if (newStatus === 'error') {
    isGloballyEnabled.value = false;
  }
});

onBeforeUnmount(() => {
  unsubscribeModalChange();
  unsubscribeDarkMode();
  unsubscribeAuth();
  unsubscribeHealthWatch();
  if (destroyPopNavigation)
    destroyPopNavigation();
});
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

:root {
  --safe-area-inset-top: 0px;
  --safe-area-inset-bottom: 0px;
  --safe-area-inset-left: 0px;
  --safe-area-inset-right: 0px;
}

b {
  @apply font-bold;
}

/* Skeleton */
/* TODO: fix this */

.skeleton {
  @apply animate-pulse h-8 w-8 rounded-lg bg-zinc-300;
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

.button.md\:is-medium {
  @apply md:px-8 md:py-4;
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
  @apply bg-gradient-to-t from-zinc-100 to-white hover:from-zinc-200 hover:to-zinc-200 text-zinc-900;
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
  @apply text-zinc-600 dark:text-primary-200;
}

.form-control {
  @apply flex flex-col px-2 py-2;
}

.form-control > label {
  @apply mb-2 text-zinc-600 dark:text-primary-50;
}

.form-control > .hint-text {
  @apply text-zinc-500 dark:text-primary-200 text-sm mt-2 inline-block;
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
input[type='url'],
textarea,
select {
  @apply !px-4 !py-2 !rounded-lg border border-zinc-300 dark:border-primary-700 dark:bg-primary-850;

  &:focus {
    @apply ring-primary-500;
  }
}
</style>
