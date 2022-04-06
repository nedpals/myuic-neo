<template>
  <slot :isLoading="isLoading"></slot>
</template>

<script>
import { computed } from 'vue';

export default {
  props: {
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  provide() {
    return {
      __loadState: computed(() => this.isLoading)
    }
  }
}
</script>