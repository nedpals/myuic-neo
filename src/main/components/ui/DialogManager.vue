<template>
  <Dialog
    v-for="(d) in dialogs"
    :key="'dialog_' + d.id" 
    :data="d"
    @update:data="handleUpdateDialog"  />
</template>

<script lang="ts" setup>
import { dialogs, DialogModal, modalEventBus } from '../../composables/modal';
import Dialog from './Dialog.vue';

const handleUpdateDialog = (d: DialogModal) => {
  const idx = dialogs.value.findIndex(dd => dd.id === d.id);
  if (idx === -1) return;
  dialogs.value[idx] = d;
  handleDialogOpen(idx, false);
}

const handleDialogOpen = (dialogIdx: number, newOpen: boolean) => {
  if (!dialogs.value[dialogIdx]) return;
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