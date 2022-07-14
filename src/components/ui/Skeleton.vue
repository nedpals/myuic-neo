<template>
  <div :class="customClass" class="skeleton" v-if="isLoading || __loadState"></div>
  <slot v-else></slot>
</template>

<script lang="ts" setup>
import { inject, ref, Ref } from 'vue';

const __loadState = inject<Ref<boolean>>('__loadState', ref(false));

defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String
  }
});
</script>