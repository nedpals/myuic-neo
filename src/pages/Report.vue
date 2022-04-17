<template>
  <dashboard-header container-class="p-4 md:p-8 space-y-12">
    <template #actions>
      <button @click="printPdf" class="button">
        <icon-print />
        <span>Print PDF</span>
      </button>
    </template>

    <div class="flex justify-end -mb-8">
      <self-modal title="Computation">
        <template #default="{ openModal }">
          <button
            @click="openModal"
            class="text-primary-600 hover:text-primary-600 dark:text-primary-100 dark:hover:text-primary-200 font-semibold underline">
            How to compute your GWA
          </button>
        </template>
        <template #modal-content>
          <div class="py-2 space-y-4">
            <p>In order to compute for the GWA (General Weighted Average), the following formula is used:</p>
            <img :src="computationFormulaImg" class="filter invert dark:invert-0 h-full w-auto" />
          </div>
        </template>
      </self-modal>
    </div>

    <loading-container :is-loading="isLoading" v-slot="{ isLoading }">
      <!-- TODO: package into skeleton -->
      <section 
        v-if="!isLoading"
        :key="'sem_' + j" v-for="(r, j) in latestAcademicRecords" 
        :class="{'border-primary-400': j === 0}" 
        class="bg-white dark:bg-primary-800 border dark:border-primary-600 rounded-xl shadow-md">
        <div 
          :class="[j === 0 ? 'bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-700 dark:to-primary-900' : 'border-b dark:border-primary-600']" 
          class="rounded-t-xl px-6 py-4 flex flex-col md:flex-row justify-between items-center pb-4">
          <div class="flex flex-row text-center md:flex-col md:text-left <md:space-x-1 <md:mb-2">
            <h2 class="font-semibold md:text-2xl">
              {{ semesterDisplayNames[j].semester }}
            </h2>
            <p>{{ semesterDisplayNames[j].year }}</p>
          </div>
          <div class="flex flex-row space-x-6 md:text-right">
            <div class="flex flex-col text-center md:flex-row md:space-x-2 md:text-right">
              <span class="text-lg block cursor-default">Units</span>
              <p class="font-semibold text-3xl md:text-5xl">{{ overallUnits[j] }}</p>
            </div>
            <div class="flex flex-col text-center md:flex-row md:space-x-2 md:text-right">
              <span 
                class="text-lg block underline underline-dotted underline-offset-2 cursor-default" 
                v-tooltip="'General Weighted Average'">GWA</span>
              <p class="font-semibold text-3xl md:text-5xl">{{ overallAverages[j] }}</p>
            </div>
          </div>
        </div>
        <div class="rounded-b-xl">
          <div class="flex flex-col divide-y dark:divide-primary-600">
            <div :key="'sem_' + j + '_sub_' + i" v-for="(ar, i) in r.reports" class="flex items-center">
              <div class="<md:hidden w-1/9 px-3 md:px-6 py-2 md:py-4">
                <p class="font-semibold">{{ ar.code }}</p>
              </div>
              <div class="w-5/9 md:w-4/9 px-3 md:px-6 py-2 md:py-4">
                <p class="font-semibold text-sm md:hidden">{{ ar.code }}</p>
                <p class="sm:text-lg font-semibold">{{ ar.name }}</p>
                <p class="text text-gray-600 dark:text-primary-100">
                  {{ ar.units }} units / {{ ar.type == 'Lec' ? 'Lecture' : ar.type == 'Lab' ? 'Laboratory' : 'Unknown' }}
                </p>
              </div>
              <div class="w-1/9 px-2 md:px-4 py-2 md:py-3 <md:text-center">
                <p class="text-xl md:text-3xl font-semibold">{{ ar.prelimGrade ?? '--' }}</p>
                <p class="text-gray-600 dark:text-primary-100 text-sm underline underline-dotted underline-offset-2 md:hidden" v-tooltip="'Prelim'">P</p>
                <p class="text-gray-600 dark:text-primary-100 hidden md:block">Prelim</p>
              </div>
              <div class="w-1/9 px-2 md:px-4 py-2 md:py-3 <md:text-center">
                <p class="text-xl md:text-3xl font-semibold">{{ ar.midtermGrade ?? '--' }}</p>
                <p class="text-gray-600 dark:text-primary-100 text-sm underline underline-dotted underline-offset-2 md:hidden" v-tooltip="'Midterms'">M</p>
                <p class="text-gray-600 dark:text-primary-100 hidden md:block">Midterms</p>
              </div>
              <div class="w-1/9 px-2 md:px-4 py-2 border-r md:py-3 <md:text-center">
                <p class="text-xl md:text-3xl font-semibold">{{ ar.finalsGrade ?? '--' }}</p>
                <p class="text-gray-600 dark:text-primary-100 text-sm underline underline-dotted underline-offset-2 md:hidden" v-tooltip="'Finals'">F</p>
                <p class="text-gray-600 dark:text-primary-100 hidden md:block">Finals</p>
              </div>
              <div class="w-1/9 px-2 md:px-4 py-2 md:py-3 <md:text-center flex flex-col">
                <p class="text-xl text-primary-800 dark:text-primary-200 md:text-3xl font-semibold <md:my-auto">{{ ar.overallGrade ?? '--' }}</p>
                <p class="text-gray-600 dark:text-primary-100 <md:hidden">Overall</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section 
        v-else 
        :key="'sem_' + j" 
        v-for="j in 2" 
        :class="{'border-primary-400': j === 1}" 
        class="bg-white dark:bg-primary-800 border dark:border-primary-600 rounded-xl shadow-md -z-1">
        <div 
          :class="[j === 1 ? 'bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-700 dark:to-primary-900' : 'border-b  dark:border-primary-600']" 
          class="rounded-t-xl px-6 py-4 flex flex-col md:flex-row justify-between items-center pb-4">
          <div class="flex flex-row text-center md:flex-col md:text-left <md:space-x-1 <md:mb-2 animate-pulse">
            <div class="w-24 h-4 md:h-6 rounded-lg mb-2" :class="[j === 1 ? 'bg-primary-300' : 'bg-gray-300']"></div>
            <div class="w-16 h-4 rounded-lg" :class="[j === 1 ? 'bg-primary-300' : 'bg-gray-300']"></div>
          </div>
          <div class="flex flex-col text-center md:flex-row md:space-x-2 md:text-right">
            <span class="text-lg block">Average</span>
            <div class="w-18 h-7.5 md:h-12 rounded-lg animate-pulse" :class="[j === 1 ? 'bg-primary-300' : 'bg-gray-300']"></div>
          </div>
        </div>
        <div class="rounded-b-xl">
          <div class="flex flex-col divide-y dark:divide-primary-600">
            <div :key="'sem_' + j + '_sub_' + i" v-for="i in 4" class="flex items-center animate-pulse">
              <div class="<md:hidden w-1/9 px-3 md:px-6 py-2 md:py-4">
                <div class="w-6 md:w-11 h-5 md:h-7.5 mt-1 mb-3 rounded-lg bg-gray-400"></div>
              </div>
              <div class="w-5/9 px-3 md:px-6 py-2 md:py-4">
                <div class="w-18 sm:h-4.5 h-4 md:h-5 mt-1 mb-2 rounded-lg bg-gray-200"></div>
                <div class="w-10 h-4 rounded-lg bg-gray-200"></div>
              </div>
              <div :key="'g_' + jj" v-for="jj in 3" class="w-1/9 px-2 md:px-4 py-2 md:py-3 <md:text-center animate-pulse">
                <div class="w-6 md:w-11 h-5 md:h-7.5 mt-1 mb-3 rounded-lg bg-gray-400"></div>
                <div class="w-5 md:w-14 <md:h-3.5 h-4 rounded-lg bg-gray-200"></div>
              </div>
              <div class="flex flex-col w-1/9 px-2 md:px-4 py-2 md:py-3 <md:text-center animate-pulse">
                <div class="w-6 md:w-11 h-5 md:h-7.5 mt-1 mb-3 rounded-lg bg-primary-400"></div>
                <div class="w-5 md:w-14 <md:h-3.5 h-4 rounded-lg bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </loading-container>
  </dashboard-header>
</template>

<script lang="ts">
import DashboardHeader from '../components/ui/DashboardHeader.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import PromiseLoader from '../components/ui/PromiseLoader.vue';
import { generateAcademicRecordsPDF, useAcademicRecordQuery, useAcademicRecordQueryUtilities } from '../stores/academicRecordStore';
import IconPrint from '~icons/ion/print';
import { catchAndNotifyError } from '../utils';
import SelfModal from '../components/ui/SelfModal.vue';
import { ref } from 'vue';

import computationFormulaImg from '../assets/computation-formula.png';

export default {
  components: { PromiseLoader, LoadingContainer, DashboardHeader, IconPrint, SelfModal },
  setup() {
    const academicRecordQuery = useAcademicRecordQuery();
    const { isLoading, latestAcademicRecords, overallAverages, semesterDisplayNames, overallUnits } = useAcademicRecordQueryUtilities(academicRecordQuery);

    return {
      latestAcademicRecords,
      isLoading,
      overallAverages,
      overallUnits,
      semesterDisplayNames,
      computationFormulaImg: ref(computationFormulaImg)
    }
  },
  methods: {
    async printPdf() {
      try {
        this.$notify({ type: 'info', text: 'Downloading PDF...' }, 10 * 1000);
        const fileUrl = await generateAcademicRecordsPDF();
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