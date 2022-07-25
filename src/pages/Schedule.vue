<template>
  <dashboard-scaffold :subtitle="currentSemester.label" container-class="px-4 md:px-5 flex flex-col">
    <template #actions>
      <button @click="printPdf" class="button">
        <icon-print />
        <span>Print PDF</span>
      </button>
    </template>

    <div class="mb-2 text-center">
      <p class="text-2xl mb-0">Today is</p>
      <p class="text-3xl md:mt-2 font-bold mb-8">{{ currentDate }}</p>

      <button 
        :disabled="!hasAlternates || isLoading"
        @click="isAlternate = !isAlternate"
        class="mb-4 self-end button"
        :class="[isAlternate ? 'is-primary' : 'is-light']">
        Alternate Schedule
      </button>
    </div>

    <loading-container :is-loading="isLoading">
      <div class="flex flex-col space-y-4">
          <div
            class="w-full flex flex-col md:flex-row <md:space-y-2 md:space-x-2"
            v-for="(courses, day) in scheduleList" 
            :key="'sched_' + day">

            <span 
              :class="[days[day] === currentDay ? 'bg-primary-500 dark:bg-primary-700 text-white' : 'bg-gray-200 dark:bg-primary-800']"
              class="flex items-start px-3 py-1 rounded-full md:rounded-xl w-full md:w-1/5">
              {{ days[day] }}
            </span>

            <div class="flex flex-col w-full md:w-4/5 space-y-2">
              <box v-if="courses.length === 0"><p>No Class</p></box>

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

      <pdf-viewer ref="pdfViewer" :default-pdf-name="`Schedule - ${currentSemester.label}`" />
  </dashboard-scaffold>
</template>

<script lang="ts" setup>
import Box from '../components/ui/Box.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import { useSemesterQuery, currentSemesterIdKey } from '../stores/studentStore';
import {catchAndNotifyError, formatDatetime, now} from '../utils';
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';
import Skeleton from '../components/ui/Skeleton.vue';
import { inject, ref } from 'vue';
import IconPrint from '~icons/ion/print';
import { generateSchedulePDF, useSchedulesQuery, days } from '../stores/scheduleStore';
import { notify } from 'notiwind';
import PdfViewer from "../components/ui/PdfViewer.vue";

const pdfViewer = ref<InstanceType<typeof PdfViewer>>();
const currentSemesterId = inject(currentSemesterIdKey);
const { currentSemester, hasSemesterId } = useSemesterQuery(currentSemesterId);
const currentDay = ref(formatDatetime(now, 'EEE'));
const currentDate = ref(formatDatetime(now, 'MMMM d, yyyy'));
const { scheduleList, hasAlternates, isAlternate, isLoading } = useSchedulesQuery(currentSemesterId!);
const { data: pdfData, isSuccess, refetch } = generateSchedulePDF(currentSemesterId!);
const printPdf = async () => {
  try {
    if (!hasSemesterId) return;
    const { close } = notify({ type: 'info', text: 'Downloading PDF...' }, Infinity);
    await refetch.value();
    close();

    if (!isSuccess.value) return;
    pdfViewer.value!.open(pdfData.value!);
  } catch (e) {
    catchAndNotifyError(e);
  }
}
</script>