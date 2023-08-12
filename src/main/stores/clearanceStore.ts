import { computed, Ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { client } from "../client";
import { ClearanceItem } from "@myuic-api/types";
import { useLoadingFactory } from "../utils";

export const useClearanceQuery = (semesterId: Ref<string | number | undefined>) => {
  const query = useQuery(
    ['clearance', semesterId],
    () => client.clearance(semesterId.value!.toString()),
    {
      enabled: computed(() => typeof semesterId.value !== 'undefined'),
      placeholderData: {
        id: '',
        items: [...Array(4)].map<ClearanceItem>(it => ({
          id: 0,
          label: '',
          priority: 1,
          requirements: [],
          status: 'unknown'
        }))
      }
    }
  );

  const isLoading = useLoadingFactory(query);
  const remainingNotCleared = computed(() => {
    // Add UI for unknown number
    if (isLoading.value || !query.data.value) return -1;
    let notClearedCount = 0;
    for (const item of query.data.value.items) {
      notClearedCount += item.requirements.filter(r => r.status === 'not_cleared').length;
    }
    return notClearedCount;
  });

  const isCleared = computed(() => remainingNotCleared.value == 0);

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
