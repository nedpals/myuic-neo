<template>
  <slot 
    :isRejected="status == 0"
    :isPending="status == 2"
    :isResolved="status == 1"
    :data="data"
    :error="error"
    :reload="execute"
    ></slot>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const STATUS_REJECT = 0;
const STATUS_RESOLVE = 1;
const STATUS_PENDING = 2;

const emit = defineEmits(['resolve', 'reject']);
const props = defineProps({
  defaultData: {},
  promise: {
    type: Promise,
    required: true,
  },
  failFn: {
    type: Function,
  },
});

const status = ref(STATUS_PENDING);
const data = ref<any>(undefined);
const error = ref<any>(undefined);

function  execute() {
  if (import.meta.env.SSR) {
    return;
  }
  data.value = props.defaultData;
  status.value = STATUS_PENDING;
  props.promise
    .then((d) => {
      props.failFn?.(d);
      status.value = STATUS_RESOLVE;
      emit("resolve", d);
      data.value = d;
    })
    .catch((err) => {
      status.value = STATUS_REJECT;
      error.value = err;
      emit("reject", err);
      if (!import.meta.env.PROD) {
        console.error(err);
      }
    });
};

watch(props.promise, execute, {
  immediate: true
});
</script>