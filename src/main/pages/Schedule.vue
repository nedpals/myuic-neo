<template>
  <dashboard-scaffold :subtitle="currentSemester.label" container-class="px-4 md:px-5 flex flex-col">
    <template #actions>
      <Button :disabled="!scheduleList" @click="printPdf" :icon="IconPrint" text="Print PDF" />
    </template>

    <div class="mb-4 text-center">
      <div class="flex items-center space-x-2">
        <div class="flex">
          <Button
            v-for="type in (['Lec', 'Lab', 'All'] as UseScheduleQueryOptions['type'][])"
            :disabled="!scheduleList"
            @click="scheduleQuerySettings.type = type"
            class="text-sm md:text-base !px-4"
            :class="{
              '!rounded-r-none': type === 'Lec',
              '!rounded-none': type === 'Lab',
              '!rounded-l-none': type === 'All',
            }"
            :theme="scheduleQuerySettings.type === type ? 'primary' : 'light'"
            :text="type" />
        </div>
        <Listbox v-if="isLoading || isTermBased" as="div" class="relative" v-model="scheduleQuerySettings.term">
          <ListboxButton :as="Button" class="text-sm md:text-base" :disabled="isLoading || !isTermBased" with-icon>
            <span>{{ availableTerms[scheduleQuerySettings.term] }}</span>
            <icon-chevron-down class="text-primary-400" />
          </ListboxButton>
          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-out"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <ListboxOptions class="absolute z-10 mt-1 w-full border dark:border-primary-700 bg-white dark:bg-primary-800 shadow-lg max-h-56 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
              <ListboxOption as="template" :key="`term_${term}`" :value="term" v-for="(termLabel, term) in availableTerms">
                <li :class="[scheduleQuerySettings.term == term ? 'bg-primary-100 dark:bg-primary-600' : '', 'hover:bg-zinc-200 dark:hover:bg-primary-700 cursor-default select-none relative py-2 pl-3 pr-9']">
                  {{ termLabel }}
                </li>
              </ListboxOption>
            </ListboxOptions>
          </transition>
        </Listbox>

        <Button
          class="!ml-auto text-sm md:text-base"
          v-if="!hasAlternates || isLoading"
          @click="scheduleQuerySettings.isAlternate = !scheduleQuerySettings.isAlternate"
          :theme="scheduleQuerySettings.isAlternate ? 'primary' : 'light'">
          Alternate Schedule
        </Button>
      </div>
    </div>

    <loading-container :is-loading="isLoading">
      <div class="flex flex-col space-y-4">
        <div
          class="w-full flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2"
          v-for="(courses, day) in scheduleList"
          :key="'sched_' + day">

            <span
              :class="[!isLoading && days[day] === currentDay ? 'bg-primary-500 dark:bg-primary-700 text-white' : 'bg-zinc-200 dark:bg-primary-800']"
              class="flex items-start px-3 py-1 rounded-full md:rounded-xl w-full md:w-1/5">
              {{ days[day] }}
            </span>

            <div class="flex flex-col w-full md:w-4/5 space-y-2">
              <box v-if="courses.length === 0"><p>No Class</p></box>

              <box
                v-for="(sub, i) in courses"
                :key="`${day}_courses_${i}`"
                no-padding>
                <div class="flex">
                  <div
                    class="w-1/4 md:w-1/8 flex items-center justify-center px-4 rounded-l"
                    :class="[!isLoading && days[day] === currentDay ? 'bg-primary-100 dark:bg-primary-500' : 'bg-zinc-100 dark:bg-primary-700']">
                    <skeleton custom-class="h-4 w-24 mb-1 bg-zinc-200">
                      <p class="font-semibold">{{ sub.code }}</p>
                    </skeleton>
                  </div>

                  <div class="w-3/4 md:w-7/8 flex flex-col h-full px-4 py-2">
                    <skeleton custom-class="h-4 w-24 mb-1 bg-zinc-200">
                      <h3 class="font-semibold">
                        {{ sub.name }}
                        <span
                          v-for="type in sub.types"
                          class="ml-1 border rounded-md text-sm px-2 py-1"
                          :class="{
                            'bg-primary-100 border-primary-400 text-primary-400': type === 'Lab',
                            'bg-success-100 border-success-400 text-success-400': type === 'Lec'
                          }">{{ type }}</span>
                      </h3>
                    </skeleton>
                    <skeleton custom-class="h-3.5 w-12 mb-4 bg-zinc-200">
                      <p class="text-sm mb-2">{{ sub.instructor }}</p>
                    </skeleton>
                    <skeleton custom-class="h-4 w-16 bg-zinc-200">
                      <p class="mt-auto">{{ sub.fromTime }} - {{ sub.toTime }}</p>
                    </skeleton>
                  </div>
                </div>
              </box>
            </div>
          </div>
        </div>

        <div v-if="!scheduleList" class="py-14 flex items-center justify-center">
          <span class="text-center text-zinc-400 text-2xl">No schedule found.</span>
        </div>
      </loading-container>

      <pdf-viewer ref="pdfViewer" :default-pdf-name="`Schedule - ${currentSemester.label}`" />
  </dashboard-scaffold>
</template>

<script lang="ts" setup>
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';
import Box from '../components/ui/Box.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import IconChevronDown from '~icons/ion/chevron-down';
import { useAdditionalInfoQuery, currentSemesterIdKey } from '../stores/studentStore';
import {catchAndNotifyError, formatDatetime, now} from '../utils';
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';
import Skeleton from '../components/ui/Skeleton.vue';
import { inject, reactive, ref, watch } from 'vue';
import IconPrint from '~icons/ion/print';
import { generateSchedulePDF, useSchedulesQuery, UseScheduleQueryOptions, days } from '../stores/scheduleStore';
import { notify } from 'notiwind';
import PdfViewer from "../components/ui/PdfViewer.vue";
import Button from '../components/ui/Button.vue';

const pdfViewer = ref<InstanceType<typeof PdfViewer>>();
const currentSemesterId = inject(currentSemesterIdKey);
const { currentSemester, hasSemesterId } = useAdditionalInfoQuery(currentSemesterId);
const currentDay = ref(formatDatetime(now, 'EEE'));
const scheduleQuerySettings = reactive<UseScheduleQueryOptions>({
  isAlternate: false,
  term: '1stT',
  type: 'All'
});

const { scheduleList, hasAlternates, isLoading, isTermBased } = useSchedulesQuery(currentSemesterId!, scheduleQuerySettings);
const { data: pdfData, isSuccess, refetch } = generateSchedulePDF(currentSemesterId!);
const availableTerms = {'1stT': '1st Term', '2ndT': '2nd Term'};

function determineTerm(): '1stT' | '2ndT' {
  if (!isTermBased.value || !currentSemester.value || currentSemester.value.label.startsWith('Summer')) {
    return '1stT';
  }

  // end of 1st term is december (minus 5 months = august)
  // end of 2nd term is may (minus 5 months = january)
  let endingMonthIdx = 11;
  if (currentSemester.value.label.startsWith('Second Semester')) {
    endingMonthIdx = 5;
  }

  // get the month where term would change (october for 1st, march for 2nd)
  const centerIdx = endingMonthIdx - 3;
  const monthIdx = now.getMonth();

  if (monthIdx >= centerIdx) {
    return '2ndT';
  }

  return '1stT';
}

async function printPdf() {
  try {
    if (!hasSemesterId) return;
    const { close } = notify({ type: 'info', text: 'Downloading PDF...' }, Infinity);
    await refetch();
    close();

    if (!isSuccess.value) return;
    pdfViewer.value!.open(pdfData.value!);
  } catch (e) {
    catchAndNotifyError(e);
  }
}

watch(currentSemester, () => {
  if (currentSemester.value) {
    scheduleQuerySettings.term = determineTerm();
  }
});
</script>
