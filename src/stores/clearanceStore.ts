import { computed } from "vue";
import { useQuery } from "vue-query";
import { client } from "../client";
import { useStudentStore } from "./studentStore";

export const useClearanceQuery = () => {
  const studentStore = useStudentStore();
  const semesterId = studentStore.currentSemesterId;

  return useQuery(
    'clearance',
    () => client.clearance(semesterId.toString()),
    {
      enabled: studentStore.hasSemesterId
    }
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
  const studentStore = useStudentStore();
  const data = await client.clearancePermitPDF(studentStore.currentSemesterId.toString());
  if (window.URL.createObjectURL) {
    const fileUrl = window.URL.createObjectURL(data);
    return fileUrl;
  } else {
    throw new Error('There was an error downloading the file.');
  }
}