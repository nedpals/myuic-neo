<template>
  <d-dialog 
    v-for="(d, dIdx) in dialogs"
    :key="'dialog_' + d.id" 
    :data="d"
    @update:data="handleUpdateDialog"
    @update:open="handleDialogOpen(dIdx, $event)"  />
</template>

<script lang="ts" setup>
import { dialogs, DialogModal, modalEventBus } from '../../composables/modal';
import DDialog from './Dialog.vue';

const handleUpdateDialog = (d: DialogModal) => {
  const idx = dialogs.value.findIndex(dd => dd.id === d.id);
  if (idx === -1) return;
  dialogs.value[idx] = d;
}

const handleDialogOpen = (dialogIdx: number, newOpen: boolean) => {
  dialogs.value[dialogIdx].isOpen = newOpen;

  if (!newOpen) {
    const d = dialogs.value[dialogIdx];
    if (!d.hasActionPressed) {
      modalEventBus.emit('dialog_closed', { id: d.id, result: null });
    }
    dialogs.value.splice(dialogIdx, 1);
  }
}
</script>