<template>
  <dashboard-scaffold container-class="py-24">
    <empty-state
      :icon="IconMegaphoneOutline"
      title="Coming soon!" />
  </dashboard-scaffold>
</template>

<script lang="ts" setup>
import DashboardScaffold from '../components/ui/DashboardScaffold.vue';
import EmptyState from '../components/ui/EmptyState.vue';
import IconMegaphoneOutline from '~icons/ion/megaphone-outline';
</script>
