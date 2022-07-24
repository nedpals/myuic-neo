import {SafeArea} from 'capacitor-plugin-safe-area';
import {SecureStoragePlugin} from 'capacitor-secure-storage-plugin';
import {App} from '@capacitor/app';
import {StatusBar, Style} from '@capacitor/status-bar';
import {AppLauncher} from '@capacitor/app-launcher';
import {Printer} from '@awesome-cordova-plugins/printer';
import {Directory, Encoding, Filesystem} from '@capacitor/filesystem';
import writeBlob from 'capacitor-blob-writer';

import {startApp} from './main.common';
import {darkModeQuery} from './composables/ui';
import {LocalNotifications} from "@capacitor/local-notifications";

const SESSION_NATIVE_ID_KEY = { key: 'id' };
const SESSION_NATIVE_PW_KEY = { key: 'password' };
const textDec = new TextDecoder('utf8');

async function setDeviceSafeAreas() {
  const safeAreas = await SafeArea.getSafeAreaInsets();

  for (const pos in safeAreas.insets) {
    document.documentElement.style
      .setProperty(`--safe-area-inset-${pos}`, `${safeAreas.insets[pos]}px`);
  }
}

async function setupStatusBar() {
    await StatusBar.setOverlaysWebView({ overlay: true });
}

startApp(async () => {
  // disable zoom
  const viewportElement = document.querySelector('meta[name=viewport]');
  const disableZoomViewport = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  if (viewportElement && viewportElement instanceof HTMLMetaElement) {
          viewportElement.content = disableZoomViewport;
  } else {
      const newViewportElement = document.createElement('meta');
      newViewportElement.name = 'viewport';
      newViewportElement.content = disableZoomViewport;
      document.getElementsByTagName('head')[0].appendChild(newViewportElement);
  }

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
  async onDownloadURL({ url, data, fileName }) {
    if (url) {
      await AppLauncher.openUrl({ url });
    } else if (data) {
      let status = await Filesystem.checkPermissions();
      if (status.publicStorage !== 'granted') {
        status = await Filesystem.requestPermissions();
        if (status.publicStorage !== 'granted') return;
      }

      const pending = await LocalNotifications.schedule({
        notifications: [
          {
            title: `Downloading ${fileName}`,
            ongoing: true,
            body: '',
            id: new Date().getTime()
          }
        ]
      });

      await writeBlob({
        path: fileName,
        directory: Directory.Documents,
        blob: new Blob([data.buffer], {
          type: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'
        })
      });

      await LocalNotifications.cancel({
        notifications: pending.notifications
      });

      await LocalNotifications.schedule({
        notifications: [
          {
            title: fileName,
            body: 'Download complete.',
            id: new Date().getTime()
          }
        ]
      });
    }
  },
  async onPrintPage({ url, data }) {
    const isPrinterAvailable = await Printer.isAvailable();
    if (isPrinterAvailable) {
      try {
        if (url) {
          await Printer.print(url);
        } else if (data) {
          await Printer.print(`base64://${btoa(textDec.decode(data))}`);
        }
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
    return false;
  }
})