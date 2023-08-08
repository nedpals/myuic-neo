<template>
  <component
    :is="statusIcon(status)"
    :class="[status == 'cleared'
      ? 'text-success-600 dark:text-success-300'
      : status == 'not_cleared'
      ? 'text-danger-400'
      : 'text-zinc-400']" />
</template>

<script lang="ts" setup>
import { RequirementStatus } from '@myuic-api/types';
import { PropType } from 'vue';
import IconCheckmarkCircleOutline from '~icons/ion/ios-checkmark-circle-outline';
import IconCloseCircleOutline from '~icons/ion/ios-close-circle-outline';
import IconUnknownCircleOutline from '~icons/ion/remove-circle-outline';

defineProps({
  status: {
    type: String as PropType<RequirementStatus>,
    default: 'unknown'
  },
});

const statusIcon = (status: RequirementStatus) => {
  return status == 'cleared'
    ? IconCheckmarkCircleOutline
    : status == 'not_cleared'
    ? IconCloseCircleOutline
    : IconUnknownCircleOutline;
}
</script>
