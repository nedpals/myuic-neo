import { computed, Ref } from "vue";
import { useQuery } from "vue-query";
import { client } from "../client";

export const useClearanceQuery = (semesterId: Ref<string | number | undefined>) => {
  const query = useQuery(
    ['clearance', semesterId],
    () => client.clearance(semesterId.value!.toString()),
    { enabled: computed(() => typeof semesterId.value !== 'undefined') }
  );

  const isLoading = computed(() => query.isFetching.value || query.isIdle.value);

  const remainingNotCleared = computed(() => {
    // Add UI for unknown number
    if (isLoading.value || !query.data.value) return -1;
    let notClearedCount = 1;

    for (const item of query.data.value.items) {
      if (item.status === 'not_cleared') {
        notClearedCount++;
      }
    }
    return notClearedCount;
  });

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
    isLoading,
    remainingNotCleared
  }
}

export function generateClearancePDF(semesterId: Ref<string | number | undefined>) {
  return useQuery(
    ['clearance_pdf', semesterId],
    async () => {
      if (!window.URL.createObjectURL) {
        throw new Error('Downloading PDF files is not supported.');
      }
      return client.clearancePermitPDF(semesterId.value!.toString());
    }, {
      enabled: false,
      select: window.URL.createObjectURL
    }
  );
}