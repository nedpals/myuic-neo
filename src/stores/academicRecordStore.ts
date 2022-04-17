import { SemesterReport } from "@myuic-api/types";
import { computed } from "vue";
import { useQuery } from "vue-query"
import { client } from "../client";
import { semesterRegex } from "../utils";

export const useAcademicRecordQuery = () => {
  return useQuery(
    'academic_records',
    () => client.academicRecords(),

  );
}

export const useAcademicRecordQueryUtilities = ({ isFetching, isIdle, data }: ReturnType<typeof useAcademicRecordQuery>) => {
  const isLoading = computed(() => isFetching.value || isIdle.value);

  const extractSemesterInfo = (r: SemesterReport) => {
    const parsedSemResults = semesterRegex.exec(r.label);
    return {
      semester: parsedSemResults?.[1] ?? r.label,
      year: parsedSemResults?.[2] ?? r.label
    }
  }

  const latestAcademicRecords = computed(() => {
    return data.value?.reports.reverse() ?? [];
  })

  const overallAverages = computed(() => {
    if (isLoading.value) return [];
    return latestAcademicRecords.value.map((r: any) => {
      // As per recommendation:
      // (Sum of all product of overall/final grade and units) / total units
      let totalUnits = 0;
      let sumOfAllProduct = 0;

      for (const s of r.reports) {
        const units = (s.units ?? 0);
        totalUnits += units;
        sumOfAllProduct += ((s.overallGrade ?? 0) * units);
      }

      const avg = sumOfAllProduct / totalUnits;
      return avg > 59 ? Math.round((avg + Number.EPSILON) * 100) / 100 : '--';
    });
  });

  const overallUnits = computed(() => {
    if (isLoading.value) return [];
    return latestAcademicRecords.value.map((r) => {
      let totalUnits = 0;
      for (const s of r.reports) {
        const units = (s.units ?? 0);
        totalUnits += units;
      }
      return totalUnits;
    });
  });

  const semesterDisplayNames = computed(() => {
    return latestAcademicRecords.value.map((r) => {
      return extractSemesterInfo(r);
    });
  });

  return {
    isLoading,
    semesterDisplayNames,
    overallAverages,
    latestAcademicRecords,
    overallUnits
  }
}

export async function generateAcademicRecordsPDF(): Promise<string> {
  const data = await client.academicRecordsPDF();
  if (data instanceof Blob && window.URL.createObjectURL) {
    const fileUrl = window.URL.createObjectURL(data);
    return fileUrl;
  } else {
    throw new Error('There was an error downloading the file.');
  }
}