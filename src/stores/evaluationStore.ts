import { CourseEvaluation, CourseEvaluationEntry, CourseEvaluationEntryIDs, EvaluationStatus, questionnaires, RoutePath } from "@myuic-api/types";
import { notify } from "notiwind";
import { computed } from "vue";
import { useMutation, useQuery, useQueryClient } from "vue-query"
import { client, useClientQuery } from "../client";
import { catchAndNotifyError } from "../utils";

export const useEvaluationQuery = (classId: string, classType: string) => {
  const idQuery = useQuery<CourseEvaluationEntryIDs>(
    ['evaluation_id', classId, classType],
    () => client.facultyEvaluationEntryId(classId, classType)
  );
  
  const questionnaireQuery = useClientQuery<typeof questionnaires>(
    'evaluation_questionnaires',
    () => client.http.get(RoutePath('facultyEvaluationQuestionnaires')),
    {
      enabled: computed(() => !idQuery.isFetching.value && !idQuery.isIdle.value)
    }
  );

  return {
    questionnaireQuery,
    idQuery
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
  const queryClient = useQueryClient();

  return useMutation((newEval: CourseEvaluation) => client.http.postJson(RoutePath('facultyEvaluationSubmit'), newEval), {
    onError: (err) => {
      catchAndNotifyError(err);
    },
    onSuccess: async ({data}) => {
      notify({
        type: 'success',
        text: data.message
      }, 3000);

      await queryClient.refetchQueries({ 
          exact: true, 
          queryKey: 'evaluation' 
        });
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