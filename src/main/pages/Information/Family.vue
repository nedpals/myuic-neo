<template>
  <main class="flex flex-col space-y-4">
    <div>
      <div class="form-group">
        <div class="form-control w-full md:w-1/2">
          <label for="parents_status">Parents Status</label>
          <loading-container :is-loading="parentRelationshipStatusesQuery.isLoading" v-slot="{ isLoading }">
            <select name="monthly_family_income" id="monthly_family_income" :value="student.parentInformation.status" :disabled="isLoading">
              <option v-if="isLoading">Loading...</option>
              <option v-for="n in parentRelationshipStatusesQuery.data" :key="n" :value="n">{{ n }}</option>
            </select>
          </loading-container>
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="monthly_family_income">Monthly Family Income</label>
          <loading-container :is-loading="incomeGroupsQuery.isLoading" v-slot="{ isLoading }">
            <select name="monthly_family_income" id="monthly_family_income" :value="student.parentInformation.incomeGroup" :disabled="isLoading">
              <option v-if="isLoading">Loading...</option>
              <option v-for="n in incomeGroupsQuery.data" :key="n" :value="n">{{ n }}</option>
            </select>
          </loading-container>
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="contact_no">Contact Number</label>
          <input type="text" name="contact_no" id="contact_no" :value="student.parentInformation.contactNumber" />
        </div>
      </div>

      <h3 class="sub-form-group-title">Address</h3>
      <div class="form-group">
        <div class="form-control w-full">
          <label for="address">Full Address</label>
          <input type="text" name="address" id="address" :value="student.parentInformation.address.address" />
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="city">City</label>
          <input type="text" name="city" id="city" :value="student.parentInformation.address.city" />
        </div>
      </div>
    </div>

    <div>
      <div class="form-group-info">
        <h2 class="title">Parent Information</h2>
        <p class="description">Additional information of mother and/or father.</p>
      </div>

      <div :key="key" v-for="(label, key) in parentsKV">
        <h3 class="sub-form-group-title !text-2xl">{{ label }}</h3>
        <div class="form-group">
          <div class="form-control w-full md:w-1/2">
            <label :for="key + '_name'">Full Name</label>
            <input type="text" :name="key + '_name'" :id="key + '_name'" v-model="student.parentInformation[key].name" />
          </div>
          <div class="form-control w-full md:w-1/2">
            <label :for="key + '_educational_attainment'">Educational Attainment</label>
            <input type="text" :name="key + '_educational_attainment'" :id="key + '_educational_attainment'" v-model="student.parentInformation[key].educationalAttainment" />
          </div>
        </div>
        
        <h3 class="sub-form-group-title">Employment Information</h3>
        <div class="form-group">
          <div class="form-control w-full md:w-1/2">
            <label :for="key + '_occupation'">Occupation</label>
            <input type="text" :name="key + '_occupation'" :id="key + '_occupation'" v-model="student.parentInformation[key].occupation" />
          </div>
          <div class="form-control w-full md:w-1/2">
            <label :for="key + '_office_contact_number'">Contact Number</label>
            <input type="text" :name="key + '_office_contact_number'" :id="key + '_office_contact_number'" v-model="student.parentInformation[key].officeContactNumber" />
          </div>
          <div class="form-control w-full">
            <label :for="key + '_employment_address'">Employment Address</label>
            <input type="text" :name="key + '_employment_address'" :id="key + '_employment_address'" v-model="student.parentInformation[key].employer" />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import LoadingContainer from '../../components/ui/LoadingContainer.vue';
import { useParentRelationshipsQuery, useIncomeGroupsQuery } from '../../stores/formStore';
import { studentInjectionKey } from '../../keys';

const student = inject(studentInjectionKey)!;
const parentRelationshipStatusesQuery = useParentRelationshipsQuery();
const incomeGroupsQuery = useIncomeGroupsQuery();
const parentsKV = {
  'father': 'Father',
  'mother': 'Mother'
}
</script>