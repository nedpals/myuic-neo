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
            :is-loading="isResolved && studentStore.currentSemesterId === -1" 
            class="h-4.5 md:h-5 w-72 rounded-lg mb-8">
            <span class="text-gray-600 dark:text-uic-200 text-lg md:text-xl mb-8">
              {{ studentStore.getSemesterInfoByID(studentStore.currentSemesterId - 1)?.label ?? 'Unknown Semester' }}
            </span>
          </skeleton>

          <loading-container :is-loading="isPending" v-slot="{ isLoading }">
            <component 
              :is="isLoading 
                ? 'icon-unknown-circle-outline' 
                : clearanceStore.isCleared 
                ? 'icon-checkmark-circle-outline' 
                : 'icon-close-circle-outline'"
              :class="[isLoading ? 'text-gray-400' : clearanceStore.isCleared ? 'text-green-400' : 'text-red-400']"
              class="h-42 w-42 md:h-48 md:w-48 mb-4" />

            <skeleton custom-class="h-7.5 md:h-9 w-96 mb-4">
              <h1 class="text-3xl md:text-4xl font-semibold mb-2">
                {{ clearanceStore.isCleared ? 'You\'re cleared' : 'Not cleared yet' }}, {{ studentStore.normalizedFirstName }}!
              </h1>
            </skeleton>

            <skeleton custom-class="h-5 md:h-6 w-72">
              <h2 class="text-xl md:text-2xl text-gray-600 dark:text-uic-200 mb-8">
                {{
                  clearanceStore.isCleared
                  ? 'All of the requirements for this semester have been met.'
                  : 'You need to comply first all of the requirements before you can proceed.'
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
            <div 
              :key="'item_' + i" v-for="(clearanceItem, i) in data.items" 
              class="flex justify-between cursor-pointer px-6 py-4 transition-colors hover:bg-gray-100 dark:hover:bg-uic-700">
              <p>{{ clearanceItem.label }}</p>
              <icon-checkmark-circle-outline v-if="clearanceItem.status == 'cleared'" class="text-xl text-green-600" />
              <icon-close-circle-outline v-else-if="clearanceItem.status == 'not_cleared'" class="text-xl text-red-600" />
              <icon-unknown-circle-outline v-else class="text-xl text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </promise-loader>
  </dashboard-header>
</template>

<script>
import IconCheckmarkCircleOutline from '~icons/ion/ios-checkmark-circle-outline';
import IconCloseCircleOutline from '~icons/ion/ios-close-circle-outline';
import IconUnknownCircleOutline from '~icons/ion/remove-circle-outline';
import DashboardHeader from '../components/ui/DashboardHeader.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import PromiseLoader from '../components/ui/PromiseLoader.vue';
import Skeleton from '../components/ui/Skeleton.vue';
import { useClearanceStore, useStudentStore } from '../stores/studentStore';
import { catchAndNotifyError } from '../utils';

export default {
  components: {
    IconCheckmarkCircleOutline,
    IconCloseCircleOutline,
    IconUnknownCircleOutline,
    PromiseLoader,
    LoadingContainer,
    DashboardHeader,
    Skeleton
  },
  setup() {
    const clearanceStore = useClearanceStore();
    const studentStore = useStudentStore();

    return {
      clearanceStore,
      studentStore
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