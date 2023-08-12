<template>
  <teleport to="body">
    <transition name="modal-overlay" @enter="showModal = true">
      <div
        v-if="open"
        class="fixed inset-0 bg-white dark:bg-primary-900 bg-opacity-40 z-50 flex items-center justify-center"
        @click.self="partiallyCloseModal">
        <transition name="modal-window" @after-leave="closeModal">
          <box v-if="showModal" class="flex flex-col w-screen md:w-full rounded-none md:rounded-lg h-full md:h-[unset] max-h-screen !shadow-lg" :class="modalClass" no-padding>
            <div class="md:px-6" style="padding-top: var(--safe-area-inset-top);">
              <div class="py-3 md:py-4 border-b dark:border-primary-600 relative flex items-center md:justify-center">
                <slot name="customTitle" :closeModal="partiallyCloseModal">
                  <div class="mx-auto px-12 text-center whitespace-nowrap overflow-ellipsis overflow-hidden">
                    <h2 class="text-lg md:text-xl font-bold">{{ title }}</h2>
                    <h3 v-if="subtitle" class="text-sm">{{ subtitle }}</h3>
                  </div>
                  <button
                    @click="partiallyCloseModal"
                    class="absolute left-2 md:left-[unset] md:right-0 md:bg-zinc-200 md:dark:bg-primary-600 hover:bg-zinc-200 md:hover:bg-zinc-300 dark:hover:bg-primary-600 md:dark:hover:bg-primary-700 rounded-full p-2">
                    <icon-back class="block md:hidden text-primary-600 dark:text-white text-lg" />
                    <icon-close class="hidden md:block" />
                  </button>
                </slot>
              </div>
            </div>
            <div class="w-full flex-1 overflow-auto" :class="contentClass">
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
import IconBack from '~icons/ion/chevron-left';
import { isSlotVisible } from '../../utils';
import { computed, onBeforeUnmount, ref, onMounted, PropType } from 'vue';
import { useModal } from '../../composables/modal';

const showModal = ref(false);
const emit = defineEmits(['update:open']);
const props = defineProps({
  title: {
    type: String,
  },
  subtitle: {
    type: String
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
    default: 'px-4 md:px-6 py-2'
  },
  modalClass: {
    type: String,
    default: 'md:max-w-xl w-full'
  },
  shouldClose: {
    type: Function as PropType<() => Promise<boolean>>,
    default: () => Promise.resolve(true)
  }
});

const partiallyCloseModal = () => {
  props.shouldClose()
    .then(result => {
      if (result)
        showModal.value = false;
    });
}

const { closeModal, unsubscribe } = useModal(
  computed(() => props.open),
  (o) => emit('update:open', o)
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

@keyframes zoomIn {
    0% {
        opacity: 0;
        transform: scale(90%);
    }
    100% {
        opacity: 1;
        transform: scale(100%);
    }
}

.modal-window-enter-active {
  animation: zoomIn 150ms ease;
}

.modal-window-leave-active {
  animation: zoomIn 100ms ease reverse;
}

.modal-window-enter-from,
.modal-window-leave-to {
  opacity: 0;
  transform: scale(90%);
}
</style>
