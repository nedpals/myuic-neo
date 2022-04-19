<template>
  <dashboard-scaffold container-class="p-6 flex flex-col">
    <template #actions>
      <button @click="printPdf" class="button">
        <icon-print />
        <span>Print PDF</span>
      </button>
    </template>

    <div class="flex justify-between">
      <div class="mb-6">
        <h2 class="text-2xl md:text-4xl font-bold">Today</h2>
        <p class="md:text-xl md:mt-2">{{ currentDate }}</p>
      </div>

      <div class="mb-6 text-right" v-if="studentStore.currentSemester"> 
        <h2 class="text-2xl md:text-4xl font-bold">{{ studentStore.filterSemesterLabel(studentStore.currentSemester.label) }}</h2>
        <p class="md:text-xl md:mt-2">{{ studentStore.currentSemester.fromYear }} - {{ studentStore.currentSemester.toYear }}</p>
      </div>
    </div>

    <loading-container :is-loading="isIdle || isFetching" v-slot="{ isLoading }">
      <button 
        :disabled="!hasAlternates || isLoading"
        v-tooltip="!hasAlternates ? 'All of your courses does not have alternate class times.' : null"
        @click="isAlternate = !isAlternate"
        class="mb-4 self-end button"
        :class="[isAlternate ? 'is-primary' : 'is-light']">Alternate Schedule</button>
      
      <div class="flex flex-col space-y-4">
          <div
            class="w-full flex flex-col md:flex-row <md:space-y-2 md:space-x-2"
            v-for="(courses, day) in scheduleList" :key="'sched_' + day">

            <span 
              :class="[days[day] === currentDay ? 'bg-primary-500 dark:bg-primary-700 text-white' : 'bg-gray-200 dark:bg-primary-800']"
              class="flex items-start px-3 py-1 rounded-full md:rounded-xl w-full md:w-1/5">
              {{ days[day] }}
            </span>
            <div class="flex flex-col w-full md:w-4/5 space-y-2">
              <box 
                :key="day + '_courses_' + i" 
                v-for="(sub, i) in courses" 
                class="px-4 py-2"
                no-padding>
                <div class="flex flex-col h-full">
                  <skeleton custom-class="h-4 w-24 mb-1 bg-gray-200">
                    <h3 class="font-semibold">{{ sub.name }}</h3>
                  </skeleton>
                  <skeleton custom-class="h-3.5 w-12 mb-4 bg-gray-200">
                    <p class="text-sm mb-2">{{ sub.instructor }}</p>
                  </skeleton>
                  <skeleton custom-class="h-4 w-16 bg-gray-200">
                    <p class="mt-auto">{{ sub.fromTime }} - {{ sub.toTime }}</p>
                  </skeleton>
                </div>
              </box>
            </div>
          </div>
        </div>
      </loading-container>
  </dashboard-scaffold>
</template>

<script lang="ts">
import Box from '../components/ui/Box.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import PromiseLoader from '../components/ui/PromiseLoader.vue';
import { useStudentStore } from '../stores/studentStore';
import { formatDatetime, now } from '../utils';
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';
import Skeleton from '../components/ui/Skeleton.vue';
import { ref } from 'vue';
import { catchAndNotifyError } from '../utils';
import IconPrint from '~icons/ion/print';
import { generateSchedulePDF, useScheduleQueryUtilities, useSchedulesQuery, days } from '../stores/scheduleStore';

export default {
  components: { PromiseLoader, Box, LoadingContainer, DashboardScaffold, Skeleton, IconPrint },
  setup() {
    const schedulesQuery = useSchedulesQuery();
    const { isFetching, isIdle } = schedulesQuery;
    const { scheduleList, hasAlternates, isAlternate } = useScheduleQueryUtilities(schedulesQuery);

    const studentStore = useStudentStore();
    const currentDay = ref(formatDatetime(now, 'EEE'));
    const currentDate = ref(formatDatetime(now, 'MMMM d, yyyy'));
    const formattedDate = ref(formatDatetime(now, 'yyyy-MM-d'));

    return {
      days,
      scheduleList,
      hasAlternates,
      isAlternate,
      studentStore,
      isIdle,
      isFetching,
      currentDay,
      currentDate,
      formattedDate
    }
  },
  methods: {
    async printPdf() {
      try {
        // TODO: unified component for fetching and previewing PDFs
        this.$notify({ type: 'info', text: 'Downloading PDF...' }, 10 * 1000);
        const fileUrl = await generateSchedulePDF();
        const pdfPreviewTab = window.open(fileUrl, '_blank');
        if (pdfPreviewTab) {
          pdfPreviewTab.focus();
        } else {
          throw new Error('There was an error when opening the file.');
        }
      } catch (e) {
        catchAndNotifyError(e);
      }
    }
  }
}
</script>