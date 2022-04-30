import { useRegisterSW } from 'virtual:pwa-register/vue';
import { watch } from 'vue';
import { notify } from 'notiwind';

export default function() {
  const {
    offlineReady,
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW()
  
  watch(offlineReady, () => {
    notify({
      type: 'info',
      text: 'App ready to work offline.',
    });
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
    });
  });
}