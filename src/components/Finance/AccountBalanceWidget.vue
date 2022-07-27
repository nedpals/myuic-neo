<template>
  <loading-container :isLoading="isLoading">
    <box
      title="Account Balance"
      title-class="text-white"
      bg="bg-gradient-to-tr from-primary-500 to-primary-300 dark:from-primary-700 dark:to-primary-500"
      class="transition-colors text-white">
      <skeleton custom-class="h-9 w-48 rounded-xl mb-6 bg-white">
        <h2 class="font-bold text-4xl pb-4">{{ accountBalance }}</h2>
      </skeleton>

      <skeleton custom-class="h-3.5 w-32 bg-primary-100 rounded-lg">
        <span v-if="!isLoading && lastUpdated" class="text-sm font-semibold text-primary-100">Updated: {{ lastUpdated }}</span>
      </skeleton>
    </box>
  </loading-container>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { useFinancialRecordQuery } from '../../stores/financialStore';
import { currentSemesterIdKey } from '../../stores/studentStore';
import Box from '../ui/Box.vue';
import LoadingContainer from '../ui/LoadingContainer.vue';
import Skeleton from '../ui/Skeleton.vue';

const currentSemesterId = inject(currentSemesterIdKey);
const { accountBalance, lastUpdated, isLoading } = useFinancialRecordQuery(currentSemesterId!);
</script>