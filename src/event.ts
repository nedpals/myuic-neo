import { Client } from '@myuic-api/client';
import { Ref } from 'vue';

export type AppEvents = {
  onAuthSuccess: (params: { id: string, password: string }) => Promise<void>;
  onAuthDestroy: () => Promise<void>;
  onAuthRefresh: (params: { client: Client, refresh: () => Promise<{ token: string, refreshToken: string }>}) => Promise<{ token: string, refreshToken: string }>;
  onNavigationPop: (params: { modalCount: Ref<number>, closeModal: () => void, goBack: () => void }) => (() => Promise<void>);
  onDarkModeChange: (params: string) => Promise<void>;
  onDownloadURL: (params: { url?: string, fileName: string, data?: Uint8Array }) => Promise<void>;
  onPrintPage: (params: { url?: string, data?: Uint8Array }) => Promise<boolean>;
  onDestroyProfile: (params: { hasBiometrics: boolean }) => Promise<void>;
  onFetchCredentials: () => Promise<{ id: string, password: string }>
  onAuthenticateProfile: (params: { isSave: boolean, id?: string, password?: string }) => Promise<void>;
}

const appEvents: Partial<AppEvents> = {
  onNavigationPop: () => () => Promise.resolve()
};
export default appEvents;