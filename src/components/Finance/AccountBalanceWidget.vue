<template>
  <loading-container :isLoading="isFetching || isIdle">
    <box
      title="Account Balance"
      title-class="text-white"
      bg="bg-gradient-to-tr from-uic-500 to-uic-300 dark:from-uic-700 dark:to-uic-500"
      class="transition-colors text-white">
      <skeleton custom-class="h-9 w-48 rounded-xl mb-6 bg-white">
        <h2 class="font-bold text-4xl pb-4">{{ accountBalance }}</h2>
      </skeleton>

      <skeleton custom-class="h-3.5 w-32 bg-uic-100 rounded-lg">
        <span class="text-sm font-semibold text-uic-100">Updated: {{ lastUpdated }}</span>
      </skeleton>
    </box>
  </loading-container>
</template>

<script lang="ts">
import { useFinancialRecordQuery, useFinancialRecordQueryUtilities } from '../../stores/financialStore';
import Box from '../ui/Box.vue';
import LoadingContainer from '../ui/LoadingContainer.vue';
import Skeleton from '../ui/Skeleton.vue';

export default {
  components: { Box, Skeleton, LoadingContainer },
  setup() {
    const financialRecordQuery = useFinancialRecordQuery();
    const { isIdle, isFetching } = financialRecordQuery;
    const { accountBalance, lastUpdated } = useFinancialRecordQueryUtilities(financialRecordQuery);

    return { 
      accountBalance,
      lastUpdated,
      isFetching,
      isIdle,
      financialRecordQuery
    };
  }
}
</script>