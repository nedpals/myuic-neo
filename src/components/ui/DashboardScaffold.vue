<template>
  <div class="sticky inset-x-0 top-0 z-1">
    <div style="padding-top: var(--safe-area-inset-top);" class="bg-white dark:bg-primary-900 px-4 md:px-5" v-if="title ? true : $route.meta.useHeader ?? true">
      <div class="relative flex-0 py-3 md:py-5">
        <div class="absolute right-0 top-4 md:top-5 dashboard-scaffold-actions" :class="{ 'has-more-button': shouldActionsBeDropdown }">
          <Menu v-if="shouldActionsBeDropdown">
            <menu-button class="more-button button">
              <icon-more />
            </menu-button>

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

        <span class="text-xl text-center font-bold block">{{ pageTitle ?? 'Unknown page name' }}</span>
      </div>
      <div class="overflow-x-auto">
        <ul class="flex space-x-2">
          <li :key="r.name" v-for="r in childRouteLinks" class="inline-flex flex-shrink-0">
            <router-link
              :to="r"
              style="transition: ease 150ms background-color "
              exact-active-class="bg-primary-100 dark:bg-primary-700 hover:bg-primary-200 dark:hover:bg-primary-600"
              class="px-4 py-2 md:py-3 bg-primary-100 hover:bg-primary-200 bg-primary-800 dark:hover:bg-primary-700 rounded-lg">
              {{ r.meta?.pageTitle ?? r.name }}
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

import { useTitle } from '@vueuse/core';
import { computed, watch, defineEmits, defineProps, useSlots } from 'vue';
import { useRoute, useRouter } from 'vue-router';

defineEmits(['reload']);

const { title } = defineProps({
  title: {
    type: String
  },
  containerClass: {
    type: String
  }
});

const route = useRoute();
const router = useRouter();

const slots = useSlots();
const actionsSlot = slots.actions?.() ?? [];
const shouldActionsBeDropdown = computed(() => actionsSlot.length > 1);

const childRouteLinks = computed(() => {
  if (route.matched.length < 3) return [];
  const routes = router.getRoutes();
  const currentRouteData = routes.find(r => r.name === route.matched[route.matched.length - 2].name);
  if (!currentRouteData) return [];
  return currentRouteData.children;
})

const pageTitle = computed(() => {
  if (title) return title;
  if (route.matched.length < 3) return route.meta.pageTitle;
  const routes = router.getRoutes();
  const currentRouteData = routes.find(r => r.name === route.matched[route.matched.length - 2].name);
  if (!currentRouteData) return route.meta.pageTitle;
  return currentRouteData.meta.pageTitle;
})

watch(() => route.fullPath, () => {
  useTitle(`${pageTitle.value} | MyUIC Neo`);
}, {
  immediate: true
});
</script>

<style lang="postcss">
.dashboard-scaffold-actions {
  @apply flex space-x-1;
}

.dashboard-scaffold-actions .more-button.button {
  @apply md:hidden;
}

.dashboard-scaffold-actions-dropdown > .button {
  @apply w-full hover:bg-gray-200 dark:hover:bg-primary-700 cursor-default py-2 pl-3 pr-9 rounded-none;
}

.dashboard-scaffold-actions-dropdown > .button > svg {
  @apply text-primary-400
}

.dashboard-scaffold-actions .button {
  @apply flex items-center space-x-2 text-left;
}

.dashboard-scaffold-actions > .button span {
  @apply <md:hidden;
}

.dashboard-scaffold-actions > .button {
  @apply text-primary-300 hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-primary-600 px-3 py-3 -my-3 -mx-3 dark:hover:bg-opacity-20;
}

.dashboard-scaffold-actions.has-more-button > .button:not(.more-button) {
  @apply <md:hidden;
}
</style>