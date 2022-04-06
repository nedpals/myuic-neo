<template>
  <main class="flex flex-col space-y-4">
    <div>
      <div class="form-group">
        <div class="form-control w-full md:w-1/2">
          <label for="parents_status">Parents Status</label>
          <select name="parents_status" id="parents_status" :value="studentStore.student.parentInformation.status">
            <option v-for="s in formStore.parentRelationshipStatuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="monthly_family_income">Monthly Family Income</label>
          <select name="monthly_family_income" id="monthly_family_income" :value="studentStore.student.parentInformation.incomeGroup">
            <option v-for="ig in formStore.incomeGroups" :key="ig" :value="ig">{{ ig }}</option>
          </select>
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="contact_no">Contact Number</label>
          <input type="text" name="contact_no" id="contact_no" :value="studentStore.student.parentInformation.contactNumber" />
        </div>
      </div>

      <h3 class="sub-form-group-title">Address</h3>
      <div class="form-group">
        <div class="form-control w-full">
          <label for="address">Full Address</label>
          <input type="text" name="address" id="address" :value="studentStore.student.parentInformation.address.address" />
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="city">City</label>
          <input type="text" name="city" id="city" :value="studentStore.student.parentInformation.address.city" />
        </div>
      </div>
    </div>

    <div>
      <div class="form-group-info">
        <h2 class="title">Parent Information</h2>
      </div>

      <div :key="key" v-for="(label, key) in parents">
        <h3 class="sub-form-group-title !text-2xl">{{ label }}</h3>
        <div class="form-group">
          <div class="form-control w-full md:w-1/2">
            <label :for="key + '_name'">Full Name</label>
            <input type="text" :name="key + '_name'" :id="key + '_name'" />
          </div>
          <div class="form-control w-full md:w-1/2">
            <label :for="key + '_educational_attainment'">Educational Attainment</label>
            <input type="text" :name="key + '_educational_attainment'" :id="key + '_educational_attainment'" />
          </div>
        </div>
        
        <h3 class="sub-form-group-title">Employment Information</h3>
        <div class="form-group">
          <div class="form-control w-full md:w-1/2">
            <label :for="key + '_occupation'">Occupation</label>
            <input type="text" :name="key + '_occupation'" :id="key + '_occupation'" />
          </div>
          <div class="form-control w-full md:w-1/2">
            <label :for="key + '_office_contact_number'">Contact Number</label>
            <input type="text" :name="key + '_office_contact_number'" :id="key + '_office_contact_number'" />
          </div>
          <div class="form-control w-full">
            <label :for="key + '_employment_address'">Employment Address</label>
            <input type="text" :name="key + '_employment_address'" :id="key + '_employment_address'" />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { useFormStore } from '../../stores/formStore';
import { useStudentStore } from '../../stores/studentStore'
export default {
  setup() {
    const studentStore = useStudentStore();
    const formStore = useFormStore();
    return { studentStore, formStore }
  },
  computed: {
    parents() {
      return {
        'fathers': 'Father',
        'mothers': 'Mother'
      }
    }
  }
}
</script>

<style>

</style>