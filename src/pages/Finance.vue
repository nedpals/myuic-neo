<template>
  <dashboard-scaffold container-class="px-4 mx-auto w-full md:px-8 md:pt-8">
    <loading-container :is-loading="isLoading" v-slot="{ isLoading }">
      <div class="flex flex-col-reverse lg:flex-row <lg:space-y-4 lg:space-x-4">
        <div class="w-full lg:w-2/3 flex flex-col space-y-2">
          <div class="border dark:border-primary-700 rounded-lg bg-white dark:bg-primary-800 shadow pt-4">
            <div class="flex justify-between items-start px-6 pb-4">
              <span class="text-gray-500 dark:text-primary-300 mb-2 block">Monthly Dues</span>
              <div class="flex flex-col items-end">
                <p>Paid Total</p>
                <div v-if="isLoading" class="h-7.5 w-32 bg-gray-400 rounded-xl mt-2 mb-0.5 animate-pulse"></div>
                <h3 v-else class="text-3xl font-bold">{{ paidTotal }}</h3>
              </div>
            </div>

            <div class="flex flex-col">
              <self-modal-window
                :key="'monthlyDue_' + i"
                v-for="(mDue, i) in data!.monthlyDues"
                :title="isLoading ? 'Loading...' : 'Month ' + mDue.month">
                <template #default="{ openModal }">
                  <div
                    @click="openModal"
                    class="flex px-6 py-3 border-t dark:border-primary-700"
                    :class="{
                      'bg-success-50 dark:bg-success-800 hover:bg-success-100 dark:hover:bg-success-900': !isLoading && mDue.status === 'Paid',
                      'bg-warning-50 dark:bg-warning-800 hover:bg-warning-100 dark:hover:bg-warning-900': !isLoading && mDue.status === 'Partially Paid',
                      'hover:bg-gray-100 dark:hover:bg-primary-800': !isLoading && mDue.status.length === 0,
                      'cursor-pointer': !isLoading,
                      'rounded-b-lg': i === data!.monthlyDues.length - 1
                    }">
                    
                    <skeleton custom-class="w-13 h-13 -ml-1 bg-gray-400 dark:bg-primary-600 rounded-full">
                      <div class="w-16 h-16">
                        <component
                          :is="mDue.status === 'Paid' || mDue.status === 'Partially Paid' ? 'icon-paid' : 'icon-pending'"
                          class="w-full h-full -ml-2"
                          :class="{ 
                            'text-success-400': mDue.status === 'Paid', 
                            'text-warning-400': mDue.status === 'Partially Paid', 
                            'text-gray-400 dark:text-primary-600': mDue.status.length === 0 
                          }" />
                      </div>
                    </skeleton>
                    <div class="flex-1" :class="{ 'pl-4': isLoading }">
                      <div class="flex justify-between mb-1">
                        <div>
                          <skeleton custom-class="h-4 w-28 mb-2">
                            <h2 class="font-semibold">Month {{ mDue.month }}</h2>
                          </skeleton>
                          <skeleton custom-class="h-3 w-20">
                            <p :class="{ 
                              'text-success-700 dark:text-success-400': mDue.status === 'Paid', 
                              'text-amber-700 dark:text-amber-400': mDue.status === 'Partially Paid' 
                            }" class="text-sm">
                              {{ mDue.status.length ? mDue.status : 'Pending' }}
                            </p>
                          </skeleton>
                        </div>
                        <div class="text-right">
                          <skeleton custom-class="h-4 w-20 rounded-full">
                            <p>{{ moneyFormatter.format(mDue.amount - mDue.balance) }} / <span class="font-semibold">{{ moneyFormatter.format(mDue.amount) }}</span></p>
                          </skeleton>
                        </div>
                      </div>
                      <skeleton custom-class="h-3 w-full rounded-full bg-gray-200 mt-4">
                        <progress class="due-progress" :value="((mDue.amount - mDue.balance) / mDue.amount) * 100" max="100"></progress>
                      </skeleton>
                    </div>
                  </div>
                </template>

                <template #modal-content>
                  <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
                    <loader class="h-12 w-12" />
                  </div>
                  <div v-else class="flex flex-col divide-y">
                    <div class="flex pt-3">
                      <div class="w-1/2 pl-0 pb-4 text-center">
                        <skeleton custom-class="w-16 h-4 bg-gray-200 mb-2">
                          <p class="text-lg mb-1">Amount</p>
                        </skeleton>
                        <skeleton custom-class="w-8 h-3.5 bg-gray-200">
                          <p class="font-semibold text-4xl">{{ moneyFormatter.format(mDue.amount) }}</p>
                        </skeleton>
                      </div>

                      <div class="w-1/2 pl-0 pb-4 text-center">
                        <skeleton custom-class="w-16 h-4 bg-gray-200 mb-2">
                          <p class="text-lg mb-1">Balance</p>
                        </skeleton>
                        <skeleton custom-class="w-8 h-3.5 bg-gray-200">
                          <p class="font-semibold text-4xl">{{ moneyFormatter.format(mDue.balance) }}</p>
                        </skeleton>
                      </div>
                    </div>
                    <div class="flex flex-col divide-y">
                      <div class="flex justify-between py-2">
                        <p>Status</p>
                        <p class="font-bold">{{ mDue.status.length ? mDue.status : 'Pending' }}</p>
                      </div>
                      <div v-if="mDue.remarks.length" class="flex justify-between py-2">
                        <p>Remarks</p>
                        <p class="font-bold">{{ mDue.remarks }}</p>
                      </div>
                    </div>
                  </div>
                </template>
              </self-modal-window>
            </div>
          </div>

          <div class="border dark:border-primary-700 rounded-lg shadow">
            <div class="dark:border-primary-700 bg-white dark:bg-primary-800 border-b rounded-t-lg px-6 py-4">
              <div class="flex justify-between items-start">
                <span class="text-gray-500 dark:text-primary-300 mb-2 block">Assessment</span>
                <div class="text-right flex flex-col items-end">
                  <p>Total</p>
                  <skeleton 
                    custom-class="h-7.5 w-32 bg-gray-400 rounded-xl mt-2 mb-0.5 animate-pulse">
                    <h3 class="text-3xl font-bold">{{ assessmentTotal }}</h3>
                  </skeleton>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 dark:bg-primary-800 rounded-b-lg px-6 py-2">
              <div class="flex flex-col divide-y dark:divide-primary-600">
                <div :key="'breakdown_' + bKey" v-for="(bKey, bi) in breakdownKeys" class="flex flex-col py-2">
                  <div class="flex justify-between">
                    <skeleton custom-class="h-4 w-32 rounded-xl bg-gray-400">
                      <p class="mb-3">{{ breakdownLabels[bi] }}</p>
                    </skeleton>
                    <skeleton custom-class="h-4 w-24 rounded-xl bg-gray-400">
                      <p class="font-bold">
                        {{ !isLoading ? moneyFormatter.format(getBreakdownSubtotal(data!.assessments[bKey])) : '--' }}
                      </p>
                    </skeleton>
                  </div>
                  <div class="flex flex-col space-y-2">
                    <div
                      v-if="!isLoading"
                      :key="'entry_' + ai + '_' + bKey"
                      v-for="(aEntry, ai) in data!.assessments[bKey]"
                      class="flex justify-between text-sm mb-2">
                      <skeleton custom-class="h-3.5 w-24 rounded-xl">
                        <p>{{ aEntry.description }}</p>
                      </skeleton>
                      <skeleton custom-class="h-3.5 w-16 rounded-xl">
                        <p class="text-gray-600 dark:text-primary-300 font-semibold">{{ moneyFormatter.format(aEntry.amount) }}</p>
                      </skeleton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full lg:w-1/3 flex flex-col space-y-2 <lg:pb-4">
          <account-balance-widget />
          <payment-history />

          <!-- TODO: make it skeleton -->
          <new-payment-modal 
            @update:open="onPaymentFormOpenUpdate" 
            :key="'form_' + formKey"  
            v-if="!isLoading" 
            v-slot="{ openNewPaymentModal }">
            <button
              @click="openNewPaymentModal"
              class="button is-light dark:is-primary flex items-center justify-center space-x-3">
              <icon-plus class="text-primary-400 dark:text-white" />
              <span>New Payment</span>  
            </button>
          </new-payment-modal>
        </div>
      </div>
    </loading-container>
  </dashboard-scaffold>
</template>

<script lang="ts" setup>
import Box from '../components/ui/Box.vue';
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';
import NewPaymentModal from '../components/Finance/NewPaymentModal.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import PromiseLoader from '../components/ui/PromiseLoader.vue';
import SelfModalWindow from '../components/ui/SelfModalWindow.vue';
import Skeleton from '../components/ui/Skeleton.vue';
import AccountBalanceWidget from '../components/Finance/AccountBalanceWidget.vue';
import IconPlus from '~icons/ion/plus';
import IconPaid from '~icons/ion/checkmark-circle';
import IconPending from '~icons/ion/ios-circle-outline';
import Loader from '../components/ui/Loader.vue';
import { computed, inject, ref } from 'vue';
import PaymentHistory from '../components/Finance/PaymentHistory.vue';
import { getBreakdownSubtotal, useFinancialRecordQuery } from '../stores/financialStore';
import { pesoFormatter as moneyFormatter } from '../utils';
import { currentSemesterIdKey } from '../stores/studentStore';

const currentSemesterId = inject(currentSemesterIdKey);
const { query: { data }, isLoading, paidTotal, assessmentTotal } = useFinancialRecordQuery(currentSemesterId!);
const formKey = ref(0);
const breakdownKeys = computed(() => ['tuition', 'misc', 'others', 'receivables']);
const breakdownLabels = computed(() => ['Tuition', 'Miscellanous', 'Other Fees', 'Back Account']);

function onPaymentFormOpenUpdate(isOpen: boolean) {
  if (!isOpen) {
    formKey.value++;
  }
}
</script>

<style lang="postcss" scoped>
progress.due-progress {
  @apply w-full rounded-full border h-3;
}

progress.due-progress::-webkit-progress-bar {
  @apply bg-gray-100 rounded-full;
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