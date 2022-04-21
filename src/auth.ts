import { client, eventbus } from './client';
import { Storage } from '@capacitor/storage';
import { useMutation, useQueryClient } from 'vue-query';
import { useStudentStore } from './stores/studentStore';
import { useRouter } from 'vue-router';
import { notify } from 'notiwind';

const SESSION_NAME = 'session';
const SESSION_SEP = '||-||';

export function subscribeAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleChangeAuthenticatedStatus = ({ newStatus, oldStatus }) => {
    if (oldStatus && !newStatus) {
      router.replace({ name: 'login' });
      useStudentStore().fullReset();
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
  if (client.isAuthenticated()) {
    refresh();    
  }

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
    onSuccess: ({ token, refreshToken }) => {
      persistTokens(token, refreshToken);
    }
  });

  return {
    login: (id: string, password: string) => mutateAsync({ id, password }),
    isProcessing: isLoading
  }
}

export async function refresh() {
  if (!client.isAuthenticated()) return;
  const { token, refreshToken } = await client.refresh();
  persistTokens(token, refreshToken);
}

export async function retrieve() {
  if (client.isAuthenticated()) return;
  const { value: sessionCreds } = await Storage.get({ key: SESSION_NAME });
  
  if (!sessionCreds) return;
  const [accessToken, refreshToken] = sessionCreds.split(SESSION_SEP);
  client.setAuthCredentials(accessToken, refreshToken);
}

export async function destroy() {
  try {
    await client.logout();
  } catch(e) {
    console.error(e);
  } finally {
    Storage.remove({ key: SESSION_NAME });
  }
}