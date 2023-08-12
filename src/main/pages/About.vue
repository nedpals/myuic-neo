<template>
  <dashboard-scaffold title="About" container-class="px-4 md:px-5 space-y-4">
    <div class="max-w-lg w-full mx-auto flex flex-col justify-center text-center items-center py-6">
      <icon-logo class="text-primary-400 h-36 w-36 mb-4" />
      <h1 class="text-4xl font-bold mb-2">MyUIC <span class="font-medium">Neo</span></h1>
      <p class="max-w-sm text-zinc-600 dark:text-primary-200 text-2xl">A new student portal concept for UICians in the
        21st century.</p>

      <div class="mt-24">
        <p class="mb-18">Version {{ fullVersion }}</p>
        <p>Copyright &copy; 2022 by Ned Palacios and its contributors. Licensed under the <a
            class="text-primary-500 underline" href="https://github.com/nedpals/myuic-neo/blob/master/LICENSE">AGPL3
            license</a>.</p>
      </div>
    </div>
  </dashboard-scaffold>
</template>

<script lang="ts" setup>
import IconLogo from '~icons/custom/logo';
import { useMeta } from '../composables/meta';
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';

const { fullVersion } = useMeta();
</script>
