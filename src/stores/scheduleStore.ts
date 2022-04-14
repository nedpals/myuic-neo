import { LocalNotifications, LocalNotificationSchema, Weekday } from "@capacitor/local-notifications";
import { Schedule } from "@myuic-api/types";
import { computed, isRef, Ref, ref } from "vue";
import { useQuery } from "vue-query";
import { client } from "../client";
import { compare12hTimesSort, IS_NATIVE } from "../utils";
import { useStudentStore } from "./studentStore";

interface NormalizedCourseSchedule {
  name: string;
  room: string;
  instructor: string;
  fromTime: string;
  toTime: string;
  day: string;
}

export const useSchedulesQuery = () => {
  const studentStore = useStudentStore();

  return useQuery(
    'class_schedule',
    () => client.classSchedule(
      studentStore.currentSemesterId.toString()
    )
  );
};

const roomRegex = /(?:OL-)?((?:2nd|1st)T)/;

export const days = {
  'M': 'Mon',
  'T': 'Tue',
  'W': 'Wed',
  'Th': 'Thu',
  'F': 'Fri',
  'S': 'Sat'
};

export const useScheduleQueryUtilities = ({ data, isFetching, isIdle }: ReturnType<typeof useSchedulesQuery>) => {
  const isAlternate = ref(false);
  const hasAlternates = ref(false);  
  const scheduleList = computed(() => {
    const isLoading = isFetching.value || isIdle.value;
    let scheduleList: Record<string, NormalizedCourseSchedule[]> = {
      'M': [],
      'T': [],
      'W': [],
      'Th': [],
      'F': [],
      'S': []
    }

    if (isLoading) {
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
    if (IS_NATIVE) {
      const weekday: Weekday[] = [
        Weekday.Monday, 
        Weekday.Tuesday, 
        Weekday.Wednesday, 
        Weekday.Thursday, 
        Weekday.Friday,
        Weekday.Saturday
      ];

      Object.keys(scheduleList).forEach((s, i) => {
        LocalNotifications.schedule({
          notifications: scheduleList[s].map<LocalNotificationSchema>(c => ({
            id: new Date().getTime(),
            title: `Incoming: ${c.name}`,
            body: `${c.fromTime}-${c.toTime}`,
            schedule: {
              on: {
                weekday: weekday[i],
              }
            }
          }))
        })
      });
    }
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
    scheduleList,
    activateNotifications,
    getScheduleByDay,
    isAlternate,
    hasAlternates
  };
};

export async function generateSchedulePDF(): Promise<string> {
  const studentStore = useStudentStore();
  const data = await client.classSchedulePDF((studentStore.currentSemesterId - 1).toString());
  if (data instanceof Blob && window.URL.createObjectURL) {
    const fileUrl = window.URL.createObjectURL(data);
    return fileUrl;
  } else {
    throw new Error('There was an error downloading the file.');
  }
}