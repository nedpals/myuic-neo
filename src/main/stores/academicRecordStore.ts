import { CourseReport } from "@myuic-api/types";
import { computed, ref, Ref } from "vue";
import { useQuery } from "@tanstack/vue-query"
import { client } from "../client";
import { useLoadingFactory } from "../utils";

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

  const { data: reportData } = query;
  const isLoading = useLoadingFactory(query);
  const isIncomplete = ref(false);

  const overallAverage = computed(() => {
    if (isLoading.value) return 0;
    // As per recommendation:
    // (Sum of all product of overall/final grade and units) / total units
    let totalUnits = 0;
    let sumOfAllProduct = 0;

    for (const s of reportData.value!.report.courses) {
      const units = (s.units ?? 0);
      totalUnits += units;

      if (!s.overallGrade) {
        isIncomplete.value = true;
      }

      sumOfAllProduct += ((s.overallGrade ?? 0) * units);
    }

    const avg = sumOfAllProduct / totalUnits;
    return avg > 59 ? Math.round((avg + Number.EPSILON) * 100) / 100 : '--';
  });

  const overallUnits = computed(() => {
    if (isLoading.value) return 0;
    return reportData.value!.report.courses.reduce((c, s) => c + (s.units ?? 0), 0);
  });

  return {
    query,
    isLoading,
    overallAverage,
    overallUnits,
    reportData,
    isIncomplete: computed(() => isIncomplete.value)
  }
}

export async function generateAcademicRecordsPDF(semesterId: string): Promise<Uint8Array> {
  const blob = await client.academicRecordPDF(semesterId);
  if (blob instanceof Blob) {
    const pdfBuf = await blob.arrayBuffer();
    return new Uint8Array(pdfBuf);
  } else {
    throw new Error('Your device does not support downloading PDF files.');
  }
}
