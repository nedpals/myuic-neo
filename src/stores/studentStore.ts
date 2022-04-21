import { defineStore } from 'pinia';
import { client, useClientQuery } from '../client';
import { nameCase } from '@foundernest/namecase';
import { destroy } from '../auth';
import { RoutePath } from '@myuic-api/types';
import { semesterRegex } from '../utils';
import { QueryClient, useQuery } from 'vue-query';
import { computed } from 'vue';

const fetchStudent = () => client.currentStudent();

export const prefetchStudent = (queryClient: QueryClient) => 
  queryClient.prefetchQuery('student', fetchStudent);

export const useStudentQuery = () => {
  const query = useQuery('student', fetchStudent);
  const isLoading = computed(() => query.isFetching.value || query.isIdle.value);
  const normalizedFirstName = computed(() => {
    if (isLoading.value || !query.data.value) return '';
    const splitted = query.data.value.firstName.split(' ');
    return nameCase(splitted[0]);
  });

  return {
    query,
    isLoading,
    normalizedFirstName
  }
}

export const useStudentStore = defineStore('student', {
  state: () => ({
    currentSemesterId: -1,
    academicRecords: [] as any[],
    semesterList: [] as any[],
  }),

  getters: {
    hasSemesterId(): boolean {
      return this.currentSemesterId !== -1;
    },

    currentSemester(state): any {
      return this.semesterList.find(s => s.id == state.currentSemesterId);
    },
  },

  actions: {
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

export const useResourceLinkQuery = () => {
  return useClientQuery(
    'resource_links',
    () => client.http.get(RoutePath('resourceLinksList')),
    {
      select: ({ data }) => data[0].entries ?? [],
    }
  );
}
