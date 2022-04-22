import { computed } from "vue";
import { useQuery } from "vue-query";
import { client } from "../client";
import { useSemesterQuery } from "./studentStore";

export const useClearanceQuery = () => {
  const { idQuery: { data: semesterId }, hasSemesterId } = useSemesterQuery();
  const query = useQuery(
    'clearance',
    () => client.clearance(semesterId.value!),
    { enabled: hasSemesterId }
  );

  const isLoading = computed(() => query.isFetching.value || query.isIdle.value);
  const isCleared = computed(() => {
    if (isLoading.value || !query.data.value) return false;
    for (const item of query.data.value.items) {
      if (item.status === 'not_cleared') return false;
    }
    return true;
  });

  return {
    query,
    isCleared,
    isLoading
  }
}

export function generateClearancePDF() {
  const { idQuery: { data: currentSemesterId } } = useSemesterQuery();
  return useQuery(
    ['clearance_pdf', currentSemesterId.value!],
    async () => {
      if (!window.URL.createObjectURL) {
        throw new Error('Downloading PDF files is not supported.');
      }
      return client.clearancePermitPDF(currentSemesterId.value!);
    }, {
      enabled: false,
      select: window.URL.createObjectURL
    }
  );
}