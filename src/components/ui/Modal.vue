<template>
  <teleport to="body">
    <div 
      v-if="open" 
      class="fixed inset-0 bg-white dark:bg-primary-900 bg-opacity-40 z-50 flex items-center justify-center" 
      @click.self="closeModal">
      <box class="flex flex-col max-h-screen !shadow-lg" :class="modalClass" no-padding>
        <div class="px-6">
          <div class="py-3 py-4 border-b dark:border-primary-600 relative flex items-center justify-center">
            <h2 class="text-xl font-bold text-center overflow-ellipsis whitespace-nowrap overflow-hidden">{{ title }}</h2>
            <button 
              @click="closeModal" 
              class="absolute right-0 bg-gray-200 dark:bg-primary-600 hover:bg-gray-200 hover:bg-gray-300 dark:hover:bg-primary-600 dark:hover:bg-primary-700 rounded-full p-2">
              <icon-close />
            </button>
          </div>
        </div>
        <div class="w-full flex-1" :class="contentClass">
          <slot></slot>
        </div>
        <div class="border-t dark:border-primary-600" :class="footerClass" v-if="isSlotVisible($slots.footer)">
          <slot name="footer"></slot>
        </div>
      </box>
    </div>
  </teleport>
</template>

<script lang="ts">
import Box from './Box.vue';
import IconClose from '~icons/ion/close';
import IconBack from '~icons/ion/chevron-left';
import { isSlotVisible, eventBus } from '../../utils';
import { onBeforeUnmount, reactive, watch } from 'vue';
import { currentModalId } from '../../modal';

export default {
  components: { Box, IconClose, IconBack },
  emits: ['update:open'],
  props: {
    title: {
      type: String,
    },
    open: {
      type: Boolean
    },
    contentClass: {
      type: String,
      default: 'px-6 pb-4'
    },
    footerClass: {
      type: String,
      default: 'px-4 px-6 py-4'
    },
    modalClass: {
      type: String,
      default: 'max-w-xl w-full'
    }
  },
  setup(props, { emit }) {
    const modal = reactive({ id: currentModalId.value });
    const closeModal = () => {
      eventBus.emit('modal_closed', modal);
      if (props.open) {
        emit('update:open', false);
      }
    }

    eventBus.on('modal_manual_close', ({ id: gotId }) => {
      if (gotId === modal.id) {
        closeModal();
      }
    });

    const unwatchOpen = watch(() => props.open, (newVal, oldVal) => {
      if (newVal === oldVal || typeof oldVal === 'undefined') return;
      if (newVal) {
        eventBus.emit('modal_opened', modal);
      } else {
        closeModal();
      }
    }, { immediate: true });

    onBeforeUnmount(() => {
      if (props.open) {
        closeModal();
      }
      unwatchOpen();
    });

    return {
      isSlotVisible,
      closeModal
    }
  },
}
</script>