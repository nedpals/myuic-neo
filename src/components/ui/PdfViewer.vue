<template>
  <modal-window
      open
      v-if="src != null"
      :key="src.toString()"
      modal-class="max-w-6xl w-full"
      content-class="relative min-h-[90vh] max-h-[90vh] md:min-h-[80vh] md:max-h-[80vh]"
      @update:open="() => src = null">
    <template #customTitle="{ closeModal }">
      <div class="flex items-center w-full">
        <div class="<md:ml-12 <md:w-3/4 overflow-ellipsis whitespace-nowrap overflow-hidden">
          <h2 class="text-lg font-bold text-left">PDF Preview</h2>
          <span class="text-md">{{ isLoading ? 'Loading...' : pdfName }}</span>
        </div>

        <div class="ml-auto flex items-center space-x-2 mr-4 md:mr-12">
          <button @click="downloadDocument" class="button is-light h-full" v-tooltip="'Download'"><icon-download /></button>
          <button v-if="supportsPrinting" @click="() => printDocument()" :disabled="hasError || isLoading" class="button is-light h-full space-x-2 flex items-center">
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
      <div ref="pdfViewerContainer" style="min-height: inherit; max-height: inherit;" class="max-w-6xl h-full">
        <div v-if="isLoading" class="absolute top-0 inset-x-0 h-full w-full flex justify-center items-center bg-white bg-opacity-40">
          <loader class="h-13 w-13" />
        </div>

        <div
            v-if="hasError"
            style="min-height: inherit; max-height: inherit;"
            class="flex flex-col w-full h-full items-center justify-center text-gray-500">
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

        <div
            v-show="!hasError"
            style="min-height: inherit; max-height: inherit"
            class="flex flex-col items-center h-full w-full overflow-y-scroll py-4 space-y-4 bg-gray-100">
          <canvas v-for="_ in totalPage" ref="pdfViewers" class="shadow-lg pdf-viewer" />
        </div>
      </div>
    </template>
  </modal-window>
</template>

<script lang="ts" setup>
import { getDocument, PDFDocumentProxy, PDFPageProxy, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfJsWorker from 'pdfjs-dist/build/pdf.worker.js?url';

import {ref, computed, onMounted, onBeforeUnmount, markRaw} from 'vue';
import Loader from './Loader.vue';
import ModalWindow from "./ModalWindow.vue";
import IconPrint from '~icons/ion/print';
import IconDownload from '~icons/ion/download-outline';
import IconClose from '~icons/ion/close';
import IconBack from '~icons/ion/chevron-left';
import IconFailed from '~icons/ion/alert-circle-outline';
import appEvents from "../../event";
import debounce from 'debounce';

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
const pdfRegex = /([a-zA-Z0-9_@]+\.pdf)/;
const pdfName = computed(() => {
  if (!src.value || !pdfRegex.test(src.value)) {
    return props.defaultPdfName + ".pdf";
  }
  return pdfRegex.exec(src.value)![1];
});

async function printDocument() {
  if (!appEvents.onPrintPage) return;

  const shouldClose = await appEvents.onPrintPage(src.value!);
  if (shouldClose) {
    src.value = null;
  }
}

function downloadDocument() {
  if (!src.value) return;
  appEvents.onDownloadURL?.({ url: src.value, fileName: pdfName.value });
}

function resizeViewers() {
  if (!pdfViewerContainer.value || pages.value.length === 0 || pdfViewers.value.length === 0) return;

  for (let i = 1; i <= totalPage.value; i++) {
    resizeViewer(i);
  }
}

function resizeViewer(pageNumber: number): number {
  if (!pdfViewerContainer.value || pageNumber > pages.value.length || pageNumber > pdfViewers.value.length) return 1;
  const clientWidth = pdfViewerContainer.value.clientWidth;
  const maxContainerWidth = clientWidth >= 1000 ? clientWidth * 0.75 : clientWidth * 0.95;
  const viewport = pages.value[pageNumber - 1].getViewport({
    scale: maxContainerWidth / pages.value[pageNumber - 1].getViewport({ scale: 1 }).width
  });

  pdfViewers.value[pageNumber - 1].width = viewport.width;
  pdfViewers.value[pageNumber - 1].height = viewport.height;

  return viewport.scale;
}

const resizeAndRender = debounce(() => {
  resizeViewers();
  void renderPage(pdfData.value!, currentPage.value);
}, 1500);

// pdf.js
const pdfViewerContainer = ref<HTMLDivElement>();
const pdfViewers = ref<HTMLCanvasElement[]>([]);
const isRendering = ref(false);
const pages = ref<PDFPageProxy[]>([]);
const totalPage = ref(0);
const currentPage = ref(1);
const pdfData = ref<PDFDocumentProxy>();

GlobalWorkerOptions.workerSrc = pdfJsWorker;

async function renderPage(doc: PDFDocumentProxy, pageNumber: number) {
  if (!doc || !pdfViewers.value || pageNumber > totalPage.value) return;

  if (pageNumber > pages.value.length) {
    pages.value.push(markRaw(await doc.getPage(pageNumber)));
  }

  if (!pages.value[pageNumber - 1]) return;

  const scale = resizeViewer(pageNumber);
  isRendering.value = true;

  await pages.value[pageNumber - 1].render({
    canvasContext: pdfViewers.value[pageNumber - 1].getContext('2d')!,
    viewport: pages.value[pageNumber - 1].getViewport({ scale })
  }).promise;

  // queueRenderPage
  await renderPage(doc, pageNumber + 1);
}

async function open(newSrc: string) {
  if (newSrc === src.value) return;
  src.value = newSrc;

  try {
    hasError.value = false;
    isLoading.value = true;
    totalPage.value = 0;

    const loadingDoc = getDocument(src.value);
    pdfData.value = markRaw(await loadingDoc.promise);
    totalPage.value = pdfData.value.numPages;

    await new Promise(r => setTimeout(r, 250));
    await renderPage(pdfData.value, 1);
  } catch (e) {
    console.trace(e);
    hasError.value = true;
  } finally {
    isLoading.value = false;
    isRendering.value = false;
  }
}

onMounted(() => {
  window.addEventListener('resize', resizeAndRender);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeAndRender);
});

defineExpose({ open })
</script>