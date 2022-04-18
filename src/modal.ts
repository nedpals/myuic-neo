import { computed, ref, watch } from "vue";
import { eventBus } from "./utils";

export const currentModalId = ref(0);

export function useModal() {
  const modalStack = ref<number[]>([]);
  const modalCount = computed(() => modalStack.value.length);
  
  eventBus.on('modal_opened', ({ id }) => {
    modalStack.value.push(id);
    currentModalId.value++;
  });

  eventBus.on('modal_closed', ({ id }) => {
    const idIndex = modalStack.value.indexOf(id);
    if (idIndex !== -1) {
      modalStack.value.splice(idIndex, 1);
    }
  });
  
  const closeModal = (id: number) => {
    eventBus.emit('modal_manual_close', { id });
  } 

  const closeLastModal = () => {
    modalStack.value.pop();
  }

  watch(modalCount, (newVal, oldVal) => {
    if (!import.meta.env.PROD) {
      console.log('Modal Count', newVal);
    }

    if (newVal > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  });

  return {
    modalStack,
    modalCount,
    closeModal,
    closeLastModal
  }
}