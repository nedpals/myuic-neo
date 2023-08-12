<template>
  <main class="flex flex-col space-y-4">
    <div>
      <div class="form-group-info">
        <h2 class="title">Identifiers</h2>
        <p class="description">Unique, computer-generated information used for reference.</p>
      </div>
      <div class="form-group">
        <div class="form-control w-full md:w-1/2 lg:w-1/3">
          <label for="lrn_number">LRN Number</label>
          <input type="text" name="lrn_number" id="lrn_number" :value="student.LRN" readonly />
        </div>
        <div class="form-control w-full md:w-1/2 lg:w-1/3">
          <label for="id_number">ID Number</label>
          <input type="text" name="id_number" id="id_number" :value="student.number" readonly />
        </div>
        <div class="form-control w-full md:w-1/2 lg:w-1/3">
          <label for="acr_number">ACR Number</label>
          <input type="text" name="acr_number" id="acr_number" :value="student.ACR" readonly />
          <span class="hint-text">For foreign students only</span>
        </div>
      </div>
    </div>
    <div>
      <div class="form-group-info">
        <h2 class="title">Personal Information</h2>
        <p class="description">Information used for identification.</p>
      </div>

      <h3 class="sub-form-group-title">Name</h3>
      <div class="form-group">
        <div class="form-control w-full md:w-1/2">
          <label for="last_name">Last Name</label>
          <input type="text" name="last_name" id="last_name" v-model="student.lastName" />
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="first_name">First Name</label>
          <input type="text" name="first_name" id="first_name" v-model="student.firstName" />
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="middle_name">Middle Name</label>
          <input type="text" name="middle_name" id="middle_name" v-model="student.middleName" />
          <span class="hint-text">The full version of your middle initial.</span>
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="suffix">Suffix</label>
          <input type="text" name="suffix" id="suffix" v-model="student.suffix" />
        </div>
      </div>

      <h3 class="sub-form-group-title">Birth Information</h3>
      <div class="form-group">
        <div class="form-control w-full md:w-1/2">
          <label for="gender">Gender</label>
          <loading-container :is-loading="gendersQuery.isLoading" v-slot="{ isLoading }">
            <select name="gender" id="gender" v-model="student.gender" :disabled="isLoading">
              <option v-if="isLoading" selected>Loading...</option>
              <option v-for="g in gendersQuery.data" :key="g" :value="g">{{ g }}</option>
            </select>
          </loading-container>
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="birth_date">Birth Date</label>
          <input type="text" name="birth_date" id="birth_date" v-model="student.birthDate" />
        </div>
        <div class="form-control w-full">
          <label for="birth_place">Birth Place</label>
          <input type="text" name="birth_place" id="birth_place" v-model="student.birthPlace" />
        </div>
      </div>

      <h3 class="sub-form-group-title">Origin</h3>
      <div class="form-group">
        <div class="form-control w-full md:w-1/2">
          <label for="nationality">Nationality</label>
          <loading-container :is-loading="nationalitiesQuery.isLoading" v-slot="{ isLoading }">
            <select name="nationality" id="nationality" v-model="student.nationality" :disabled="isLoading">
              <option v-if="isLoading" selected>Loading...</option>
              <option v-for="n in nationalitiesQuery.data" :key="n" :value="n">{{ n }}</option>
            </select>
          </loading-container>
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="ethnic_group">Ethnic Group</label>
          <loading-container :is-loading="ethnicGroupsQuery.isLoading" v-slot="{ isLoading }">
            <select name="ethnic_group" id="ethnic_group" v-model="student.ethnicGroup" :disabled="isLoading">
              <option v-if="isLoading" selected>Loading...</option>
              <option v-for="eg in ethnicGroupsQuery.data" :key="eg" :value="eg">{{ eg }}</option>
            </select>
          </loading-container>
        </div>
      </div>

      <h3 class="sub-form-group-title">Religion / Beliefs</h3>
      <div class="form-group">
        <div class="form-control w-full">
          <label for="religion">Religion</label>
          <loading-container :is-loading="religionsQuery.isLoading" v-slot="{ isLoading }">
            <select name="religion" id="religion" v-model="student.religion" :disabled="isLoading">
              <option v-if="isLoading" selected>Loading...</option>
              <option v-for="r in religionsQuery.data" :key="r" :value="r">{{ r }}</option>
            </select>
          </loading-container>
        </div>

        <div class="form-control is-horizontal w-full">
          <input type="checkbox" name="has_baptized" id="has_baptized" :checked="student.baptized">
          <label for="has_baptized">I am baptized.</label>
        </div>

        <div class="form-control is-horizontal w-full">
          <input type="checkbox" name="has_confirmed" id="has_confirmed" :checked="student.confirmed">
          <label for="has_confirmed">I am confirmed. (For Roman Catholics)</label>
        </div>
      </div>

      <h3 class="sub-form-group-title">Contact Information</h3>
      <div class="form-group">
        <div class="form-control w-full md:w-1/2">
          <label for="email_address">E-mail Address</label>
          <input type="email" name="email_address" id="email_address" v-model="student.email" />
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="contact_no">Contact Number</label>
          <input type="text" name="contact_no" id="contact_no" v-model="student.contactNumber" />
        </div>
      </div>

      <h3 class="sub-form-group-title">Address</h3>
      <div class="form-group">
        <div class="form-control w-full">
          <label for="address">Full Address</label>
          <input type="text" name="address" id="address" v-model="student.address.address" />
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="city">City</label>
          <input type="text" name="city" id="city" v-model="student.address.city" />
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="Province">Province</label>
          <input type="text" name="province" id="province" v-model="student.address.province" />
        </div>
        <div class="form-control w-full md:w-1/2">
          <label for="region">Region</label>
          <input type="text" name="region" id="region" v-model="student.address.region" />
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import LoadingContainer from '../../components/ui/LoadingContainer.vue';
import { useGendersQuery, useNationalitiesQuery, useEthnicGroupsQuery, useReligionsQuery } from '../../stores/formStore';
import { inject } from 'vue';
import { studentInjectionKey } from '../../keys';

const student = inject(studentInjectionKey)!;
const gendersQuery = useGendersQuery();
const nationalitiesQuery = useNationalitiesQuery();
const ethnicGroupsQuery = useEthnicGroupsQuery();
const religionsQuery = useReligionsQuery();
</script>
