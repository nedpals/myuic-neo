import {avatarBaseUrl, client, useClientQuery} from '../client';
import { nameCase } from '@foundernest/namecase';
import { RoutePath } from '@myuic-api/types';
import { semesterRegex, useLoadingFactory } from '../utils';
import { QueryClient, useMutation, useQuery } from '@tanstack/vue-query';
import { computed, InjectionKey, Ref, ref, WritableComputedRef } from 'vue';
import { notify } from 'notiwind';

const fetchStudent = () => client.currentStudent();

export const prefetchStudent = (queryClient: QueryClient) =>
  queryClient.prefetchQuery(['student'], fetchStudent);

export const useStudentQuery = () => {
  const query = useQuery(['student'], fetchStudent);
  const isLoading = useLoadingFactory(query);
  const normalizedFirstName = computed(() => {
    if (isLoading.value || !query.data.value) return '';
    const splitted = query.data.value.firstName.split(' ');
    return nameCase(splitted[0]);
  });

  const avatarUrl = computed(() => {
    if (import.meta.env.DEV) {
      return '';
    }

    return `${avatarBaseUrl}/images/100x102/${query.data.value?.number ?? '0'}.jpg`;
  });

  return {
    query,
    avatarUrl,
    isLoading,
    normalizedFirstName
  }
}

const fetchAdditionalInfo = () => client.additionalInfo();
const fetchSemesterList = () => client.http.get(RoutePath('semesterList'));

export const prefetchSemesterId = (queryClient: QueryClient) =>
  queryClient.prefetchQuery(['student_additional_info'], fetchAdditionalInfo);

export const prefetchSemesterList = (queryClient: QueryClient) =>
  queryClient.prefetchQuery(['semester_list'], fetchSemesterList);

const extractSemesterInfo = (label: string) => {
  const parsedSemResults = semesterRegex.exec(label);
  return {
    semester: parsedSemResults?.[1] ?? parsedSemResults?.[3] ?? label,
    year: parsedSemResults?.[2] ?? parsedSemResults?.[4] ?? label
  }
}

export const currentSemesterIdKey: InjectionKey<WritableComputedRef<string | number | undefined>> = Symbol();

export const useAdditionalInfoQuery = (existingSemesterId?: Ref<string | number | undefined>) => {
  const infoQuery = useQuery(['student_additional_info'], fetchAdditionalInfo, { initialData: { semesterId: -1, course: '', year: '' } });
  const listQuery = useClientQuery(['semester_list'], fetchSemesterList, {
    select: (s) => {
      return s.data.map(d => ({
        ...d,
        display: extractSemesterInfo(d.label)
      })) ?? [];
    }
  });
  const hasSemesterId = computed(() => !!infoQuery.data.value && infoQuery.data.value.semesterId > 1);
  const semesterList = computed<any[]>(() => listQuery.data.value as any[] ?? []);
  const getSemesterInfoByID = (semId: number | string): any => semesterList.value.find(s => s.id == semId);
  const rawCurrentSemesterId = ref<number | string>();
  const currentSemesterId = computed<string | number | undefined>({
    get() {
      if (typeof existingSemesterId !== 'undefined') {
        return existingSemesterId.value;
      } else if (!rawCurrentSemesterId.value && infoQuery.data.value && hasSemesterId) {
        return infoQuery.data.value.semesterId;
      }
      return rawCurrentSemesterId.value;
    },
    set(newValue) {
      rawCurrentSemesterId.value = newValue;
    }
  });

  const currentSemester = computed(() => semesterList.value.find(s => s.id == currentSemesterId.value) ?? { display: { semester: '', year: '' } });

  return {
    infoQuery,
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
    ['resource_links'],
    () => client.http.get(RoutePath('resourceLinksList')),
    {
      select: ({ data }) => data[0].entries ?? [],
      enabled: true
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
