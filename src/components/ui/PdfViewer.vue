<template>
  <self-modal title="PDF Preview">
    <template #="{ openModal }">
      <slot :openModal="openModal"></slot>
    </template>

    <template #modal-content="{ open }">
      <pdf v-if="open" :src="src" :page="1">
        <template #loading>
          <div class="flex flex-col justify-center items-center">
            <loader class="h-18 w-18" />
          </div>
        </template>
      </pdf>
    </template>

    <template #footer>
      <button class="button is-primary">Print</button>
    </template>
  </self-modal>
</template>

<script>
import SelfModal from './SelfModal.vue';
import pdfvuer from 'pdfvuer';
import 'pdfjs-dist/build/pdf.worker.entry';
import Loader from './Loader.vue';

export default {
  components: { 
    SelfModal, 
    pdf: pdfvuer, Loader 
  },
  props: {
    src: {
      type: [Object, String, Promise],
      required: true
    }
  }
}
</script>