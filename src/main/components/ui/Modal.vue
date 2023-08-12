<template>
  <teleport to="body">
    <transition name="modal-overlay" @enter="showModal = true">
      <div
        v-if="open"
        class="fixed inset-0 bg-white dark:bg-primary-900 bg-opacity-40 z-50 flex items-center justify-center"
        @click.self="partiallyCloseModal">
        <transition name="modal" @after-leave="closeModal">
          <box v-if="showModal" class="flex flex-col max-h-screen !shadow-lg" :class="modalClass" no-padding>
            <div class="px-6">
              <div class="py-4 border-b dark:border-primary-600 relative flex items-center justify-center">
                <h2 class="text-xl font-bold text-center overflow-ellipsis whitespace-nowrap overflow-hidden">{{ title }}</h2>
                <button
                  @click="partiallyCloseModal"
                  class="absolute right-0 bg-zinc-200 dark:bg-primary-600 hover:bg-zinc-300 dark:hover:bg-primary-700 rounded-full p-2">
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
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts" setup>
import Box from './Box.vue';
import IconClose from '~icons/ion/close';
import { isSlotVisible } from '../../utils';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useModal } from '../../composables/modal';

const emit = defineEmits(['update:open']);
const props = defineProps({
  mId: {
    type: Number
  },
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
    default: 'max-w-xl w-11/12 md:w-full'
  }
});

const showModal = ref(false);
const partiallyCloseModal = () => { showModal.value = false }

const { closeModal, unsubscribe } = useModal(
  computed(() => props.open),
  (o) => emit('update:open', o),
  props.mId
);

onMounted(() => {
  showModal.value = props.open;
});

onBeforeUnmount(unsubscribe);
</script>

<style scoped>
.modal-overlay-enter-active,
.modal-overlay-leave-active {
  transition: opacity 0.25s ease;
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}

@keyframes bottomToCenter {
    0% {
        opacity: 0;
        transform: translateY(20%);
    }
    100% {
        opacity: 1;
        transform: translateY(0%);
    }
}

@keyframes centerToTop {
    0% {
        opacity: 1;
        transform: translateY(0%);
    }
    100% {
        opacity: 0;
        transform: translateY(-10%);
    }
}

.modal-enter-active {
  animation: bottomToCenter 150ms ease;
}

.modal-leave-active {
  animation: centerToTop 150ms ease;
}


.modal-enter-from {
  opacity: 0;
  transform: translateY(20%);
}

.modal-leave-to {
  opacity: 0;
  transform: translateY(-10%);
}
</style>
