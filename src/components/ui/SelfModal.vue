<template>
  <slot :openModal="openModal"></slot>

  <modal 
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
  </modal>
</template>

<script>
import Modal from './Modal.vue'
export default {
  components: { Modal },
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