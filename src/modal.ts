import mitt from "mitt";
import { computed, ref, watch } from "vue";

export type ModalEvents = {
  modal_opened: {
    id: number
  }
  modal_closed: {
    id: number
  }
  modal_manual_close: {
    id: number
  }
}

export const events: Record<string, keyof ModalEvents> = {
  MODAL_OPENED: 'modal_opened',
  MODAL_CLOSED: 'modal_closed',
  MODAL_MANUAL_CLOSE: 'modal_manual_close',
} as const;

export const modalEventBus = mitt<ModalEvents>();

export const currentModalId = ref(0);

export function useModalManager() {
  const modalStack = ref<number[]>([]);
  const modalCount = computed(() => modalStack.value.length);
  const closeModal = (id: number) => {
    modalEventBus.emit('modal_manual_close', { id });
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
    modalEventBus.on('modal_opened', handleModalOpened);
    modalEventBus.on('modal_closed', handleModalClosed);
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
      modalEventBus.off('modal_opened', handleModalOpened);
      modalEventBus.off('modal_closed', handleModalClosed);
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