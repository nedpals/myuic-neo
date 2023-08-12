<template>
  <modal-window
    title="Vote Form" 
    v-model:open="isOpen"
    content-class="flex overflow-hidden"
    modal-class="max-w-4xl w-full">
    <div>
      <p>test</p>
    </div>

  </modal-window>
</template>

<script lang="ts">
import { ref } from 'vue'
import ModalWindow from '../../ui/ModalWindow.vue'
import LoadingContainer from '../../ui/LoadingContainer.vue'
import Loader from '../../ui/Loader.vue'
import { TabGroup, Tab, TabList, TabPanels, TabPanel } from '@headlessui/vue'
import Box from '../../ui/Box.vue'
import IconDone from '~icons/ion/happy-outline';

export default {
  emits: ['close'],
  components: { 
    ModalWindow, 
    LoadingContainer, 
    Loader,
    Tab,
    TabGroup,
    TabList,
    TabPanels,
    TabPanel,
    Box,
    IconDone
  },
  setup() {
    const isOpen = ref(false);
    const open = () => {
      isOpen.value = true;
    }

    return {
      isOpen,
      open
    }
  }
}
</script>