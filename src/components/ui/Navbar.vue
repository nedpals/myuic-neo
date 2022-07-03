<template>
  <aside 
    :class="[isMenuOpen ? '<md:block w-full' : '<md:hidden']" 
    class="main-navbar md:border-l md:border-r border-gray-300 dark:border-primary-700 md:h-full md:w-24 lg:w-64 fixed h-screen z-40 transition pt-2 bg-white dark:bg-primary-900 overflow-y-auto scrollbar-thin">
    <div class="flex flex-row md:flex-col lg:flex-row justify-between px-2 w-full">
      <div class="flex flex-col space-y-2 py-2 pl-4 pr-2">
        <loading-container :is-loading="isStudentLoading" v-slot="{ isLoading }">
          <div class="w-full flex flex-row space-x-2 md:flex-col md:space-y-2 md:space-x-0 lg:flex-row lg:space-y-0 lg:space-x-2">
            <div class="h-12 w-12 lg:h-13 lg:w-13">
              <icon-logo @click="isAboutModalOpen = true" class="cursor-pointer w-full h-full text-primary-400 hover:text-primary-500 transition-colors" />
            </div>
            <div
              class="h-12 w-12 lg:h-13 lg:w-13 rounded-full bg-gray-200 bg-cover"
              :class="{ 'animate-pulse': isLoading }"
              :style="[!isLoading ? 'background-image: url(./default_avatar.png)': '']"
            ></div>
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

    <loading-container :is-loading="isStudentLoading" v-slot="{ isLoading }">
      <listbox as="div" class="@md:hidden px-2" v-model="currentSemesterId">
        <div class="md:pt-4 relative">
          <listbox-button 
            :disabled="isLoading"
            :class="{ 'cursor-pointer hover:bg-gray-100 dark:hover:bg-primary-700': !isLoading }"
            class="flex items-center justify-between transition-colors relative w-full border dark:border-primary-700 rounded-md px-4 py-2 text-left focus:outline-none">
            <div
              :class="{ 'space-y-2': isLoading }"
              class="flex-col flex md:hidden lg:flex">
              <skeleton custom-class="h-4 w-36 bg-gray-200">
                <span class="font-semibold">{{ currentSemester.display.semester }}</span>
              </skeleton>
              <skeleton custom-class="h-3.5 w-24 bg-gray-200">
                <span class="text-sm">{{ currentSemester.display.year }}</span>
              </skeleton>
            </div>
            <icon-chevron-right class="text-primary-400" />
          </listbox-button>
          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-out"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <listbox-options class="absolute z-10 mt-1 w-full border dark:border-primary-700 bg-white dark:bg-primary-800 shadow-lg max-h-56 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
              <listbox-option as="template" :key="semester.id" :value="semester.id" v-for="semester in semesterList">
                <li :class="[currentSemesterId == semester.id ? 'bg-primary-100 dark:bg-primary-600' : '', 'hover:bg-gray-200 dark:hover:bg-primary-700 cursor-default select-none relative py-2 pl-3 pr-9']">
                  <div
                    :class="{ 'space-y-2': isLoading }"
                    class="flex-col flex md:hidden lg:flex">
                    <skeleton custom-class="h-4 w-36 bg-gray-200">
                      <span class="font-semibold">{{ semester.display.semester }}</span>
                    </skeleton>
                    <skeleton custom-class="h-3.5 w-24 bg-gray-200">
                      <span class="text-sm">{{ semester.display.year }}</span>
                    </skeleton>
                  </div>
                </li>
              </listbox-option>
            </listbox-options>
          </transition>
        </div>
      </listbox>
    </loading-container>

    <nav class="pt-6 pb-24 mt-2 md:pb-8 pl-4 md:h-[87%] flex flex-col">
      <div :key="'links_' + j" v-for="(linkGroup, j) in linkGroups" :class="{ 'mt-10': j > 0 }">
        <span class="uppercase text-sm font-bold pb-4 block pl-2 text-gray-500 dark:text-primary-200 md:hidden lg:block">{{ linkGroup.name }}</span>
        <div class="space-y-3">
          <router-link
            :key="'link_' + (j + i)"
            v-for="(link, i) in linkGroup.links"
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
            :is="currentRouteName === 'settings' ? 'icon-settings' : 'icon-settings-outline'" 
            :class="[currentRouteName !== 'settings' ? 'text-primary-500' : 'dark:text-primary-300']" 
            class="text-[1.3rem]" />
          <span class="md:hidden lg:block">Settings</span>
        </router-link>

        <button
          @click="logout"
          class="w-full hover:bg-danger-100 dark:hover:bg-danger-900 bg-danger-50 dark:bg-danger-800 py-2 px-4 flex items-center max-h-12 space-x-4 rounded-l-full" 
          style="transition: ease 150ms background-color">
            <icon-logout-outline class="text-danger-500 dark:text-white text-[1.3rem]" />
            <span class="md:hidden lg:block">Logout</span>
        </button>
      </div>
    </nav>
  </aside>

  <modal-window title="About" v-model:open="isAboutModalOpen" modal-class="max-w-4xl w-full">
    <div class="max-w-lg w-full mx-auto flex flex-col justify-center text-center items-center py-6">
      <icon-logo class="text-primary-400 h-36 w-36 mb-4" />
      <h1 class="text-4xl font-bold mb-2">MyUIC <span class="font-medium">Neo</span></h1>
      <p class="max-w-sm text-gray-600 dark:text-primary-200 text-2xl">A new student portal concept for UICians in the 21st century.</p>

      <div class="mt-24">
        <p class="mb-18">Version {{ appVersion }}</p>
        <p>Copyright &copy; 2022 by Ned Palacios and its contributors. Licensed under the <a class="text-primary-500 underline" href="https://github.com/nedpals/myuic-neo/blob/master/LICENSE">AGPL3 license</a>.</p>
      </div>
    </div>
  </modal-window>

  <div class="bg-white dark:bg-primary-900 flex border-t dark:border-primary-700 fixed bottom-0 inset-x-0 md:hidden z-50">
    <router-link 
      :key="'link_' + i"
      v-for="(link, i) in mobileMenuLinks"
      :to="link.to" 
      @click="isMenuOpen = false"
      v-slot="{ isExactActive }"
      exact-active-class="text-primary-600 dark:text-white bg-primary-100 !hover:bg-primary-200 dark:bg-primary-700 !dark:hover:bg-primary-800"
      class="flex-1 px-4 py-2 flex flex-col items-center space-y-1 hover:bg-primary-100 dark:hover:bg-primary-600 text-sm">
      <component :is="isExactActive ? link.activeIcon : link.icon" class="text-primary-600 dark:text-primary-200 text-[1.15rem]" />
      <span class="text-xs">{{ link.title }}</span>
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
import IconHomeOutline from '~icons/ion/home-outline';
import IconHome from '~icons/ion/home';
import IconCalendar from '~icons/ion/calendar';
import IconCalendarOutline from '~icons/ion/calendar-outline';
import IconCash from '~icons/ion/cash';
import IconCashOutline from '~icons/ion/cash-outline';
import IconPerson from '~icons/ion/person';
import IconPersonOutline from '~icons/ion/person-outline';
import IconReceipt from '~icons/ion/receipt';
import IconReceiptOutline from '~icons/ion/receipt-outline';
import IconBallot from '~icons/ic/baseline-ballot';
import IconBallotOutline from '~icons/ic/outline-ballot';
import IconFeedback from '~icons/fluent/person-feedback-16-filled';
import IconFeedbackOutline from '~icons/fluent/person-feedback-16-regular';
import IconReport from '~icons/ion/stats-chart';
import IconReportOutline from '~icons/ion/stats-chart-outline';
import IconMenu from '~icons/ion/apps';
import IconArrowDropdown from '~icons/ion/md-arrow-dropdown';
import IconLogoutOutline from '~icons/ion/log-out-outline';
import IconLogo from '~icons/custom/logo';
import IconOnlineEnrollment from '~icons/fluent/compose-16-filled';
import IconAboutOutline from '~icons/ion/help-circle-outline';
import IconSettings from '~icons/ion/settings';
import IconSettingsOutline from '~icons/ion/settings-outline';
import IconChevronRight from '~icons/ion/chevron-right';
import DarkModeToggle from './DarkModeToggle.vue';
import LoadingContainer from './LoadingContainer.vue';
import Skeleton from './Skeleton.vue';
import SelfModalWindow from './SelfModalWindow.vue';
import ModalWindow from './ModalWindow.vue';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';
import { currentSemesterIdKey, useStudentQuery } from '../../stores/studentStore';

import { IS_NATIVE } from '../../utils';
import { App } from '@capacitor/app';
import { computed, inject, ref } from 'vue';
import { Capacitor } from '@capacitor/core';
import { useLogoutMutation } from '../../composables/auth';
import { useSemesterQuery } from '../../stores/studentStore';
import { useRoute } from 'vue-router';

const route = useRoute();
const isMenuOpen = ref(false);
const appVersion = ref('1.0.0 Web');
const isAboutModalOpen = ref(false);
const { isLoading: isStudentLoading, normalizedFirstName: studentFirstName, query: { data: student } } = useStudentQuery();
const { mutate: destroy } = useLogoutMutation();
const currentSemesterId = inject(currentSemesterIdKey);
const { semesterList, hasSemesterId, currentSemester, idQuery } = useSemesterQuery(currentSemesterId);

if (IS_NATIVE) {
  App.getInfo().then((info) => {
    appVersion.value = `${info.version} ${info.id} ${info.build} ${Capacitor.getPlatform()}`
  });
} 

const filteredSemesterList = computed(() => {
  if (isStudentLoading.value) {
    return [];
  }

  const startingYear = 2000 + parseInt(student.value?.number.substring(0, 2) ?? '20');
  const endingYear = (new Date()).getFullYear();

  return semesterList.value.filter((s) => {
    return s.fromYear && s.fromYear >= startingYear && s.fromYear <= endingYear && s.id && s.id <= idQuery.data.value!;
  })
});

const getParentRouteName = () => {
  if (route.matched.length < 2) return 'dashboard';
  return route.matched[1].name;
}

const logout = () => destroy();

const currentRouteName = computed(() => getParentRouteName()?.toString() ?? 'home');
const linkGroups = [
  {
    name: 'Student',
    links: [
      {
        title: 'Home',
        to: { name: 'home' },
        icon: IconHomeOutline,
        activeIcon: IconHome,
      },
      {
        title: 'Schedule',
        to: { name: 'schedule' },
        icon: IconCalendarOutline,
        activeIcon: IconCalendar,
      },
      {
        title: 'Reports',
        to: { name: 'reports' },
        icon: IconReportOutline,
        activeIcon: IconReport,
      },
      {
        title: 'Finance',
        to: { name: 'finance' },
        icon: IconCashOutline,
        activeIcon: IconCash,
      },
      {
        title: 'Clearance',
        to: { name: 'clearance' },
        icon: IconReceiptOutline,
        activeIcon: IconReceipt,
      },
      {
        title: 'Information',
        to: { name: 'information' },
        icon: IconPersonOutline,
        activeIcon: IconPerson,
      }
    ]
  },
  {
    name: 'Apps',
    links: [
      {
        title: 'Election',
        to: { name: 'election-app' },
        icon: IconBallotOutline,
        activeIcon: IconBallot,
      },
      {
        title: 'Course Evaluation',
        to: { name: 'course-evaluation-app' },
        icon: IconFeedbackOutline,
        activeIcon: IconFeedback,
      },
      {
        title: 'Online Enrollment',
        to: { name: 'online-enrollment-app' },
        icon: IconOnlineEnrollment,
        activeIcon: IconOnlineEnrollment,
      },
      ...(IS_NATIVE ? [
        {
          title: 'Test App',
          to: { name: 'test-app' },
          icon: IconLogo,
          activeIcon: IconLogo,
        }
      ]: []),
    ]
  }
];

const mobileMenuLinks = linkGroups[0].links.slice(0, 4);
</script>

<style lang="postcss" scoped>
.main-navbar::-webkit-scrollbar {
  display: none;
}
</style>