<template>
  <slot :openNewPaymentModal="openNewPaymentModal"></slot>

  <modal-window :open="open" @update:open="setOpenState" content-class="max-h-[93vh] overflow-y-auto" title="New Payment">
    <loading-container :isLoading="formState == 'processing'" v-slot="{ isLoading }">
      <div v-if="isLoading" class="flex justify-center py-8">
        <loader class="h-14 w-14" />
      </div>

      <template v-else>
        <template v-if="formState == 'success' || formState == 'failed'">
          <div class="flex flex-col items-center text-center pb-8">
            <component
              :is="formState == 'success' ? 'icon-checkmark-circle-outline' : 'icon-close-circle-outline'"
              :class="[formState == 'success' ? 'text-success-400' : 'text-danger-400']"
              class="h-42 w-42 mb-2" />
            
            <h2 class="font-semibold text-4xl mb-3">{{ formState == 'success' ? 'Success!' : 'Something went wrong.' }}</h2>
            <p class="text-lg">{{ formState == 'success' ? 'Payment details were submitted. You will be notified shortly.' : 'There was an issue while submitting. Please try again.' }}</p>
          </div>
        </template>

        <template v-else-if="formState == 'none'">
          <notification-container
            type="info"
            text="Not functional at this moment. For demonstration purposes only."
            />
          <notification-container type="warning">
            <ol class="list-decimal pl-2">
              <li>Your submission is still subject for review and verification.</li>
              <li>Only upon verification shall your payment be processed and entered into the school information system.</li>
              <li>You certify that your submitted documents online are authentic.</li>
            </ol>
          </notification-container>
          <form @submit="(e) => submitForm(e as SubmitEvent)" ref="newPaymentForm" class="px-4 py-3">
            <div class="form-control">
              <label for="purpose">Purpose</label>
              <textarea
                type="text"
                name="purpose"
                id="purpose"
                required />
            </div>
            <div class="form-control">
              <label for="amount_paid">Amount Paid</label>
              <input
                type="text"
                placeholder="etc. 10000 for P10,000"
                name="amount_paid"
                id="amount_paid"
                required />
            </div>
            <radio-group class="form-control" v-model="miscData.paymentMethod">
              <radio-group-label>Payment Method</radio-group-label>

              <div class="flex flex-wrap -mx-1">
                <radio-group-option
                  class="w-1/2 md:w-1/3 p-1"
                  :key="'payment_center' + pci"
                  v-for="(pc, pci) in paymentCenters" 
                  :value="pc"
                  v-slot="{ checked }">
                  <div 
                    :class="[checked ? 'border-primary-400 hover:border-primary-500' : 'hover:border-primary-400']" 
                    class="border-2 rounded-lg px-2 py-3 cursor-pointer flex flex-row md:flex-col items-center justify-center">
                    <component 
                      :is="paymentCenterIcons[pc]" 
                      class="text-xl <md:mr-2 md:text-3xl md:mb-2 md:mt-1"
                      :class="{ 'text-primary-600': checked }" />
                    <span class="text-center font-semibold text-sm block">{{ pc }}</span>
                  </div>
                </radio-group-option>
              </div>
            </radio-group>
            <div class="form-control">
              <!-- TODO: Change this depending on the payment method -->
              <label for="receipt_number">Payment Slip / Receipt Number</label>
              <input
                type="text"
                name="receipt_number"
                id="receipt_number" required />
            </div>
            <div class="form-control">
              <label for="file_proof_of_payment">Proof of Payment</label>
              <input
                type="file"
                name="file_proof_of_payment"
                id="file_proof_of_payment"
                accept=".zip,.rar,.7zip, .pdf, image/*"
                capture="user">
            </div>
            <!-- Hidden stuff that should be automatically filled out -->
            <input type="hidden" name="student_id" :value="student?.number" />
            <input type="hidden" name="first_name" :value="student?.firstName" />
            <input type="hidden" name="middle_name" :value="student?.middleName" />
            <input type="hidden" name="last_name" :value="student?.lastName" />
            <input type="hidden" name="email" :value="student?.email" />
            <input type="hidden" name="contact_number" :value="student?.contactNumber" />
            <input type="hidden" name="department" :value="higherEducationDepartmentId" />
            <input type="hidden" name="payment_center" :value="miscData.paymentMethod" />
            <div class="form-control pt-8">
              <p class="text-gray-500 dark:text-primary-200">
                By clicking "Submit", I acknowledge that I have read, understood, and agreed to the terms and conditions for the processing of my payment.
              </p>
            </div>
          </form>
        </template>

      </template>
    </loading-container>
    
    <template #footer>
      <div class="flex">
        <button v-if="formState !== 'success'" @click="triggerSubmitForm" class="button is-primary ml-auto px-6">
          Submit
        </button>
        <button v-else @click="setOpenState(false)" class="button is-primary ml-auto px-6">
          Close
        </button>
      </div>
    </template>
  </modal-window>
</template>

<script lang="ts" setup>
import { useStudentQuery } from '../../stores/studentStore'
import Loader from '../ui/Loader.vue';
import LoadingContainer from '../ui/LoadingContainer.vue';
import ModalWindow from '../ui/ModalWindow.vue';
import NotificationContainer from '../ui/NotificationContainer.vue';
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue';
import { reactive, ref, defineEmits } from 'vue';

// Payment Center Logo Icons
import IconAUB from '~icons/payment-center-logos/aub';
import IconBDO from '~icons/payment-center-logos/bdo';
import IconCebuana from '~icons/payment-center-logos/cebuana';
import IconGcash from '~icons/payment-center-logos/gcash';
import IconMetrobank from '~icons/payment-center-logos/metrobank';
import IconML from '~icons/payment-center-logos/ml';
import IconPaymaya from '~icons/payment-center-logos/paymaya';
import IconRD from '~icons/payment-center-logos/rd';
import IconSM from '~icons/payment-center-logos/sm';

const { query: { data: student } } = useStudentQuery();
const newPaymentForm = ref<HTMLFormElement | null>(null);

const emit = defineEmits(['update:open']);
const open = ref(false);
const formState = ref<'none' | 'processing' | 'success' | 'failed'>('none')
const miscData = reactive({
  paymentMethod: 'Asia United Bank'
});

const paymentCenters = [
  'Asia United Bank',
  'BDO Network Bank',
  'Cebuana Lhullier',
  'GCash',
  'Metrobank',
  'MLhuillier',
  'PayMaya',
  'RD Pawnshop',
  'SM'
];

const paymentCenterIcons = {
  'Asia United Bank': IconAUB,
  'BDO Network Bank': IconBDO,
  'Cebuana Lhullier': IconCebuana,
  'GCash': IconGcash,
  'Metrobank': IconMetrobank,
  'MLhuillier': IconML,
  'PayMaya': IconPaymaya,
  'RD Pawnshop': IconRD,
  'SM': IconSM
}

// TODO: support basic ed and techvoc
const higherEducationDepartmentId = 1;

function openNewPaymentModal() {
  setOpenState(true);
}

function setOpenState(ev: boolean) {
  open.value = ev;
  emit('update:open', ev);
}

function triggerSubmitForm(_e: Event) {
  newPaymentForm.value?.requestSubmit();
}

function submitForm(e: SubmitEvent) {
  e.preventDefault();
  formState.value = 'processing';

  setTimeout(() => {
    formState.value = 'success';
    setTimeout(() => {
      formState.value = 'none';
      setOpenState(false);
    }, 1500);
  }, 1000);
}
</script>