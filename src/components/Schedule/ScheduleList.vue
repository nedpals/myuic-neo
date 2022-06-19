<template>
  <loading-container :is-loading="isLoading" v-slot="{ isLoading }">
    <box title="This week's class schedule" class="h-full min-h-[23rem] flex flex-col">
      <div class="flex flex-col flex-1">
        <div class="flex space-x-1 overflow-x-scroll disable-scrollbar">
          <skeleton
            v-if="isLoading"
            :key="'day_' + j"
            v-for="j in 6"
            custom-class="bg-gray-200 flex-1 px-3 py-1 rounded-full h-7 w-auto" />
          <button
            v-else
            :key="'day_' + shortDay"
            v-for="(day, shortDay) in days"
            @click="currentScheduleDay = day"
            :class="[currentScheduleDay === day ? 'bg-primary-400 dark:bg-primary-600 text-white' : 'bg-gray-200 dark:bg-primary-700']"
            class="flex-1 px-3 py-1 rounded-full">{{ day }}</button>
        </div>

        <div v-if="currentSchedule.length == 0" class="text-gray-400 dark:text-primary-300 flex flex-col items-center flex-1 justify-center space-y-2">
          <icon-calendar class="text-7xl" />
          <span class="text-2xl block text-center">No class!</span>
        </div>

        <div v-else class="flex flex-col divide-y dark:divide-primary-400 py-2">
          <div
            :key="'sched_' + si" v-for="(sub, si) in currentSchedule"
            :class="{ 'hover:bg-gray-100 dark:hover:bg-primary-700 transition-colors cursor-pointer': !isLoading }"
            class="flex-col rounded-lg -mx-3 px-4 py-3">
            <skeleton custom-class="h-4 w-32 bg-gray-200 mb-2">
              <p class="mb-2 font-semibold">{{ sub.name }}</p>
            </skeleton>
            <skeleton custom-class="h-3.5 w-24 bg-gray-200">
              <p class="text-gray-600 dark:text-primary-200 text-sm">{{ sub.fromTime }}-{{ sub.toTime }}</p>
            </skeleton>
          </div>
        </div>
        
        <div class="mt-auto">
          <skeleton custom-class="h-4 w-24 bg-primary-400">
            <router-link :to="{ name: 'schedule' }" class="hover:underline text-primary-500 dark:text-primary-200">See full schedule</router-link>
          </skeleton>
        </div>
      </div>
    </box>
  </loading-container>
</template>

<script lang="ts">
import { inject, ref } from 'vue';
import { useSchedulesQuery, days } from '../../stores/scheduleStore';
import Box from '../ui/Box.vue';
import LoadingContainer from '../ui/LoadingContainer.vue';
import Skeleton from '../ui/Skeleton.vue';
import { formatDatetime, now } from '../../utils';
import IconCalendar from '~icons/ion/calendar-clear-outline';
import { currentSemesterIdKey } from '../../stores/studentStore';

export default {
  components: { Box, LoadingContainer, Skeleton, IconCalendar },
  setup() {
    const currentSemesterId = inject(currentSemesterIdKey);
    const { getScheduleByDay, isLoading } = useSchedulesQuery(currentSemesterId!);
    const currentScheduleDay = ref(formatDatetime(now, 'EEE'));
    if (currentScheduleDay.value === 'Sun') {
      currentScheduleDay.value = 'Mon';
    }

    const currentSchedule = getScheduleByDay(currentScheduleDay);
    return {
      isLoading,
      currentSchedule,
      currentScheduleDay,
      days
    }
  }
}
</script>

<style lang="postcss" scoped>
.disable-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>