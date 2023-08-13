<template>
  <dashboard-scaffold title="Test Page" class="p-4">
    <Button theme="primary" @click="testNotify">Test Notification</Button>
  </dashboard-scaffold>
</template>

<script lang="ts" setup>
import { notify } from 'notiwind';
import Button from '../../../main/components/ui/Button.vue';
import DashboardScaffold from '../../../main/components/ui/DashboardScaffold.vue';
import { LocalNotifications } from '@capacitor/local-notifications';

const testNotify = async () => {
  try {
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
</script>
