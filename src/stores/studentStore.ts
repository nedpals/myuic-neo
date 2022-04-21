import { defineStore } from 'pinia';
import { client } from '../client';
import { nameCase } from '@foundernest/namecase';
import { destroy } from '../auth';
import { RoutePath } from '@myuic-api/types';
import { semesterRegex } from '../utils';

export const useStudentStore = defineStore('student', {
  state: () => ({
    student: {} as Record<string, any>,
    currentSemesterId: -1,
    academicRecords: [] as any[],
    semesterList: [] as any[],
    resourceLinks: [] as any[],
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
