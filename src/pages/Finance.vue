<template>
  <dashboard-scaffold container-class="px-4 mx-auto w-full md:px-5">
    <template #actions>
      <Button @click="isPaymentModalOpen = true" :icon="IconPlus" text="New Payment" />
    </template>

    <new-payment-modal
      :open="isPaymentModalOpen"
      @update:open="onPaymentFormOpenUpdate"
      :key="'form_' + formKey" />

    <loading-container :is-loading="isLoading" v-slot="{ isLoading }">
      <div class="flex flex-col-reverse lg:flex-row lg:space-x-4">
        <div class="w-full lg:w-2/3 flex flex-col space-y-2">
          <div class="border dark:border-primary-700 rounded-lg bg-white dark:bg-primary-800 shadow">
            <div class="flex border-b dark:border-primary-700">
              <button class="flex-1 px-2 pt-4 pb-3 rounded-tl-lg hover:bg-zinc-100 dark:hover:bg-primary-700" @click="isQuarterly = true">
                <span class="pb-3" :class="{'border-b-[3px] border-primary-400 font-semibold': isQuarterly}">Quarterly</span>
              </button>
              <button class="flex-1 px-2 pt-4 pb-3 rounded-tr-lg hover:bg-zinc-100 dark:hover:bg-primary-700" @click="isQuarterly = false">
                <span class="pb-3" :class="{'border-b-[3px] border-primary-400 font-semibold': !isQuarterly}">Monthly</span>
              </button>
            </div>

            <div v-if="!isLoading && duesLength === 0" class="py-8 px-8 bg-zinc-50 dark:bg-primary-800 rounded-b-lg">
              <empty-state
                :icon="IconUnknown"
                title="No dues found."
                class="w-2/3 md:w-3/4 mx-auto"
                description="Either you are not enrolled yet or there is something wrong when fetching your information." />
            </div>

            <div v-else class="flex justify-between items-start px-6 py-4">
              <span class="text-zinc-500 dark:text-primary-300 mb-2 block">{{ isQuarterly ? 'Quarterly' : 'Monthly' }} Dues</span>
              <div class="flex flex-col items-end">
                <p>Paid Total</p>
                <div v-if="isLoading" class="h-7.5 w-32 bg-zinc-400 rounded-xl mt-2 mb-0.5 animate-pulse"></div>
                <h3 v-else class="text-3xl font-bold">{{ paidTotal }}</h3>
              </div>
            </div>

            <div v-if="!isLoading && duesLength !== 0" class="flex flex-col">
              <div
                :key="'monthlyDue_' + i"
                v-for="(mDue, mDueLabel, i) in duesList"
                @click="() => selectedDueIdx = mDueLabel"
                class="flex px-6 py-3 border-t dark:border-primary-700"
                :class="{
                  'bg-success-50 dark:bg-success-800 hover:bg-success-100 dark:hover:bg-success-900': !isLoading && mDue.status === 'Paid',
                  'bg-warning-50 dark:bg-warning-800 hover:bg-warning-100 dark:hover:bg-warning-900': !isLoading && mDue.status === 'Partially Paid',
                  'hover:bg-zinc-100 dark:hover:bg-primary-800': !isLoading && mDue.status.length === 0,
                  'cursor-pointer': !isLoading,
                  'rounded-b-lg': i === duesLength - 1
                }">

                <skeleton :delay="(i + 1) * 350" custom-class="w-13 h-13 -ml-1 bg-zinc-400 dark:bg-primary-600 rounded-full">
                  <div class="w-16 h-16">
                    <component
                      :is="mDue.status === 'Paid' || mDue.status === 'Partially Paid' ? IconPaid : IconPending"
                      class="w-full h-full -ml-2"
                      :class="{
                        'text-success-400': mDue.status === 'Paid',
                        'text-warning-400': mDue.status === 'Partially Paid',
                        'text-zinc-400 dark:text-primary-600': mDue.status.length === 0
                      }" />
                  </div>
                </skeleton>
                <div class="flex-1" :class="{ 'pl-4': isLoading }">
                  <div class="flex justify-between mb-1">
                    <div>
                      <skeleton :delay="(i + 1) * 350" custom-class="h-4 w-28 mb-2">
                        <h2 class="font-semibold">{{ mDueLabel }}</h2>
                      </skeleton>
                      <skeleton :delay="(i + 1) * 350" custom-class="h-3 w-20">
                        <p :class="{
                          'text-success-700 dark:text-success-400': mDue.status === 'Paid',
                          'text-amber-700 dark:text-amber-400': mDue.status === 'Partially Paid'
                        }" class="text-sm">
                          {{ mDue.status.length ? mDue.status : 'Pending' }}
                        </p>
                      </skeleton>
                    </div>
                    <div class="text-right">
                      <skeleton :delay="(i + 1) * 350" custom-class="h-4 w-20 rounded-full">
                        <p>{{ moneyFormatter.format(mDue.amount - mDue.balance) }} / <span class="font-semibold">{{ moneyFormatter.format(mDue.amount) }}</span></p>
                      </skeleton>
                    </div>
                  </div>
                  <skeleton :delay="(i + 1) * 350" custom-class="h-3 w-full rounded-full bg-zinc-200 mt-4">
                    <progress class="due-progress" :value="((mDue.amount - mDue.balance) / mDue.amount) * 100" max="100"></progress>
                  </skeleton>
                </div>
              </div>

              <modal-window
                open
                v-if="selectedDueIdx !== null"
                :key="'selectedDue_' + selectedDueIdx"
                @update:open="() => selectedDueIdx = null"
                :title="isLoading ? 'Loading...' : (selectedDueIdx ?? 'Loading...').toString()">
                <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
                  <loader class="h-12 w-12" />
                </div>
                <div v-else class="flex flex-col divide-y">
                  <div class="flex pt-3">
                    <div class="w-1/2 pl-0 pb-4 text-center">
                      <skeleton custom-class="w-16 h-4 bg-zinc-200 mb-2">
                        <p class="text-lg mb-1">Amount</p>
                      </skeleton>
                      <skeleton :delay="350" custom-class="w-8 h-3.5 bg-zinc-200">
                        <p class="font-semibold text-4xl">{{ moneyFormatter.format(selectedDue.amount) }}</p>
                      </skeleton>
                    </div>

                    <div class="w-1/2 pl-0 pb-4 text-center">
                      <skeleton custom-class="w-16 h-4 bg-zinc-200 mb-2">
                        <p class="text-lg mb-1">Balance</p>
                      </skeleton>
                      <skeleton :delay="350" custom-class="w-8 h-3.5 bg-zinc-200">
                        <p class="font-semibold text-4xl">{{ moneyFormatter.format(selectedDue.balance) }}</p>
                      </skeleton>
                    </div>
                  </div>
                  <div class="flex flex-col divide-y">
                    <div class="flex justify-between py-2">
                      <p>Status</p>
                      <p class="font-bold">{{ selectedDue.status.length ? selectedDue.status : 'Pending' }}</p>
                    </div>
                    <div v-if="selectedDue.remarks.length" class="flex justify-between py-2">
                      <p>Remarks</p>
                      <p class="font-bold">{{ selectedDue.remarks }}</p>
                    </div>
                  </div>
                </div>
              </modal-window>
            </div>
          </div>

          <div class="border dark:border-primary-700 rounded-lg shadow">
            <div v-if="!isLoading && Object.keys(data?.assessments ?? {}).length === 0" class="flex flex-col items-center py-8 px-8 text-center bg-zinc-50 dark:bg-primary-800 text-zinc-500 dark:text-primary-300 rounded-b-lg">
              <icon-unknown class="text-9xl" />
              <p class="text-2xl font-semibold text-zinc-600 dark:text-primary-200">No assessment found.</p>
              <p class="w-full md:w-1/2 xl:w-2/3">Either you are not enrolled yet or there is something wrong when fetching your information.</p>
            </div>

            <div v-else class="dark:border-primary-700 bg-white dark:bg-primary-800 border-b rounded-t-lg px-6 py-4">
              <div class="flex justify-between items-start">
                <span class="text-zinc-500 dark:text-primary-300 mb-2 block">Assessment</span>
                <div class="text-right flex flex-col items-end">
                  <p>Total</p>
                  <skeleton
                    custom-class="h-7.5 w-32 bg-zinc-400 rounded-xl mt-2 mb-0.5 animate-pulse">
                    <h3 class="text-3xl font-bold">{{ assessmentTotal }}</h3>
                  </skeleton>
                </div>
              </div>
            </div>

            <div v-if="!isLoading && Object.keys(data?.assessments ?? {}).length !== 0" class="bg-zinc-50 dark:bg-primary-800 rounded-b-lg px-6 py-2">
              <div class="flex flex-col divide-y dark:divide-primary-600">
                <empty-state
                  v-if="breakdownKeys.length === 0"
                  :icon="IconUnknown"
                  title="No breakdown found."
                  class="w-2/3 md:w-3/4 mx-auto py-6" />

                <div :key="'breakdown_' + bKey" v-for="(bKey, bi) in breakdownKeys" class="flex flex-col py-2">
                  <div class="flex justify-between">
                    <skeleton :delay="(bi + 1) * 350" custom-class="h-4 w-32 rounded-xl bg-zinc-400">
                      <p class="mb-3">{{ breakdownLabels[bi] }}</p>
                    </skeleton>
                    <skeleton :delay="(bi + 1) * 350" custom-class="h-4 w-24 rounded-xl bg-zinc-400">
                      <p class="font-bold">
                        {{ !isLoading ? moneyFormatter.format(getBreakdownSubtotal(data!.assessments[bKey])) : '--' }}
                      </p>
                    </skeleton>
                  </div>
                  <div class="flex flex-col space-y-3">
                    <div
                      :key="'entry_' + ai + '_' + bKey"
                      v-for="(aEntry, ai) in data!.assessments[bKey]"
                      class="flex justify-between text-sm" :class="{'mt-3': isLoading}">
                      <skeleton :delay="(ai + bi + 1) * 350" custom-class="h-3.5 w-24 rounded-xl">
                        <p>{{ aEntry.description }}</p>
                      </skeleton>

                      <skeleton :delay="(ai + bi + 1) * 350" custom-class="h-3.5 w-16 rounded-xl">
                        <p class="text-zinc-600 dark:text-primary-300 font-semibold">{{ moneyFormatter.format(aEntry.amount) }}</p>
                      </skeleton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full lg:w-1/3 flex flex-col space-y-2 pb-4 lg:pb-0">
          <account-balance-widget />
          <payment-history />
        </div>
      </div>
    </loading-container>
  </dashboard-scaffold>
</template>

<script lang="ts" setup>
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';
import NewPaymentModal from '../components/Finance/NewPaymentModal.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import ModalWindow from '../components/ui/ModalWindow.vue';
import Skeleton from '../components/ui/Skeleton.vue';
import AccountBalanceWidget from '../components/Finance/AccountBalanceWidget.vue';
import IconPlus from '~icons/ion/plus';
import IconPaid from '~icons/ion/checkmark-circle';
import IconPending from '~icons/ion/ios-circle-outline';
import IconUnknown from '~icons/ion/help-circle-outline';
import Loader from '../components/ui/Loader.vue';
import Button from '../components/ui/Button.vue';
import { computed, ComputedRef, inject, Ref, ref } from 'vue';
import PaymentHistory from '../components/Finance/PaymentHistory.vue';
import { getBreakdownSubtotal, useFinancialRecordQuery } from '../stores/financialStore';
import { pesoFormatter as moneyFormatter } from '../utils';
import { currentSemesterIdKey } from '../stores/studentStore';
import { PaymentDue } from '@myuic-api/types';
import EmptyState from '../components/ui/EmptyState.vue';

const isQuarterly = ref(true);
const currentSemesterId = inject(currentSemesterIdKey);
const { query: { data }, isLoading, paidTotal, assessmentTotal } = useFinancialRecordQuery(currentSemesterId!);

const monthlyDues = computed(() => {
  return data.value?.monthlyDues.map(due => {
    return {
      ...due,
      status: due.balance === 0
        ? 'Paid' : due.balance !== due.amount
        ? 'Partially Paid' : due.status
    }
  }) ?? [];
})

const duesList: ComputedRef<Record<string, PaymentDue>> = computed(() => {
  if (!data.value || data.value.monthlyDues.length === 0 || isLoading.value) {
    return {};
  }

  if (isQuarterly.value) {
    const prelims = monthlyDues.value.slice(0, 3).reduce((prev, curr) => {
      return {
        ...prev,
        status: inferStatus(prev, curr),
        amount: prev.amount + curr.amount,
        balance: prev.balance + curr.balance,
      }
    });

    const midterms = monthlyDues.value[3];
    const finals = monthlyDues.value[4];

    return {
      'Prelims': prelims,
      'Midterms': midterms,
      'Finals': finals
    }
  }

  return monthlyDues.value.reduce<Record<string, PaymentDue>>((p, v) => {
    p[`Month ${v.month}`] = v;
    return p;
  }, {});
});
const duesLength = computed(() => Object.keys(duesList.value).length);
const formKey = ref(0);
const breakdownKeys = computed(() => {
  const keys = ['tuition', 'misc', 'others', 'receivables'];
  if (isLoading.value || !data.value) return keys;
  return keys.filter(k => data.value.assessments[k].length !== 0);
});
const breakdownLabels = computed(() => ['Tuition', 'Miscellanous', 'Other Fees', 'Back Account']);
const selectedDueIdx: Ref<number | string | null> = ref(null);
const selectedDue = computed(() => duesList.value[selectedDueIdx.value ?? '-1']);
const isPaymentModalOpen = ref(false);

function inferStatus(prev: PaymentDue, curr: PaymentDue) {
  const totalBalance = prev.balance + curr.balance;
  if (totalBalance === 0) {
    return 'Paid';
  } else if ((prev.status === 'Paid' && curr.status !== 'Paid') || (prev.status !== 'Paid' && curr.status !== 'Pending')) {
    return 'Partially Paid'
  }
  return prev.status
}

function onPaymentFormOpenUpdate(isOpen: boolean) {
  isPaymentModalOpen.value = isOpen;
  if (!isPaymentModalOpen.value) {
    formKey.value++;
  }
}
</script>

<style lang="postcss" scoped>
progress.due-progress {
  @apply w-full rounded-full border dark:border-0 h-3;
}

progress.due-progress::-webkit-progress-bar {
  @apply bg-zinc-100 rounded-full;
}

progress.due-progress::-webkit-progress-value {
  @apply bg-primary-400 rounded-full;
}

progress.due-progress[value="100"]::-webkit-progress-value {
  @apply bg-success-500;
}

progress.due-progress[value="100"]::-webkit-progress-value {
  @apply bg-success-500;
}
</style>
