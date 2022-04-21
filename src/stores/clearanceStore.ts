import { computed } from "vue";
import { useQuery } from "vue-query";
import { client } from "../client";
import { useSemesterQuery } from "./studentStore";

export const useClearanceQuery = () => {
  const { idQuery: { data: semesterId }, hasSemesterId } = useSemesterQuery();
  return useQuery(
    'clearance',
    () => client.clearance(semesterId.value!),
    { enabled: hasSemesterId }
  );
}

export const useClearanceQueryUtilities = ({ isFetching, isIdle, data }: ReturnType<typeof useClearanceQuery>) => {
  const isLoading = computed(() => isFetching.value || isIdle.value);

  const isCleared = computed(() => {
    if (isLoading.value || !data.value) return false;

    for (const item of data.value.items) {
      if (item.status === 'not_cleared') return false;
    }

    return true;
  });


  return {
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