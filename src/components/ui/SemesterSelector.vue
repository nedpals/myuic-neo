<template>
  <listbox as="div" class="@md:hidden px-2" v-model="currentSemesterId">
    <div class="md:pt-4 relative">
      <listbox-button 
        :disabled="isLoading"
        :class="{ 'cursor-pointer hover:bg-gray-100 dark:hover:bg-primary-700': !isLoading }"
        class="flex items-center justify-between transition-colors relative w-full border dark:border-primary-700 rounded-md px-4 py-2 text-left focus:outline-none">
        <div
          :class="{ 'space-y-2': isLoading }"
          class="flex-col flex md:hidden lg:flex">
          <skeleton custom-class="h-4 w-36 bg-gray-200">
            <span class="font-semibold">{{ currentSemester.display.semester }}</span>
          </skeleton>
          <skeleton custom-class="h-3.5 w-24 bg-gray-200">
            <span class="text-sm">{{ currentSemester.display.year }}</span>
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
          <listbox-option as="template" :key="semester.id" :value="semester.id" v-for="semester in filteredSemesterList">
            <li :class="[currentSemesterId == semester.id ? 'bg-primary-100 dark:bg-primary-600' : '', 'hover:bg-gray-200 dark:hover:bg-primary-700 cursor-default select-none relative py-2 pl-3 pr-9']">
              <div
                :class="{ 'space-y-2': isLoading }"
                class="flex-col flex md:hidden lg:flex">
                <skeleton custom-class="h-4 w-36 bg-gray-200">
                  <span class="font-semibold">{{ semester.display.semester }}</span>
                </skeleton>
                <skeleton custom-class="h-3.5 w-24 bg-gray-200">
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
import { computed, inject, ref, Ref } from 'vue';
import { currentSemesterIdKey, useSemesterQuery, useStudentQuery } from '../../stores/studentStore';

import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';
import IconChevronRight from '~icons/ion/chevron-right';
import Skeleton from './Skeleton.vue';

const isLoading = inject<Ref<boolean>>('__loadState', ref(false));
const currentSemesterId = inject(currentSemesterIdKey);
const { semesterList, currentSemester } = useSemesterQuery(currentSemesterId);
const { query: { data: student } } = useStudentQuery();
const firstEnrolledYear = computed(() => 2000 + parseInt((student.value?.number ?? '20123').substring(0, 2)));
const lastEnrolledYear = computed(() => firstEnrolledYear.value + 4);
const filteredSemesterList = computed(() => {
  return semesterList.value.filter(s => {
    return s.fromYear >= firstEnrolledYear.value && (s.toYear < lastEnrolledYear.value || (!s.label.startsWith('Summer') && s.toYear === lastEnrolledYear.value))
  });
});
</script>