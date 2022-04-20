import { CourseEvaluation, CourseEvaluationEntry, EvaluationStatus, questionnaires, RoutePath } from "@myuic-api/types";
import { notify } from "notiwind";
import { computed } from "vue";
import { useMutation, useQueries, useQuery, useQueryClient } from "vue-query"
import { client, useClientQuery } from "../client";
import { catchAndNotifyError } from "../utils";

export const useEvaluationQuery = (courses: {classId: string, classType: string}[]) => {
  const idQueries = useQueries(courses.map(({ classId, classType }) => ({
    queryKey: ['evaluation_id', classId, classType],
    queryFn: () => client.facultyEvaluationEntryId(classId, classType)
  })))
  
  const questionnaireQuery = useClientQuery<typeof questionnaires>(
    'evaluation_questionnaires',
    () => client.http.get(RoutePath('facultyEvaluationQuestionnaires')),
    {
      enabled: computed(() => idQueries.every(q => !q.isFetching && !q.isIdle))
    }
  );

  return {
    questionnaireQuery,
    idQueries
  }
}

export const useEvaluationListQuery = () => {
  return useQuery(
    'evaluation',
    () => client.facultyEvaluationList(),
    {
      placeholderData: [...Array(6).keys()].map<CourseEvaluationEntry>(() => ({
        code: '',
        instructor: '',
        instructorImageUrl: '',
        name: '',
        status: 'open',
        type: 'Lab'
      }))
    }
  );
}

export const useEvaluationMutation = () => {
  return useMutation((newEval: CourseEvaluation) => client.http.postJson(RoutePath('facultyEvaluationSubmit'), newEval), {
    onError: (err) => {
      catchAndNotifyError(err);
    }
  });
}

export const useEvaluationListQueryUtilities = ({ isFetching, isIdle, data }: ReturnType<typeof useEvaluationListQuery>) => {
  const isLoading = computed(() => isFetching.value || isIdle.value);
  const getEntriesByStatus = (status: EvaluationStatus) => computed(() => data.value!.filter(e => e.status === status));

  return {
    isLoading,
    getEntriesByStatus
  }
}