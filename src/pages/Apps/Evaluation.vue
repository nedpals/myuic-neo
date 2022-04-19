<template>
  <dashboard-scaffold>
    <main class="max-w-2xl mx-auto px-6 md:px-2 py-4 md:py-8">
      <!-- TODO: skeleton -->
      <loading-container :is-loading="isLoading" v-slot="{ isLoading }">
        <skeleton custom-class="h-8 w-24 mt-2">
          <h2 class="text-3xl font-semibold">Available for Evaluation</h2>
        </skeleton>

        <div v-if="!isLoading">
          <div class="flex flex-col space-y-4 py-8">
            <box 
              :key="'sub_' + sub.code" v-for="sub in openedEvaluationList" 
              class="hover:bg-gray-100 dark:hover:bg-uic-900 hover:border-uic-500 dark:hover:border-uic-700 cursor-pointer" 
              @click="evaluateCourse(sub)">
              <div class="flex flex-row justify-between items-center">
                <div class="flex space-x-4 items-start">
                  <div class="h-13 w-13 flex-shrink-0">
                    <div 
                      :style="{ backgroundImage: `url(${sub.instructorImageUrl})` }"
                      class="bg-gray-200 dark:bg-uic-500 rounded-full h-full w-full bg-cover bg-center"></div>
                  </div>
                  <div>
                    <h3 class="text-xl font-semibold">{{ sub.name }}</h3>
                    <p>{{ sub.instructor }} • {{ sub.type }}</p>
                  </div>
                </div>
                <icon-chevron-right />
              </div>
            </box>
          </div>
        </div>
        <div v-else>
          <div class="flex flex-col space-y-4 py-8">
            <box
              :key="'box_' + i"
              v-for="i in 6">
              <div class="flex flex-row justify-between items-center">
                <div class="flex space-x-4 items-start">
                  <div class="h-13 w-13 flex-shrink-0">
                    <skeleton
                      custom-class="bg-gray-200 dark:bg-uic-500 rounded-full h-full w-full">
                    </skeleton>
                  </div>
                  <div>
                    <skeleton custom-class="h-5 w-8 mb-2" />
                    <skeleton custom-class="h-4 w-16" />
                  </div>
                </div>
                <icon-chevron-right />
              </div>
            </box>
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
import { ref } from 'vue';
import { CourseEvaluationEntry } from '@myuic-api/types';

export default {
  components: { PromiseLoader, LoadingContainer, Loader, Box, IconChevronRight, DashboardScaffold, Skeleton, EvaluationModal },
  setup() {
    const facultyEvaluationQuery = useEvaluationListQuery();
    const { isLoading, getEntriesByStatus } = useEvaluationListQueryUtilities(facultyEvaluationQuery);
    const openedEvaluationList = getEntriesByStatus('open');
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
      currentlyEvaluated
    }
  },
}
</script>