import { Assessment, PaymentDue, PaymentRecord } from "@myuic-api/types";
import { computed } from "vue";
import { useQuery } from "vue-query";
import { client } from "../client";
import { formatDatetime, humanizeTime, pesoFormatter } from "../utils";
import { useStudentStore } from "./studentStore";

export const useFinancialRecordQuery = () => {
  const studentStore = useStudentStore();
  return useQuery(
    'financial_records', 
    () => client.financialRecord(
      studentStore.currentSemesterId.toString()
    ), 
    {
      placeholderData: {
        assessments: {
          misc: Array(4).map<Assessment>(() => ({
            amount: 0,
            amount_paid: 0,
            balance: 0,
            description: '',
            priority: 1,
            type: 'misc'
          })),
          others: Array(3).map<Assessment>(() => ({
            amount: 0,
            amount_paid: 0,
            balance: 0,
            description: '',
            priority: 1,
            type: 'others'
          })),
          receivables: Array(8).map<Assessment>(() => ({
            amount: 0,
            amount_paid: 0,
            balance: 0,
            description: '',
            priority: 1,
            type: 'receivables'
          })),
          tuition: Array(8).map<Assessment>(() => ({
            amount: 0,
            amount_paid: 0,
            balance: 0,
            description: '',
            priority: 1,
            type: 'tuition'
          }))
        },
        monthlyDues: Array(5).map<PaymentDue>((_, i) => ({
          amount: 0,
          balance: 0,
          month: i,
          remarks: '',
          semesterId: 0,
          status: ''
        })),
        paymentHistory: Array(3).map<PaymentRecord>(() => ({
          amount: 0,
          cashier: '',
          orNo: '',
          orSig: '',
          paidAt: new Date()
        }))
      },
      enabled: studentStore.hasSemesterId
    }
  );
};

export function getBreakdownSubtotal(entries: Assessment[]) {
  return entries.reduce((p, v) => p + v.amount, 0);
};

export const useFinancialRecordQueryUtilities = ({ data, isFetching, isIdle }: ReturnType<typeof useFinancialRecordQuery>) => {
  const isLoading = computed(() => isFetching.value || isIdle.value);

  const accountBalance = computed(() => pesoFormatter.format(
    data.value?.monthlyDues
      .map((md) => md.balance)
    . reduce((p, v) => p + v, 0) ?? 0
  ));

  const lastUpdated = computed(() => {
    const record = data.value;
    if (!record || record.paymentHistory.length === 0) return '';
    return humanizeTime(record.paymentHistory[record.paymentHistory.length - 1].paidAt);
  });

  const paidTotal = computed(() => {
    return pesoFormatter.format(
      data.value?.monthlyDues
        .map((md: any) => md.amount - md.balance)
        .reduce((p: number, v: any) => p + v, 0) ?? 0);
  });

  const assessmentTotal = computed(() => {
    return pesoFormatter.format(
      Object.values(data.value?.assessments ?? {})
        .reduce((p, v) => p + getBreakdownSubtotal(v), 0)
    );
  });

  const getPaymentHistory = (isRecent: boolean, limit?: number) => computed(() => {
    let history = data.value?.paymentHistory.slice() ?? [];
    if (!isLoading.value && isRecent) {
      history = history.sort((a, b) => {
        return (<string> <unknown> b.paidAt).localeCompare(<string> <unknown> a.paidAt);
      });
    }
    return history.slice(0, limit ?? history.length) ?? [];
  });

  const paymentOr = (pr: PaymentRecord) => `${pr.orNo}-${pr.orSig}`;
  const humanizedPaidAt = (pr: PaymentRecord) => humanizeTime(pr.paidAt);
  const formattedPaidAt = (pr: PaymentRecord) => formatDatetime(pr.paidAt, 'MMMM d, yyyy');
  const formattedAmount = (pr: PaymentRecord) => pesoFormatter.format(pr.amount);

  return {
    accountBalance,
    lastUpdated,
    paidTotal,
    assessmentTotal,
    getPaymentHistory,
    paymentOr,
    humanizedPaidAt,
    formattedPaidAt,
    formattedAmount,
    isLoading
  }
}