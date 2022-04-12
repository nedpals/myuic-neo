import { defineStore } from 'pinia';
import { compare12hTimesSort, formatDatetime, humanizeTime, IS_NATIVE } from '../utils';
import { client } from '../client';
import { nameCase } from '@foundernest/namecase';
import { destroy } from '../auth';
import { RoutePath } from '@myuic-api/types';
import { LocalNotifications, LocalNotificationSchema, Weekday } from '@capacitor/local-notifications';

const semesterRegex = /((?:First|Second) Semester|Summer)\s(\d{4}-\d{4})/;

export const useStudentStore = defineStore('student', {
  state: () => ({
    student: {} as Record<string, any>,
    currentSemesterId: -1,
    academicRecords: [] as any[],
    semesterList: [] as any[],
    resourceLinks: [] as any[],
    courseEvaluationList: [] as any[]
  }),

  getters: {
    hasSemesterId(): boolean {
      return this.currentSemesterId !== -1;
    },

    isEmpty(state): boolean {
      return state.student == null || Object.keys(state.student).length == 0;
    },
    normalizedFirstName(state): string {
      if (this.isEmpty) return '';
      const splitted = state.student.firstName.split(' ');
      return nameCase(splitted[0]);
    },
    isAcademicRecordEmpty(state): boolean {
      return state.academicRecords == null || state.academicRecords.length == 0;
    },
    latestAcademicRecords(state): any[] {
      if (this.isAcademicRecordEmpty) return [];
      return state.academicRecords.reverse();
    },
    recordOverallUnits(): any[] {
      if (this.isAcademicRecordEmpty) return [];
      return this.latestAcademicRecords.map((r: any) => {
        let totalUnits = 0;
        for (const s of r.reports) {
          const units = (s.units ?? 0);
          totalUnits += units;
        }
        return totalUnits
      });
    },
    recordOverallAverages(): any[] {
      if (this.isAcademicRecordEmpty) return [];
      return this.latestAcademicRecords.map((r: any) => {
        // As per recommendation:
        // (Sum of all product of overall/final grade and units) / total units
        let totalUnits = 0;
        let sumOfAllProduct = 0;

        for (const s of r.reports) {
          const units = (s.units ?? 0);
          totalUnits += units;
          sumOfAllProduct += ((s.overallGrade ?? 0) * units);
        }

        const avg = sumOfAllProduct / totalUnits;
        return avg > 59 ? Math.round((avg + Number.EPSILON) * 100) / 100 : '--';
      });
    },
    currentSemester(state): any {
      return this.semesterList.find(s => s.id == state.currentSemesterId);
    },
  },

  actions: {
    async getStudent() {
      if (this.isEmpty) {
        const data = await client.currentStudent();
        this.student = data;
      }
      return this.student;
    },

    async getAcademicRecords() {
      if (this.isAcademicRecordEmpty) {
        const data = await client.academicRecords();
        if (data && data.reports) {
          this.academicRecords = data.reports.map((r: any) => {
            const parsedSemResults = semesterRegex.exec(r.label);
            return {
              ...r,
              semester: parsedSemResults?.[1] ?? r.label,
              year: parsedSemResults?.[2] ?? r.label
            };
          });
        }
      }
      return this.academicRecords;
    },

    async getCurrentSemesterId() {
      if (this.currentSemesterId > 0) return;
      const data = await client.semesterId();
      this.currentSemesterId = parseInt(data);
    },

    async getSemesterList() {
      if (this.semesterList === null || this.semesterList.length === 0) {
        const { data } = await client.http.get(RoutePath('semesterList'));
        this.semesterList = data;
      }
    },

    async getResourceLinks() {
      if (this.resourceLinks == null || this.resourceLinks.length == 0) {
        const { data } = await client.http.get(RoutePath('resourceLinksList'));
        if (data && data.length != 0) {
          this.resourceLinks = data[0].entries;
        }
      }
    },

    async getCourseEvaluationList() {
      if (this.courseEvaluationList == null || this.courseEvaluationList.length == 0) {
        const data = await client.facultyEvaluationList();
        if (data && data.length != 0) {
          this.courseEvaluationList = data;
        }
      }
      return this.courseEvaluationList;
    },

    async generatePDF(): Promise<string> {
      const data = await client.academicRecordsPDF();
      if (data instanceof Blob && window.URL.createObjectURL) {
        const fileUrl = window.URL.createObjectURL(data);
        return fileUrl;
      } else {
        throw new Error('There was an error downloading the file.');
      }
    },

    getSemesterInfoByID(semId: number): any {
      return this.semesterList.find(s => s.id == semId);
    },

    filterSemesterLabel(label: string): string {
      const parsedSemResults = semesterRegex.exec(label);
      return parsedSemResults?.[1] ?? label;
    },

    fullReset(): void {
      const scheduleStore = useClassScheduleStore();
      const clearanceStore = useClearanceStore();

      this.$reset();
      scheduleStore.$reset();
      clearanceStore.$reset();
      destroy();
    }
  }
});

const roomRegex = /(?:OL-)?((?:2nd|1st)T)/;

export const useClassScheduleStore = defineStore('class_schedule', {
  state: () => ({
    // TODO: amalgamate all data from schedule and records into single course store
    rawCourses: [] as any[],
    isAlternate: false,
    hasAlternates: false
  }),

  getters: {
    isEmpty(state): boolean {
      return state.rawCourses == null || state.rawCourses.length == 0;
    },

    days(): Record<string, string> {
      return {
        'M': 'Mon',
        'T': 'Tue',
        'W': 'Wed',
        'Th': 'Thu',
        'F': 'Fri',
        'S': 'Sat'
      };
    },

    scheduleList(state): Record<string, any[]> | null {
      if (state.rawCourses.length == 0) return null;
      let scheduleList: Record<string, any[]> = {
        'M': [],
        'T': [],
        'W': [],
        'Th': [],
        'F': [],
        'S': []
      }

      state.rawCourses.forEach((c: any) => {
        const { name, instructor, room } = c;
        // TODO: remove code. check if term is in 2nd term or not
        const termMatches = roomRegex.exec(room);
        if (termMatches && termMatches[1] && termMatches[1] !== '2ndT') return;

        const insertFn = (s: any) => {
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

        const nonAlts: any[] = c.schedules.filter(cc => !cc.isAlternate);
        const alts: any[] = c.schedules.filter(cc => cc.isAlternate);
        if (!state.hasAlternates && alts.length !== 0) {
          state.hasAlternates = true;
        }
        
        if (this.isAlternate) {
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

      // if (IS_NATIVE) {
      //   const weekday: Weekday[] = [
      //     Weekday.Monday, 
      //     Weekday.Tuesday, 
      //     Weekday.Wednesday, 
      //     Weekday.Thursday, 
      //     Weekday.Friday,
      //     Weekday.Saturday
      //   ];

      //   Object.keys(scheduleList).forEach((s, i) => {
      //     LocalNotifications.schedule({
      //       notifications: scheduleList[s].map<LocalNotificationSchema>(c => ({
      //         id: new Date().getTime(),
      //         title: `Incoming: ${c.name}`,
      //         body: `${c.fromTime}-${c.toTime}`,
      //         schedule: {
      //           on: {
      //             weekday: weekday[i],

      //           }
      //         }
      //       }))
      //     })
      //   });
      // }

      return scheduleList;
    }
  },

  actions: {
    getScheduleByDay(day: string): any[] {
      if (!this.isEmpty && this.scheduleList) {
        for (const shortDay in this.days) {
          if (this.days[shortDay] === day) {
            return this.scheduleList[shortDay];
          }
        }
      }
      return [];
    },

    async getSchedule() {
      if (this.isEmpty) {
        const studentStore = useStudentStore();
        const data = await client.classSchedule(studentStore.currentSemesterId.toString());
        const { courses } = data;
        this.rawCourses = courses;
      }
      return this.scheduleList;
    },

    async generatePDF(): Promise<string> {
      const studentStore = useStudentStore();
      const data = await client.classSchedulePDF((studentStore.currentSemesterId - 1).toString());
      if (data instanceof Blob && window.URL.createObjectURL) {
        const fileUrl = window.URL.createObjectURL(data);
        return fileUrl;
      } else {
        throw new Error('There was an error downloading the file.');
      }
    },
  }
});

export const useClearanceStore = defineStore('student_clearance', {
  state: () => ({
    data: {} as Record<string, any>
  }),

  getters: {
    isEmpty(state) {
      return state.data == null || Object.keys(state.data).length == 0;
    },

    isCleared(state) {
      if (this.isEmpty) return false;

      for (const item of state.data.items) {
        if (item.status === 'not_cleared') return false;
      }

      return true;
    }
  },

  actions: {
    async getClearance() {
      if (this.isEmpty) {
        const studentStore = useStudentStore();
        const data = await client.clearance((studentStore.currentSemesterId - 1).toString());
        this.data = data;
      }
      return this.data;
    },

    async generatePDF(): Promise<string> {
      const studentStore = useStudentStore();
      const data = await client.clearancePermitPDF((studentStore.currentSemesterId - 1).toString());
      if (window.URL.createObjectURL) {
        const fileUrl = window.URL.createObjectURL(data);
        return fileUrl;
      } else {
        throw new Error('There was an error downloading the file.');
      }
    },
  }
});