/// <reference types="@capacitor/local-notifications" />
//// <reference types="@capacitor/splash-screen" />
import { CapacitorConfig } from '@capacitor/cli';
import colorPalette from './color_palette';

const config: CapacitorConfig = {
  appId: 'xyz.nedpals.myuic',
  appName: 'MyUIC Neo',
  webDir: 'dist_mobile_app',
  bundledWebRuntime: false,
  plugins: {
    CapacitorHttp: {
      enabled: false
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: colorPalette.primary[500]
    },
    SplashScreen: {
      launchAutoHide: false,
      androidScaleType: 'CENTER_CROP',
      backgroundColor: '#FFFFFF'
    }
  },
};

export default config;
