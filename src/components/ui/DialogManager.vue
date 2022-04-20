<template>
  <modal 
    @update:open="handleDialogOpen(d, $event)" 
    :m-id="d.id"
    :open="d.isOpen"
    :key="d.id" v-for="d in dialogs" :title="d.title">
    <div class="pt-4" v-html="d.content"></div>

    <template #footer>
      <div class="flex justify-end items-center space-x-2">
        <button 
          :key="'action_' + ai" 
          @click="handleDialogAction(d, action)"
          class="button"
          :class="action.class"
          v-for="(action, ai) in d.actions">
          {{ action.label }}
        </button>
      </div>
    </template>
  </modal>
</template>

<script lang="ts">
import { ref } from 'vue';
import { dialogs, DialogModal, modalEventBus, DialogAction } from '../../modal';
import Modal from './Modal.vue';

export default {
  components: { Modal },
  setup() {
    const hasActionPressed = ref(false);
    const handleDialogAction = (d: DialogModal, action: DialogAction) => {
      hasActionPressed.value = true;
      const result = action.onClick();
      modalEventBus.emit('dialog_closed', { id: d.id, result });
      modalEventBus.emit('modal_manual_close', { id: d.id });
    }

    const handleDialogOpen = (d: DialogModal, newOpen: boolean) => {
      d.isOpen = newOpen;

      if (!newOpen) {
        if (!hasActionPressed.value) {
          modalEventBus.emit('dialog_closed', { id: d.id, result: null });
        }
        const idx = dialogs.value.findIndex(dd => dd.id === d.id);
        if (idx !== -1) {
          dialogs.value.splice(idx, 1);
        }
      }
    }
    
    return {
      handleDialogOpen,
      handleDialogAction,
      dialogs
    }
  }
}
</script>