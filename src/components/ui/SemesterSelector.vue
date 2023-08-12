<template>
  <listbox as="div" class="semester-selector px-2" v-model="currentSemesterId">
    <div class="md:pt-4 relative">
      <listbox-button
        :disabled="isLoading"
        :class="{ 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-primary-700': !isLoading }"
        class="flex items-center justify-between transition-colors relative w-full border dark:border-primary-700 rounded-md px-4 py-2 text-left focus:outline-none">
        <div
          :class="{ 'space-y-2': isLoading }"
          class="flex-col flex lg:flex">
          <skeleton :delay="3 * 250" custom-class="h-4 w-36 bg-zinc-200">
            <span class="font-semibold">{{ currentSemester.display.semester }}</span>
          </skeleton>
          <skeleton :delay="3 * 250" custom-class="h-3.5 w-24 bg-zinc-200">
            <span class="text-sm dark:text-primary-200">{{ currentSemester.display.year }}</span>
          </skeleton>
        </div>
        <icon-chevron-right class="text-primary-400" />
      </listbox-button>
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-out"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <listbox-options class="absolute z-10 mt-1 w-full border dark:border-primary-700 bg-white dark:bg-primary-800 shadow-lg max-h-56 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
          <listbox-option as="template" :key="semester.id" :value="semester.id" v-for="(semester, si) in filteredSemesterList">
            <li :class="[currentSemesterId == semester.id ? 'bg-primary-100 dark:bg-primary-600' : '', 'hover:bg-zinc-200 dark:hover:bg-primary-700 cursor-default select-none relative py-2 pl-3 pr-9']">
              <div
                :class="{ 'space-y-2': isLoading }"
                class="flex-col flex lg:flex">
                <skeleton :delay="(4 + (si + 1)) * 250" custom-class="h-4 w-36 bg-zinc-200">
                  <span class="font-semibold">{{ semester.display.semester }}</span>
                </skeleton>
                <skeleton :delay="(4 + (si + 1)) * 250" custom-class="h-3.5 w-24 bg-zinc-200">
                  <span class="text-sm">{{ semester.display.year }}</span>
                </skeleton>
              </div>
            </li>
          </listbox-option>
        </listbox-options>
      </transition>
    </div>
  </listbox>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, watch } from 'vue';
import { currentSemesterIdKey, useAdditionalInfoQuery, useStudentQuery } from '../../stores/studentStore';

import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';
import IconChevronRight from '~icons/ion/chevron-right';
import Skeleton from './Skeleton.vue';
import { useLoadState } from '../../utils';

const emit = defineEmits(['update:semesterId']);
const isLoading = useLoadState();
const currentSemesterId = inject(currentSemesterIdKey);
const { semesterList, currentSemester, infoQuery } = useAdditionalInfoQuery(currentSemesterId);
const { query: { data: student } } = useStudentQuery();
const firstEnrolledYear = computed(() => 2000 + parseInt((student.value?.number ?? '20123').substring(0, 2)));
const currentYear = new Date().getFullYear();
const graduateYear = computed(() => firstEnrolledYear.value + 4);
const lastEnrolledYear = computed(() => Math.min(currentYear, graduateYear.value));
const filteredSemesterList = computed(() => {
  return semesterList.value.filter(s => {
    const isSummer = s.label.startsWith('Summer');
    // do not show if:
    // - summer of the first enrolled year or summer of the graduated year
    // - scope is beyond between the first and the last enrolled year
    //   - if the current year is not graduate year, past the current year
    if (isSummer && (s.fromYear === firstEnrolledYear.value || s.fromYear === graduateYear.value)) {
      return false;
    } else if (s.fromYear < firstEnrolledYear.value || s.fromYear > lastEnrolledYear.value) {
      return false;
    } else if (infoQuery.data.value && s.id > infoQuery.data.value.semesterId) {
      return false;
    }
    // else if (s.toYear && s.toYear > lastEnrolledYear.value) {
    //   return false;
    // }
    return true;
  }).reverse();
});

const unwatch = watch(currentSemesterId!, (newId, oldId) => {
  if (newId === oldId) return;
  emit('update:semesterId', newId);
});

onBeforeUnmount(unwatch);
</script>
