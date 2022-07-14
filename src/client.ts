import { newClient } from '@myuic-api/client';
import { APIResponse, APIResponseError } from '@myuic-api/client/lib/fetch';
import { QueryFunction, QueryKey } from 'react-query/types/core';
import { useQuery, UseQueryOptions, VueQueryPluginOptions } from 'vue-query';
import { persistTokens } from './composables/auth';
import { catchAndNotifyError, twentyFourHoursInMs } from './utils';
import appEvents from './event';

export { eventbus } from '@myuic-api/client/lib/event';

export const backendUrl = import.meta.env.VITE_API_URL || 'http://api.my.uic.edu.ph'; // latter is a dummy URL
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