<template>
  <slot :openModal="openModal"></slot>

  <modal 
    :modalClass="modalClass" 
    :contentClass="contentClass"
    :open="open" 
    @update:open="open = $event" :title="title">
    <template #default>
      <slot name="modal-content" :open="open"></slot>
    </template>
    <template #footer>
      <slot name="modal-footer" v-if="$slots['modal-footer']"></slot>
    </template>
  </modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Modal from './Modal.vue';

defineProps({
  title: {
    type: String,
  },
  modalClass: {
    type: String
  },
  contentClass: {
    type: String
  }
});

const open = ref(false);
const openModal = () => { open.value = true; }
</script>