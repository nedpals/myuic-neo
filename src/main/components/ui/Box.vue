<template>
  <div
    :class="[
      {
        'px-6 py-4': !noPadding,
        'hover:bg-zinc-100 dark:hover:bg-uic-900 hover:border-uic-500 dark:hover:border-uic-700 cursor-pointer': isHoverable
      },
      bg
    ]"
    class="shadow rounded-lg border dark:border-primary-700">
    <span v-if="title" class="mb-2 block" :class="titleClass">{{ title }}</span>
    <slot :isLoading="existingLoadState || isLoading"></slot>
  </div>
</template>

<script lang="ts" setup>
import { useLoadState } from '../../utils';

const existingLoadState = useLoadState();

defineProps({
  isHoverable: {
    type: Boolean
  },
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
    default: 'text-zinc-500 dark:text-primary-100'
  },
  bg: {
    type: String,
    default: 'bg-white dark:bg-primary-800'
  }
});
</script>
