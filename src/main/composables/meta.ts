import { App, AppInfo } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";

export function useInfoQuery() {
  return useQuery(['app_info'], async () => {
    if (Capacitor.getPlatform() === 'web') {
      return {
        version: import.meta.env.VITE_APP_VERSION_NAME,
        build: import.meta.env.VITE_APP_VERSION_CODE,
      } as AppInfo
    }

    return App.getInfo();
  }, { enabled: true });
}

export const useMeta = () => {
  const platform = Capacitor.getPlatform();
  const { data, isLoading } = useInfoQuery();
  const fullVersion = computed(() => {
    if (data.value) {
      if (platform === 'web') {
        return `${platform} ${data.value.version} (Build ${data.value.build} ${import.meta.env.VITE_APP_BUILD_DATE})`
      } else {
        return `${platform} ${data.value.version} (Build ${data.value.build}-${data.value.id} ${import.meta.env.VITE_APP_BUILD_DATE})`;
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
