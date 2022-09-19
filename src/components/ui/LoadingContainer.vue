<template>
  <slot :isLoading="isLoading"></slot>
</template>

<script lang="ts" setup>
import { computed, provide } from 'vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
});

provide('__loadState', computed(() => props.isLoading));
</script>