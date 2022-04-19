<template>
  <dashboard-scaffold>
    <main class="max-w-2xl mx-auto px-6 md:px-2 py-4 md:py-8">
      <loading-container :is-loading="isLoading" v-slot="{ isLoading }">
        <skeleton custom-class="h-8 w-24 mt-2">
          <h2 class="text-3xl font-semibold">Available for Evaluation</h2>
        </skeleton>

        <div class="flex flex-col space-y-4 py-8">
          <box 
            :key="'sub_' + sub.code + '_' + sub.type" v-for="sub in openedEvaluationList" 
            :disabled="isLoading"
            class="hover:bg-gray-100 dark:hover:bg-uic-900 hover:border-uic-500 dark:hover:border-uic-700 cursor-pointer" 
            @click="evaluateCourse(sub)">
            <div class="flex flex-row justify-between items-center">
              <div class="flex space-x-4" :class="[isLoading ? 'items-center' : 'items-start']">
                <div class="h-13 w-13 flex-shrink-0">
                  <skeleton
                      custom-class="bg-gray-200 dark:bg-uic-500 rounded-full h-full w-full">
                    <div 
                      :style="{ backgroundImage: `url(${sub.instructorImageUrl})` }"
                      class="bg-gray-200 dark:bg-uic-500 rounded-full h-full w-full bg-cover bg-center"></div>
                  </skeleton>
                </div>
                <div>
                  <skeleton custom-class="h-5 w-8 mb-2">
                    <h3 class="text-xl font-semibold">{{ sub.name }}</h3>
                  </skeleton>
                  <skeleton custom-class="h-4 w-16">
                    <p>{{ sub.instructor }} • {{ sub.type }}</p>
                  </skeleton>
                </div>
              </div>
              <icon-chevron-right />
            </div>
          </box>

          <div class="py-4" v-if="openedEvaluationList.length === 0">
            <h2 class="text-3xl text-center text-gray-400">
              {{
                notOpenCount != 0 ? 'Evaluation is not yet open.'
                  : 'All courses have already been evaluated.'
              }}
            </h2>
          </div>
        </div>
      </loading-container>
    </main>

    <!-- Modal -->
    <evaluation-modal
      v-for="c in currentlyEvaluated"
      :key="'eval_' + c.code + '_' + c.type"
      @close="closeCourseEvaluation(c)"
      :course="c"
      open />
  </dashboard-scaffold>
</template>

<script lang="ts">
import Box from '../../components/ui/Box.vue';
import Loader from '../../components/ui/Loader.vue';
import LoadingContainer from '../../components/ui/LoadingContainer.vue';
import PromiseLoader from '../../components/ui/PromiseLoader.vue';
import IconChevronRight from '~icons/ion/chevron-right'
import DashboardScaffold from '../../components/ui/DashboardScaffold.vue';
import Skeleton from '../../components/ui/Skeleton.vue';
import { useEvaluationListQuery, useEvaluationListQueryUtilities } from '../../stores/evaluationStore';
import EvaluationModal from '../../components/Apps/Evaluation/EvaluationModal.vue';
import { computed, ref } from 'vue';
import { CourseEvaluationEntry } from '@myuic-api/types';

export default {
  components: { PromiseLoader, LoadingContainer, Loader, Box, IconChevronRight, DashboardScaffold, Skeleton, EvaluationModal },
  setup() {
    const facultyEvaluationQuery = useEvaluationListQuery();
    const { isLoading, getEntriesByStatus } = useEvaluationListQueryUtilities(facultyEvaluationQuery);
    const openedEvaluationList = getEntriesByStatus('open');
    const notOpenCount = computed(() => getEntriesByStatus('not_open').value.length);
    const currentlyEvaluated = ref<CourseEvaluationEntry[]>([]);

    const closeCourseEvaluation = (c: CourseEvaluationEntry) => {
      const idx = currentlyEvaluated.value.findIndex(e => e.code === c.code && e.type === c.type);
      currentlyEvaluated.value.splice(idx, 1);
    }

    const evaluateCourse = (c: CourseEvaluationEntry) => {
      if (currentlyEvaluated.value.length !== 0) {
        currentlyEvaluated.value.splice(0, currentlyEvaluated.value.length);
      }

      currentlyEvaluated.value.push(c);
    }

    return {
      isLoading,
      openedEvaluationList,
      evaluateCourse,
      closeCourseEvaluation,
      notOpenCount,
      currentlyEvaluated
    }
  },
}
</script>