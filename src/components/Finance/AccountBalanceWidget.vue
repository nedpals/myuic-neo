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
import { computed } from 'vue-demi';
import { useFinancialRecordQuery } from '../../stores/financialStore';
import Box from '../ui/Box.vue';
import LoadingContainer from '../ui/LoadingContainer.vue';
import Skeleton from '../ui/Skeleton.vue';
import { humanizeTime, pesoFormatter } from '../../utils';

export default {
  components: { Box, Skeleton, LoadingContainer },
  setup() {
    const financialRecordQuery = useFinancialRecordQuery();
    const { isIdle, isFetching } = financialRecordQuery;

    const accountBalance = computed(() => pesoFormatter.format(
      financialRecordQuery.data.value?.monthlyDues
        .map((md) => md.balance)
      . reduce((p, v) => p + v, 0) ?? 0
    ));

    const lastUpdated = computed(() => {
      const record = financialRecordQuery.data.value;
      if (!record || record.paymentHistory.length === 0) return '';
      return humanizeTime(record.paymentHistory[record.paymentHistory.length - 1].paidAt);
    });

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