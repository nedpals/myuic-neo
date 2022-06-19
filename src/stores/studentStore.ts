import { client, useClientQuery } from '../client';
import { nameCase } from '@foundernest/namecase';
import { RoutePath } from '@myuic-api/types';
import { semesterRegex } from '../utils';
import { QueryClient, useMutation, useQuery } from 'vue-query';
import { computed, ComputedRef, InjectionKey, Ref, ref } from 'vue';
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

const extractSemesterInfo = (label: string) => {
  const parsedSemResults = semesterRegex.exec(label);
  return {
    semester: parsedSemResults?.[1] ?? parsedSemResults?.[3] ?? label,
    year: parsedSemResults?.[2] ?? parsedSemResults?.[4] ?? label
  }
}

export const currentSemesterIdKey: InjectionKey<ComputedRef<string | number | undefined>> = Symbol();

export const useSemesterQuery = (existingSemesterId?: Ref<string | number | undefined>) => {
  const idQuery = useQuery('semester_id', fetchSemesterId, { initialData: () => '' });
  const listQuery = useClientQuery('semester_list', fetchSemesterList, {
    select: (s) => {
      return s.data.map(d => ({
        ...d,
        display: extractSemesterInfo(d.label)
      })) ?? [];
    }
  });
  const hasSemesterId = computed(() => !!idQuery.data.value);
  const semesterList = computed<any[]>(() => listQuery.data.value as any[] ?? []);
  const getSemesterInfoByID = (semId: number | string): any => semesterList.value.find(s => s.id == semId);
  const rawCurrentSemesterId = ref<number | string>();
  const currentSemesterId = computed<string | number | undefined>({
    get() {
      if (typeof existingSemesterId !== 'undefined') {
        return existingSemesterId.value;
      } else if (!rawCurrentSemesterId.value && hasSemesterId) {
        return idQuery.data.value;
      }
      return rawCurrentSemesterId.value;
    },
    set(newValue) {
      rawCurrentSemesterId.value = newValue;
    }
  });

  const currentSemester = computed(() => semesterList.value.find(s => s.id == currentSemesterId.value) ?? { display: { semester: '', year: '' } });

  return {
    idQuery,
    listQuery,
    hasSemesterId,
    semesterList,
    currentSemester,
    currentSemesterId,
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
        }, 3000);
      }
    }
  );
}