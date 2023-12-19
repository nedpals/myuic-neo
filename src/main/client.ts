import { newClient } from '@myuic-api/client';
import { APIResponse, APIResponseError } from '@myuic-api/client/lib/fetch';
import { QueryFunction, QueryKey, useQuery, UseQueryOptions, VueQueryPluginOptions } from '@tanstack/vue-query';
import { persistTokens } from './composables/auth';
import { catchAndNotifyError, twentyFourHoursInMs } from './utils';
import appEvents from './event';
import { ref } from 'vue';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import localforage from 'localforage';
import { compress, decompress } from 'lz-string';

export { eventbus } from '@myuic-api/client/lib/event';

export const mockBackendUrl = 'http://api.uic';
export const backendUrl = import.meta.env.VITE_API_URL || mockBackendUrl;
export const backendHost = new URL(backendUrl).hostname;
export const isMock = backendUrl === mockBackendUrl;
export const avatarBaseUrl = isMock ? backendUrl : import.meta.env.VITE_AVATAR_BASE_URL;
export const isGloballyEnabled = ref(false);

export const client = (() => {
  const client = newClient({
    baseUrl: backendUrl,
  });

  client.onRefresh = async (refresh) => {
    const creds = await (() => {
      if (appEvents.onAuthRefresh) {
        return appEvents.onAuthRefresh({ client, refresh });
      } else {
        return refresh();
      }
    })();

    // TODO: @myuic-api/client : Add event for getting successful login
    persistTokens(creds.token, creds.refreshToken);
    return creds;
  }

  return client;
})();

export type ClientConfig<T> = UseQueryOptions<APIResponse, APIResponseError | unknown, T, QueryKey>;

export const customClientOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        cacheTime: twentyFourHoursInMs,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        networkMode: 'online',
        onError: catchAndNotifyError,
        enabled: isGloballyEnabled
      },
      mutations: {
        onError: catchAndNotifyError
      }
    },
  },
  // clientPersister(queryClient) {
  //   return persistQueryClient({
  //     queryClient,
  //     persister: localStoragePersister
  //   });
  // },
}

export function queryConfig<T>(config?: ClientConfig<T>): ClientConfig<T> {
  return {
    select: (resp) => resp.data as T,
    ...config
  };
}

export function useClientQuery<T>(
  queryKey: QueryKey,
  queryFn: QueryFunction<APIResponse, QueryKey>,
  config?: Omit<ClientConfig<T>, "queryKey" | "queryFn">
) {
  return useQuery(queryKey, queryFn, queryConfig(config));
}

export const localStoragePersister = createAsyncStoragePersister({
  storage: localforage,
  serialize: data => compress(JSON.stringify(data)),
  deserialize: data => JSON.parse(decompress(data))
});
