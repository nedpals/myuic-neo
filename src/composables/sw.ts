import { useRegisterSW } from 'virtual:pwa-register/vue';
import { watch } from 'vue';
import { notify } from 'notiwind';

export default function() {
  if (import.meta.env.DEV) {
    return;
  }

  const {
    offlineReady,
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW()
  
  watch(offlineReady, () => {
    notify({
      type: 'info',
      text: 'App ready to work offline.',
    }, 3000);
  });
  
  watch(needRefresh, () => {
    notify({
      type: 'info',
      text: 'A new version has been released.',
      data: {
        actions: [
          {
            label: 'Update',
            onClick: updateServiceWorker
          }
        ]
      }
    }, 3000);
  });
}