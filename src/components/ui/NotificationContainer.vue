<template>
  <div
    :class="{
      'bg-red-400 border-red-500': type == 'error',
      'bg-green-500 border-green-600': type == 'success',
      'bg-orange-400 border-orange-500': type == 'warning',
      'bg-uic-400 border-uic-500': type == 'info'
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