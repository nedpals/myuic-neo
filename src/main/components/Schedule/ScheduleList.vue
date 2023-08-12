<template>
  <loading-container :is-loading="isLoading" v-slot="{ isLoading }">
    <box title="This week's class schedule" class="h-full min-h-[23rem] flex flex-col">
      <div class="flex flex-col flex-1">
        <div class="flex space-x-1 overflow-x-scroll disable-scrollbar">
          <skeleton
            v-if="isLoading"
            :key="'day_' + j"
            v-for="j in 6"
            :delay="j * 250"
            custom-class="bg-zinc-200 flex-1 px-3 py-1 rounded-full h-7 w-auto" />
          <button
            v-else
            :key="'day_' + shortDay"
            v-for="(day, shortDay) in days"
            @click="currentScheduleDay = day"
            :class="[currentScheduleDay === day ? 'bg-primary-400 dark:bg-primary-600 text-white' : 'bg-zinc-200 dark:bg-primary-700']"
            class="flex-1 px-3 py-1 rounded-full">{{ day }}</button>
        </div>

        <empty-state
          v-if="currentSchedule.length === 0"
          class="my-auto"
          :icon="IconCalendar"
          title="No class" />

        <div v-else class="flex flex-col divide-y dark:divide-primary-400 py-2">
          <article :key="'sched_' + si" v-for="(sub, si) in currentSchedule">
            <div
              :class="[isLoading ? 'py-4' : 'py-3 hover:bg-zinc-100 dark:hover:bg-primary-700 transition-colors']"
              class="flex-col rounded-lg -mx-3 px-4">
              <skeleton :delay="(si + 1) * 250" custom-class="h-4 w-32 bg-zinc-200 mb-2">
                <p class="mb-2 font-semibold">{{ sub.name }}</p>
              </skeleton>
              <skeleton :delay="(si + 1) * 250" custom-class="h-3.5 w-24 bg-zinc-200">
                <p class="text-zinc-600 dark:text-primary-200 text-sm">{{ sub.fromTime }}-{{ sub.toTime }}</p>
              </skeleton>
            </div>
          </article>
        </div>

        <div class="mt-auto">
          <skeleton :delay="(currentSchedule.length + 1) * 250" custom-class="h-4 w-24 bg-primary-400">
            <router-link :to="{ name: 'schedule' }" class="hover:underline text-primary-500 dark:text-primary-200">See full schedule</router-link>
          </skeleton>
        </div>
      </div>
    </box>
  </loading-container>
</template>

<script lang="ts" setup>
import { inject, ref } from 'vue';
import { useSchedulesQuery, days } from '../../stores/scheduleStore';
import Box from '../ui/Box.vue';
import LoadingContainer from '../ui/LoadingContainer.vue';
import Skeleton from '../ui/Skeleton.vue';
import { formatDatetime, now } from '../../utils';
import IconCalendar from '~icons/ion/calendar-clear-outline';
import { currentSemesterIdKey } from '../../stores/studentStore';
import EmptyState from '../ui/EmptyState.vue';

const currentSemesterId = inject(currentSemesterIdKey);
const { getScheduleByDay, isLoading } = useSchedulesQuery(currentSemesterId!);
const currentScheduleDay = ref(formatDatetime(now, 'EEE'));
if (currentScheduleDay.value === 'Sun') {
  currentScheduleDay.value = 'Mon';
}

const currentSchedule = getScheduleByDay(currentScheduleDay);
</script>

<style lang="postcss" scoped>
.disable-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
