import { defineStore } from 'pinia';

export const DARK_MODE_KEY = 'darkMode';
export const darkModeQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

export const  useUIStore = defineStore('ui', {
  state: () => ({
    darkMode: '0'
  }),

  actions: {
    toggleDarkMode() {
      // 0 (off), 1 (on), or 2 (auto)
      const nextValue = parseInt(this.darkMode)+1;
      this.darkMode = (nextValue % 3).toString();
      if (localStorage)
        localStorage.setItem(DARK_MODE_KEY, this.darkMode);
    },

    toggleDarkModeCss(darkModeValue: string) {
      let isDarkMode = darkModeValue === '1';
      if (darkModeValue === '2') {
        isDarkMode = darkModeQuery().matches;
      }

      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },

    fetchDarkMode() {
      if (localStorage && localStorage.getItem(DARK_MODE_KEY)) {
        this.darkMode = localStorage.getItem(DARK_MODE_KEY) ?? '0';
      } else if (darkModeQuery().matches) {
        this.darkMode = '2';
      }
    },  
  }
});