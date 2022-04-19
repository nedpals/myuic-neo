<template>
  <div :class="[{ 'px-6 py-4': !noPadding }, bg]" class="shadow rounded-lg border dark:border-primary-700">
    <span v-if="title" class="mb-2 block" :class="titleClass">{{ title }}</span>
    <slot :isLoading="__loadState.value || isLoading"></slot>
  </div>
</template>

<script>
import LoadingContainer from './LoadingContainer.vue';

export default {
  inject: {
    __loadState: {
      default: false
    }
  },
  components: { LoadingContainer },
  props: {
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
  }
}
</script>