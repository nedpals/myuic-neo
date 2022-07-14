import { SafeArea } from 'capacitor-plugin-safe-area';
import { startApp } from './main.common';

async function setDeviceSafeAreas() {
  const safeAreas = await SafeArea.getSafeAreaInsets();

  for (var pos in safeAreas.insets) {
    document.documentElement.style
      .setProperty(`--safe-area-inset-${pos}`, `${safeAreas.insets[pos]}px`);
  }
}

startApp(async () => {
  await setDeviceSafeAreas();
})