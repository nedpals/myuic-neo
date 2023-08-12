<template>
  <main class="max-w-7xl mx-auto w-full flex min-h-screen">
    <navbar />
    <section class="md:ml-24 lg:ml-64 md:w-[calc(100%-6rem)] lg:w-[calc(100%-16rem)] border-r border-zinc-300 dark:border-primary-700 w-full">
      <loading-container :is-loading="!hasSemesterId || isLogoutProcessing" v-slot="{ isLoading }">
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

<script lang="ts" setup>
import Navbar from '../components/ui/Navbar.vue'
import { prefetchStudent, prefetchSemesterId, prefetchSemesterList, useAdditionalInfoQuery, currentSemesterIdKey } from '../stores/studentStore';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import Loader from '../components/ui/Loader.vue';
import { useQueryClient } from '@tanstack/vue-query';
import { useLogoutMutation } from '../composables/auth';
import { provide } from 'vue';
const queryClient = useQueryClient();

Promise.all([
  prefetchSemesterId(queryClient),
  prefetchSemesterList(queryClient),
  prefetchStudent(queryClient),
]);

const { isLoading: isLogoutProcessing } = useLogoutMutation();
const { currentSemesterId, hasSemesterId } = useAdditionalInfoQuery();
provide(currentSemesterIdKey, currentSemesterId);
</script>
