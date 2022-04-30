import { Storage } from '@capacitor/storage';
import { ref, watch } from 'vue';

export const DARK_MODE_KEY = 'dark_mode';
export const darkModeQuery = () => window.matchMedia('(prefers-color-scheme: dark)');
const DARK_MODE_CLASS = 'dark';

const darkModeState = ref('0');

export const useDarkMode = () => {
  const toggleDarkMode = () => {
    // 0 (off), 1 (on), or 2 (auto)
    const nextValue = parseInt(darkModeState.value)+1;
    darkModeState.value = (nextValue % 3).toString();
    
    Storage.set({
      key: DARK_MODE_KEY,
      value: darkModeState.value
    })
  }

  const toggleDarkModeCss = (darkModeValue: string) => {
    let isDarkMode = darkModeValue === '1';
    if (darkModeValue === '2') {
      isDarkMode = darkModeQuery().matches;
    }

    if (isDarkMode) {
      document.documentElement.classList.add(DARK_MODE_CLASS);
    } else {
      document.documentElement.classList.remove(DARK_MODE_CLASS);
    }
  }

  const fetchDarkMode = async () => {
    if ((await Storage.keys()).keys.includes(DARK_MODE_KEY)) {
      darkModeState.value = (await Storage.get({ key: DARK_MODE_KEY })).value ?? '0';
    } else if (darkModeQuery().matches) {
      darkModeState.value = '2';
    }

    return darkModeState.value;
  }

  const handleDarkModeChange = (ev: MediaQueryListEvent) => {
    if (darkModeState.value === '2') {
      toggleDarkModeCss(darkModeState.value);
    }
  }
  
  const subscribeDarkMode = () => {
    fetchDarkMode();
    toggleDarkModeCss(darkModeState.value);

    const unsubscribeWatch = watch(darkModeState, toggleDarkModeCss);
    darkModeQuery().addEventListener('change', handleDarkModeChange);

    return () => {
      unsubscribeWatch();
      darkModeQuery().removeEventListener('change', handleDarkModeChange);
    }
  }

  return {
    darkModeState,
    toggleDarkMode,
    toggleDarkModeCss,
    subscribeDarkMode,
    fetchDarkMode
  }
}
