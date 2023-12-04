import { CourseEvaluation, CourseEvaluationEntry, EvaluationStatus, questionnaires, RoutePath } from "@myuic-api/types";
import { computed } from "vue";
import { useMutation, useQueries, useQuery } from "@tanstack/vue-query"
import { client, isGloballyEnabled, useClientQuery } from "../client";
import { useLoadingFactory } from "../utils";

export const useEvaluationQuery = (courses: {classId: string, classType: string}[]) => {
  const idQueries = useQueries({
    queries: courses.map(({ classId, classType }) => ({
      queryKey: ['evaluation_id', classId, classType],
      queryFn: () => client.facultyEvaluationEntryId(classId, classType),
      enabled: true
    }))
  })

  const questionnaireQuery = useClientQuery<typeof questionnaires>(
    ['evaluation_questionnaires'],
    () => client.http.get(RoutePath('facultyEvaluationQuestionnaires')),
    {
      enabled: computed(() => idQueries.every(q => q.isFetched))
    }
  );

  return {
    questionnaireQuery,
    idQueries
  }
}

export const useEvaluationMutation = () => {
  return useMutation((newEval: CourseEvaluation) =>
    client.http.postJson(RoutePath('facultyEvaluationSubmit'), newEval));
}

export const useEvaluationListQuery = () => {
  const query = useQuery(
    ['evaluation'],
    () => client.facultyEvaluationList(),
    {
      placeholderData: [...Array(6).keys()].map<CourseEvaluationEntry>(() => ({
        code: '',
        instructor: '',
        instructorImageUrl: '',
        name: '',
        status: 'open',
        type: 'Lab'
      })),
      enabled: isGloballyEnabled
    },
  );

  const { data } = query;
  const isLoading = useLoadingFactory(query);
  const getEntriesByStatus = (status: EvaluationStatus) => computed(() => data.value!.filter(e => e.status === status));

  return {
    query,
    isLoading,
    getEntriesByStatus
  }
}
