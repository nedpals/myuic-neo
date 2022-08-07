import mitt from "mitt";
import { computed, ComputedRef, reactive, ref, watch } from "vue";

interface ModalInfo {
  id: number
}

export type ModalEvents = {
  modal_opened: ModalInfo
  modal_closed: ModalInfo
  modal_manual_close: ModalInfo
  dialog_closed: ModalInfo & { result: any }
}

export const events: Record<string, keyof ModalEvents> = {
  MODAL_OPENED: 'modal_opened',
  MODAL_CLOSED: 'modal_closed',
  MODAL_MANUAL_CLOSE: 'modal_manual_close',
  DIALOG_CLOSED: 'dialog_closed'
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
    if (import.meta.env.DEV) {
      console.log('[modalManager] opened modal', id)
    }
  }

  const handleModalClosed = ({ id }) => {
    const idIndex = modalStack.value.indexOf(id);
    if (import.meta.env.DEV) {
      console.log('[modalManager] closed modal', id);
      console.log(modalStack.value, idIndex);
    }
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

export const useModal = (isOpen: ComputedRef<boolean>, updateFn: (state: boolean) => void, modalId?: number) => {
  const state = reactive<ModalInfo>({ id: modalId ?? currentModalId.value++ });
  const closeModal = () => {
    updateFn(false);
  }

  const handleManualClose = ({ id: gotId }: ModalInfo) => {
    if (gotId === state.id) {
      if (import.meta.env.DEV) {
        console.trace('[modal] manually closing modal', state.id)
      }
      closeModal();
    }
  }

  modalEventBus.on('modal_manual_close', handleManualClose);

  const unwatchOpen = watch(isOpen, (newVal, oldVal) => {
    if (newVal === oldVal) return;
    if (newVal) {
      modalEventBus.emit('modal_opened', state);
    } else if (typeof oldVal !== 'undefined') {
      modalEventBus.emit('modal_closed', state);
    }
  }, { immediate: true });
  
  return {
    unsubscribe: () => {
      modalEventBus.emit('modal_closed', state);
      if (isOpen.value) {
        closeModal();
      }
      modalEventBus.off('modal_manual_close', handleManualClose);
      unwatchOpen();
    },
    closeModal,
    state
  }
}

// Dialog
export interface DialogAction {
  label: string
  theme?: 'light' | 'primary' | 'danger' | 'warning' | 'success' | 'info'
  class?: string
  answer: string | (() => string)
}

export interface Dialog {
  title: string
  content: string
  actions: DialogAction[]
}

export interface DialogModal extends Dialog, ModalInfo {
  isOpen: boolean
  hasActionPressed?: boolean
}

export const dialogs = ref<DialogModal[]>([]);

export async function showDialog(d: Dialog): Promise<string | null> {
  let gotResult: string | null = '';
  const newDialog: DialogModal = {
    ...d,
    id: currentModalId.value++,
    isOpen: true
  };

  const dialogHandler = ({ id, result }: ModalInfo & { result: any }) => {
    if (id !== newDialog.id) return;
    gotResult = result;
    modalEventBus.emit('modal_manual_close', { id });
    modalEventBus.off('dialog_closed', dialogHandler);
  }

  dialogs.value.push(newDialog);
  modalEventBus.on('dialog_closed', dialogHandler);

  return new Promise<string | null>((resolve) => {
    (function waitForResult() {
      if (gotResult || gotResult === null) return resolve(gotResult);
      setTimeout(waitForResult, 30);
    })()
  });
};