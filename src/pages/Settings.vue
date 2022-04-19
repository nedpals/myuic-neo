<template>
  <dashboard-scaffold title="Settings">
    <div class="p-6 max-w-2xl mx-auto">
      <router-view></router-view>
    </div>
  </dashboard-scaffold>
</template>

<script>
import DashboardScaffold from '../components/ui/DashboardScaffold.vue'
export default {
  components: { DashboardScaffold },

}
</script>