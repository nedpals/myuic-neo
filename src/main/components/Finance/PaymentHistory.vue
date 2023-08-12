<template>
  <loading-container :is-loading="isLoading" v-slot="{ isLoading }">
    <box :title="!isRecent ? 'Payment History' : 'Recent Payments'">
      <template v-if="paymentHistory.length !== 0">
        <div class="flex flex-col divide-y dark:divide-primary-600" :class="{ 'pb-2': hasLink }">
          <div
            v-for="(entry, i) in paymentHistory"
            :key="'paymentHistory_' + i">
            <div
              @click="() => selectedIdx = i"
              :class="{ 'hover:bg-zinc-100 dark:hover:bg-primary-700 transition-colors': !isLoading }"
              class="flex justify-between items-center rounded-lg -mx-3 px-3 py-3 cursor-pointer">
              <div>
                <skeleton :delay="i * 250" :custom-class="isShort ? 'bg-zinc-200 h-3.5 w-24' : 'w-16 h-4 bg-zinc-200 mb-2'">
                  <p class="font-semibold">{{ formattedAmount(entry) }}</p>
                </skeleton>
                <skeleton :delay="i * 250" v-if="!isShort" custom-class="w-8 h-3.5 bg-zinc-200">
                  <p class="text-sm">{{ entry.cashier }}</p>
                </skeleton>
              </div>
              <div :class="[isLoading ? 'space-y-2 flex flex-col items-end' : 'text-right']">
                <skeleton :delay="i * 250" :custom-class="isShort ? 'bg-zinc-200 h-3.5 w-16' : 'w-16 h-4 bg-zinc-200'">
                  <span class="text-zinc-600 dark:text-primary-200 block">
                    {{ isShort ? formattedPaidAt(entry) : humanizedPaidAt(entry) }}
                  </span>
                </skeleton>
                <skeleton :delay="i * 250" v-if="!isShort" custom-class="bg-zinc-200 w-8 h-3.5">
                  <span class="text-sm block">{{ paymentOr(entry) }}</span>
                </skeleton>
              </div>
            </div>
          </div>
        </div>
        <skeleton v-if="hasLink" custom-class="h-4 w-26 bg-primary-400">
          <router-link
            :to="{ name: 'finance' }"
            class="hover:underline text-primary-500 dark:text-primary-200">
            See full list
          </router-link>
        </skeleton>
      </template>

      <div v-else class="py-4 w-full text-center">
        <span class="text-zinc-400 dark:text-primary-300 text-2xl text-center">No history.</span>
      </div>
    </box>

    <modal-window
      v-if="selectedIdx !== -1"
      open
      :key="'selectedPaymentHistory_' + selectedIdx"
      @update:open="() => selectedIdx = -1"
      content-class="px-6 py-4 h-[80vh] md:h-[unset]"
      title="Payment Details">
      <div v-if="!isLoading" class="flex flex-col divide-y dark:divide-primary-600">
        <div class="pl-0 pb-4 text-center">
          <skeleton custom-class="w-16 h-4 bg-zinc-200 mb-2">
            <p class="text-lg mb-1">Amount</p>
          </skeleton>
          <skeleton custom-class="w-8 h-3.5 bg-zinc-200">
            <p class="font-semibold text-4xl">{{ formattedAmount(selected) }}</p>
          </skeleton>
        </div>
        <div class="flex flex-col divide-y dark:divide-primary-600">
          <div class="flex justify-between py-2">
            <p>OR Number</p>
            <p class="font-bold">{{ paymentOr(selected) }}</p>
          </div>
          <div class="flex justify-between py-2">
            <p>Cashier</p>
            <p class="font-bold">{{ selected.cashier }}</p>
          </div>
          <div class="flex justify-between py-2">
            <p>Date Paid</p>
            <p class="font-bold">{{ humanizedPaidAt(selected) }}</p>
          </div>
        </div>
      </div>
    </modal-window>
  </loading-container>
</template>

<script lang="ts" setup>
import { useFinancialRecordQuery } from '../../stores/financialStore';
import Skeleton from '../ui/Skeleton.vue';
import Box from '../ui/Box.vue';
import LoadingContainer from '../ui/LoadingContainer.vue';
import { inject, ref, computed } from 'vue';
import { currentSemesterIdKey } from '../../stores/studentStore';
import ModalWindow from '../ui/ModalWindow.vue';

const { isRecent, limit } = defineProps({
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
});

const currentSemesterId = inject(currentSemesterIdKey);
const { isLoading, humanizedPaidAt, paymentOr, formattedAmount, formattedPaidAt, getPaymentHistory } = useFinancialRecordQuery(currentSemesterId!);
const paymentHistory = getPaymentHistory(limit);
const selectedIdx = ref(-1);
const selected = computed(() => paymentHistory.value[selectedIdx.value]);
</script>
