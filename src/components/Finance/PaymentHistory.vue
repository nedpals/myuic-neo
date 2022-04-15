<template>
  <loading-container :is-loading="isFetching || isIdle" v-slot="{ isLoading }">
    <box :title="!isRecent ? 'Payment History' : 'Recent Payments'">
      <div class="flex flex-col divide-y dark:divide-uic-300" :class="{ 'pb-2': hasLink }">
        <self-modal
          :key="'paymentHistory_' + i"
          content-class="px-6 py-4 <md:h-[80vh]"
          v-for="(pEntry, i) in paymentHistory"
          title="Payment Details">
          <template #default="{ openModal }">
            <div
              @click="openModal"
              :class="{ 'hover:bg-gray-100 dark:hover:bg-uic-700': !isLoading }"
              class="flex justify-between items-center rounded-lg -mx-3 px-3 py-3 cursor-pointer">
              <div>
                <skeleton :custom-class="isShort ? 'bg-gray-200 h-3.5 w-24' : 'w-16 h-4 bg-gray-200 mb-2'">
                  <p class="font-semibold">{{ formattedAmount(pEntry) }}</p>
                </skeleton>
                <skeleton v-if="!isShort" custom-class="w-8 h-3.5 bg-gray-200">
                  <p class="text-sm">{{ pEntry.cashier }}</p>
                </skeleton>
              </div>
              <div :class="[isLoading ? 'space-y-2 flex flex-col items-end' : 'text-right']">
                <skeleton :custom-class="isShort ? 'bg-gray-200 h-3.5 w-16' : 'w-16 h-4 bg-gray-200'">
                  <span class="text-gray-600 dark:text-uic-200 block">
                    {{ isShort ? formattedPaidAt(pEntry) : humanizedPaidAt(pEntry) }}
                  </span>
                </skeleton>
                <skeleton v-if="!isShort" custom-class="bg-gray-200 w-8 h-3.5">
                  <span class="text-sm block">{{ paymentOr(pEntry) }}</span>
                </skeleton>
              </div>
            </div>
          </template>
          <template #modal-content>
            <div v-if="!isLoading" class="flex flex-col divide-y">
              <div class="pl-0 pb-4 text-center">
                <skeleton custom-class="w-16 h-4 bg-gray-200 mb-2">
                  <p class="text-lg mb-1">Amount</p>
                </skeleton>
                <skeleton custom-class="w-8 h-3.5 bg-gray-200">
                  <p class="font-semibold text-4xl">{{ formattedAmount(pEntry) }}</p>
                </skeleton>
              </div>
              <div class="flex flex-col divide-y">
                <div class="flex justify-between py-2">
                  <p>OR Number</p>
                  <p class="font-bold">{{ paymentOr(pEntry) }}</p>
                </div>
                <div class="flex justify-between py-2">
                  <p>Cashier</p>
                  <p class="font-bold">{{ pEntry.cashier }}</p>
                </div>
                <div class="flex justify-between py-2">
                  <p>Date Paid</p>
                  <p class="font-bold">{{ humanizedPaidAt(pEntry) }}</p>
                </div>
              </div>
            </div>
          </template>
        </self-modal>
      </div>
      <skeleton v-if="hasLink" custom-class="h-4 w-26 bg-uic-400">
        <router-link
          :to="{ name: 'finance' }"
          class="hover:underline text-uic-500 dark:text-uic-200">
          See full list
        </router-link>
      </skeleton>
    </box>
  </loading-container>
</template>

<script lang="ts">
import { useFinancialRecordQuery, useFinancialRecordQueryUtilities } from '../../stores/financialStore';
import Skeleton from '../ui/Skeleton.vue';
import Box from '../ui/Box.vue';
import SelfModal from '../ui/SelfModal.vue';
import LoadingContainer from '../ui/LoadingContainer.vue';
import { computed } from 'vue';

export default {
  components: { Skeleton, Box, SelfModal, LoadingContainer },
  props: {
    isRecent: {
      type: Boolean,
      default: false
    },
    isShort: {
      type: Boolean,
      default: false
    },
    hasLink: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number
    }
  },

  setup({ isRecent, limit }) {
    const financialRecordQuery = useFinancialRecordQuery();
    const { isFetching, isIdle } = financialRecordQuery;
    const { humanizedPaidAt, paymentOr, formattedAmount, formattedPaidAt, getPaymentHistory } = useFinancialRecordQueryUtilities(financialRecordQuery);
    const paymentHistory = computed(() => getPaymentHistory(isRecent, limit));
    
    return {
      humanizedPaidAt,
      paymentOr,
      formattedAmount,
      formattedPaidAt,
      isFetching,
      isIdle,
      paymentHistory
    }
  }
}
</script>