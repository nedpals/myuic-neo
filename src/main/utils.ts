import { formatDistanceToNow, format } from 'date-fns';
import { Comment, Ref, Slot, computed, inject, readonly, ref } from 'vue';
import { notify } from 'notiwind';
import { Capacitor } from '@capacitor/core'
import { FetchStatus, UseQueryReturnType } from '@tanstack/vue-query';

export const feedbackUrl = computed(() => `${import.meta.env.VITE_FEEDBACK_URL ?? ''}`);

export const APP_PREFIX = '__myuic_neo__';

// Regex
export const semesterRegex = /((?:First|Second) Semester)\s(\d{4}-\d{4})|(Summer)\s(\d{4})/;

// Currency
export const pesoFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'PHP'
});

// Capacitor-related utils
export const IS_NATIVE = Capacitor.isNativePlatform();

// Time Utilities
export const now = new Date();
export const twentyFourHoursInMs = 1000 * 60 * 60 * 24;

export function humanizeTime(dt: string | Date): string {
  const input = dt instanceof Date ? dt : new Date(dt);
  if (import.meta.env.DEV) {
    console.log('[humanizeTime] input', dt, input);
  }
  return formatDistanceToNow(input, { addSuffix: true })
}

export function formatDatetime(dt: string | Date, formatStr: string): string {
  const input = dt instanceof Date ? dt : new Date(dt);
  if (import.meta.env.DEV) {
    console.log('[formatDateTime] input', dt, input);
  }
  return format(input, formatStr);
}

const twelveHourTimeRegex = /(\d{1,}):(\d{2,}):?(\d{2,})?\W*((?:A|P|a|p)(?:M|m))/;

export interface ParsedTime {
  hours: number;
  minutes: number;
  seconds: number;
  amPm: string;
}

export function parse12hour(time: string): ParsedTime {
  const res = twelveHourTimeRegex.exec(time);
  let hours = res ? parseInt(res[1]) : 12;
  const minutes = res ? parseInt(res[2]) : 0;
  let seconds = res ? parseInt(res[3] ?? '0') : 0;
  const amPm = res ? res[4].toLowerCase() : 'am';
  return { hours, minutes, seconds, amPm };
}

export function getPeriod(time: string) {
  const { hours, amPm } = parse12hour(time);
  if (amPm === 'am') {
    return 'morning';
  } else if (hours >= 1 && hours < 6 && amPm === 'pm') {
    return 'afternoon';
  } else if (amPm === 'pm') {
    return hours === 12 ? 'noon' : 'evening';
  }
  return 'day';
}

export function compare12hTimes(fromTimeInput: string | ParsedTime, toTimeInput: string | ParsedTime): number {
  const fromTime: ParsedTime = typeof fromTimeInput === 'string' ? parse12hour(fromTimeInput) : fromTimeInput;
  const toTime: ParsedTime = typeof toTimeInput === 'string' ? parse12hour(toTimeInput) : toTimeInput;
  const fromHour = fromTime.amPm === 'pm' && (fromTime.hours >= 1 && fromTime.hours < 12) ? fromTime.hours + 12 : fromTime.hours;
  const toHour = toTime.amPm === 'pm' && (toTime.hours >= 1 && toTime.hours < 12) ? toTime.hours + 12 : toTime.hours;
  return Math.max(fromHour - toHour, toHour - fromHour);
}

// based on seconds
const hours = 3600;
const minutes = 60;

function getTotal(input: ParsedTime) {
  let total = 0;
  if (input.amPm === 'pm') {
    total += (12 * hours);
  }

  if (input.hours !== 12) {
    total += (input.hours * hours)
  }

  total += (input.minutes * minutes);
  total += (input.seconds);
  return total;
}

export function compare12hTimesSort(a: string, b: string) {
  const aTime = parse12hour(a);
  const bTime = parse12hour(b);
  const aTimeTotal = getTotal(aTime);
  const bTimeTotal = getTotal(bTime);

  // if (!import.meta.env.PROD) {
  //   console.log(a, aTime, aTimeTotal);
  //   console.log(b, bTime, bTimeTotal);
  // }

  if (aTimeTotal === bTimeTotal) {
    return 0;
  } else if (aTimeTotal > bTimeTotal) {
    return 1;
  } else {
    return -1;
  }
}

// Vue utilities
export function isSlotVisible(slot: Slot | null | undefined): boolean {
  if (!slot) {
    return false;
  }
  return slot().findIndex(o => o.type !== Comment) !== -1;
}

// Notifications
export interface NotifyAction {
  label: string,
  onClick: (e: Event) => void
}

export function catchAndNotifyError(e: unknown) {
  if (e instanceof Error && e.message) {
    notify({ type: 'error', text: e.message }, 3000);
  } else {
    notify({ type: 'error', text: `Unknown error.` }, 3000);
  }
}

// Data
export function deepReactiveUpdate(src: Record<any, any>, dest: Record<any, any>) {
  for (const k in src) {
    if (Array.isArray(src[k])) {
      if (!dest.hasOwnProperty(k)) {
        dest[k] = src[k];
      } else {
        dest[k] = dest[k].splice(0, dest[k].length);
        dest[k].push(...src[k]);
      }

    } else if (typeof src[k] === 'object') {
      deepReactiveUpdate(src[k], dest[k]);
    } else {
      dest[k] = src[k];
    }
  }
}

export function useLoadState(defaultValue = false) {
  return inject<Ref<boolean>>('__loadState', ref(defaultValue));
}

export function useLoadingFactory<T = any, D = any>({ fetchStatus, status, isFetching }: {
  fetchStatus: Ref<FetchStatus>,
  status: UseQueryReturnType<T, D>['status'],
  isFetching: UseQueryReturnType<T, D>['isFetching']
}) {
  if (fetchStatus && status && isFetching) {
    return computed(() => isFetching.value || (status.value === 'loading' && fetchStatus.value === 'idle'));
  }
  return ref(false);
}
