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

<script lang="ts">
const STATUS_REJECT = 0;
const STATUS_RESOLVE = 1;
const STATUS_PENDING = 2;

export default {
  emits: ["resolve", "reject"],
  props: {
    defaultData: {},
    promise: {
      type: Promise,
      required: true,
    },
    failFn: {
      type: Function,
    },
  },
  data() {
    return {
      status: STATUS_PENDING, // 2 for loading, 0 for reject, 1 for resolve
      data: undefined as any,
      error: undefined as any
    };
  },
  watch: {
    promise: {
      handler() {
        this.execute();
      },
      immediate: true,
    },
  },
  methods: {
    execute() {
      if (import.meta.env.SSR) {
        return;
      }
      this.data = this.defaultData;
      this.status = STATUS_PENDING;
      this.promise
        .then((d) => {
          this.failFn?.(d);
          this.status = STATUS_RESOLVE;
          this.$emit("resolve", d);
          this.data = d;
        })
        .catch((err) => {
          this.status = STATUS_REJECT;
          this.error = err;
          this.$emit("reject", err);
          if (!import.meta.env.PROD) {
            console.error(err);
          }
        });
    }
  }
};
</script>