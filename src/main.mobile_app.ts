import {SafeArea} from 'capacitor-plugin-safe-area';
import {SecureStoragePlugin} from 'capacitor-secure-storage-plugin';
import {App} from '@capacitor/app';
import {StatusBar, Style} from '@capacitor/status-bar';
import { Browser } from '@capacitor/browser';
import { Printer } from '@awesome-cordova-plugins/printer';

import {startApp} from './main.common';
import {darkModeQuery} from './composables/ui';

const SESSION_NATIVE_ID_KEY = { key: 'id' };
const SESSION_NATIVE_PW_KEY = { key: 'password' };

async function setDeviceSafeAreas() {
  const safeAreas = await SafeArea.getSafeAreaInsets();

  for (var pos in safeAreas.insets) {
    document.documentElement.style
      .setProperty(`--safe-area-inset-${pos}`, `${safeAreas.insets[pos]}px`);
  }
}

async function setupStatusBar() {
    await StatusBar.setOverlaysWebView({ overlay: true });
}

startApp(async () => {
  await setDeviceSafeAreas();
  await setupStatusBar();
}, {
  onAuthSuccess: async ({ id, password }) => {
    await Promise.all([
      SecureStoragePlugin.set({ ...SESSION_NATIVE_ID_KEY, value: id }),
      SecureStoragePlugin.set({ ...SESSION_NATIVE_PW_KEY, value: password })
    ]);
  },
  onAuthDestroy: async () => {
    await Promise.all([
      SecureStoragePlugin.remove(SESSION_NATIVE_ID_KEY),
      SecureStoragePlugin.remove(SESSION_NATIVE_PW_KEY)
    ]);
  },
  onAuthRefresh: async ({ client }) => {
    let id = '';
    let password = '';
    try {
      const { value: rawId } = await SecureStoragePlugin.get(SESSION_NATIVE_ID_KEY);
      id = rawId;
    } catch {}

    try {
      const { value: rawPassword } = await SecureStoragePlugin.get(SESSION_NATIVE_PW_KEY);
      password = rawPassword;
    } catch {}
    return await client.login(id, password);
  },
  onNavigationPop: ({ modalCount, closeModal, goBack }) => {
    return App.addListener('backButton', (evt) => {
      if (modalCount.value != 0) {
        closeModal();
      } else if (evt.canGoBack) {
        goBack();
      } else {
        void App.minimizeApp();
      }
    }).remove;
  },
  async onDarkModeChange(mode) {
    if (mode === '1' || (mode === '2' && darkModeQuery().matches)) {
      await StatusBar.setStyle({ style: Style.Dark });
    } else {
      await StatusBar.setStyle({ style: Style.Light });
    }
  },
  async onDownloadURL({ url, fileName }) {
    await Browser.open({ url });
    // let status = await Filesystem.checkPermissions();
    // if (status.publicStorage !== 'granted') {
    //   status = await Filesystem.requestPermissions();
    //   if (status.publicStorage !== 'granted') return;
    // }

    // await Filesystem.writeFile({
    //   path: fileName,
    //   directory: Directory.Documents,
    //   encoding: Encoding.UTF8
    // });
  },
  async onPrintPage(url) {
    const isPrinterAvailable = await Printer.isAvailable();
    if (isPrinterAvailable) {
      try {
        await Printer.print(url);
        return true;
      } catch (e) {
        console.error(e);
      }
      return false;
    }
    return true;
  }
})