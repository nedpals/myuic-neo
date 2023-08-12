<template>
  <main class="flex flex-col space-y-4">
    <div>
      <div class="form-group-info">
        <p class="description">Additional information of guardian</p>
      </div>
      <div class="form-group">
        <div class="form-control w-full md:w-1/2">
          <label for="guardian_full_name">Guardian's Name</label>
          <input type="text" name="guardian_full_name" id="guardian_full_name" v-model="student.guardianInformation.name" />
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="guardian_contact_no">Guardian's Contact Number</label>
          <input type="text" name="guardian_contact_no" id="guardian_contact_no" v-model="student.guardianInformation.contactNumber" />
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="guardian_full_address">Guardian's Full Address</label>
          <input type="text" name="guardian_full_address" id="guardian_full_address" v-model="student.guardianInformation.address.address" />
        </div>
        <!-- <div class="form-control w-full md:w-1/2">
          <label for="guardian_address_city">City</label>
          <input type="text" name="guardian_address_city" id="guardian_address_city" />
        </div> -->
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { studentInjectionKey } from '../../keys';
const student = inject(studentInjectionKey)!;
</script>
