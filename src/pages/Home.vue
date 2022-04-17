<template>
  <dashboard-header container-class="max-w-3xl mx-auto w-full <md:px-4 <lg:px-2">
    <div class="text-center py-8 md:py-12 flex flex-col items-center">
      <loading-container :is-loading="studentStore.isEmpty" v-slot="{ isLoading }">
        <div
          :style="isLoading ? {} : {backgroundImage: 'url(./default_avatar.png)'}"
          :class="[isLoading ? 'animate-pulse bg-gray-200' : 'bg-primary-200']"
          class="h-32 w-32 md:h-42 md:w-42 rounded-full mb-4 md:mb-8 bg-cover"></div>
        <skeleton custom-class="h-9 min-w-64 max-w-90 w-full bg-gray-200 mb-5 rounded-2xl">
          <h1 class="text-4xl font-semibold mb-2">
            {{ welcomeGreeting }}, {{ studentStore.normalizedFirstName }}!
          </h1>
        </skeleton>
        <skeleton custom-class="h-6 min-w-48 max-w-64 w-full bg-gray-200 rounded-xl">
          <p class="text-2xl text-gray-600 dark:text-primary-200">{{ todayDate }}</p>
        </skeleton>
      </loading-container>
    </div>

    <div class="flex flex-col space-y-4">
      <div class="w-full px-6">
        <promise-loader :promise="studentStore.getResourceLinks()" v-slot="{ isPending }">
          <loading-container :is-loading="isPending" v-slot="{ isLoading }">
            <div 
              class="flex pt-2 flex-wrap justify-center flex-wrap" 
              :class="{ 'animate-pulse': isLoading }">
              <template v-if="!isLoading">
                <router-link :to="{ name: 'finance' }" class="quick-link-item">
                  <icon-cash-outline />
                  <span>Finance</span>
                </router-link>
                <router-link :to="{ name: 'clearance' }" class="quick-link-item">
                  <icon-receipt-outline />
                  <span>Clearance</span>
                </router-link>
                <a href="http://bit.ly/2xSkcLk" class="quick-link-item">
                  <icon-book-outline />
                  <span>Handbook</span>
                </a>
                <a href="https://mail.google.com" class="quick-link-item">
                  <icon-mail-open-outline />
                  <span>E-mail</span>
                </a>
                <a href="https://classroom.google.com" class="quick-link-item">
                  <icon-g-classroom />
                  <span>Classroom</span>
                </a>
                <self-modal title="Resources">
                  <template #default="{ openModal }">
                    <button @click="openModal" class="quick-link-item">
                      <icon-bookmark-outline />
                      <span>Resources</span>
                    </button>
                  </template>
                  <template #modal-content>
                    <div class="flex flex-row w-full flex-wrap justify-center mt-4">
                      <a
                        :href="link.href"
                        :key="'link_' + li" v-for="(link, li) in studentStore.resourceLinks"
                        target="_blank"
                        class="p-3 flex flex-col text-center justify-center items-center w-1/4 space-y-4 hover:bg-gray-200 dark:hover:bg-primary-900 rounded-lg">
                        <div class="max-w-10">
                          <img :src="link.iconUrl" class="h-auto w-full" :alt="link.label" />
                        </div>
                        <p>{{ link.label }}</p>
                      </a>
                    </div>
                    <p class="text-center pt-8">You will be redirected to a new window / tab upon clicking the link.</p>
                  </template>
                </self-modal>
              </template>
              <div v-else :key="i" v-for="i in 6" class="quick-link-item text-center">
                <div class="h-12 w-12 rounded-full bg-primary-400 mb-2"></div>
                <div class="h-4 w-20 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </loading-container>
        </promise-loader>
      </div>

      <div class="w-full">
        <loading-container :is-loading="isClearanceLoading" v-slot="{ isLoading }">
          <box
            @click="$router.push({ name: 'clearance' })"
            bg="bg-white hover:bg-gray-100 dark:bg-primary-800 dark:hover:bg-primary-900"
            class="cursor-pointer">
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center space-x-2">
                <clearance-status-icon 
                  :status="isLoading ? 'unknown' : isClearanceCleared ? 'cleared' : 'not_cleared'" class="text-xl" />
                <skeleton custom-class="h-4 w-48 bg-gray-200 dark:text-primary-700">
                  <p>Clearance Status: <span class="font-bold">{{ isClearanceCleared ? 'Cleared' : 'Not cleared' }}</span></p>
                </skeleton>
              </div>
              <icon-chevron-right class="text-lg text-gray-400 dark:text-primary-300" />
            </div>
          </box>
        </loading-container>
      </div>

      <div class="flex flex-col md:flex-row <md:space-y-4 md:space-x-4">
        <div class="w-full md:w-1/2 flex flex-col space-y-4">
          <account-balance-widget />
          <payment-history is-short is-recent has-link />
        </div>
        <div class="w-full md:w-1/2 flex flex-col space-y-2 h-full">
          <schedule-list />
        </div>
      </div>
    </div>
  </dashboard-header>
</template>

<script lang="ts">
import PromiseLoader from '../components/ui/PromiseLoader.vue';
import Box from '../components/ui/Box.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import IconBookmarkOutline from '~icons/ion/bookmarks-outline';
import IconMailOpenOutline from '~icons/ion/mail-open-outline';
import IconBookOutline from '~icons/fluent/book-24-regular';
import IconReceiptOutline from '~icons/ion/receipt-outline';
import IconCashOutline from '~icons/ion/cash-outline';
import IconGClassroom from '~icons/custom/google-classroom';

import { useStudentStore } from '../stores/studentStore';
import SelfModal from '../components/ui/SelfModal.vue';
import { formatDatetime, getPeriod, now } from '../utils';
import DashboardHeader from '../components/ui/DashboardHeader.vue';
import Skeleton from '../components/ui/Skeleton.vue';
import AccountBalanceWidget from '../components/Finance/AccountBalanceWidget.vue';
import { computed } from 'vue';
import PaymentHistory from '../components/Finance/PaymentHistory.vue';
import ScheduleList from '../components/Schedule/ScheduleList.vue';
import ClearanceStatusIcon from '../components/Clearance/ClearanceStatusIcon.vue';
import IconChevronRight from '~icons/ion/chevron-right';
import { useClearanceQuery, useClearanceQueryUtilities } from '../stores/clearanceStore';

export default {
  components: { PromiseLoader, Box, LoadingContainer, IconGClassroom, IconBookmarkOutline, IconMailOpenOutline, IconBookOutline, IconReceiptOutline, IconChevronRight, IconCashOutline, SelfModal, DashboardHeader, Skeleton, AccountBalanceWidget, PaymentHistory, ScheduleList, ClearanceStatusIcon },
  setup() {
    const studentStore = useStudentStore();
    const { isCleared: isClearanceCleared, isLoading: isClearanceLoading } = useClearanceQueryUtilities(useClearanceQuery());

    const welcomeGreeting = computed(() => {
      const twelveHr = formatDatetime(now, 'hh:mm aa');
      const period = getPeriod(twelveHr);
      return `Good ${period}`;
    });
    const todayDate = computed(() => formatDatetime(now, '\'Today is\' iiii, MMMM d, yyyy'));

    return {
      isClearanceCleared,
      isClearanceLoading,
      studentStore,
      welcomeGreeting,
      todayDate
    }
  }
}
</script>

<style lang="postcss" scoped>
.quick-link-item {
  @apply w-1/4 md:w-1/6 cursor-pointer hover:bg-gray-100 dark:hover:bg-primary-800 rounded-lg p-3 flex flex-col items-center space-y-2;
}

.quick-link-item > svg,
.quick-link-item > .icon {
  @apply h-12 w-12 p-1 text-primary-400;
}
</style>