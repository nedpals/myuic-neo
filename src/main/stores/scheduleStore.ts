import { CourseSchedule, Schedule } from "@myuic-api/types";
import { computed, isRef, readonly, Ref, ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { client } from "../client";
import { compare12hTimesSort, useLoadingFactory } from "../utils";
import appEvents from "../event";

export interface NormalizedCourseSchedule {
  code: string;
  name: string;
  room: string;
  instructor: string;
  fromTime: string;
  toTime: string;
  day: string;
  types: ['Lec' | 'Lab'] | ['Lab' | 'Lec', 'Lec' | 'Lab']
}

const roomRegex = /(?:OL-)?((?:2nd|1st)T)/;

export const days = {
  'M': 'Mon',
  'T': 'Tue',
  'W': 'Wed',
  'Th': 'Thu',
  'F': 'Fri',
  'S': 'Sat'
};

export interface UseScheduleQueryOptions {
  term: '1stT' | '2ndT'
  type: 'Lab' | 'Lec' | 'All'
  isAlternate: boolean
}

function insertSchedule(c: CourseSchedule, scheduleList: Record<string, NormalizedCourseSchedule[]>) {
  return (s: Schedule) => {
    const existingIdx = scheduleList[s.day].findIndex((cc: any) => cc.name == c.name);
    if (existingIdx !== -1) {
      const existing = scheduleList[s.day][existingIdx];
      scheduleList[s.day][existingIdx].types = [existing.types[0], c.type];
      return;
    }

    scheduleList[s.day].push({
      code: c.code,
      name: c.name,
      instructor: c.instructor,
      room: c.room,
      fromTime: s.fromTime,
      toTime: s.toTime,
      day: s.day,
      types: [c.type]
    });
  }
}

export const useSchedulesQuery = (semesterId: Ref<string | number | undefined>, options: UseScheduleQueryOptions = readonly({ term: '1stT', type: 'All', isAlternate: false })) => {
  const isTermBased = computed(() => {
    if (semesterId.value) {
      let semId = 0;

      if (typeof semesterId.value == 'string') {
        semId = parseInt(semesterId.value);
      }

      return semId >= 481 && semId <= 486;
    }
  });

  const query = useQuery(['class_schedule', semesterId], () => client.classSchedule(semesterId.value!.toString()), {
    enabled: computed(() => typeof semesterId.value !== 'undefined'),
  });

  const { data } = query;
  const isLoading = useLoadingFactory(query);
  const hasAlternates = ref(false);
  const scheduleList = computed(() => {
    let scheduleList: Record<string, NormalizedCourseSchedule[]> = {
      'M': [],
      'T': [],
      'W': [],
      'Th': [],
      'F': [],
      'S': []
    }

    if (isLoading.value) {
      for (const day in scheduleList) {
        scheduleList[day] = [...Array(3).keys()].map<NormalizedCourseSchedule>(() => ({
          code: '',
          instructor: '',
          name: '',
          room: '',
          fromTime: '',
          toTime: '',
          day: '',
          types: ['Lab']
        }));
      }

      return scheduleList;
    }

    if (!data.value || data.value.courses.length === 0) {
      return null;
    }

    for (const rawCourse of data.value.courses) {
      if (isTermBased.value && (roomRegex.exec(rawCourse.room)?.[1] !== options.term ?? false)) {
        continue;
      } else if (options.type !== 'All' && rawCourse.type !== options.type) {
        continue;
      }

      const nonAlts: Schedule[] = rawCourse.schedules.filter(cc => !cc.isAlternate);
      const alts: Schedule[] = rawCourse.schedules.filter(cc => cc.isAlternate);

      if (!hasAlternates.value && alts.length !== 0) {
        hasAlternates.value = true;
      }

      const insertFn = insertSchedule(rawCourse, scheduleList);

      if (options.isAlternate) {
        nonAlts
          .filter(cc => alts.findIndex(ss => ss.day === cc.day) === -1)
          .forEach(insertFn);

        alts.forEach(insertFn);
      } else {
        nonAlts.forEach(insertFn);
      }
    }

    for (const day in scheduleList) {
      scheduleList[day].sort((a, b) => compare12hTimesSort(a.fromTime, b.fromTime));
    }

    return scheduleList;
  });

  const activateNotifications = () => {
    if (!scheduleList.value) return;
    appEvents.onActivateScheduleNotifications?.({
      scheduleList: scheduleList.value
    });
  }

  const getScheduleByDay = (dayRef: string | Ref<string>) => {
    return computed(() => {
      const day = isRef(dayRef) ? dayRef.value : dayRef;

      for (const shortDay in days) {
        if (days[shortDay] !== day) {
          continue;
        }

        if (scheduleList.value && Object.keys(scheduleList.value).length !== 0) {
          return scheduleList.value[shortDay];
        }
      }

      return [];
    })
  }

  return {
    query,
    isLoading,
    isTermBased,
    scheduleList,
    activateNotifications,
    getScheduleByDay,
    hasAlternates
  };
};

export function generateSchedulePDF(semesterId: Ref<string | number | undefined>) {
  return useQuery(
    ['schedule_pdf', semesterId],
    async () => {
      const blob = await client.classSchedulePDF(semesterId.value!.toString());
      if (blob instanceof Blob) {
        const pdfBuf = await blob.arrayBuffer();
        return new Uint8Array(pdfBuf);
      } else {
        throw new Error('Your device does not support downloading PDF files.');
      }
    }, {
      enabled: false
    }
  );
}
