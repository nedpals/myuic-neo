<template>
  <promise-loader :promise="financialStore.getFinancialRecords()" v-slot="{ isPending }">
    <box
      title="Account Balance"
      title-class="text-white"
      bg="bg-gradient-to-tr from-uic-500 to-uic-300 dark:from-uic-700 dark:to-uic-500"
      class="transition-colors text-white"
      :is-loading="isPending">
      <skeleton custom-class="h-9 w-48 rounded-xl mb-6 bg-white">
        <h2 class="font-bold text-4xl pb-4">{{ financialStore.accountBalance }}</h2>
      </skeleton>
      <skeleton custom-class="h-3.5 w-32 bg-uic-100 rounded-lg">
        <span class="text-sm font-semibold text-uic-100">Updated: {{ financialStore.lastUpdated }}</span>
      </skeleton>
    </box>
  </promise-loader>
</template>

<script>
import { useFinancialRecordStore } from '../../stores/studentStore';
import Box from '../ui/Box.vue';
import PromiseLoader from '../ui/PromiseLoader.vue';
import Skeleton from '../ui/Skeleton.vue';
export default {
  components: { Box, PromiseLoader, Skeleton },
  setup() {
    const financialStore = useFinancialRecordStore();
    return {
      financialStore
    };
  }
}
</script>