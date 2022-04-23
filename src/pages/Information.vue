<template>
  <dashboard-scaffold>
    <template #actions>
      <button :disabled="!isSet" @click="saveInformation" class="button">
        <icon-save />
        <span>Save</span>
      </button>
    </template>

    <loading-container :is-loading="isLoading" v-slot="{ isLoading }">
      <div class="p-6 max-w-2xl mx-auto" v-if="!isLoading">
        <router-view v-slot="{ Component }">
          <component :is="Component" v-model:student="studentData" />
        </router-view>
      </div>
      <div class="flex items-center justify-center p-8 mx-auto" v-else>
        <loader class="w-16 h-16" />
      </div>
    </loading-container>
  </dashboard-scaffold>
</template>

<script lang="ts">
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import PromiseLoader from '../components/ui/PromiseLoader.vue';
import Loader from '../components/ui/Loader.vue';
import IconSave from '~icons/ion/save';

import { useStudentQuery } from '../stores/studentStore';
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';
import { onBeforeUnmount, reactive, ref, watch } from 'vue';
import { Student } from '@myuic-api/types';
import { deepEqual } from 'fast-equals';
import { notify } from 'notiwind';
import { useMutation } from 'vue-query';
import { client } from '../client';

export default {
  components: { LoadingContainer, PromiseLoader, Loader, IconSave, DashboardScaffold },
  setup() {
    const { isLoading, query: { data: originalStudentData, refetch: refetchStudent } } = useStudentQuery();
    const studentData = reactive<Student>(originalStudentData.value ?? {} as Student);
    const isSet = ref(false);
    const { mutateAsync, isLoading: isProcessing } = useMutation((s: Student) => client.updateStudent(s), {
      onMutate: () => {
        notify({
          type: 'info',
          text: 'Saving your information...',
        }, 3000);
      },
    });

    const saveInformation = async () => {
      await mutateAsync(studentData, {
        onSuccess: async ({ message }) => {
          notify({
            type: 'success',
            text: message,
          }, 3000);
          isSet.value = false;
          const { data: newData } = await refetchStudent.value();
          replaceStudentData(newData!);
        }
      });
    }

    const replaceStudentData = (newData: Student) => {
      for (const newDataKey in newData) {
        studentData[newDataKey] = newData[newDataKey];
      }
    }

    // triggered only once student data is received.
    const unwatchOrigData = watch(originalStudentData, (newData, oldData) => {
      if (typeof newData !== 'undefined') {
        console.log('MUTATE!');
        replaceStudentData(newData);
        unwatchOrigData();
      }
    });

    const unwatchData = watch(studentData, (n, o) => {
      if (isLoading.value || isProcessing.value) return;
      isSet.value = !deepEqual(n, originalStudentData.value!);
    }, {
      deep: true
    });    

    onBeforeUnmount(() => {
      unwatchData();
    });

    return { isLoading, isProcessing, saveInformation, originalStudentData, studentData, isSet }
  },
}
</script>