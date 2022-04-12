<template>
  <div :class="customClass" class="skeleton" v-if="isLoading || __loadState"></div>
  <slot v-else></slot>
</template>

<script>
export default {
  inject: {
    __loadState: {
      default: false
    }
  },
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    customClass: {
      type: String
    }
  }
}
</script>