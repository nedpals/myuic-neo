import { computed, ref, watch } from "vue";
import { eventBus } from "./utils";

export const currentModalId = ref(0);

export function useModal() {
  const modalStack = ref<number[]>([]);
  const modalCount = computed(() => modalStack.value.length);
  const closeModal = (id: number) => {
    eventBus.emit('modal_manual_close', { id });
  } 

  const closeLastModal = () => {
    const lastId = modalStack.value.pop();
    if (!lastId) return;
    closeModal(lastId);
  }

  const handleModalOpened = ({ id }) => {
    modalStack.value.push(id);
    currentModalId.value++;
  }

  const handleModalClosed = ({ id }) => {
    const idIndex = modalStack.value.indexOf(id);
    if (idIndex !== -1) {
      modalStack.value.splice(idIndex, 1);
    }
  }

  const subscribeModalChange = () => {
    eventBus.on('modal_opened', handleModalOpened);
    eventBus.on('modal_closed', handleModalClosed);
    const unsubscribe = watch(modalCount, (newVal, oldVal) => {
      if (import.meta.env.DEV) {
        console.log('Modal Count', newVal);
      }
  
      if (newVal > 0) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    }, {
      immediate: true
    });
    
    return () => {
      eventBus.off('modal_opened', handleModalOpened);
      eventBus.off('modal_closed', handleModalClosed);
      unsubscribe();
    }
  }

  return {
    modalStack,
    modalCount,
    closeModal,
    closeLastModal,
    subscribeModalChange
  }
}