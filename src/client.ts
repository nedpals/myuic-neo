import { newClient } from '@myuic-api/client';
import { APIResponse, APIResponseError } from '@myuic-api/client/lib/fetch';
import { QueryFunction, QueryKey } from 'react-query/types/core';
import { readonly } from 'vue';
import { useQuery, UseQueryOptions, VueQueryPluginOptions } from 'vue-query';
import { catchAndNotifyError, twentyFourHoursInMs } from './utils';
export { eventbus } from '@myuic-api/client/lib/event';

export const backendUrl = import.meta.env.VITE_API_URL || 'http://api.my.uic.edu.ph'; // latter is a dummy URL
export const client = newClient({ baseUrl: backendUrl });

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