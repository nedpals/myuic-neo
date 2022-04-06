import { client } from './client';

const SESSION_NAME = '__myuic_session';
const SESSION_SEP = '||-||';

export function persistTokens(token: string, refreshToken: string) {
  if (token && refreshToken && localStorage)
    localStorage.setItem(
      SESSION_NAME, token + SESSION_SEP + refreshToken
    );
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
  if (client.isAuthenticated() || !localStorage) return;
  const sessionCreds = localStorage.getItem(SESSION_NAME);
  
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
    if (localStorage) {
      localStorage.removeItem(SESSION_NAME);
    }
  }
}