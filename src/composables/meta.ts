import { App, AppInfo } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { computed } from "vue";
import { useQuery } from "vue-query";

export function useInfoQuery() {
  return useQuery(['app_info'], async () => {
    if (Capacitor.getPlatform() === 'web') {
      return {
        version: APP_VERSION
      } as AppInfo
    }

    return App.getInfo();
  });
}

export const useMeta = () => {
  const platform = Capacitor.getPlatform();
  const { data, isLoading } = useInfoQuery(); 
  const fullVersion = computed(() => {
    if (data.value) {
      if (platform === 'web') {
        return `${data.value.version} ${platform}`
      } else {
        return `${data.value.version} ${data.value.id} ${data.value.build} ${platform}`;
      }
    }

    return 'loading...';
  });

  return {
    data,
    isLoading,
    platform,
    fullVersion
  }
}