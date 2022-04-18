<template>
  <slot :openModal="openModal"></slot>

  <modal-window
    :modalClass="modalClass" 
    :contentClass="contentClass"
    :open="open" 
    @update:open="open = $event" :title="title">
    <template #default>
      <slot name="modal-content" :open="open"></slot>
    </template>
    <template #footer>
      <slot name="modal-footer" v-if="$slots['modal-footer']"></slot>
    </template>
  </modal-window>
</template>

<script>
import ModalWindow from './ModalWindow.vue'
export default {
  components: { ModalWindow },
  props: {
    title: {
      type: String,
    },
    modalClass: {
      type: String
    },
    contentClass: {
      type: String
    }
  },
  data() {
    return {
      open: false
    }
  },
  methods: {
    openModal() {
      this.open = true;
    }
  }
}
</script>