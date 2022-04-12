<template>
  <dashboard-header title="Test Page" class="p-4">
    <button class="button is-primary" @click="testNotify">Test Notification</button>
  </dashboard-header>
</template>

<script lang="ts">
import { notify } from 'notiwind';
import DashboardHeader from '../../components/ui/DashboardHeader.vue';
import { IS_NATIVE } from '../../utils';
import { LocalNotifications } from '@capacitor/local-notifications';

export default {
  components: { DashboardHeader },
  setup() {
    const testNotify = async () => {
      try {
        if (!IS_NATIVE) return;
        notify({ type: 'info', text: 'Creating test notification...' }, 5 * 1000);
        const { display: status } = await LocalNotifications.checkPermissions();
        notify({ type: 'info', text: 'Notif status: ' + status }, 5 * 1000);

        if (status === 'denied') return;
        if (status === 'prompt' || status === 'prompt-with-rationale') {
          const { display: promptStatus } = await LocalNotifications.requestPermissions();
          if (promptStatus === 'denied') {
            return;
          }
        }

        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'Incoming: Subject Name',
              body: 'CC111 | 8:00AM - 11:00AM',
              id: new Date().getTime()
            }
          ]
        });
      } catch (e) {
        notify({
          type: 'error',
          text: e instanceof Error ? e.message : (<any>e).toString()
        }, 5000);
      }
    }

    return {
      testNotify
    }
  }
}
</script>