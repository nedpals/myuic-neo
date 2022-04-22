import { LocalNotifications, LocalNotificationSchema, Weekday } from "@capacitor/local-notifications";
import { Schedule } from "@myuic-api/types";
import { computed, isRef, Ref, ref } from "vue";
import { useQuery } from "vue-query";
import { client } from "../client";
import { compare12hTimesSort, IS_NATIVE } from "../utils";
import { useSemesterQuery } from "./studentStore";

interface NormalizedCourseSchedule {
  name: string;
  room: string;
  instructor: string;
  fromTime: string;
  toTime: string;
  day: string;
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

const weekday: Weekday[] = [
  Weekday.Monday, 
  Weekday.Tuesday, 
  Weekday.Wednesday, 
  Weekday.Thursday, 
  Weekday.Friday,
  Weekday.Saturday
];

export const useSchedulesQuery = () => {
  const { idQuery: { data: currentSemesterId }, hasSemesterId } = useSemesterQuery();
  const query = useQuery('class_schedule', () => client.classSchedule(currentSemesterId.value!), {
    enabled: hasSemesterId,
  });
  const { isFetching, isIdle, data } = query;
  const isLoading = computed(() => isFetching.value || isIdle.value);
  const isAlternate = ref(false);
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
          instructor: '',
          name: '',
          room: '',
          fromTime: '',
          toTime: '',
          day: ''
        }));
      }

      return scheduleList;
    }

    const sch = data.value;
    if (!sch) return null;

    const rawCourses = sch.courses;
    if (rawCourses.length == 0) return null;

    rawCourses.forEach(c => {
      const { name, instructor, room } = c;
      // TODO: remove code. check if term is in 2nd term or not
      const termMatches = roomRegex.exec(room);
      if (termMatches && termMatches[1] && termMatches[1] !== '2ndT') return;

      const insertFn = (s: Schedule) => {
        if (scheduleList[s.day].findIndex((cc: any) => cc.name == name) !== -1) return;
        scheduleList[s.day].push({
          name,
          instructor,
          room,
          fromTime: s.fromTime,
          toTime: s.toTime,
          day: s.day
        });
      }

      const nonAlts: Schedule[] = c.schedules.filter(cc => !cc.isAlternate);
      const alts: Schedule[] = c.schedules.filter(cc => cc.isAlternate);
      if (!hasAlternates.value && alts.length !== 0) {
        hasAlternates.value = true;
      }
      
      if (isAlternate.value) {
        nonAlts
          .filter(cc => alts.findIndex(ss => ss.day === cc.day) === -1)
          .forEach(insertFn);
        alts.forEach(insertFn);
      } else {
        nonAlts.forEach(insertFn);
      }
    });

    Object.keys(scheduleList).forEach(s => {
      scheduleList[s].sort((a, b) => compare12hTimesSort(a.fromTime, b.fromTime));
    });

    return scheduleList;
  });
  
  const activateNotifications = () => {
    if (!IS_NATIVE || !scheduleList.value) return;

    Object.values(scheduleList.value).forEach((s, i) => {
      LocalNotifications.schedule({
        notifications: s.map<LocalNotificationSchema>(c => ({
          id: new Date().getTime(),
          title: `Incoming: ${c.name}`,
          body: `${c.fromTime}-${c.toTime}`,
          schedule: {
            every: 'week',
            on: {
              day: weekday[i],
            },
            allowWhileIdle: true,
          }
        }))
      })
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
    scheduleList,
    activateNotifications,
    getScheduleByDay,
    isAlternate,
    hasAlternates
  };
};

export function generateSchedulePDF() {
  const { idQuery: { data: currentSemesterId } } = useSemesterQuery();
  return useQuery(
    ['schedule_pdf', currentSemesterId.value!],
    async () => {
      if (!window.URL.createObjectURL) {
        throw new Error('Downloading PDF files is not supported.');
      }
      return client.classSchedulePDF(currentSemesterId.value!);
    }, {
      enabled: false,
      select: window.URL.createObjectURL
    }
  );
}