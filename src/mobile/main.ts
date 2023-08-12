import {SafeArea} from 'capacitor-plugin-safe-area';
import {SecureStoragePlugin} from 'capacitor-secure-storage-plugin';
import {App} from '@capacitor/app';
import {StatusBar, Style} from '@capacitor/status-bar';
import {AppLauncher} from '@capacitor/app-launcher';
import {Printer} from '@awesome-cordova-plugins/printer';
import {Directory, Filesystem} from '@capacitor/filesystem';
import {LocalNotifications} from "@capacitor/local-notifications";
import writeBlob from 'capacitor-blob-writer';
import {NavigationBar} from '@hugotomazi/capacitor-navigation-bar';
import {NativeBiometric} from 'capacitor-native-biometric';

import {startApp} from '../main';
import {darkModeQuery} from '../main/composables/ui';
import color_palette from '../../color_palette';
import { backendHost } from '../main/client';

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

const credsConfig = { server: backendHost };

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
    // NOTE: let onAuthenticateProfile do its job
  },
  onAuthDestroy: async () => {
    // NOTE: let onDeleteProfile do its job
  },
  onAuthRefresh: async ({ client }) => {
    const { username: id, password } = await NativeBiometric.getCredentials(credsConfig);
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
      await NavigationBar.setColor({ color: color_palette.primary[900], darkButtons: false });
    } else {
      await StatusBar.setStyle({ style: Style.Light });
      await NavigationBar.setColor({ color: '#FFFFFF', darkButtons: true });
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
  },
  async onAuthenticateProfile({ isSave, id, password }) {
    const biometricsAvailableResult = await NativeBiometric.isAvailable();
    if (!biometricsAvailableResult.isAvailable) {
      return;
    }

    if (isSave && id && password) {
      await NativeBiometric.setCredentials({
        ...credsConfig,
        username: id,
        password
      });
    } else {
      await NativeBiometric.verifyIdentity();
    }
  },
  async onFetchCredentials() {
    const { username: id, password } = await NativeBiometric.getCredentials(credsConfig);
    return { id, password }
  },
  async onDestroyProfile({ hasBiometrics }) {
    if (hasBiometrics) {
      await NativeBiometric.deleteCredentials(credsConfig);
    }
  },
})
