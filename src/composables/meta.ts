import { App, AppInfo } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { computed } from "vue";
import { useQuery } from "vue-query";

export function useInfoQuery() {
  return useQuery(['app_info'], async () => {
    if (Capacitor.getPlatform() === 'web') {
      return {
        version: APP_VERSION,
        build: APP_BUILD_COMMIT
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
        return `${platform} ${data.value.version} (Build ${data.value.build} ${APP_BUILD_DATE})`
      } else {
        return `${platform} ${data.value.version} (Build ${data.value.build}-${data.value.id} ${APP_BUILD_DATE})`;
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