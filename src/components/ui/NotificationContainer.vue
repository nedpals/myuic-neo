<template>
  <div
    :class="{
      'bg-danger-500 border-danger-600': type == 'error',
      'bg-success-500 border-success-600': type == 'success',
      'bg-warning-400 border-warning-500': type == 'warning',
      'bg-info-400 border-info-500': type == 'info'
    }"
    class="py-2 px-2 lg:px-8 text-white border-b origin-top">
    <slot>
      <div class="flex justify-between items-center">
        <p>{{ text }}</p>
        <div v-if="actions">
          <button 
            v-for="action in actions"
            @click="action.onClick"
            class="-my-2 px-2 lg:px-3 py-2 hover:bg-gray-900 hover:bg-opacity-20 font-semibold cursor-pointer">
            {{ action.label }}
          </button>
        </div>
      </div>
    </slot>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      validator: (v) => ['error', 'success', 'warning', 'info'].includes(v)
    },
    text: {
      type: String
    },
    actions: {
      type: Array,
    }
  }
}
</script>