<template>
  <dashboard-scaffold title="Settings">
    <div class="p-6 max-w-2xl mx-auto">
      <router-view></router-view>
    </div>
  </dashboard-scaffold>
</template>

<script lang="ts" setup>
import DashboardScaffold from '../../main/components/ui/DashboardScaffold.vue';
</script>
