<template>
  <div class="sticky inset-x-0 top-0 z-1">
    <div style="padding-top: var(--safe-area-inset-top);" class="bg-white dark:bg-primary-900 px-4 md:px-5" v-if="title ? true : $route.meta.useHeader ?? true">
      <div class="relative flex-0" :class="[subtitle ? 'py-1 mb-2' : 'py-3 md:py-5']">
        <div class="absolute right-0 top-4 md:top-5 dashboard-scaffold-actions" :class="{ 'has-more-button': shouldActionsBeDropdown }">
          <Menu v-if="shouldActionsBeDropdown">
            <menu-button :as="Button" class="more-button" :icon="IconMore" />

            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-out"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <menu-items
                class="dashboard-scaffold-actions-dropdown absolute right-0 z-10 mt-1 min-w-[60vw] md:min-w-[30vw] border dark:border-primary-700 bg-white dark:bg-primary-800 shadow-lg max-h-56 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                <menu-item v-for="(action, ai) in actionsSlot" :key="`actions_${ai}`" as="template">
                  <component :is="action" />
                </menu-item>
              </menu-items>
            </transition>
          </Menu>

          <component
            v-for="(action, ai) in actionsSlot" :key="`actions_${ai}`"
            :is="action" />
        </div>

        <div class="flex flex-col text-center md:text-left">
          <span :class="[subtitle ? 'md:text-lg' : 'text-xl']" class="font-bold">
            {{ pageTitle ?? 'Unknown page name' }}
          </span>
          <span v-if="subtitle" class="text-xs md:text-sm">{{ subtitle }}</span>
        </div>
      </div>
      <div :class="childMenuClass" class="overflow-x-auto">
        <ul class="flex space-x-2">
          <li :key="'child_' + entry.title" v-for="entry in childRouteLinks" class="inline-flex flex-shrink-0">
            <router-link
              :to="entry.to"
              v-slot="{ isExactActive, href, navigate }"
              custom>
              <a
                :href="href"
                @click="navigate"
                style="transition: ease 150ms background-color"
                class="px-4 py-2 md:py-3 rounded-lg"
                :class="[isExactActive ?
                  'bg-primary-200 dark:bg-primary-700 hover:bg-primary-300 dark:hover:!bg-primary-600' :
                  'bg-primary-50 hover:bg-primary-100 dark:bg-primary-800 dark:hover:bg-primary-700']">
                  {{ entry.title }}
              </a>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <main :class="containerClass">
    <slot></slot>
  </main>
</template>

<script lang="ts" setup>
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import IconMore from '~icons/ion/more';
import Button from './Button.vue';

import { useTitle } from '@vueuse/core';
import { computed, watch, useSlots, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useAdditionalInfoQuery, useStudentQuery } from '../../stores/studentStore.js';
import { useProfileMutation, useProfiles } from '../../composables/auth.js';
import appEvents from '../../event';
import { useNav } from '../../composables/nav';

defineEmits(['reload']);

const { title, subtitle } = defineProps({
  title: {
    type: String
  },
  subtitle: {
    type: String
  },
  containerClass: {
    type: String
  },
  childMenuClass: {
    type: String
  }
});

const route = useRoute();
const slots = useSlots();
const actionsSlot = slots.actions?.() ?? [];
const shouldActionsBeDropdown = computed(() => actionsSlot.length > 1);
const { infoQuery: { data: additionalInfo } } = useAdditionalInfoQuery();

const { currentEntry, currentRoute } = useNav();
const childRouteLinks = computed(() => {
  if (route.matched.length < 3) return [];
  return currentEntry.value?.children ?? [];
});

const pageTitle = computed(() => {
  if (title) return title;
  if (route.matched.length < 3 || !currentRoute.value) return route.meta.pageTitle;
  return currentRoute.value.meta.pageTitle;
})

const unwatchTitle = watch(() => route.fullPath, () => {
  useTitle(`${pageTitle.value} | MyUIC Neo`);
}, {
  immediate: true
});

// Inject details to student
const { mutate: saveProfileSync } = useProfileMutation();
const { data: profiles } = useProfiles();
const { query: { data: student }, avatarUrl } = useStudentQuery();
const unwatchProfile = watch(student, (student) => {
  if (appEvents.onReceiveStudentInfo) {
    if (student && additionalInfo.value) {
      appEvents.onReceiveStudentInfo({ student: student!, additionalInfo: additionalInfo.value });
    }
  }

  if (student && profiles.value) {
    const existingProfile = profiles.value.find(p => p.id === student.number);
    if (existingProfile) {
      saveProfileSync({
        ...existingProfile,
        avatarUrl: avatarUrl.value,
        name: `${student.lastName}, ${student.firstName}`
      });
    }

    unwatchProfile();
  }
});

onBeforeUnmount(() => {
  unwatchProfile();
  unwatchTitle();
})
</script>

<style lang="postcss" scoped>
.dashboard-scaffold-actions {
  @apply flex space-x-1;
}

.dashboard-scaffold-actions :deep(.button.more-button) {
  @apply md:hidden;
}

.dashboard-scaffold-actions-dropdown > :deep(.button) {
  @apply justify-start w-full shadow-none bg-none border-none hover:bg-zinc-200 dark:hover:!bg-primary-700 dark:!text-white cursor-default !py-2 !pl-3 !pr-9 rounded-none;
}

.dashboard-scaffold-actions-dropdown > :deep(.button.with-icon) > svg {
  @apply text-primary-400;
}

.dashboard-scaffold-actions > :deep(.button.with-icon) span {
  @apply hidden md:flex dark:text-white;
}

.dashboard-scaffold-actions > :deep(.button.with-icon) > svg {
  @apply text-primary-400 hover:text-primary-500;
}

.dashboard-scaffold-actions > :deep(.button) {
  @apply shadow-none rounded-lg bg-none border-none hover:bg-zinc-100 dark:hover:!bg-primary-600 dark:text-white p-3 -m-3 dark:hover:bg-opacity-20;
}

.dashboard-scaffold-actions.has-more-button > :deep(.button:not(.more-button)) {
  @apply hidden md:flex;
}
</style>
