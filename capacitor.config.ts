/// <reference types="@capacitor/local-notifications" />
/// <reference types="@capacitor/splash-screen" />
import { CapacitorConfig } from '@capacitor/cli';
import windiConfig from './windi.config';

const config: CapacitorConfig = {
  appId: 'xyz.nedpals.myuic',
  appName: 'MyUIC Neo',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      //@ts-ignore
      iconColor: windiConfig.theme.colors.primary["500"]
    },
    SplashScreen: {
      launchAutoHide: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: false,
      //@ts-ignore
      backgroundColor: windiConfig.theme.colors.primary["500"]
    }
  },
};

export default config;
