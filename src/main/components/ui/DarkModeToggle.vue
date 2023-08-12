<template>
  <button 
    @click="toggleDarkMode" 
    class="rounded-full p-2 hover:bg-primary-100 dark:hover:bg-primary-800">
    <component 
      :is="darkModeState === '1' ? IconSun : darkModeState === '2' ? IconSunMoon : IconMoon"
      class="h-6 w-6 text-primary-500 dark:text-primary-300" />
  </button>
</template>

<script lang="ts" setup>
import { useDarkMode } from '../../composables/ui';
import IconSun from '~icons/ion/sunny-outline';
import IconMoon from '~icons/ion/moon-outline';
import IconSunMoon from '~icons/mdi/theme-light-dark';

const { toggleDarkMode, darkModeState } = useDarkMode();
</script>