import { Assessment, PaymentDue, PaymentRecord } from "@myuic-api/types";
import { computed, Ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { client } from "../client";
import { formatDatetime, humanizeTime, pesoFormatter, useLoadingFactory } from "../utils";

export function getBreakdownSubtotal(entries: Assessment[]) {
  return entries.reduce((p, v) => p + v.amount, 0);
};

export const useFinancialRecordQuery = (semesterId: Ref<string | number | undefined>) => {
  const query = useQuery(
    ['financial_records', semesterId],
    () => client.financialRecord(semesterId.value!.toString()),
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
      enabled: computed(() => typeof semesterId.value !== 'undefined')
    }
  );

  const isLoading = useLoadingFactory(query);
  const accountBalance = computed(() => pesoFormatter.format(
    query.data.value?.monthlyDues
      .map((md) => md.balance)
      .reduce((p, v) => p + v, 0) ?? 0
  ));

  const lastUpdated = computed(() => {
    const record = query.data.value;
    if (!record || record.paymentHistory.length === 0) return '';
    return humanizeTime(record.paymentHistory[record.paymentHistory.length - 1].paidAt);
  });

  const paidTotal = computed(() => {
    return pesoFormatter.format(
      query.data.value?.monthlyDues
        .map((md: any) => md.amount - md.balance)
        .reduce((p: number, v: any) => p + v, 0) ?? 0);
  });

  const assessmentTotal = computed(() => {
    return pesoFormatter.format(
      Object.entries(query.data.value?.assessments ?? {})
        .filter(([k]) => k !== 'receivables')
        .map(([_, v]) => v)
        .reduce((p, v) => p + getBreakdownSubtotal(v), 0)
    );
  });

  const getPaymentHistory = (limit?: number) => computed(() => {
    let history = query.data.value?.paymentHistory.slice() ?? [];
    if (!isLoading.value) {
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
    isLoading,
    query
  }
}
