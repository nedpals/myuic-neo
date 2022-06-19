<template>
  <dashboard-scaffold container-class="p-4 md:p-8 space-y-12">
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
      <section 
        :key="'sem_' + j" v-for="(r, j) in latestAcademicRecords" 
        :class="{'border-primary-400': j === 0}" 
        class="bg-white dark:bg-primary-800 border dark:border-primary-600 rounded-xl shadow-md">
        <div 
          :class="[j === 0 ? 'bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-700 dark:to-primary-900' : 'border-b dark:border-primary-600']" 
          class="rounded-t-xl px-6 py-4 flex flex-col md:flex-row justify-between items-center pb-4">
          <div class="flex flex-row text-center md:flex-col md:text-left <md:space-x-1 <md:mb-2">
            <skeleton :custom-class="'w-24 h-4 md:h-6 md:mb-2 ' + (j === 0 ? 'bg-primary-300' : '')">
              <h2 class="font-semibold md:text-2xl">
                {{ semesterDisplayNames[j].semester }}
              </h2>
            </skeleton>
            <skeleton :custom-class="'w-16 h-4 ' + (j === 0 ? 'bg-primary-300' : '')">
              <p>{{ semesterDisplayNames[j].year }}</p>
            </skeleton>
          </div>
          <div class="flex flex-row space-x-6 md:text-right">
            <div class="flex flex-col text-center md:flex-row md:space-x-2 md:text-right">
              <span class="text-lg block cursor-default">Units</span>
              <skeleton :custom-class="'w-18 h-7.5 md:h-12 ' + (j === 0 ? 'bg-primary-300' : '')">
                <p class="font-semibold text-3xl md:text-5xl">{{ overallUnits[j] }}</p>
              </skeleton>
            </div>
            <div class="flex flex-col text-center md:flex-row md:space-x-2 md:text-right">
              <span 
                class="text-lg block underline underline-dotted underline-offset-2 cursor-default" 
                v-tooltip="'General Weighted Average'">GWA</span>
              <skeleton :custom-class="'w-18 h-7.5 md:h-12 ' + (j === 0 ? 'bg-primary-300' : '')">
                <p class="font-semibold text-3xl md:text-5xl">{{ overallAverages[j] }}</p>
              </skeleton>
            </div>
          </div>
        </div>
        <div class="rounded-b-xl">
          <div class="flex flex-col divide-y dark:divide-primary-600">
            <div class="flex items-center justify-center" v-if="r.report.courses.length == 0">
              <p class="text-center text-2xl py-8">No grades found.</p>
            </div>
            
            <div :key="'sem_' + j + '_sub_' + i" v-for="(ar, i) in r.report.courses" class="flex items-center">
              <div class="<md:hidden w-1/9 px-3 md:px-6 py-2 md:py-4">
                <skeleton custom-class="w-8 md:w-11 h-5 md:h-7.5 bg-gray-400">
                  <p class="font-semibold">{{ ar.code }}</p>
                </skeleton>
              </div>
              <div class="w-5/9 md:w-4/9 px-3 md:px-6 py-2 md:py-4">
                <skeleton custom-class="w-8 md:w-11 h-5 mb-2 md:hidden bg-gray-400">
                  <p class="font-semibold text-sm md:hidden">{{ ar.code }}</p>
                </skeleton>
                <skeleton custom-class="w-24 sm:h-4.5 h-4 md:h-5 mt-1 mb-2 rounded-lg bg-gray-200">
                  <p class="sm:text-lg font-semibold">{{ ar.name }}</p>
                </skeleton>
                <skeleton custom-class="w-16 h-4 rounded-lg bg-gray-200">
                  <p class="text text-gray-600 dark:text-primary-100">
                    {{ ar.units }} units / {{ ar.type == 'Lec' ? 'Lecture' : ar.type == 'Lab' ? 'Laboratory' : 'Unknown' }}
                  </p>
                </skeleton>
              </div>
              <div :key="'grade_' + gKey" v-for="(gLabel, gKey) in gradeKeysAndLabels" class="w-1/9 px-2 md:px-4 py-2 md:py-3 <md:text-center">
                <skeleton custom-class="w-6 md:w-11 h-5 md:h-7.5 mt-1 mb-3 bg-gray-400">
                  <p class="text-xl md:text-3xl font-semibold">{{ ar[gKey] && ar[gKey] > 40 ? ar[gKey] : '--' }}</p>
                </skeleton>
                <skeleton custom-class="w-5 md:w-14 <md:h-3.5 h-4 bg-gray-200">
                  <p 
                    class="text-gray-600 dark:text-primary-100 text-sm underline underline-dotted underline-offset-2 md:hidden" 
                    v-tooltip="gLabel">{{ gLabel[0] }}</p>
                  <p class="text-gray-600 dark:text-primary-100 hidden md:block">{{ gLabel }}</p>
                </skeleton>
              </div>
              <div class="w-1/9 px-2 md:px-4 py-2 md:py-3 <md:text-center flex flex-col">
                <skeleton custom-class="w-6 md:w-11 h-5 md:h-7.5 mt-1 mb-3 bg-primary-400">
                  <p class="text-xl text-primary-800 dark:text-primary-200 md:text-3xl font-semibold <md:my-auto">
                    {{ ar.overallGrade && typeof ar.overallGrade == 'number' ? ar.overallGrade : '--' }}
                  </p>
                </skeleton>
                <skeleton custom-class="w-5 md:w-14 <md:h-3.5 h-4 bg-gray-200">
                  <p class="text-gray-600 dark:text-primary-100 <md:hidden">Overall</p>
                </skeleton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </loading-container>
  </dashboard-scaffold>
</template>

<script lang="ts">
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import PromiseLoader from '../components/ui/PromiseLoader.vue';
import { generateAcademicRecordsPDF, useAcademicRecordsQuery } from '../stores/academicRecordStore';
import IconPrint from '~icons/ion/print';
import { catchAndNotifyError } from '../utils';
import SelfModal from '../components/ui/SelfModal.vue';
import { computed, inject, readonly, ref } from 'vue';

import computationFormulaImg from '../assets/computation-formula.png';
import Skeleton from '../components/ui/Skeleton.vue';
import { currentSemesterIdKey, useSemesterQuery } from '../stores/studentStore';

export default {
  components: { PromiseLoader, LoadingContainer, DashboardScaffold, IconPrint, SelfModal, Skeleton },
  setup() {
    const currentSemesterId = inject(currentSemesterIdKey);
    const { currentSemester } = useSemesterQuery(currentSemesterId);
    const { 
      isLoading, 
      latestAcademicRecords, 
      overallAverages,
      overallUnits
    } = useAcademicRecordsQuery(currentSemesterId!);

    const semesterDisplayNames = computed(() => {
      return [
        currentSemester.value.display
      ];
    });

    const gradeKeysAndLabels = readonly({
      'prelimGrade': 'Prelim',
      'midtermGrade': 'Midterms',
      'finalsGrade': 'Finals'
    });

    return {
      latestAcademicRecords,
      isLoading,
      overallAverages,
      overallUnits,
      computationFormulaImg: ref(computationFormulaImg),
      gradeKeysAndLabels,
      currentSemesterId,
      semesterDisplayNames
    }
  },
  methods: {
    async printPdf() {
      try {
        const { close } = this.$notify({ type: 'info', text: 'Downloading PDF...' }, Infinity);
        const fileUrl = await generateAcademicRecordsPDF(this.currentSemesterId!.toString());
        close();
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