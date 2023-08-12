<template>
  <dashboard-scaffold child-menu-class="md:hidden">
    <template #actions>
      <Button v-if="$route.name !== 'account-information'" @click="saveInformation" :icon="IconSave" text="Save" />
    </template>

    <div class="flex">
      <div class="hidden md:flex flex-col w-1/4 px-2 py-2 space-y-2">
        <router-link
        v-for="r in childRouteLinks"
          :key="r.name"
          :to="r"
          v-slot="{ isExactActive, href, navigate }"
          custom>
          <a :href="href"
            @click="navigate"
            :class="[isExactActive ?
              'bg-primary-100 dark:bg-primary-700 hover:bg-primary-200 dark:hover:!bg-primary-600' :
              'hover:bg-primary-100 dark:hover:bg-primary-700']"
            class="transition-colors rounded-md px-3 py-4 flex justify-between items-center">

            <span>{{ r.meta?.pageTitle ?? r.name }}</span>
            <icon-chevron-right class="text-primary-800 dark:text-primary-200" />
          </a>
        </router-link>
      </div>

      <loading-container :is-loading="isLoading" v-slot="{ isLoading }">
        <div class="w-full md:w-3/4 px-4 md:px-6 pt-6 md:pt-0" v-if="!isLoading">
          <router-view></router-view>
        </div>
        <div class="flex items-center justify-center p-8 mx-auto" v-else>
          <loader class="w-16 h-16" />
        </div>
      </loading-container>
    </div>

  </dashboard-scaffold>
</template>

<script lang="ts" setup>
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import Loader from '../components/ui/Loader.vue';
import IconSave from '~icons/ion/save';
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';
import Button from '../components/ui/Button.vue';
import IconChevronRight from '~icons/ion/chevron-right';

import { useStudentQuery } from '../stores/studentStore';
import { computed, provide, reactive, watch } from 'vue';
import { Student } from '@myuic-api/types';
import { notify } from 'notiwind';
import { useMutation } from 'vue-query';
import { client } from '../client';
import { deepReactiveUpdate } from '../utils';
import { studentInjectionKey } from '../keys';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';

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

const route = useRoute();
const router = useRouter();
const childRouteLinks = computed(() => {
  if (route.matched.length < 3) return [];
  const routes = router.getRoutes();
  const currentRouteData = routes.find(r => r.name === route.matched[route.matched.length - 2].name);
  if (!currentRouteData) return [];
  return currentRouteData.children;
});

provide(studentInjectionKey, studentData);
</script>
