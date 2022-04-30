import { client, eventbus } from '../client';
import { Storage } from '@capacitor/storage';
import { useMutation, useQueryClient } from 'vue-query';
import { useRouter } from 'vue-router';
import { notify } from 'notiwind';
import { IS_NATIVE } from '../utils';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const SESSION_NAME = 'session';
const SESSION_SEP = '||-||';
export const SESSION_NATIVE_ID_KEY = { key: 'id' };
export const SESSION_NATIVE_PW_KEY = { key: 'password' };

export function subscribeAuth() {
  const queryClient = useQueryClient();
  const { mutate: logout } = useLogoutMutation();

  const handleChangeAuthenticatedStatus = ({ newStatus, oldStatus }) => {
    if (oldStatus && !newStatus) {
      logout();
      queryClient.clear();
    }
  };

  const handleSessionRefresh = () => {
    notify({
      type: 'info',
      text: 'Refreshing your session...'
    }, 1000);
  };

  const handleSessionExpired = () => {
    notify({
      type: 'error',
      text: 'Your session has expired. Please log in again.'
    }, 3000);
  };

  eventbus.on('changeAuthenticatedStatus', handleChangeAuthenticatedStatus);
  eventbus.on('sessionRefresh', handleSessionRefresh);
  eventbus.on('sessionExpired', handleSessionExpired);

  retrieve();

  return () => {
    eventbus.off('changeAuthenticatedStatus', handleChangeAuthenticatedStatus);
    eventbus.off('sessionRefresh', handleSessionRefresh);
    eventbus.off('sessionExpired', handleSessionExpired);
  }
} 

export function persistTokens(token: string, refreshToken: string) {
  if (token && refreshToken)
    Storage.set({
      key: SESSION_NAME,
      value: token + SESSION_SEP + refreshToken
    });
}

export function useLoginMutation() {
  const { mutateAsync, isLoading } = useMutation(
    ({ id, password }:{ id: string, password: string }) => client.login(id, password), 
  {
    onSuccess: async ({ token, refreshToken }, { id, password }) => {
      persistTokens(token, refreshToken);

      if (IS_NATIVE) {
        await Promise.all([
          SecureStoragePlugin.set({ ...SESSION_NATIVE_ID_KEY, value: id }),
          SecureStoragePlugin.set({ ...SESSION_NATIVE_PW_KEY, value: password })
        ]);
      }
    }
  });

  return {
    login: (id: string, password: string) => mutateAsync({ id, password }),
    isProcessing: isLoading
  }
}

export async function retrieve() {
  if (client.isAuthenticated()) return;
  const { value: sessionCreds } = await Storage.get({ key: SESSION_NAME });
  
  if (!sessionCreds) return;
  const [accessToken, refreshToken] = sessionCreds.split(SESSION_SEP);
  client.setAuthCredentials(accessToken, refreshToken);
}

export function useLogoutMutation() {
  const router = useRouter();
  return useMutation(() => client.logout(), {
    onSuccess: async () => {
      if (IS_NATIVE) 
        await Promise.all([
          SecureStoragePlugin.remove(SESSION_NATIVE_ID_KEY),
          SecureStoragePlugin.remove(SESSION_NATIVE_PW_KEY)
        ]);
      await Storage.remove({ key: SESSION_NAME });
      router.replace({ name: 'login' });
    }
  });
}