<template>
  <modal-window
      open
      v-if="src != null"
      :key="typeof src === 'string' ? src : 'unknown_src'"
      modal-class="max-w-6xl w-full"
      content-class="relative min-h-[90vh] max-h-[90vh] md:min-h-[80vh] md:max-h-[80vh]"
      @update:open="() => src = null">
    <template #customTitle="{ closeModal }">
      <div class="flex items-center w-full">
        <div class="ml-12 md:ml-0 w-3/4 md:w-full overflow-ellipsis whitespace-nowrap overflow-hidden">
          <h2 class="text-lg font-bold text-left">PDF Preview</h2>
          <span class="text-base">{{ isLoading ? 'Loading...' : pdfName }}</span>
        </div>

        <div class="ml-auto flex items-center space-x-2 mr-4 md:mr-12">
          <Button theme="light" @click="downloadDocument" class="h-full" v-tooltip="'Download'" :icon="IconDownload" />
          <Button theme="light" v-if="supportsPrinting" @click="() => printDocument()" :disabled="hasError || isLoading" class="h-full space-x-2 flex items-center" :icon="IconPrint" text="Print" />
        </div>

        <button
            @click="closeModal"
            class="absolute left-2 md:left-[unset] md:right-0 md:bg-zinc-200 md:dark:bg-primary-600 hover:bg-zinc-200 md:hover:bg-zinc-300 dark:hover:bg-primary-600 md:dark:hover:bg-primary-700 rounded-full p-2">
          <icon-back class="block md:hidden text-primary-600 dark:text-white text-lg" />
          <icon-close class="hidden md:block" />
        </button>
      </div>
    </template>

    <template #default>
      <div ref="pdfViewerContainer"
           class="min-h-[inherit] max-h-[inherit] max-w-6xl h-full">
        <div v-if="isLoading" class="absolute top-0 inset-x-0 h-full w-full flex justify-center items-center bg-white bg-opacity-40">
          <loader class="h-13 w-13" />
        </div>

        <div
            v-if="hasError"
            style="min-height: inherit; max-height: inherit;"
            class="flex flex-col w-full h-full items-center justify-center text-zinc-500">
          <icon-failed class="w-32 h-32" />
          <h2 class="text-3xl font-bold mb-2">Failed to load document</h2>
          <p class="text-xl mb-6">Something went wrong </p>
          <div class="flex space-x-2">
            <Button theme="light" size="medium" @click="downloadDocument" class="space-x-2 flex items-center" :icon="IconDownload" text="Download" />
            <Button as="a" v-if="typeof src == 'string'" :href="src" target="_blank" theme="primary" size="medium" text="Open in New Tab" />
          </div>
        </div>

        <div
          ref="pdfStageContainer"
          :class="{'!hidden': hasError}"
          class="min-h-[inherit] max-h-[inherit] flex flex-col items-center h-full w-full overflow-y-scroll py-4 space-y-4 bg-zinc-100">
          <!-- <canvas v-for="_ in totalPage" ref="pdfViewers" class="shadow-lg pdf-viewer"></canvas> -->
        </div>
      </div>
    </template>
  </modal-window>
</template>

<script lang="ts" setup>
import { getDocument, PDFDocumentProxy, PDFPageProxy, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfJsWorker from 'pdfjs-dist/build/pdf.worker.js?url';

import { useMutation } from '@tanstack/vue-query';
import {ref, computed, onMounted, onBeforeUnmount, markRaw, watch} from 'vue';
import Loader from './Loader.vue';
import ModalWindow from "./ModalWindow.vue";
import IconPrint from '~icons/ion/print';
import IconDownload from '~icons/ion/download-outline';
import IconClose from '~icons/ion/close';
import IconBack from '~icons/ion/chevron-left';
import IconFailed from '~icons/ion/alert-circle-outline';
import Button from './Button.vue';
import appEvents from "../../event";
import debounce from 'debounce';

import Konva from 'konva';

const props = defineProps({
  defaultPdfName: {
    type: String,
    default: 'unknown'
  }
});

// konva
const pdfViewerContainer = ref<HTMLDivElement | null>(null);
const pdfStageContainer = ref<HTMLDivElement | null>(null);
const stage = ref<Konva.Stage>();
const totalLayerHeight = computed(() => {
  const layers = stage.value?.getLayers() ?? [];
  let total = 0;
  for (const layer of layers) {
    total += layer.height();
  }
  return total;
});

const supportsPrinting = !!appEvents.onPrintPage;
const src = ref<string | Uint8Array | null>(null);
const pdfRegex = /([a-zA-Z0-9_@]+\.pdf)/;
const pdfName = computed(() => {
  if (!src.value || typeof src.value !== 'string' || !pdfRegex.test(src.value)) {
    return props.defaultPdfName + ".pdf";
  }
  return pdfRegex.exec(src.value)![1];
});

async function printDocument() {
  if (!appEvents.onPrintPage || !src.value) return;
  const shouldClose = await appEvents.onPrintPage(
      typeof src.value === 'string'
          ? { url: src.value }
          : { data: src.value }
  );
  if (shouldClose) {
    src.value = null;
  }
}

function downloadDocument() {
  if (!src.value) return;

  if (typeof src.value === 'string') {
    appEvents.onDownloadURL?.({ url: src.value, fileName: pdfName.value });
  } else {
    appEvents.onDownloadURL?.({ data: src.value as Uint8Array, fileName: pdfName.value });
  }
}

function calculateViewports() {
  if (!pdfViewerContainer.value || pages.value.length === 0 || pdfViewers.value.length === 0) return;

  for (let i = 1; i <= totalPage.value; i++) {
    calculateViewport(i);
  }
}

function calculateViewport(pageNumber: number) {
  if (!stage.value || pageNumber > pages.value.length) return null;
  const clientWidth = stage.value.width();
  const maxContainerWidth = clientWidth >= 1000 ? clientWidth * 0.75 : clientWidth * 0.95;
  const viewport = pages.value[pageNumber - 1].getViewport({
    scale: maxContainerWidth / pages.value[pageNumber - 1].getViewport({ scale: stage.value.scaleX() }).width
  });

  const layer = stage.value.findOne(`#page_${pageNumber}`);
  layer.height(viewport.height);

  if (totalLayerHeight.value > stage.value.height()) {
    stage.value.height(totalLayerHeight.value);
  }

  return viewport;
}

const resizeAndRender = debounce(() => {
  if (!pdfStageContainer.value || !stage.value) return;
  const containerWidth = pdfStageContainer.value.offsetWidth;
  const scale = containerWidth / viewerWidth.value;

  stage.value.width(viewerWidth.value * scale);
  stage.value.height(viewerHeight.value * scale);
  stage.value.scale({ x: scale, y: scale });

  calculateViewports();
  void renderPage(pdfData.value!, 1);
}, 100);

// pdf.js
const pdfViewers = ref<HTMLCanvasElement[]>([]);
const isRendering = ref(false);
const pages = ref<PDFPageProxy[]>([]);
const viewerWidth = ref(0);
const viewerHeight = ref(0);
const pdfData = ref<PDFDocumentProxy>();

GlobalWorkerOptions.workerSrc = pdfJsWorker;

const { mutateAsync: openPdf, isError: hasError, isLoading } = useMutation(async (newSrc: string | Uint8Array) => {
  const doc = getDocument(newSrc);
  const pdf = await doc.promise;
  pdfData.value = markRaw(pdf);
  return pdf;
}, {
  async onSuccess() {
    await renderPage(pdfData.value!, 1);
  },
  onError(err) {
    console.trace(err);
  },
  onSettled() {
    isRendering.value = false;
  },
});

const totalPage = computed(() => pdfData.value?.numPages ?? 0);

async function renderPage(doc: PDFDocumentProxy, pageNumber: number) {
  if (!stage.value || !doc || pageNumber > totalPage.value) return;
  if (pageNumber > pages.value.length) {
    pages.value.push(markRaw(await doc.getPage(pageNumber)));
  }

  if (!pages.value[pageNumber - 1]) return;
  isRendering.value = true;

  const layers = stage.value.getLayers();
  const lastLayer = layers[layers.length - 1];
  let layer = layers.find(l => l.id() === `page_${pageNumber}`);
  const isLayerExisting = typeof layer !== 'undefined';

  if (!layer) {
    layer = new Konva.Layer({
      id:  `page_${pageNumber}`,
      height: stage.value.height(),
      width: stage.value.width(),
      y: lastLayer?.height() ?? 0,
      listening: false
    });

    stage.value.add(layer);
  }

  const viewport = calculateViewport(pageNumber);
  if (!viewport) {
    layer.destroy();
    return;
  }

  let page = document.createElement('canvas');
  page.width = viewport.width;
  page.height = viewport.height;

  let img = new Konva.Image({
    id: 'img',
    image: page
  });

  if (isLayerExisting) {
    const found = layer.getChildren((it) => it.id() === 'img');
    if (found.length !== 0) {
      img = found[0] as Konva.Image;
      img.clearCache();
    }
  }

  img.width(viewport.width);
  img.height(viewport.height);
  img.x(Math.max((layer.width() / 2) - (viewport.width / 2), 0));

  await pages.value[pageNumber - 1].render({
    canvasContext: page.getContext('2d')!,
    viewport
  }).promise;

  layer.add(img);

  // queueRenderPage
  await renderPage(doc, pageNumber + 1);
}

async function open(newSrc: string | Uint8Array) {
  if (newSrc === src.value) return;
  src.value = typeof newSrc === 'string' ? newSrc : markRaw(newSrc);
  await openPdf(newSrc);
}

const unwatch = watch([pdfViewerContainer, pdfStageContainer], ([viewerContainer, stageContainer]) => {
  if (stage.value === undefined && viewerContainer && stageContainer) {
    stage.value = new Konva.Stage({
      container: stageContainer,
      height: stageContainer.offsetHeight,
      width: stageContainer.offsetWidth
    });

    viewerWidth.value = stageContainer.offsetWidth;
    viewerHeight.value = stageContainer.offsetHeight;
  }
});

onMounted(() => {
  window.addEventListener('resize', resizeAndRender);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeAndRender);
  unwatch();
});

defineExpose({ open })
</script>
