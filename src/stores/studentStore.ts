import { client, useClientQuery } from '../client';
import { nameCase } from '@foundernest/namecase';
import { RoutePath } from '@myuic-api/types';
import { semesterRegex } from '../utils';
import { QueryClient, useMutation, useQuery } from 'vue-query';
import { computed } from 'vue';
import { notify } from 'notiwind';

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

const fetchSemesterId = () => client.semesterId();
const fetchSemesterList = () => client.http.get(RoutePath('semesterList'));

export const prefetchSemesterId = (queryClient: QueryClient) =>
  queryClient.prefetchQuery('semester_id', fetchSemesterId);

export const prefetchSemesterList = (queryClient: QueryClient) =>
  queryClient.prefetchQuery('semester_list', fetchSemesterList);

export const useSemesterQuery = () => {
  const idQuery = useQuery('semester_id', fetchSemesterId, { initialData: () => '' });
  const listQuery = useClientQuery('semester_list', fetchSemesterList);
  const hasSemesterId = computed(() => !!idQuery.data.value);
  const semesterList = computed<any[]>(() => listQuery.data.value as any[] ?? []);
  const getSemesterInfoByID = (semId: number | string): any => semesterList.value.find(s => s.id == semId);
  const currentSemester = computed(() => semesterList.value.find(s => s.id == idQuery.data.value));

  return {
    idQuery,
    listQuery,
    hasSemesterId,
    semesterList,
    currentSemester,
    getSemesterInfoByID
  }
}

export const filterSemesterLabel = (label: string): string => {
  const parsedSemResults = semesterRegex.exec(label);
  return parsedSemResults?.[1] ?? label;
}

export const useResourceLinkQuery = () => {
  return useClientQuery(
    'resource_links',
    () => client.http.get(RoutePath('resourceLinksList')),
    {
      select: ({ data }) => data[0].entries ?? [],
    }
  );
}

export const useChangePasswordMutation = () => {
  return useMutation(
    ({ newPassword, confirmNewPassword }: { newPassword: string, confirmNewPassword: string }) => 
      client.updatePassword(newPassword, confirmNewPassword),
    {
      onSuccess: ({ message }) => {
        notify({
          type: 'success',
          text: message,
        });
      }
    }
  );
}