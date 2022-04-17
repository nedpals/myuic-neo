<template>
  <dashboard-scaffold>
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
  </dashboard-scaffold>
</template>

<script lang="ts">
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import PromiseLoader from '../components/ui/PromiseLoader.vue';
import Loader from '../components/ui/Loader.vue';
import IconSave from '~icons/ion/save';

import { useStudentStore } from '../stores/studentStore';
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';

export default {
  components: { LoadingContainer, PromiseLoader, Loader, IconSave, DashboardScaffold },
  setup() {
    const studentStore = useStudentStore();
    const loadData = () => studentStore.getStudent();
    return { loadData }
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