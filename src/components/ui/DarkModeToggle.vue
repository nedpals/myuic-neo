<template>
  <button 
    @click="toggleDarkMode" 
    class="rounded-full p-2 hover:bg-primary-100 dark:hover:bg-primary-800">
    <component 
      :is="darkModeState === '1' ? 'icon-sun' : darkModeState === '2' ? 'icon-sun-moon' : 'icon-moon'"
      class="h-6 w-6 text-primary-500 dark:text-primary-300" />
  </button>
</template>

<script>
import { useDarkMode } from '../../stores/uiStore';
import IconSun from '~icons/ion/sunny-outline';
import IconMoon from '~icons/ion/moon-outline';
import IconSunMoon from '~icons/mdi/theme-light-dark';

export default {
  components: { IconSun, IconMoon, IconSunMoon },
  setup() {
    const { toggleDarkMode, darkModeState } = useDarkMode();
    return {
      toggleDarkMode,
      darkModeState
    };
  },
}
</script>