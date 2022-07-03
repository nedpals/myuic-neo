<template>
  <div class="divide-y divide-primary-500">
    <div class="py-4 flex justify-between items-center">
      <div>
        <h2 class="text-xl font-bold">Test Notification</h2>
        <p>Checks if the notification is working or not (for debugging)</p>
      </div>

      <button @click="testNotify" class="button is-primary px-6">Test</button>
    </div>
    <div class="py-4 flex justify-between items-center">
      <div>
        <h2 class="text-xl font-bold">Clear Notifications</h2>
        <p>Clears all the pending notifications</p>
      </div>

      <button @click="resetNotifs" class="button is-primary px-6">Clear</button>
    </div>
    <div class="py-4 flex justify-between items-center">
      <div>
        <h2 class="text-xl font-bold">Activate Schedule Notifications</h2>
        <p>Activates sending course schedule notifications</p>
      </div>

      <button @click="activateNotifications" class="button is-primary px-6">Activate</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { notify } from 'notiwind';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useSchedulesQuery } from '../../stores/scheduleStore';
import { currentSemesterIdKey } from '../../stores/studentStore';
import { inject } from 'vue';

const currentSemesterId = inject(currentSemesterIdKey)!;
const { activateNotifications: activateScheduleNotifications } = useSchedulesQuery(currentSemesterId);
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

const resetNotifs = async () => {
  try {
    notify({ type: 'info', text: 'Clearing notifications...' }, 2000);
    const { notifications } = await LocalNotifications.getPending();
    await LocalNotifications.cancel({ notifications });
    notify({ type: 'success', text: `${notifications.length} have been cleared.` }, 2000);
  } catch (e) {
    notify({
      type: 'error',
      text: e instanceof Error ? e.message : (<any>e).toString()
    }, 5000);
  }
}

const activateNotifications = () => {
  // TODO: add check if notif is activated.
  activateScheduleNotifications();
  notify({ type: 'info', text: 'Schedule notifications have been activated.' }, 3000);
}
</script>