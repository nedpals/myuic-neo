<template>
  <dashboard-scaffold :subtitle="currentSemester.label" container-class="px-4 md:px-5 space-y-4">
    <template #actions>
      <button @click="printPdf" class="button">
        <icon-print />
        <span>Print PDF</span>
      </button>

      <button
        @click="isComputationModalOpen = true"
        class="button">
        <icon-formula />
        <span>View formula</span>
      </button>
    </template>

    <modal v-model:open="isComputationModalOpen" title="Computation">
      <div class="py-2 space-y-4">
        <p>In order to compute for the GWA (General Weighted Average), the following formula is used:</p>
        <img :src="computationFormulaImg" class="filter invert dark:invert-0 h-full w-auto" />
      </div>
    </modal>

    <loading-container :is-loading="isLoading">
      <div class="flex space-x-3">
        <section class="flex-1 border border-primary-200 dark:border-primary-600 rounded-xl shadow-md bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-700 dark:to-primary-900 px-6 py-4 flex flex-col md:flex-row justify-between items-center pb-4">
          <div class="flex flex-col text-center mx-auto">
            <span class="text-lg block cursor-default">Units</span>
            <skeleton custom-class="w-18 h-7.5 md:h-12 bg-primary-300">
              <p class="font-semibold text-3xl md:text-5xl">{{ overallUnits }}</p>
            </skeleton>
          </div>
        </section>

        <section class="flex-1 border border-primary-200 dark:border-primary-600 rounded-xl shadow-md bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-700 dark:to-primary-900 px-6 py-4 flex flex-col md:flex-row justify-between items-center pb-4">
          <div class="flex flex-col text-center mx-auto">
            <span 
              class="text-lg block underline underline-dotted underline-offset-2 cursor-default" 
              v-tooltip="isIncomplete ? 'Partial General Weighted Average' : 'General Weighted Average'">{{ isIncomplete ? 'Partial GWA' : 'GWA' }}</span>
            <skeleton custom-class="w-18 h-7.5 md:h-12 bg-primary-300">
              <p class="font-semibold text-3xl md:text-5xl">{{ overallAverage }}</p>
            </skeleton>
          </div>
        </section>
      </div>

      <section 
        class="bg-white dark:bg-primary-800 border dark:border-primary-600 rounded-xl shadow-md">
        <div class="rounded-b-xl">
          <div class="flex flex-col divide-y dark:divide-primary-600">
            <div class="flex items-center justify-center" v-if="reportData!.report.courses.length == 0">
              <p class="text-center text-2xl py-8">No grades found.</p>
            </div>
            
            <div :key="'_sub_' + i" v-for="(ar, i) in reportData!.report.courses" class="flex items-center">
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

    <pdf-viewer ref="pdfViewer" :default-pdf-name="`Report - ${currentSemester.label}`" />
  </dashboard-scaffold>
</template>

<script lang="ts" setup>
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import IconPrint from '~icons/ion/print';
import Skeleton from '../components/ui/Skeleton.vue';
import PdfViewer from "../components/ui/PdfViewer.vue";
import Modal from '../components/ui/Modal.vue';
import IconFormula from '~icons/fluent/math-formula-16-filled';

import { generateAcademicRecordsPDF, useAcademicRecordsQuery } from '../stores/academicRecordStore';
import { catchAndNotifyError } from '../utils';
import { inject, readonly, ref } from 'vue';

import { currentSemesterIdKey, useSemesterQuery } from '../stores/studentStore';
import { notify } from 'notiwind';

import computationFormulaImg from '../assets/computation-formula.png';

const isComputationModalOpen = ref(false);
const pdfViewer = ref<InstanceType<typeof PdfViewer>>();
const currentSemesterId = inject(currentSemesterIdKey);
const { currentSemester } = useSemesterQuery(currentSemesterId);
const {
  isLoading,
  reportData,
  overallAverage,
  overallUnits,
  isIncomplete
} = useAcademicRecordsQuery(currentSemesterId!);

const gradeKeysAndLabels = readonly({
  'prelimGrade': 'Prelim',
  'midtermGrade': 'Midterms',
  'finalsGrade': 'Finals'
});

async function printPdf() {
  try {
    const { close } = notify({ type: 'info', text: 'Downloading PDF...' }, Infinity);
    const pdfData = await generateAcademicRecordsPDF(currentSemesterId!.value!.toString());
    close();
    pdfViewer.value?.open(pdfData);
  } catch (e) {
    catchAndNotifyError(e);
  }
}
</script>