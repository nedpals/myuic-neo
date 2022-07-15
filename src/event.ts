import { Client } from '@myuic-api/client';
import { Ref } from 'vue';

export type AppEvents = {
  onAuthSuccess: (params: { id: string, password: string }) => Promise<void>;
  onAuthDestroy: () => Promise<void>;
  onAuthRefresh: (params: { client: Client, refresh: () => Promise<{ token: string, refreshToken: string }>}) => Promise<{ token: string, refreshToken: string }>;
  onNavigationPop: (params: { modalCount: Ref<number>, closeModal: () => void, goBack: () => void }) => (() => Promise<void>);
  onDarkModeChange: (params: string) => Promise<void>;
  onDownloadURL: (params: { url: string, fileName: string }) => Promise<void>;
  onPrintPage: (params: string) => Promise<void>
}

const appEvents: Partial<AppEvents> = {
  onNavigationPop: () => () => Promise.resolve()
};
export default appEvents;