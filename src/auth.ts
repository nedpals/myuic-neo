import { client } from './client';
import { Storage } from '@capacitor/storage';

const SESSION_NAME = 'session';
const SESSION_SEP = '||-||';

export function persistTokens(token: string, refreshToken: string) {
  if (token && refreshToken)
    Storage.set({
      key: SESSION_NAME,
      value: token + SESSION_SEP + refreshToken
    });
}

export async function login(id: string, password: string) {
  const { token, refreshToken } = await client.login(id, password);
  persistTokens(token, refreshToken);
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