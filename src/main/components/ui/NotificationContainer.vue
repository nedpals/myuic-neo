<template>
  <div
    :class="{
      'bg-danger-100 dark:bg-danger-800 border-danger-200 dark:border-danger-600': type == 'error',
      'bg-success-100 dark:bg-success-800 border-success-200 dark:border-success-600': type == 'success',
      'bg-warning-100 dark:bg-warning-800 border-warning-200 dark:border-warning-600': type == 'warning',
      'bg-info-100 dark:bg-info-800 border-info-200 dark:border-info-600': type == 'info'
    }"
    class="py-2 px-4 lg:px-4 text-zinc-900 dark:text-white border">
    <slot>
      <div class="flex flex-row">
        <div class="mr-2">
          <component
            :is="icon"
            class="text-2xl"
            :class="{
              'text-danger-400': type === 'error',
              'text-success-400': type === 'success',
              'text-warning-400': type === 'warning',
              'text-info-400': type === 'info'
            }" />
        </div>

        <div class="flex-1 flex justify-between items-center">
          <p>{{ text }}</p>
          <div v-if="actions">
            <button
              v-for="action in actions"
              @click="action.onClick"
              class="h-full -my-2 px-2 lg:px-3 py-2 hover:bg-zinc-900 hover:bg-opacity-20 font-semibold cursor-pointer rounded-lg">
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { PropType, computed } from 'vue';
import IconAlert from '~icons/ion/alert-circle-outline';
import IconDanger from '~icons/ion/warning-outline';
import IconSuccess from '~icons/ion/checkmark-circle-outline';
import IconInfo from '~icons/ion/information-circle-outline';

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (v: string) => ['error', 'success', 'warning', 'info'].includes(v)
  },
  text: {
    type: String
  },
  actions: {
    type: Array as PropType<{
      onClick: () => void,
      label: string
    }[]>,
  }
});

const icon = computed(() => {
  switch (props.type) {
  case "error":
    return IconAlert;
  case "success":
    return IconSuccess;
  case "warning":
    return IconDanger;
  case "info":
    return IconInfo;
  }
});
</script>
