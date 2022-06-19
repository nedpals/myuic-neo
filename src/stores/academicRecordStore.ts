import { AcademicRecord, CourseReport } from "@myuic-api/types";
import { computed, Ref } from "vue";
import { useQuery } from "vue-query"
import { client } from "../client";

export const useAcademicRecordsQuery = (semesterId: Ref<string | number | undefined>) => {
  const query = useQuery(
    ['academic_records', semesterId],
    () => client.academicRecord(semesterId.value!.toString()),
    {
      enabled: computed(() => typeof semesterId.value !== 'undefined'),
      placeholderData: {
        studentPermanentRecordId: '',
        report: {
          courses: [...Array(6).keys()].map<CourseReport>(() => ({
            code: '',
            finalsGrade: 90,
            midtermGrade: 90,
            name: '',
            overallGrade: 90,
            prelimGrade: 90,
            school: '',
            section: '',
            type: 'Lab',
            units: 1
          }))
        }
      }
    }
  );

  const { isFetching, isIdle, data } = query;
  const isLoading = computed(() => isFetching.value || isIdle.value);

  const latestAcademicRecords = computed(() => {
    if (!data.value) return [];
    return [data.value];
  })

  const overallAverages = computed(() => {
    if (isLoading.value) return [];
    return latestAcademicRecords.value.map((r: AcademicRecord) => {
      // As per recommendation:
      // (Sum of all product of overall/final grade and units) / total units
      let totalUnits = 0;
      let sumOfAllProduct = 0;

      for (const s of r.report.courses) {
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
      for (const s of r.report.courses) {
        const units = (s.units ?? 0);
        totalUnits += units;
      }
      return totalUnits;
    });
  });

  return {
    query,
    isLoading,
    overallAverages,
    latestAcademicRecords,
    overallUnits
  }
}

export async function generateAcademicRecordsPDF(semesterId: string): Promise<string> {
  const data = await client.academicRecordPDF(semesterId);
  if (data instanceof Blob && window.URL.createObjectURL) {
    const fileUrl = window.URL.createObjectURL(data);
    return fileUrl;
  } else {
    throw new Error('There was an error downloading the file.');
  }
}