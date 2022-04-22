import { newClient } from '@myuic-api/client';
import { APIResponse, APIResponseError } from '@myuic-api/client/lib/fetch';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin/src/index';
import { QueryFunction, QueryKey } from 'react-query/types/core';
import { useQuery, UseQueryOptions, VueQueryPluginOptions } from 'vue-query';
import { persistTokens, SESSION_NATIVE_ID_KEY, SESSION_NATIVE_PW_KEY } from './auth';
import { catchAndNotifyError, IS_NATIVE, twentyFourHoursInMs } from './utils';
export { eventbus } from '@myuic-api/client/lib/event';

export const backendUrl = import.meta.env.VITE_API_URL || 'http://api.my.uic.edu.ph'; // latter is a dummy URL
export const client = (() => {
  const client = newClient({ 
    baseUrl: backendUrl,
  });

  client.onRefresh = async (refresh) => {
    if (IS_NATIVE) {
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
      const creds = await client.login(id, password);
      // TODO: @myuic-api/client : Add event for getting successful login
      persistTokens(creds.token, creds.refreshToken);
      return creds;
    }
    const creds = await refresh();
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
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: false,
        refetchOnReconnect: false,
        staleTime: twentyFourHoursInMs,
        onError: catchAndNotifyError
      },
      mutations: {
        onError: catchAndNotifyError
      }
    },
  }
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