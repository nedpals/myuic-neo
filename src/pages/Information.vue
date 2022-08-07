<template>
  <dashboard-scaffold>
    <template #actions>
      <Button v-if="$route.name !== 'account-information'" @click="saveInformation" :icon="IconSave" text="Save" />
    </template>

    <loading-container :is-loading="isLoading" v-slot="{ isLoading }">
      <div class="p-6 max-w-4xl mx-auto" v-if="!isLoading">
        <router-view></router-view>
      </div>
      <div class="flex items-center justify-center p-8 mx-auto" v-else>
        <loader class="w-16 h-16" />
      </div>
    </loading-container>
  </dashboard-scaffold>
</template>

<script lang="ts" setup>
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import Loader from '../components/ui/Loader.vue';
import IconSave from '~icons/ion/save';
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';
import Button from '../components/ui/Button.vue';

import { useStudentQuery } from '../stores/studentStore';
import { provide, reactive, watch } from 'vue';
import { Student } from '@myuic-api/types';
import { notify } from 'notiwind';
import { useMutation } from 'vue-query';
import { client } from '../client';
import { deepReactiveUpdate } from '../utils';
import { studentInjectionKey } from '../keys';

const { isLoading, query: { data: originalStudentData, refetch: refetchStudent } } = useStudentQuery();
const studentData = reactive<Student>({
  LRN: '',
  ACR: '',
  ID: '',
  number: '',
  lastName: '',
  firstName: '',
  middleName: '',
  suffix: '',
  gender: 'Male',
  birthDate: new Date(),
  birthPlace: '',
  religion: 'Roman Catholic',
  ethnicGroup: '',
  nationality: 'Afghan',
  contactNumber: '',
  email: '',
  baptized: false,
  confirmed: false,
  address: {
    address: '',
    city: '',
    region: '',
    province: ''
  },
  guardianInformation: {
    name: '',
    address: {
      address: '',
      city: '',
      region: '',
      province: ''
    },
    contactNumber: ''
  },
  educationalBackground: {
    gradeSchool: {
      school: '',
      schoolYear: ''
    },
    juniorHighSchool: {
      school: '',
      schoolYear: ''
    },
    seniorHighSchool: {
      school: '',
      schoolYear: ''
    },
    college: {
      school: '',
      schoolYear: ''
    },
    graduate: {
      school: '',
      schoolYear: ''
    },
    postGraduate: {
      school: '',
      schoolYear: ''
    }
  },
  parentInformation: {
    mother: {
      name: '',
      educationalAttainment: '',
      employer: '',
      occupation: '',
      officeContactNumber: ''
    },
    father: {
      name: '',
      educationalAttainment: '',
      employer: '',
      occupation: '',
      officeContactNumber: ''
    },
    status: 'Living Together',
    address: {
      address: '',
      city: '',
      region: '',
      province: ''
    },
    contactNumber: '',
    incomeGroup: 'less than 10,000 / month'
  },
});

const { mutateAsync } = useMutation((s: Student) => client.updateStudent(s), {
  onMutate: () => {
    notify({
      type: 'info',
      text: 'Saving your information...',
    });
  },
});

const saveInformation = async () => {
  await mutateAsync(studentData, {
    onSuccess: async ({ message }) => {
      notify({
        type: 'success',
        text: message,
      });
      const { data: newData } = await refetchStudent.value();
      replaceStudentData(newData!);
    }
  });
}

const replaceStudentData = (newData: Student) => {
  deepReactiveUpdate(newData, studentData);
}

// triggered only once student data is received.
const unwatchOrigData = watch(originalStudentData, (newData) => {
  if (typeof newData !== 'undefined') {
    replaceStudentData(newData);
    unwatchOrigData();
  }
});

provide(studentInjectionKey, studentData);
</script>