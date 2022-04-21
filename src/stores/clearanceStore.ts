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

export async function generateClearancePDF(): Promise<string> {
  const { idQuery: { data: currentSemesterId } } = useSemesterQuery();
  const data = await client.clearancePermitPDF(currentSemesterId.value!);
  if (window.URL.createObjectURL) {
    const fileUrl = window.URL.createObjectURL(data);
    return fileUrl;
  } else {
    throw new Error('There was an error downloading the file.');
  }
}