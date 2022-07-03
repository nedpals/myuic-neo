<template>
  <slot :isLoading="isLoading"></slot>
</template>

<script lang="ts" setup>
import { computed, defineProps, provide } from 'vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
});

provide('__loadState', computed(() => props.isLoading));
</script>