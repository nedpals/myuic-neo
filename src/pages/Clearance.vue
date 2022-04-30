<template>
  <dashboard-scaffold>
    <loading-container :is-loading="isLoading" v-slot="{ isLoading }">
      <div class="relative">
        <div 
          style="z-index:-1; opacity: 0.2;" 
          :class="[isLoading ? 'from-transparent' : isCleared ? 'from-success-400' : 'from-danger-400']"
          class="bg-gradient-to-b to-transparent h-[40vh] absolute inset-x-0 top-0"></div>

        <section class="p-4 max-w-4xl mx-auto">
          <div class="text-center py-8 md:py-8 flex flex-col items-center">
            <skeleton 
              :is-loading="!hasSemesterId" 
              custom-class="h-4.5 md:h-5 w-72 rounded-lg mb-8">
              <span class="text-gray-600 dark:text-primary-200 text-lg md:text-xl mb-8">
                {{ currentSemester.label ?? 'Unknown Semester' }}
              </span>
            </skeleton>

          
            <clearance-status-icon
              :status="isLoading ? 'unknown' : isCleared ? 'cleared' : 'not_cleared'"
              class="h-42 w-42 md:h-48 md:w-48 mb-4" />

            <skeleton custom-class="h-7.5 md:h-9 w-96 mb-4">
              <h1 class="text-3xl md:text-4xl font-semibold mb-2">
                {{ isCleared ? 'You\'re cleared' : 'You\'re not cleared' }}, {{ studentFirstName }}!
              </h1>
            </skeleton>

            <skeleton custom-class="h-5 md:h-6 w-72">
              <h2 class="text-xl md:text-2xl text-gray-600 dark:text-primary-200 mb-8">
                {{
                  isCleared
                  ? 'All of the requirements for this semester have been met.'
                  : 'Comply first all of the requirements before you proceed.'
                }}
              </h2>
            </skeleton>

            <button
              v-if="!isLoading && isCleared"
              @click="printPdf"
              class="button is-medium is-primary px-12 rounded-full">
              Print Permit
            </button>
          </div>

          <div v-if="!isLoading && data.items.length" class="bg-gray-50 dark:bg-primary-800 shadow border dark:border-primary-600 rounded-lg">
            <div class="flex flex-col divide-y dark:divide-primary-600">
              <self-modal-window 
                :key="'item_' + i" v-for="(clearanceItem, i) in data.items"
                :title="clearanceItem.label + ' Requirements'">
                <template #default="{ openModal }">
                  <div
                    @click="openModal"
                    class="flex justify-between cursor-pointer px-6 py-4 transition-colors hover:bg-gray-100 dark:hover:bg-primary-700">
                    <p>{{ clearanceItem.label }}</p>
                    <div class="flex space-x-2 items-center">
                      <p class="font-bold">
                        <template v-if="clearanceItem.status === 'not_cleared'">
                          {{ `${clearedRequirementsCount(clearanceItem)} / ${clearanceItem.requirements.length}` }}
                        </template>
                        <span class="<md:hidden ml-1">
                          {{ clearanceItem.status === 'not_cleared' ? 'requirements' : statusText(clearanceItem.status) }}
                        </span>
                      </p>

                      <clearance-status-icon :status="clearanceItem.status" class="text-xl" />
                    </div>
                  </div>
                </template>

                <template #modal-content>
                  <div v-if="isLoading" class="flex justify-center py-8">
                    <loader class="h-14 w-14" />
                  </div>

                  <div v-else class="flex flex-col divide-y">
                    <div class="pl-0 py-4 text-center">
                      <skeleton custom-class="w-16 h-4 bg-gray-200 mb-2">
                        <p class="text-lg mb-1">Status</p>
                      </skeleton>
                      <skeleton custom-class="w-8 h-3.5 bg-gray-200">
                        <p class="font-semibold text-4xl" :class="statusColor(clearanceItem.status)">
                          {{ statusText(clearanceItem.status) }}
                        </p>
                      </skeleton>
                    </div>

                    <div v-if="clearanceItem.requirements.length == 0" class="text-center text-gray-500 py-3">
                      <span class="block text-2xl">No requirements found.</span>
                    </div>

                    <div v-else class="flex flex-col divide-y">
                      <div v-for="r in clearanceItem.requirements" class="flex justify-between py-2">
                        <p>{{ r.remarks }}</p>
                        <div class="flex space-x-2 items-center">
                          <p class="font-bold">{{ statusText(r.status) }}</p>
                          <clearance-status-icon :status="r.status" />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </self-modal-window>
            </div>
          </div>
        </section>
      </div>
    </loading-container>
  </dashboard-scaffold>
</template>

<script lang="ts">
import { ClearanceItem } from '@myuic-api/types';
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';
import Loader from '../components/ui/Loader.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import PromiseLoader from '../components/ui/PromiseLoader.vue';
import SelfModalWindow from '../components/ui/SelfModalWindow.vue';
import Skeleton from '../components/ui/Skeleton.vue';
import { useSemesterQuery, useStudentQuery } from '../stores/studentStore';
import { catchAndNotifyError } from '../utils';
import ClearanceStatusIcon from '../components/Clearance/ClearanceStatusIcon.vue';
import { generateClearancePDF, useClearanceQuery } from '../stores/clearanceStore';
import { notify } from 'notiwind';

export default {
  components: {
    PromiseLoader,
    LoadingContainer,
    DashboardScaffold,
    Skeleton,
    Loader,
    SelfModalWindow,
    ClearanceStatusIcon,
  },
  setup() {
    const { query: { data }, isCleared, isLoading } = useClearanceQuery();
    const { hasSemesterId, currentSemester } = useSemesterQuery();
    const { normalizedFirstName: studentFirstName } = useStudentQuery();
    const { data: fileUrl, isSuccess, refetch } = generateClearancePDF();
    const printPdf = async () => {
      if (!hasSemesterId) return;
      const { close } = notify({ type: 'info', text: 'Downloading PDF...' }, Infinity);
      await refetch.value();
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

    const statusText = (status: 'cleared' | 'not_cleared' | 'unknown') => {
      return status == 'cleared' 
        ? 'Cleared'
        : status == 'not_cleared'
        ? 'Not cleared'
        : 'Unknown';
    }
  
    const statusColor = (status: 'cleared' | 'not_cleared' | 'unknown') => {
      return status == 'cleared' 
        ? 'text-success-600'
        : status == 'not_cleared'
        ? 'text-danger-400'
        : 'text-gray-600';
    }

    const clearedRequirementsCount = (item: ClearanceItem) => {
      return item.requirements
        .filter(r => r.status === 'cleared' || r.status === 'promisory').length;
    }

    return {
      hasSemesterId,
      currentSemester,
      studentFirstName,
      clearedRequirementsCount,
      statusColor,
      statusText,
      data,
      isLoading,
      isCleared,
      printPdf
    }
  }
}
</script>