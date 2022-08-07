<template>
  <modal-window :ref="(modalWindow as any)" content-class="max-h-[93vh] overflow-y-auto" title="New Payment">
    <div style="transition: height 150ms ease">
      <div v-if="currentIdx === 0" class="p-4 flex flex-col space-y-2">
        <button @click="amount = 5000; currentIdx++" class="p-4 shadow w-full border border-primary-500 hover:bg-gray-100 rounded-lg bg-gray flex items-center justify-between">
          <div class="text-left">
            <h3 class="font-bold">I would like to pay my enrollment downpayment</h3>
            <p class="text-gray-500">Assumes that you will be paying {{ pesoFormatter.format(5000) }}</p>
          </div>
          <icon-chevron-right class="text-primary-500" />
        </button>

        <button @click="amount = rawAccountBalance; currentIdx++" class="p-4 shadow w-full border border-primary-500 hover:bg-gray-100 rounded-lg bg-gray flex items-center justify-between">
          <div class="text-left">
            <h3 class="font-bold">I would like to settle my remaining balance</h3>
            <p class="text-gray-500">Assumes that you will be paying {{ pesoFormatter.format(rawAccountBalance) }}</p>
          </div>
          <icon-chevron-right class="text-primary-500" />
        </button>

        <button @click="currentIdx++" class="p-4 shadow w-full border border-primary-500 hover:bg-gray-100 rounded-lg bg-gray flex items-center justify-between">
          <div class="text-left">
            <h3 class="font-bold">I would like to pay a specific amount</h3>
          </div>
          <icon-chevron-right class="text-primary-500" />
        </button>
      </div>

      <form :ref="(newPaymentForm as any)" v-else-if="currentIdx === 1" class="px-4 py-2 flex flex-col space-y-2">
        <div class="form-control">
          <label class="mb-4" for="amount">Enter amount:</label>
          <input type="number" min="100" id="amount" class="text-2xl w-full" name="amount" v-model="amount" />

          <p class="hint-text" v-if="paymentCenters[paymentMethodIdx].note">NOTE: {{ paymentCenters[paymentMethodIdx].note!(amount) }}</p>
        </div>

        <div class="form-control">
          <label for="campus_branch">Branch</label>
          <select name="campus_branch" id="campus_branch" v-model="campusBranchIdx">
            <option v-for="(b, bIdx) in campusBranches" :value="bIdx">{{ b }}</option>
          </select>
        </div>

        <div class="mt-4">
          <radio-group class="form-control" v-model="paymentMethodIdx">
            <radio-group-label>Payment Method</radio-group-label>

            <div class="flex flex-wrap -mx-1">
              <radio-group-option
                class="w-1/2 md:w-1/3 p-1"
                :key="`payment_center_${pci}`"
                v-for="(pc, pci) in paymentCenters" 
                :value="pci"
                v-slot="{ checked }">
                <div 
                  :class="[checked ? 'border-primary-400 hover:border-primary-500' : 'hover:border-primary-400']" 
                  class="border-2 rounded-lg px-2 py-3 cursor-pointer flex flex-row md:flex-col items-center justify-center">
                  <component 
                    :is="pc.icon" 
                    class="text-xl <md:mr-2 md:text-3xl md:mb-2 md:mt-1"
                    :class="{ 'text-primary-600': checked }" />
                  <span class="text-center font-semibold text-sm block">{{ pc.name }}</span>
                </div>
              </radio-group-option>
            </div>
          </radio-group>
        </div>
      </form>

      <component 
        v-else-if="currentIdx === 2" 
        :is="paymentCenters[paymentMethodIdx].component" />
    </div>
    
    <template #footer>
      <div class="w-full justify-end flex space-x-2" v-if="currentIdx !== 0">
        <Button v-if="formState !== 'success'" @click="currentIdx--" class="px-6" text="Prev" />
        <Button theme="primary" v-if="formState !== 'success'" @click="currentIdx++" class="px-6" text="Next" />
        <Button theme="primary" v-else @click="modalWindow?.$emit('update:open', false)" class="px-6" text="Close" />
      </div>
    </template>
  </modal-window>
</template>

<script lang="ts" setup>
import { pesoFormatter } from '../../utils';
import { currentSemesterIdKey, useStudentQuery } from '../../stores/studentStore';
import IconChevronRight from '~icons/ion/chevron-right';
import ModalWindow from '../ui/ModalWindow.vue';
import Button from '../ui/Button.vue';
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue';
import { ComponentPublicInstance, DefineComponent, FunctionalComponent, inject, ref, SVGAttributes } from 'vue';
import { useFinancialRecordQuery } from '../../stores/financialStore';

// Payment Center Logo Icons
import IconAUB from '~icons/payment-center-logos/aub';
import IconBDO from '~icons/payment-center-logos/bdo';
import IconCebuana from '~icons/payment-center-logos/cebuana';
// import IconGcash from '~icons/payment-center-logos/gcash';
import IconMetrobank from '~icons/payment-center-logos/metrobank';
import IconML from '~icons/payment-center-logos/ml';
import IconPaymaya from '~icons/payment-center-logos/paymaya';
import IconRD from '~icons/payment-center-logos/rd';
import IconSM from '~icons/payment-center-logos/sm';

// Payment Center Screens
import ScreenSM from './PaymentMethods/SM.vue';

const { query: { data: student } } = useStudentQuery();
const newPaymentForm = ref<HTMLFormElement | null>(null);
const modalWindow = ref<InstanceType<typeof ModalWindow> | null>(null);
const formState = ref<'none' | 'processing' | 'success' | 'failed'>('none')
const currentSemesterId = inject(currentSemesterIdKey);
const { rawAccountBalance } = useFinancialRecordQuery(currentSemesterId!);
const currentIdx = ref(0);
const amount = ref(0);
const paymentMethodIdx = ref(0);
const campusBranchIdx = ref(0);

interface PaymentCenter {
  name: string
  icon: FunctionalComponent<SVGAttributes, {}>
  note?: (amount: number) => string
  charge?: (amount: number) => number
  component: InstanceType<any>
}

const campusBranches = [
  'Fr. Selga Main Campus',
  'Bonifacio Campus',
  'Bajada Campus',
]

const paymentCenters: PaymentCenter[] = [
  {name: 'Asia United Bank', icon: IconAUB, component: ScreenSM},
  {name: 'BDO Network Bank', icon: IconBDO, component: ScreenSM},
  {name: 'Cebuana Lhullier', icon: IconCebuana, component: ScreenSM},
  // {name: 'GCash', icon: IconGcash},
  {
    name: 'Metrobank', 
    icon: IconMetrobank, 
    note: () => `Metrobank Online App payments will deduct ${pesoFormatter.format(10)} and over-the-counter (OTC) payments will deduct ${pesoFormatter.format(50)} to your amount.`,
    charge: () => 10, 
    component: ScreenSM
  },
  {name: 'MLhuillier', icon: IconML, component: ScreenSM},
  {
    name: 'Maya', 
    icon: IconPaymaya, 
    note: (amount) => `Maya will deduct 1% or ${pesoFormatter.format(amount * 0.01)} to your amount.`,
    charge: (amount) => amount * 0.01, 
    component: ScreenSM
  },
  {
    name: 'RD Pawnshop', 
    icon: IconRD,
    note: () => `RD will deduct ${pesoFormatter.format(15)} to your amount as a service fee.`,
    charge: () => 15, 
    component: ScreenSM
  },
  {name: 'SM Davao / GenSan', icon: IconSM, component: ScreenSM}
];
</script>