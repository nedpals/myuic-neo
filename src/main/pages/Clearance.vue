<template>
  <dashboard-scaffold :subtitle="currentSemester.label">
    <loading-container :is-loading="isLoading" v-slot="{ isLoading }">
      <section class="px-4 max-w-4xl mx-auto">
        <div
          :class="[
            isLoading ? 'from-white' :
            isCleared ? 'from-success-200 dark:from-success-600 dark:to-success-800 dark:!border-success-500' :
            'from-danger-200 dark:from-danger-600 dark:to-danger-800 dark:!border-danger-500']"
          class="border dark:border-primary-600 rounded-lg bg-gradient-to-b dark:from-primary-800 to-white text-center shadow px-8 md:px-0 py-12 flex flex-col items-center mb-8">

          <clearance-status-icon
            :status="isLoading ? 'unknown' : isCleared ? 'cleared' : 'not_cleared'"
            :class="{ 'animate-pulse': isLoading }"
            class="h-42 w-42 md:h-48 md:w-48 mb-4" />

          <skeleton :delay="2 * 250" custom-class="h-7.5 md:h-9 w-full max-w-96 mb-4">
            <h1 class="text-3xl md:text-4xl font-semibold mb-2">
              {{ isCleared ? 'You\'re cleared' : 'You\'re not cleared' }}, {{ studentFirstName }}!
            </h1>
          </skeleton>

          <skeleton :delay="3 * 250" custom-class="h-5 md:h-6 w-full max-w-72">
            <h2 class="text-xl md:text-2xl text-zinc-600 dark:text-white dark:text-opacity-70 mb-8">
              {{
                isCleared
                ? 'All of the requirements for this semester have been met.'
                : 'Comply first all of the requirements before you proceed.'
              }}
            </h2>
          </skeleton>

          <Button
            theme="primary"
            size="medium"
            v-if="!isLoading && isCleared"
            @click="printPdf"
            class="transition-colors px-12 rounded-full"
            text="Print Permit" />
        </div>

        <h2 class="font-bold text-xl">Requirements</h2>

        <div class="flex flex-row flex-wrap -mx-2">
          <div class="mt-4 mx-2 w-full h-full p-8 flex justify-center items-center text-center rounded-lg bg-gray-100 dark:bg-primary-800" v-if="!data || data.items.length === 0">
            <p class="text-2xl">No requirements found.</p>
          </div>

          <div
            v-for="(clearanceItem, i) in data!.items"
            :key="'item_' + i"
            class="w-1/2 p-2">
            <div @click="() => {
                if (!isLoading) {
                  selectedClearanceItemIdx = i;
                }
              }"
              :class="{'hover:bg-zinc-100 dark:hover:bg-primary-700 shadow dark:hover:border-primary-700 transition-colors cursor-pointer': !isLoading}"
              class="bg-zinc-50  dark:bg-primary-800 dark:hover:bg-primary-700 border dark:border-primary-600  rounded-lg p-4 flex flex-col justify-between">
              <clearance-status-icon
                :status="clearanceItem.status"
                class="h-10 w-10 mb-8" />

              <skeleton custom-class="w-16 h-4 bg-zinc-200 mb-2">
                <p class="text-xl font-bold">{{ clearanceItem.label }}</p>
              </skeleton>

              <skeleton custom-class="w-16 h-4 bg-zinc-200 mb-2">
                <p v-if="clearanceItem.requirements.length === 0">No requirements</p>

                <p v-else-if="clearedRequirementsCount(clearanceItem) === 0">
                  {{ clearanceItem.requirements.length }} requirements
                </p>

                <p v-else>
                  {{ clearedRequirementsCount(clearanceItem) }} / {{ clearanceItem.requirements.length }}
                  cleared
                </p>
              </skeleton>
            </div>
          </div>

          <modal-window
            open
            v-if="selectedClearanceItemIdx !== -1"
            @update:open="() => selectedClearanceItemIdx = -1"
            :key="'selectedClearanceItem_' + selectedClearanceItemIdx"
            :title="selectedClearanceItem.label + ' Requirements'">
            <div v-if="isLoading" class="flex justify-center py-8">
              <loader class="h-13 w-13" />
            </div>

            <div v-else class="flex flex-col divide-y dark:divide-primary-600">
              <div class="pl-0 py-4 text-center">
                <skeleton custom-class="w-16 h-4 bg-zinc-200 mb-2">
                  <p class="text-lg mb-1">Status</p>
                </skeleton>
                <skeleton custom-class="w-8 h-3.5 bg-zinc-200">
                  <p class="font-semibold text-4xl" :class="statusColor(selectedClearanceItem.status)">
                    {{ statusText(selectedClearanceItem.status) }}
                  </p>
                </skeleton>
              </div>

              <div v-if="selectedClearanceItem.requirements.length == 0" class="text-center text-zinc-500 dark:text-primary-50 py-3">
                <span class="block text-2xl">No requirements found.</span>
              </div>

              <div v-else class="flex flex-col divide-y dark:divide-primary-600">
                <div :key="'requirement_' + i" v-for="(r, i) in selectedClearanceItem.requirements" class="flex justify-between py-2">
                  <p>{{ r.remarks }}</p>
                  <div class="flex space-x-2 items-center">
                    <p class="font-bold">{{ statusText(r.status) }}</p>
                    <clearance-status-icon :status="r.status" />
                  </div>
                </div>
              </div>
            </div>
          </modal-window>
        </div>
      </section>
    </loading-container>
  </dashboard-scaffold>
</template>

<script lang="ts" setup>
import { ClearanceItem } from '@myuic-api/types';
import Button from '../components/ui/Button.vue';
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';
import Loader from '../components/ui/Loader.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import ModalWindow from '../components/ui/ModalWindow.vue';
import Skeleton from '../components/ui/Skeleton.vue';
import { currentSemesterIdKey, useAdditionalInfoQuery, useStudentQuery } from '../stores/studentStore';
import { catchAndNotifyError } from '../utils';
import ClearanceStatusIcon from '../components/Clearance/ClearanceStatusIcon.vue';
import { generateClearancePDF, useClearanceQuery } from '../stores/clearanceStore';
import { notify } from 'notiwind';
import { computed, inject, ref } from 'vue';

const currentSemesterId = inject(currentSemesterIdKey);
const { hasSemesterId, currentSemester } = useAdditionalInfoQuery(currentSemesterId!);
const { query: { data }, isCleared, isLoading } = useClearanceQuery(currentSemesterId!);
const { normalizedFirstName: studentFirstName } = useStudentQuery();
const { data: fileUrl, isSuccess, refetch } = generateClearancePDF(currentSemesterId!);
const printPdf = async () => {
  if (!hasSemesterId) return;
  const { close } = notify({ type: 'info', text: 'Downloading PDF...' }, Infinity);
  await refetch();
  close();
  if (!isSuccess.value) return;
  const pdfPreviewTab = window.open(fileUrl.value, '_blank');
  if (!pdfPreviewTab) {
    catchAndNotifyError(
      new Error('There was an error when opening the file.')
    );
    return;
  }
  pdfPreviewTab.focus();
}

const statusText = (status: 'cleared' | 'not_cleared' | 'unknown' | 'promisory') => {
  switch (status) {
    case 'cleared':
      return 'Cleared';
    case 'not_cleared':
      return 'Not cleared';
    case 'promisory':
      return 'Promisory';
    default:
      return 'Unknown';
  }
}

const statusColor = (status: 'cleared' | 'not_cleared' | 'unknown' | 'promisory') => {
  return status == 'cleared' || status == 'promisory'
    ? 'text-success-600 dark:text-success-400'
    : status == 'not_cleared'
    ? 'text-danger-400'
    : 'text-zinc-600 dark:text-primary-200';
}

const clearedRequirementsCount = (item: ClearanceItem) => {
  return item.requirements
    .filter(r => r.status === 'cleared' || r.status === 'promisory').length;
}

const selectedClearanceItemIdx = ref(-1);
const selectedClearanceItem = computed(() => data.value!.items[selectedClearanceItemIdx.value])
</script>
