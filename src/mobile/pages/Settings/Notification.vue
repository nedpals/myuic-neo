<template>
  <div class="divide-y divide-zinc-300 dark:divide-primary-600">
    <div class="py-4 flex justify-between items-center">
      <div>
        <h2 class="text-xl font-bold">Test Notification</h2>
        <p class="text-zinc-400 dark:text-primary-200">Checks if the notification is working or not (for debugging)</p>
      </div>

      <Button @click="testNotify" theme="primary" class="px-6">Test</Button>
    </div>
    <div class="py-4 flex justify-between items-center">
      <div>
        <h2 class="text-xl font-bold">Clear Notifications</h2>
        <p class="text-zinc-400 dark:text-primary-200">Clears all the pending notifications</p>
      </div>

      <Button @click="resetNotifs(...(data?.notifications ?? []))" theme="primary" class="px-6">Clear</Button>
    </div>
    <div class="py-4 flex justify-between items-center">
      <div>
        <h2 class="text-xl font-bold">Activate Schedule Notifications</h2>
        <p class="text-zinc-400 dark:text-primary-200">Activates sending course schedule notifications</p>
      </div>

      <Button @click="activateNotifications" theme="primary" class="px-6">Activate</Button>
    </div>
    <div class="py-4 flex justify-between items-center">
      <div>
        <h2 class="text-xl font-bold">Activated notifications</h2>
        <p class="text-zinc-400 dark:text-primary-200">List of pending notifications</p>
      </div>

      <Button @click="isPendingNotificationsOpen = true" theme="primary" class="px-6">Open</Button>
    </div>
  </div>

  <modal-window v-model:open="isPendingNotificationsOpen" title="Pending Notifications">
    <div class="flex flex-col divide-y divide-zinc-300 dark:divide-primary-600">
      <empty-state
        v-if="!data || data.notifications.length === 0"
        :icon="IconUnknown"
        class="py-8"
        title="No pending notifications." />

      <div v-for="notif in data?.notifications"
        class="flex py-2">
        <div class="w-2/3">
          <h3 class="text-xl font-bold">{{ notif.title }}</h3>
          <p>{{ notif.id }} | {{ JSON.stringify(notif.schedule) }}</p>
        </div>

        <div class="w-1/3">
          <Button @click="resetNotifs(notif)" theme="primary">Cancel</Button>
        </div>
      </div>
    </div>
  </modal-window>
</template>

<script lang="ts" setup>
import { notify } from 'notiwind';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useSchedulesQuery } from '../../../main/stores/scheduleStore';
import { currentSemesterIdKey } from '../../../main/stores/studentStore';
import { inject, ref } from 'vue';
import Button from '../../../main/components/ui/Button.vue';
import ModalWindow from '../../../main/components/ui/ModalWindow.vue';
import { useQuery } from '@tanstack/vue-query';
import EmptyState from '../../../main/components/ui/EmptyState.vue';
import IconUnknown from '~icons/ion/help-circle-outline';

const isPendingNotificationsOpen = ref(false);
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

const { data, refetch } = useQuery(['local_notifications'], () => {
  return LocalNotifications.getPending();
});

const resetNotifs = async (...notifications: any[]) => {
  try {
    notify({ type: 'info', text: 'Clearing notifications...' }, 2000);
    if (notifications.length === 0) return;
    await LocalNotifications.cancel({ notifications });
    notify({ type: 'success', text: `${notifications.length} have been cleared.` }, 2000);
    refetch();
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
  refetch();
}
</script>
