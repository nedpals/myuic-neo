import { Storage } from '@capacitor/storage';
import { defineStore } from 'pinia';

export const DARK_MODE_KEY = 'dark_mode';
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
      
      Storage.set({
        key: DARK_MODE_KEY,
        value: this.darkMode
      })
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

    async fetchDarkMode() {
      if ((await Storage.keys()).keys.includes(DARK_MODE_KEY)) {
        this.darkMode = (await Storage.get({ key: DARK_MODE_KEY })).value ?? '0';
      } else if (darkModeQuery().matches) {
        this.darkMode = '2';
      }
    },  
  }
});