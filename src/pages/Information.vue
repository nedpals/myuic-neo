<template>
  <dashboard-header>
    <template #actions>
      <button @click="saveInformation" class="button">
        <icon-save />
        <span>Save</span>
      </button>
    </template>

    <promise-loader :promise="loadData()" v-slot="{ isPending }">
      <loading-container :is-loading="isPending" v-slot="{ isLoading }">
        <div class="p-6 max-w-2xl mx-auto" v-if="!isLoading">
          <router-view></router-view>
        </div>
        <div class="flex items-center justify-center p-8 mx-auto" v-else>
          <loader class="w-16 h-16" />
        </div>
      </loading-container>
    </promise-loader>
  </dashboard-header>
</template>

<script lang="ts">
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import PromiseLoader from '../components/ui/PromiseLoader.vue';
import Loader from '../components/ui/Loader.vue';
import IconSave from '~icons/ion/save';

import { useStudentStore } from '../stores/studentStore';
import { useFormStore } from '../stores/formStore';
import DashboardHeader from '../components/ui/DashboardHeader.vue';

export default {
  components: { LoadingContainer, PromiseLoader, Loader, IconSave, DashboardHeader },
  setup() {
    const studentStore = useStudentStore();
    const formStore = useFormStore();

    const loadData = () => Promise.all([
      studentStore.getStudent(),
      formStore.getFormInfos()
    ]);

    return { studentStore, loadData }
  },
  mounted() {
    this.warnNotify();
  },
  methods: {
    warnNotify() {
      this.$notify({
        type: 'warning',
        text: 'Information is read-only for now. Saving does not work.'
      }, 2000);
    },
    saveInformation() {
      this.warnNotify();
    },
  }
}
</script>