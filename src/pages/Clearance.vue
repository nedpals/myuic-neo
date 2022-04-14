<template>
  <dashboard-header>
    <promise-loader :promise="clearanceStore.getClearance()" v-slot="{ data, isPending, isResolved }">
      <div class="relative">
        <div 
          style="z-index:-1; opacity: 0.2;" 
          :class="[isPending ? 'from-transparent' : clearanceStore.isCleared ? 'from-green-400' : 'from-red-400']"
          class="bg-gradient-to-b to-transparent h-[40vh] absolute inset-x-0 top-0"></div>
      </div>
      <div class="p-4 max-w-4xl mx-auto">
        <div class="text-center py-8 md:py-8 flex flex-col items-center">
          <skeleton 
            :is-loading="isResolved && !studentStore.hasSemesterId" 
            custom-class="h-4.5 md:h-5 w-72 rounded-lg mb-8">
            <span class="text-gray-600 dark:text-uic-200 text-lg md:text-xl mb-8">
              {{ studentStore.getSemesterInfoByID(studentStore.currentSemesterId)?.label ?? 'Unknown Semester' }}
            </span>
          </skeleton>

          <loading-container :is-loading="isPending" v-slot="{ isLoading }">
            <clearance-status-icon
              :status="isLoading ? 'unknown' : clearanceStore.isCleared ? 'cleared' : 'not_cleared'"
              class="h-42 w-42 md:h-48 md:w-48 mb-4" />

            <skeleton custom-class="h-7.5 md:h-9 w-96 mb-4">
              <h1 class="text-3xl md:text-4xl font-semibold mb-2">
                {{ clearanceStore.isCleared ? 'You\'re cleared' : 'You\'re not cleared' }}, {{ studentStore.normalizedFirstName }}!
              </h1>
            </skeleton>

            <skeleton custom-class="h-5 md:h-6 w-72">
              <h2 class="text-xl md:text-2xl text-gray-600 dark:text-uic-200 mb-8">
                {{
                  clearanceStore.isCleared
                  ? 'All of the requirements for this semester have been met.'
                  : 'Comply first all of the requirements before you proceed.'
                }}
              </h2>
            </skeleton>

            <button
              v-if="!isLoading && clearanceStore.isCleared"
              @click="printPdf"
              class="button is-medium is-primary px-12 rounded-full">
              Print Permit
            </button>
          </loading-container>
        </div>

        <div v-if="isResolved && data.items.length" class="bg-gray-50 dark:bg-uic-800 shadow border dark:border-uic-600 rounded-lg">
          <div class="flex flex-col divide-y dark:divide-uic-600">
            <self-modal 
              :key="'item_' + i" v-for="(clearanceItem, i) in data.items"
              :title="clearanceItem.label + ' Requirements'">
              <template #default="{ openModal }">
                <div
                  @click="openModal"
                  class="flex justify-between cursor-pointer px-6 py-4 transition-colors hover:bg-gray-100 dark:hover:bg-uic-700">
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
            </self-modal>
          </div>
        </div>
      </div>
    </promise-loader>
  </dashboard-header>
</template>

<script lang="ts">
import { ClearanceItem } from '@myuic-api/types';
import DashboardHeader from '../components/ui/DashboardHeader.vue';
import Loader from '../components/ui/Loader.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import PromiseLoader from '../components/ui/PromiseLoader.vue';
import SelfModal from '../components/ui/SelfModal.vue';
import Skeleton from '../components/ui/Skeleton.vue';
import { useClearanceStore, useStudentStore } from '../stores/studentStore';
import { catchAndNotifyError } from '../utils';
import ClearanceStatusIcon from '../components/Clearance/ClearanceStatusIcon.vue';

export default {
  components: {
    PromiseLoader,
    LoadingContainer,
    DashboardHeader,
    Skeleton,
    Loader,
    SelfModal,
    ClearanceStatusIcon,
  },
  setup() {
    const clearanceStore = useClearanceStore();
    const studentStore = useStudentStore();
    const statusText = (status: 'cleared' | 'not_cleared' | 'unknown') => {
      return status == 'cleared' 
        ? 'Cleared'
        : status == 'not_cleared'
        ? 'Not cleared'
        : 'Unknown';
    }
  
    const statusColor = (status: 'cleared' | 'not_cleared' | 'unknown') => {
      return status == 'cleared' 
        ? 'text-green-600'
        : status == 'not_cleared'
        ? 'text-red-400'
        : 'text-gray-600';
    }

    const clearedRequirementsCount = (item: ClearanceItem) => {
      return item.requirements
        .filter(r => r.status === 'cleared' || r.status === 'promisory').length;
    }

    return {
      clearanceStore,
      studentStore,
      clearedRequirementsCount,
      statusColor,
      statusText
    }
  },
  methods: {
    async printPdf() {
      try {
        this.$notify({ type: 'info', text: 'Downloading PDF...' }, 10 * 1000);
        const fileUrl = await this.clearanceStore.generatePDF();
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