<template>
  <aside 
    :class="[isMenuOpen ? '<md:block w-full' : '<md:hidden']" 
    class="main-navbar md:border-l md:border-r border-gray-300 dark:border-uic-700 md:h-full md:w-24 lg:w-64 fixed h-screen z-40 transition pt-2 bg-white dark:bg-uic-900 overflow-y-auto scrollbar-thin">
    <div class="flex flex-row md:flex-col lg:flex-row justify-between px-2 w-full">
      <div class="flex flex-col space-y-2 py-2 pl-4 pr-2">
        <loading-container :is-loading="studentStore.isEmpty" v-slot="{ isLoading }">
          <div class="w-full flex flex-row space-x-2 md:flex-col md:space-y-2 md:space-x-0 lg:flex-row lg:space-y-0 lg:space-x-2">
            <div class="h-12 w-12 lg:h-13 lg:w-13">
              <icon-logo class="w-full h-full text-uic-500 dark:text-uic-600" />
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
              <span class="font-semibold">{{ studentStore.normalizedFirstName }}'s MyUIC</span>
            </skeleton>
            <skeleton custom-class="h-3.5 w-24 bg-gray-200">
              <span class="text-sm">{{ studentStore.student.number }}</span>
            </skeleton>
          </div>
        </loading-container>
      </div>

      <dark-mode-toggle class="self-start md:self-center md:mt-4 lg:mt-0 lg:self-start" />
    </div>

    <nav class="pt-6 md:pt-12 pb-24 md:pb-8 pl-4 md:h-[87%] flex flex-col">
      <div :key="'links_' + j" v-for="(linkGroup, j) in linkGroups" :class="{ 'mt-10': j > 0 }">
        <span class="uppercase text-sm font-bold pb-4 block pl-2 text-gray-500 dark:text-uic-200 md:hidden lg:block">{{ linkGroup.name }}</span>
        <div class="space-y-3">
          <router-link
            :key="'link_' + (j + i)"
            v-for="(link, i) in linkGroup.links"
            :to="link.to"
            @click="isMenuOpen = false"
            :class="[
              link.to.name === currentRouteName
              ?  'text-white bg-uic-500 hover:bg-uic-600 dark:bg-uic-700 dark:hover:bg-uic-800'
              :  'hover:bg-uic-100 dark:hover:bg-uic-800'
            ]"
            class="py-2 px-4 flex items-center max-h-12 space-x-4 rounded-l-full" 
            style="transition: ease 150ms background-color">
            <component 
              :is="link.to.name === currentRouteName ? link.activeIcon : link.icon" 
              :class="[link.to.name !== currentRouteName ? 'text-uic-500' : 'dark:text-uic-300']" 
              class="text-[1.3rem]" />
            <span class="md:hidden lg:block">{{ link.title }}</span>
          </router-link>
        </div>
      </div>

      <div class="block h-8 flex-shrink-0"></div>

      <div class="pb-4">
        <button
          @click="logout"
          class="w-full hover:bg-red-100 dark:hover:bg-red-900 bg-red-50 dark:bg-red-800 py-2 px-4 flex items-center max-h-12 space-x-4 rounded-l-full" 
          style="transition: ease 150ms background-color">
            <icon-logout-outline class="text-red-500 dark:text-white text-[1.3rem]" />
            <span class="md:hidden lg:block">Logout</span>
        </button>
      </div>
    </nav>
  </aside>

  <div class="bg-white dark:bg-uic-900 flex border-t dark:border-uic-700 fixed bottom-0 inset-x-0 md:hidden z-50">
    <router-link 
      :key="'link_' + i"
      v-for="(link, i) in mobileMenuLinks"
      :to="link.to" 
      @click="isMenuOpen = false"
      v-slot="{ isExactActive }"
      exact-active-class="text-uic-600 dark:text-white bg-uic-100 !hover:bg-uic-200 dark:bg-uic-700 !dark:hover:bg-uic-800"
      class="flex-1 px-4 py-2 flex flex-col items-center space-y-1 hover:bg-uic-100 dark:hover:bg-uic-600 text-sm">
      <component :is="isExactActive ? link.activeIcon : link.icon" class="text-uic-600 dark:text-uic-200 text-[1.15rem]" />
      <span class="text-xs">{{ link.title }}</span>
    </router-link>
    <button 
      @click="isMenuOpen = !isMenuOpen"
      :class="[
        isMenuOpen
        ?  'text-uic-600 dark:text-white bg-uic-100 dark:bg-uic-600 hover:bg-uic-200 dark:hover:bg-uic-800'
        :  'hover:bg-uic-100 dark:hover:bg-uic-600'
      ]"
      class="flex-1 px-4 py-2 flex flex-col items-center space-y-1 text-sm">
      <icon-menu class="text-uic-600 dark:text-uic-200 text-[1.15rem]" />
      <span class="text-xs">Menu</span>
    </button>
  </div>
</template>

<script lang="ts">
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
import { useStudentStore } from '../../stores/studentStore';
import DarkModeToggle from './DarkModeToggle.vue';
import LoadingContainer from './LoadingContainer.vue';
import Skeleton from './Skeleton.vue';
import { IS_NATIVE } from '../../utils';

export default {
  components: {
    IconMenu,
    IconArrowDropdown,
    IconLogoutOutline,
    IconLogo,
    DarkModeToggle,
    LoadingContainer,
    Skeleton
  },
  setup() {
    const studentStore = useStudentStore();
    return { studentStore };
  },
  mounted() {
    this.currentRouteName = this.getParentRouteName()?.toString() ?? 'home';
  },
  data() {
    return {
      currentRouteName: 'home',
      isMenuOpen: false
    }
  },
  watch: {
    '$route'() {
      this.currentRouteName =this.getParentRouteName()?.toString() ?? 'home';
    }
  },
  computed: {
    mobileMenuLinks(): any[] {
      return this.linkGroups[0].links.slice(0, 4)
    },
    linkGroups(): any[] {
      return [
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
    }
  },
  methods: {
    getParentRouteName() {
      if (this.$route.matched.length < 2) return 'dashboard';
      return this.$route.matched[1].name;
    },
    logout() {
      this.studentStore.fullReset();
    }
  }
}
</script>

<style lang="postcss" scoped>
.main-navbar::-webkit-scrollbar {
  display: none;
}
</style>