import { defineStore } from 'pinia';
import { client } from '../client';
import { nameCase } from '@foundernest/namecase';
import { destroy } from '../auth';
import { RoutePath } from '@myuic-api/types';

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
      this.$reset();
      destroy();
    }
  }
});
