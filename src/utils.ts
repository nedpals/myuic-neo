import { formatDistanceToNow, format } from 'date-fns';
import { Comment, Slot } from 'vue';
import mitt from 'mitt';
import { notify } from 'notiwind';
import { Capacitor } from '@capacitor/core'

export const APP_PREFIX = '__myuic_neo__';

// Capacitor-related utils
export const IS_NATIVE = Capacitor.isNativePlatform();

// Time Utilities
export const now = new Date();

export function humanizeTime(dt: string | Date): string {
  return formatDistanceToNow(dt instanceof Date ? dt : new Date(dt), { addSuffix: true })
}

export function formatDatetime(dt: string | Date, formatStr: string): string {
  return format(dt instanceof Date ? dt : new Date(dt), formatStr);
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
  } else if (hours >= 1 && hours <= 6 && amPm === 'pm') {
    return 'afternoon';
  } else {
    return hours === 12 ? 'noon' : 'evening';
  }
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

  if (!import.meta.env.PROD) {
    console.log(a, aTime, aTimeTotal);
    console.log(b, bTime, bTimeTotal);
  }

  if (aTimeTotal === bTimeTotal) {
    return 0;
  } else if (aTimeTotal > bTimeTotal) {
    return 1;
  } else {
    return -1;
  }
}

// export function subtractTime(time: ParsedTime, howManySeconds: number): ParsedTime {
//   const hrsToDeduct = Math.floor(howManySeconds / hours);
//   const minsToDeduct = 
// }

// Vue utilities
export function isSlotVisible(slot: Slot | null): boolean {
  if (!slot) {
    return false;
  }
  return slot().findIndex(o => o.type !== Comment) !== -1;
}

export const eventBus = mitt();
export const events = {
  MODAL_OPENED: 'modal_opened',
  MODAL_CLOSED: 'modal_closed'
};

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