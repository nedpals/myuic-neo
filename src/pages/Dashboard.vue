<template>
  <main class="max-w-7xl mx-auto w-full flex min-h-screen">
    <navbar />
    <section class="md:ml-24 lg:ml-64 md:w-[calc(100%-6rem)] lg:w-[calc(100%-16rem)] border-r border-gray-300 dark:border-primary-700 w-full">
      <loading-container :is-loading="!studentStore.hasSemesterId" v-slot="{ isLoading }">
        <div v-if="isLoading" class="h-full w-full flex items-center justify-center">
          <loader class="h-16 w-16" />
        </div>
        <section class="pb-24" v-else>
          <router-view></router-view>
        </section>
      </loading-container>
    </section>
  </main>
</template>

<script>
import Navbar from '../components/ui/Navbar.vue'
import { useStudentStore } from '../stores/studentStore';
import DashboardHeader from '../components/ui/DashboardHeader.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import Loader from '../components/ui/Loader.vue';

export default {
  components: { Navbar, DashboardHeader, LoadingContainer, Loader },
  setup() {
    const studentStore = useStudentStore();

    return {
      studentStore
    }
  },
  created() {
    this.studentStore.getCurrentSemesterId()
      .then(() => Promise.all([
        this.studentStore.getStudent(),
        this.studentStore.getSemesterList(),
      ]));
  }
}
</script>