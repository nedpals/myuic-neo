import { CourseEvaluationEntry, EvaluationStatus, questionnaires, RoutePath } from "@myuic-api/types";
import { computed } from "vue";
import { useQuery } from "vue-query"
import { client, useClientQuery } from "../client";

export const useFacultyEvaluationQuestionnaire = () => {
  return useClientQuery<typeof questionnaires>(
    'faculty_eval_questionnaires',
    () => client.http.get(RoutePath('facultyEvaluationQuestionnaires'))
  );
};

export const useFacultyEvaluationIdsQuery = (classId: string, classType: string) => {
  return useQuery(
    ['faculty_evaluation_id', classId, classType],
    () => client.facultyEvaluationEntryId(classId, classType)
  );
}

export const useFacultyEvaluationListQuery = () => {
  return useQuery(
    'faculty_evaluation',
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

export const useFacultyEvaluationListQueryUtilities = ({ isFetching, isIdle, data }: ReturnType<typeof useFacultyEvaluationListQuery>) => {
  const isLoading = computed(() => isFetching.value || isIdle.value);
  const getEntriesByStatus = (status: EvaluationStatus) => computed(() => data.value!.filter(e => e.status === status));

  return {
    isLoading,
    getEntriesByStatus
  }
}