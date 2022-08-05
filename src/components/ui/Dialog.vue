<template>
  <Modal :m-id="data.id" :open="data.isOpen" :title="data.title">
    <div class="pt-4" v-html="data.content"></div>

    <template #footer>
      <div class="flex justify-end items-center space-x-2">
        <button 
          :key="'action_' + ai" 
          @click="handleDialogAction(data, action)"
          class="button"
          :class="action.class"
          v-for="(action, ai) in data.actions">
          {{ action.label }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue';
import { DialogAction, DialogModal, modalEventBus } from '../../composables/modal';
import Modal from './Modal.vue';

const emit = defineEmits(['update:data']);
const props = defineProps({
  data: {
    type: Object as PropType<DialogModal>,
    required: true
  }
});

const handleDialogAction = (d: DialogModal, action: DialogAction) => {
  const result = typeof action.answer === 'function' ? action.answer() : action.answer;
  modalEventBus.emit('dialog_closed', { id: d.id, result });
  emit('update:data', { ...props.data, isOpen: false, hasActionPressed: true } as DialogModal)
}
</script>