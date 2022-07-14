<template>
  <aside 
    :class="[isMenuOpen ? '<md:block w-full' : '<md:hidden']" 
    class="main-navbar md:border-l md:border-r border-gray-300 dark:border-primary-700 md:h-full md:w-24 lg:w-64 fixed h-screen z-40 transition pt-2 bg-white dark:bg-primary-900 overflow-y-auto scrollbar-thin">
    <div style="width: var(--safe-area-inset-top); height: var(--safe-area-inset-top)"></div>
    <div class="flex flex-row md:flex-col lg:flex-row justify-between px-2 w-full">
      <div class="flex flex-col space-y-2 py-2 pl-4 pr-2">
        <loading-container :is-loading="isStudentLoading" v-slot="{ isLoading }">
          <div class="w-full flex flex-row space-x-2 md:flex-col md:space-y-2 md:space-x-0 lg:flex-row lg:space-y-0 lg:space-x-2">
            <div class="h-12 w-12 lg:h-13 lg:w-13">
              <icon-logo @click="isAboutModalOpen = true" class="cursor-pointer w-full h-full text-primary-400 hover:text-primary-500 transition-colors" />
            </div>

            <skeleton 
              custom-class="h-12 w-12 lg:h-13 lg:w-13 rounded-full bg-gray-200 dark:bg-uic-500">
              <img 
                class="h-12 w-12 lg:h-13 lg:w-13 object-cover rounded-full"
                @error="loadFallbackImage" 
                :src="avatarBaseUrl + '/images/100x102/' + (student?.number ?? '0') + '.jpg'" 
                :alt="student?.number">
            </skeleton>
          </div>
          <div
            :class="{ 'space-y-2 pt-2': isLoading }"
            class="flex-col flex md:hidden lg:flex">
            <skeleton custom-class="h-4 w-36 bg-gray-200">
              <span class="font-semibold">{{ studentFirstName }}'s MyUIC</span>
            </skeleton>
            <skeleton custom-class="h-3.5 w-24 bg-gray-200">
              <span class="text-sm">{{ student!.number }}</span>
            </skeleton>
          </div>
        </loading-container>
      </div>

      <dark-mode-toggle class="self-start md:self-center md:mt-4 lg:mt-0 lg:self-start" />
    </div>

    <loading-container :is-loading="isStudentLoading">
      <semester-selector />
    </loading-container>

    <nav class="pt-6 pb-24 mt-2 md:pb-8 pl-4 md:h-[70%] flex flex-col space-y-5">
      <div :key="`links_${groupName}`" v-for="(groupName, groupIdx) in linkGroups.groups">
        <span class="uppercase text-sm font-bold pb-4 block pl-2 text-gray-500 dark:text-primary-200 md:hidden lg:block">
          {{ groupName }}
        </span>
        <div class="space-y-3">
          <router-link
            :key="`link_${groupName}_${i}`"
            v-for="(link, i) in linkGroups.links[groupIdx]"
            :to="link.to"
            @click="isMenuOpen = false"
            :class="[
              link.to.name === currentRouteName
              ?  'text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-700 dark:hover:bg-primary-800'
              :  'hover:bg-primary-100 dark:hover:bg-primary-800'
            ]"
            class="py-2 px-4 flex items-center max-h-12 space-x-4 rounded-l-full" 
            style="transition: ease 150ms background-color">
            <component 
              :is="link.to.name === currentRouteName ? link.activeIcon : link.icon" 
              :class="[link.to.name !== currentRouteName ? 'text-primary-500' : 'dark:text-primary-300']" 
              class="text-[1.3rem]" />
            <span class="md:hidden lg:block">{{ link.title }}</span>
          </router-link>
        </div>
      </div>

      <div class="block h-8 flex-shrink-0"></div>

      <div class="pb-4 space-y-3">
        <button
          v-if="IS_NATIVE"
          @click="isAboutModalOpen = true"
          class="w-full hover:bg-primary-100 dark:hover:bg-primary-800 py-2 px-4 flex items-center max-h-12 space-x-4 rounded-l-full" 
          style="transition: ease 150ms background-color">
            <icon-about-outline class="text-primary-500 text-[1.3rem]" />
            <span class="md:hidden lg:block">About</span>
        </button>

        <router-link
          v-if="IS_NATIVE"
          :to="{ name: 'settings' }"
          @click="isMenuOpen = false"
          :class="[
            currentRouteName === 'settings'
            ?  'text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-700 dark:hover:bg-primary-800'
            :  'hover:bg-primary-100 dark:hover:bg-primary-800'
          ]"
          class="py-2 px-4 flex items-center max-h-12 space-x-4 rounded-l-full" 
          style="transition: ease 150ms background-color">
          <component 
            :is="currentRouteName === 'settings' ? IconSettings : IconSettingsOutline" 
            :class="[currentRouteName !== 'settings' ? 'text-primary-500' : 'dark:text-primary-300']" 
            class="text-[1.3rem]" />
          <span class="md:hidden lg:block">Settings</span>
        </router-link>

        <button
          @click="() => logout()"
          class="w-full hover:bg-danger-100 dark:hover:bg-danger-900 bg-danger-50 dark:bg-danger-800 py-2 px-4 flex items-center max-h-12 space-x-4 rounded-l-full" 
          style="transition: ease 150ms background-color">
            <icon-logout-outline class="text-danger-500 dark:text-white text-[1.3rem]" />
            <span class="md:hidden lg:block">Logout</span>
        </button>
      </div>
    </nav>
  </aside>  

  <about-modal v-model:open="isAboutModalOpen" />

  <div 
    style="padding-bottom: var(--safe-area-inset-bottom);" 
    class="bg-white dark:bg-primary-900 flex border-t dark:border-primary-700 fixed bottom-0 inset-x-0 md:hidden z-50">
    <router-link 
      :key="'link_' + i"
      v-for="i in 4"
      :to="linkGroups.links[0][i].to" 
      @click="isMenuOpen = false"
      v-slot="{ isExactActive }"
      exact-active-class="text-primary-600 dark:text-white bg-primary-100 !hover:bg-primary-200 dark:bg-primary-700 !dark:hover:bg-primary-800"
      class="flex-1 px-4 py-2 flex flex-col items-center space-y-1 hover:bg-primary-100 dark:hover:bg-primary-600 text-sm">
      <component :is="isExactActive ? linkGroups.links[0][i].activeIcon : linkGroups.links[0][i].icon" class="text-primary-600 dark:text-primary-200 text-[1.15rem]" />
      <span class="text-xs">{{ linkGroups.links[0][i].title }}</span>
    </router-link>
    <button 
      @click="isMenuOpen = !isMenuOpen"
      :class="[
        isMenuOpen
        ?  'text-primary-600 dark:text-white bg-primary-100 dark:bg-primary-600 hover:bg-primary-200 dark:hover:bg-primary-800'
        :  'hover:bg-primary-100 dark:hover:bg-primary-600'
      ]"
      class="flex-1 px-4 py-2 flex flex-col items-center space-y-1 text-sm">
      <icon-menu class="text-primary-600 dark:text-primary-200 text-[1.15rem]" />
      <span class="text-xs">Menu</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import IconMenu from '~icons/ion/apps';
import IconLogoutOutline from '~icons/ion/log-out-outline';
import IconLogo from '~icons/custom/logo';
import IconAboutOutline from '~icons/ion/help-circle-outline';
import IconSettings from '~icons/ion/settings';
import IconSettingsOutline from '~icons/ion/settings-outline';
import DarkModeToggle from './DarkModeToggle.vue';
import LoadingContainer from './LoadingContainer.vue';
import Skeleton from './Skeleton.vue';
import AboutModal from '../AboutModal.vue';
import { useStudentQuery } from '../../stores/studentStore';

import { IS_NATIVE } from '../../utils';
import { computed, FunctionalComponent, ref } from 'vue';
import { useLogoutMutation } from '../../composables/auth';
import { RouteRecordName, RouteRecordNormalized, RouteRecordRaw, useRoute, useRouter } from 'vue-router';
import { avatarBaseUrl } from '../../client';
import SemesterSelector from './SemesterSelector.vue';

const router = useRouter();
const route = useRoute();
const isMenuOpen = ref(false);
const isAboutModalOpen = ref(false);
const { isLoading: isStudentLoading, normalizedFirstName: studentFirstName, query: { data: student } } = useStudentQuery();
const { mutate: logout } = useLogoutMutation();

function loadFallbackImage(evt: Event) {
  if (evt.target instanceof HTMLImageElement) {
    evt.target.src = '/default_avatar.png';
  }
}

const getParentRouteName = () => {
  if (route.matched.length < 2) return 'dashboard';
  return route.matched[1].name;
}

const currentRouteName = computed(() => getParentRouteName()?.toString() ?? 'home');
const collectNavLinks = (routes: (RouteRecordRaw | RouteRecordNormalized)[]) => {
  const links: {
    to: { name: RouteRecordName }
    group: string
    title: string
    icon: FunctionalComponent
    activeIcon: FunctionalComponent
  }[] = [];

  for (const route of routes) {
    if (route.meta && route.meta.navLink) {
      links.push({
        ...route.meta.navLink,
        to: { name: route.name ?? '' }
      });
    }
  }

  return links;
}

const linkGroups = (() => {
  const links = collectNavLinks(router.getRoutes());
  return links.sort((a, b) => b.group.localeCompare(a.group)).reduce<{
    groups: string[],
    links: ReturnType<typeof collectNavLinks>[]
  }>((m, l) => {
    let groupIdx = m.groups.indexOf(l.group);
    if (groupIdx == -1) {
      m.groups.push(l.group);
      m.links.push([]);
      groupIdx = m.groups.length - 1;
    }
    m.links[groupIdx].push(l);
    return m;
  }, {
    groups: [],
    links: []
  });
})();
</script>

<style lang="postcss" scoped>
.main-navbar::-webkit-scrollbar {
  display: none;
}
</style>