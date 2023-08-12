<template>
  <dashboard-scaffold>
    <main class="max-w-2xl mx-auto px-4 md:px-5">
      <loading-container :is-loading="isLoading" v-slot="{ isLoading }">
        <skeleton v-if="openedEvaluationList.length !== 0" custom-class="h-8 w-24 mt-2">
          <h2 class="text-3xl font-semibold">Available for Evaluation</h2>
        </skeleton>

        <div class="flex flex-col space-y-4 py-8">
          <box
            :key="'sub_' + sub.code + '_' + sub.type" v-for="(sub, sub_idx) in openedEvaluationList"
            :disabled="isLoading"
            @click="evaluateCourse(sub)"
            is-hoverable>
            <div class="flex flex-row justify-between items-center">
              <div class="flex space-x-4" :class="[isLoading ? 'items-center' : 'items-start']">
                <div class="h-13 w-13 flex-shrink-0">
                  <skeleton
                      :delay="(sub_idx + 1) * 250"
                      custom-class="bg-zinc-200 dark:bg-uic-500 rounded-full h-full w-full">
                    <div
                      :style="{ backgroundImage: `url(${sub.instructorImageUrl})` }"
                      class="bg-zinc-200 dark:bg-uic-500 rounded-full h-full w-full bg-cover bg-center"></div>
                  </skeleton>
                </div>
                <div>
                  <skeleton :delay="(sub_idx + 1) * 250" custom-class="h-5 w-8 mb-2">
                    <h3 class="text-xl font-semibold">{{ sub.name }}</h3>
                  </skeleton>
                  <skeleton :delay="(sub_idx + 1) * 250" custom-class="h-4 w-16">
                    <p>{{ sub.instructor }} • {{ sub.type }}</p>
                  </skeleton>
                </div>
              </div>
              <icon-chevron-right />
            </div>
          </box>

          <empty-state
            v-if="openedEvaluationList.length === 0"
            class="h-[50vh]"
            :title="notOpenCount != 0 ? 'Evaluation is not yet open.' : 'All courses have already been evaluated.'">
            <template #icon>
              <clearance-status-icon
                :status="notOpenCount != 0 ? 'not_cleared' : 'cleared'"
                :class="{ 'animate-pulse': isLoading }"
                class="h-42 w-42 md:h-48 md:w-48 mb-4" />
            </template>
          </empty-state>
        </div>
      </loading-container>
    </main>

    <!-- Modal -->
    <evaluation-modal
      v-for="c in currentlyEvaluated"
      :key="'eval_' + c[0].code + '_' + c[0].type"
      @close="closeCourseEvaluation(c[0])"
      :courses="c"
      open />
  </dashboard-scaffold>
</template>

<script lang="ts" setup>
import Box from '../../components/ui/Box.vue';
import LoadingContainer from '../../components/ui/LoadingContainer.vue';
import IconChevronRight from '~icons/ion/chevron-right'
import DashboardScaffold from '../../components/ui/DashboardScaffold.vue';
import Skeleton from '../../components/ui/Skeleton.vue';
import { useEvaluationListQuery } from '../../stores/evaluationStore';
import EvaluationModal from '../../components/Apps/Evaluation/EvaluationModal.vue';
import ClearanceStatusIcon from '../../components/Clearance/ClearanceStatusIcon.vue';
import { computed, ref } from 'vue';
import { CourseEvaluationEntry } from '@myuic-api/types';
import EmptyState from '../../components/ui/EmptyState.vue';

type Entries = [CourseEvaluationEntry] | [CourseEvaluationEntry, CourseEvaluationEntry];

const { isLoading, getEntriesByStatus } = useEvaluationListQuery();
const openedEvaluationList = getEntriesByStatus('open');
const notOpenCount = computed(() => getEntriesByStatus('not_open').value.length);
const currentlyEvaluated = ref<Entries[]>([]);
const closeCourseEvaluation = (c: CourseEvaluationEntry) => {
  const idx = currentlyEvaluated.value.findIndex(e => e[0].code === c.code && e[0].type === c.type);
  currentlyEvaluated.value.splice(idx, 1);
}

const evaluateCourse = (...c: Entries) => {
  const additionalEntry = openedEvaluationList.value.find(cc => cc.code === c[0].code && cc.type !== c[0].type);
  const finalEntries : CourseEvaluationEntry[] = [];
  if (typeof additionalEntry !== 'undefined') {
    finalEntries.push(additionalEntry);
  }

  finalEntries.push(...c);
  if (currentlyEvaluated.value.length !== 0) {
    currentlyEvaluated.value.splice(0, currentlyEvaluated.value.length);
  }

  currentlyEvaluated.value.push(finalEntries as Entries);
}
</script>
