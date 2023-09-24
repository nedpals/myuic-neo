<template>
  <aside :class="{'is-expanded': isMenuExpanded, 'is-open': isMenuOpen}" class="main-navbar">
    <div class="padding-filler"></div>

    <section class="top-portion">
      <div class="account-header">
        <loading-container :is-loading="isStudentLoading" v-slot="{ isLoading }">
          <div class="logo-and-avatar">
            <div class="h-12 w-12 lg:h-13 lg:w-13">
              <icon-logo
                @click="isMenuOpen = false; $router.push({name: 'about'})"
                class="cursor-pointer w-full h-full text-primary-400 hover:text-primary-500 transition-colors" />
            </div>

            <avatar class="h-12 w-12 lg:h-13 lg:w-13" :src="avatarUrl" :alt="student?.number" />
          </div>
          <div :class="{ 'space-y-2 pt-2': isLoading }" class="account-info">
            <skeleton :delay="250" custom-class="h-4 w-36 bg-zinc-200">
              <span class="font-semibold">{{ studentFirstName }}'s MyUIC</span>
            </skeleton>
            <skeleton :delay="2 * 250" custom-class="h-3.5 w-24 bg-zinc-200">
              <span class="text-sm">{{ student?.number }}</span>
            </skeleton>
          </div>
        </loading-container>
      </div>

      <div class="ui-buttons">
        <dark-mode-toggle v-tooltip.right="canExpandTooltip ? 'Toggle dark mode' : null" />
      </div>
    </section>

    <loading-container :is-loading="isStudentLoading">
      <semester-selector @update:semesterId="isMenuOpen = false" />
    </loading-container>

    <nav class="menu">
      <button
        @click="isMenuExpanded = !isMenuExpanded"
        v-tooltip.right="canExpandTooltip ? 'Expand menu' : null"
        class="!hidden md:!flex lg:!hidden menu-item">
        <icon-menu />
        <span>Collapse Menu</span>
      </button>

      <template :key="`links_${group.name}`" v-for="(group) in groupedEntries">
        <div v-if="group.name === '_meta'" class="block h-8 flex-shrink-0"></div>

        <div :class="[group.name === '_meta' ? 'space-y-3' : 'menu-group']">
          <span v-if="!group.name.startsWith('_')" class="group-name">
            {{ group.name }}
          </span>

          <div class="space-y-3">
            <component
              v-for="(entry, i) in group.children"
              :is="entry.link ? 'a' : 'router-link'"
              :key="`link_${group.name}_${i}`"
              :to="entry.link ? undefined : entry.to"
              :href="entry.link ? entry.to : undefined"
              :target="entry.link ? '_blank' : undefined"
              @click="isMenuOpen = false"
              :class="[{'is-active': entry.isCurrent}, entry.class]"
              class="menu-item"
              v-tooltip.right="canExpandTooltip ? entry.title : null" >
              <component :is="entry.isCurrent ? entry.activeIcon : entry.icon" />
              <div class="flex flex-col space-y-0.5">
                <span>{{ entry.title }}</span>
                <span v-if="entry.subtitle"
                  class="text-sm text-zinc-400 dark:text-primary-400">{{ entry.subtitle }}</span>
              </div>
            </component>
          </div>
        </div>
      </template>

      <div class="pb-4 space-y-3">
        <button @click="() => logout()" class="menu-item is-logout" v-tooltip.right="canExpandTooltip ? 'Logout' : null" >
            <icon-logout-outline />
            <span>Logout</span>
        </button>
      </div>
    </nav>
  </aside>

  <div class="menu is-mobile">
    <router-link
      v-for="i in 4"
      :key="'link_' + i"
      :to="entries[i - 1].to"
      @click="isMenuOpen = false"
      v-slot="{ isExactActive }"
      exact-active-class="is-active"
      class="menu-item">
      <component :is="isExactActive ? entries[i - 1].activeIcon : entries[i - 1].icon" />
      <span>{{ entries[i - 1].title }}</span>
    </router-link>
    <button @click="isMenuOpen = !isMenuOpen" :class="{'is-active': isMenuOpen}" class="menu-item">
      <icon-menu />
      <span>Menu</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import IconMenu from '~icons/ion/menu';
import IconLogoutOutline from '~icons/ion/log-out-outline';
import IconLogo from '~icons/custom/logo';
import DarkModeToggle from './DarkModeToggle.vue';
import LoadingContainer from './LoadingContainer.vue';
import Skeleton from './Skeleton.vue';
import Avatar from './Avatar.vue';

import { useStudentQuery } from '../../stores/studentStore';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useLogoutMutation } from '../../composables/auth';
import SemesterSelector from './SemesterSelector.vue';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import { useNav } from '../../composables/nav';

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMd = breakpoints.smaller('lg');
const { groupedEntries, entries } = useNav();
const isMenuOpen = ref(false);
const isMenuExpanded = ref(false);
const canExpandTooltip = computed(() => isMd.value && !isMenuExpanded.value);
const { isLoading: isStudentLoading, avatarUrl, normalizedFirstName: studentFirstName, query: { data: student } } = useStudentQuery();
const { mutate: logout } = useLogoutMutation();

const unwatchIsExpanded = watch(isMenuExpanded, (newExpanded) => {
  if (newExpanded) {
    document.body.classList.add('navbar-has-expanded');
  } else {
    document.body.classList.remove('navbar-has-expanded');
  }

  if (isMenuOpen.value !== newExpanded) {
    isMenuOpen.value = newExpanded;
  }
});

const unwatchIsOpen = watch(isMenuOpen, (newOpen) => {
  isMenuExpanded.value = newOpen;
});

onBeforeUnmount(() => {
  unwatchIsExpanded();
  unwatchIsOpen();
});
</script>

<style lang="postcss">
body.navbar-has-expanded {
  @apply md:overflow-hidden lg:overflow-auto;
}
</style>

<style lang="postcss" scoped>
.main-navbar::-webkit-scrollbar {
  display: none;
}

.main-navbar {
  @apply md:border-l md:border-r border-zinc-300 dark:border-primary-700 md:h-full md:w-24 lg:w-64 fixed h-screen z-20 transition pt-2 bg-white dark:bg-primary-900 overflow-y-auto scrollbar-none;
  transition: width ease 150ms;
}

.main-navbar.is-open {
  @apply block w-full md:w-full;
}

.main-navbar:not(.is-open) {
  @apply hidden md:block;
}

.main-navbar.is-expanded {
  @apply md:w-1/2;
}

.main-navbar.is-open.is-expanded {
  @apply lg:w-auto;
}

.main-navbar .padding-filler {
  width: var(--safe-area-inset-top);
  height: var(--safe-area-inset-top);
}

.main-navbar .top-portion {
  @apply flex flex-row md:flex-col lg:flex-row justify-between px-2 w-full;
}

.main-navbar.is-expanded .top-portion {
  @apply flex-row;
}

.main-navbar .top-portion .account-header {
  @apply flex flex-col space-y-2 py-2 pl-4 pr-2;
}

.account-header .logo-and-avatar {
  @apply w-full flex flex-row space-x-2 md:flex-col md:space-y-2 md:space-x-0 lg:flex-row lg:space-y-0 lg:space-x-2;
}

.main-navbar.is-expanded .account-header .logo-and-avatar {
  @apply flex-row space-y-0 space-x-2;
}

.main-navbar:not(.is-expanded) .account-header .user-avatar {
  @apply md:max-md:hidden;
}

.main-navbar .account-header .account-info {
  @apply flex-col flex md:hidden lg:flex;
}

.main-navbar.is-expanded .account-header .account-info {
  @apply flex;
}

.main-navbar .top-portion .ui-buttons {
  @apply flex flex-col space-y-4 lg:space-y-0 lg:flex-row self-start md:self-center md:mt-4 lg:mt-0 lg:self-start;
}

.main-navbar.is-expanded .top-portion .ui-buttons {
  @apply flex-row self-start mt-0;
}

.ui-buttons button {
  @apply rounded-full p-2 hover:bg-primary-100 dark:hover:bg-primary-800;
}

.ui-buttons button svg {
  @apply h-6 w-6 text-primary-500 dark:text-primary-300;
}
.main-navbar.is-expanded :deep(.semester-selector) {
  @apply block;
}

.main-navbar:not(.is-expanded) :deep(.semester-selector) {
  @apply block md:hidden lg:block;
}

.main-navbar .menu {
  @apply pt-6 pb-24 mt-2 md:pb-8 pl-4 md:h-[70%] flex flex-col space-y-5;
}

.menu .menu-group .group-name {
  @apply uppercase text-sm font-bold pb-4 block pl-2 text-zinc-500 dark:text-primary-200 md:hidden lg:block;
}

.menu .menu-item {
  @apply py-4 px-4 items-center max-h-12 space-x-4 rounded-l-xl cursor-pointer;
  transition: background-color 150ms ease;
}

.menu .menu-item:not(.hidden) {
  @apply flex;
}

.menu button.menu-item {
  @apply w-full;
}

.menu .menu-item svg {
  @apply text-primary-400 text-[1.3rem];
}

.menu .menu-item span {
  @apply md:hidden lg:block;
}

.main-navbar.is-expanded .menu .menu-item span {
  @apply block;
}

.menu .menu-item.is-active {
  @apply text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-700 dark:hover:bg-primary-800;
}

.menu .menu-item.is-active svg {
  @apply text-white dark:text-primary-100;
}

.menu .menu-item:not(.is-active) {
  @apply hover:bg-zinc-100 dark:hover:bg-primary-800;
}

.menu .menu-item.is-logout {
  @apply hover:bg-danger-100 dark:hover:bg-danger-900 bg-danger-50 dark:bg-danger-800;
}

.menu .menu-item.is-logout svg {
  @apply text-danger-500 dark:text-white;
}

.menu.is-mobile {
  @apply bg-white dark:bg-primary-800 border-t dark:border-primary-800 fixed bottom-0 inset-x-0 md:hidden z-50 flex;
}

.menu.is-mobile .menu-item {
  @apply dark:hover:bg-primary-700 flex-1 max-h-none rounded-none flex-col justify-center items-center space-x-0 space-y-1 px-4 py-2;
}

.menu.is-mobile .menu-item svg {
  @apply text-primary-400 text-[1.15rem] flex-shrink-0;
}

.menu.is-mobile .menu-item span {
  @apply text-xs;
}

.menu.is-mobile .menu-item.is-active {
  @apply text-primary-600 dark:text-white bg-primary-100 hover:!bg-primary-200 dark:bg-primary-700 dark:hover:!bg-primary-600;
}

.menu.is-mobile button.menu-item {
  @apply w-auto;
}
</style>
