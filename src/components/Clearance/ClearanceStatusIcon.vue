<template>
  <component 
    :is="statusIcon(status)" 
    :class="[status == 'cleared' 
      ? 'text-success-600'
      : status == 'not_cleared'
      ? 'text-danger-400'
      : 'text-gray-400']" />
</template>

<script lang="ts">
import IconCheckmarkCircleOutline from '~icons/ion/ios-checkmark-circle-outline';
import IconCloseCircleOutline from '~icons/ion/ios-close-circle-outline';
import IconUnknownCircleOutline from '~icons/ion/remove-circle-outline';

export default {
  props: {
    status: {
      type: String,
      default: 'unknown'
    },
  },
  components: {
    IconCheckmarkCircleOutline,
    IconCloseCircleOutline,
    IconUnknownCircleOutline,
  },
  setup() {
    const statusIcon = (status: 'cleared' | 'not_cleared' | 'unknown') => {
      return status == 'cleared' 
        ? 'icon-checkmark-circle-outline'
        : status == 'not_cleared'
        ? 'icon-close-circle-outline'
        : 'icon-unknown-circle-outline';
    }

    return {
      statusIcon
    }
  }
}
</script>