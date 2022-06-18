<template>
  <dashboard-scaffold>
    <div>
      <section class="bg-gradient-to-b from-primary-300 to-primary-100">
        <div class="flex">
          <div class="w-3/4 p-12">
            <p>Voting starts in</p>
            <div class="text-7xl font-bold mb-6">
              00:00:00
            </div>
            <button class="button is-primary is-medium">Get started</button>
          </div>

          <div class="w-1/4 mt-14">
            <img :src="electionsSvg" alt="" />
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-3xl font-semibold">Candidates</h2>
        <div>

        </div>
      </section>
    </div>
  </dashboard-scaffold>
</template>

<script>
import electionsSvg from '../../assets/election.svg';
import DashboardScaffold from '../../components/ui/DashboardScaffold.vue';
import { } from '../../stores/electionsStore'

export default {
  components: { DashboardScaffold },
  setup() {
    const { } = useElectio

    return {
      electionsSvg
    }
  }
}
</script>

<style>

</style>