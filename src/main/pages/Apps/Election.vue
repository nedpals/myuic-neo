<template>
  <dashboard-scaffold>
    <div>
      <notification-container type="info" text="For demonstration purposes only." />
      <section class="bg-gradient-to-b from-primary-300 to-primary-100">
        <div class="flex">
          <div class="w-3/4 p-12">
            <p>Voting starts in</p>
            <div class="text-7xl font-bold mb-6">
              00:00:00
            </div>
            <button @click="voteModal?.open()" class="button is-primary is-medium">Get started</button>
            <vote-modal ref="voteModal" />
          </div>
          <div class="w-1/4 mt-14">
            <img :src="electionsSvg" alt="" />
          </div>
        </div>
      </section>

      <section class="px-12 pt-8">
        <h2 class="text-3xl font-semibold">Candidates</h2>
        <div>
          <div :key="'candidates_' + position" class="pt-8" v-for="(candidates, position) in candidatesByPosition">
            <h2 class="text-2xl font-semibold">For {{ position }}</h2>
            <div class="flex flex-wrap w-full border-t-4 mt-2 pt-2">
              <div
                :class="{ '-ml-2': i % 2 == 0, '-mr-2 flex-grow flex-shrink-0': i % 2 != 0 }"
                class="p-2 w-1/2"
                :key="'candidate_' + c.id"
                v-for="(c, i) in candidates">
                <box class="flex space-x-4" :class="[isLoading ? 'items-center' : 'items-start']">
                  <div class="h-13 w-13 flex-shrink-0">
                    <skeleton
                        custom-class="bg-zinc-200 dark:bg-uic-500 rounded-full h-full w-full">
                      <img
                        :src="c.imageUrl"
                        @error="($event.target as HTMLImageElement).src = '/default_avatar.png'"
                        class="bg-zinc-200 rounded-full h-full w-full object-center object-cover"
                        :alt="c.name" />
                    </skeleton>
                  </div>
                  <div>
                    <p class="font-bold text-lg">{{ nameCase(c.name) }}</p>
                    <p>{{ c.course }}</p>
                    <p>{{ c.party }}</p>
                  </div>
                </box>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </dashboard-scaffold>
</template>

<script lang="ts" setup>
import electionsSvg from '../../assets/election.svg';
import DashboardScaffold from '../../components/ui/DashboardScaffold.vue';
import { useElectionCandidatesQuery } from '../../stores/electionsStore';
import { nameCase } from '@foundernest/namecase';
import NotificationContainer from '../../components/ui/NotificationContainer.vue';
import { computed, ref } from 'vue';
import { Candidate } from '@myuic-api/types';
import Box from '../../components/ui/Box.vue';
import Skeleton from '../../components/ui/Skeleton.vue';
import VoteModal from '../../components/Apps/Election/VoteModal.vue';

const voteModal = ref<InstanceType<typeof VoteModal> | null>(null);
const { data, isLoading } = useElectionCandidatesQuery();
const candidatesByPosition = computed(() => {
  return (data.value ?? []).reduce<Record<string, Candidate[]>>((obj, c) => {
    if (!obj[c.position]) {
      obj[c.position] = [];
    }

    obj[c.position].push(c);
    return obj;
  }, {});
});
</script>

<style>

</style>
