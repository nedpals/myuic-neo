<template>
  <div :class="[{ 'px-6 py-4': !noPadding }, bg]" class="shadow rounded-lg border dark:border-primary-700">
    <span v-if="title" class="mb-2 block" :class="titleClass">{{ title }}</span>
    <slot :isLoading="__loadState || isLoading"></slot>
  </div>
</template>

<script lang="ts" setup>
import { inject, Ref, ref } from 'vue';

defineProps({
  title: {
    type: String,
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  noPadding: {
    type: Boolean,
    default: false
  },
  titleClass: {
    type: String,
    default: 'text-gray-500 dark:text-primary-200'
  },
  bg: {
    type: String,
    default: 'bg-white dark:bg-primary-800'
  }
});

const __loadState = inject<Ref<boolean>>('__loadState', ref(false));
</script>