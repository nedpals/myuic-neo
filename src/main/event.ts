import { Client } from '@myuic-api/client';
import { AdditionalInfo, Student } from '@myuic-api/types';
import { Ref } from 'vue';
import { NormalizedCourseSchedule } from './stores/scheduleStore';
import { NavigationGuardNext, RouteLocationNormalized, Router } from 'vue-router';

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
  onLogEvent: (name: string, params: any) => void;
  onReceiveStudentInfo: (params: { student: Student, additionalInfo: AdditionalInfo }) => void;
  onActivateScheduleNotifications: (params: { scheduleList: Record<string, NormalizedCourseSchedule[]> }) => void;
  onBeforeRouteChange: (params: { to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext }) => void | false;
  onRouterInit: (params: { router: Router }) => void;
}

const appEvents: Partial<AppEvents> = {
  onNavigationPop: () => () => Promise.resolve(),
  onLogEvent(name, params) {},
  onReceiveStudentInfo(params) {},
};
export default appEvents;
