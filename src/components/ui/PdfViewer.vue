<template>
  <modal-window
      open
      v-if="src != null"
      :key="src.toString()"
      modal-class="max-w-6xl w-full"
      content-class="relative md:min-h-[80vh]"
      @update:open="() => src = null">
    <template #customTitle="{ closeModal }">
      <div class="flex items-center w-full">
        <div class="<md:ml-12 <md:w-3/4 overflow-ellipsis whitespace-nowrap overflow-hidden">
          <h2 class="text-lg font-bold text-left">PDF Preview</h2>
          <span class="text-md">{{ isLoading ? 'Loading...' : pdfName }}</span>
        </div>

        <div class="ml-auto flex items-center space-x-2 mr-4 md:mr-12">
          <button @click="downloadDocument" class="button is-light h-full" v-tooltip="'Download'"><icon-download /></button>
          <button v-if="supportsPrinting" @click="() => appEvents.onPrintPage(src)" :disabled="hasError || isLoading" class="button is-light h-full space-x-2 flex items-center">
            <icon-print />
            <span>Print</span>
          </button>
        </div>

        <button
            @click="closeModal"
            class="absolute <md:left-2 md:right-0 md:bg-gray-200 md:dark:bg-primary-600 hover:bg-gray-200 md:hover:bg-gray-300 dark:hover:bg-primary-600 md:dark:hover:bg-primary-700 rounded-full p-2">
          <icon-back class="block md:hidden text-primary-600 dark:text-white text-lg" />
          <icon-close class="hidden md:block" />
        </button>
      </div>
    </template>

    <template #default>
      <div ref="pdfViewerContent" class="max-w-6xl">
        <div v-if="isLoading" class="absolute top-0 inset-x-0 h-full w-full flex justify-center items-center bg-white bg-opacity-40">
          <loader class="h-13 w-13" />
        </div>

        <div v-if="hasError" style="min-height: inherit" class="flex flex-col w-full items-center justify-center text-gray-500">
          <icon-failed class="w-32 h-32" />
          <h2 class="text-3xl font-bold mb-2">Failed to load document</h2>
          <p class="text-xl mb-6">Something went wrong </p>
          <div class="flex space-x-2">
            <button @click="downloadDocument" class="button is-light is-medium space-x-2 flex items-center">
              <icon-download />
              <span>Download</span>
            </button>
            <a :href="src" target="_blank" class="button is-primary is-medium">Open in New Tab</a>
          </div>
        </div>

        <vue-pdf-embed
            ref="pdfEmbed"
            @loading-failed="handleLoadingFailed"
            @rendered="handleDocumentRendered"
            :height="800"
            :source="src" />
      </div>
    </template>
  </modal-window>
</template>

<script lang="ts" setup>
import {ref, computed} from 'vue';
import VuePdfEmbed from "vue-pdf-embed";
import Loader from './Loader.vue';
import ModalWindow from "./ModalWindow.vue";
import IconPrint from '~icons/ion/print';
import IconDownload from '~icons/ion/download-outline';
import IconClose from '~icons/ion/close';
import IconBack from '~icons/ion/chevron-left';
import IconFailed from '~icons/ion/alert-circle-outline';
import appEvents from "../../event";

const props = defineProps({
  defaultPdfName: {
    type: String,
    default: 'unknown'
  }
});

const supportsPrinting = !!appEvents.onPrintPage;
const src = ref<string | null>(null);
const isLoading = ref<boolean>(true);
const hasError = ref<boolean>(false);
const pdfEmbed = ref();
const pdfViewerContent = ref();
const pdfRegex = /([a-zA-Z0-9_@]+\.pdf)/;
const pdfName = computed(() => {
  if (!src.value || !pdfRegex.test(src.value)) {
    return props.defaultPdfName + ".pdf";
  }
  return pdfRegex.exec(src.value)![1];
});

function open(newSrc: string) {
  src.value = newSrc;
  console.log(src.value);
}

function handleDocumentRendered() {
  isLoading.value = false;
}

function handleLoadingFailed(err) {
  isLoading.value = false;
  hasError.value = true;
  console.error(err);
}

function downloadDocument() {
  if (!src.value) return;
  appEvents.onDownloadURL?.({ url: src.value, fileName: pdfName.value });
}

defineExpose({ open })
</script>