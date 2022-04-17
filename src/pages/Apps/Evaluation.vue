<template>
  <dashboard-scaffold>
    <main class="max-w-2xl mx-auto px-6 md:px-2 py-4 md:py-8">
      <!-- TODO: skeleton -->
      <promise-loader 
        :promise="studentStore.getCourseEvaluationList()" 
        v-slot="{ data, isPending }">
        <loading-container :is-loading="isPending" v-slot="{ isLoading }">
          <div v-if="!isLoading">
            <h2 class="text-3xl font-semibold">In Review</h2>
            <div class="flex flex-col space-y-4 py-8">
              <self-modal
                :key="'sub_' + si"
                :title="sub.name + ' / ' + sub.code"
                modal-class="max-w-2xl"
                content-class="px-6 pb-8 max-h-[80vh] overflow-y-auto"
                v-for="(sub, si) in studentStore.courseEvaluationList">
                <template #default="{ openModal }">
                  <box 
                    class="hover:bg-gray-100 dark:hover:bg-primary-900 hover:border-primary-500 dark:hover:border-primary-700 cursor-pointer" 
                    @click="">
                    <div class="flex flex-row justify-between items-center">
                      <div class="flex space-x-4 items-start">
                        <div class="h-13 w-13 flex-shrink-0">
                          <div 
                            :style="{ backgroundImage: `url(${sub.instructorImageUrl})` }"
                            class="bg-gray-200 dark:bg-primary-500 rounded-full h-full w-full bg-cover bg-center"></div>
                        </div>
                        <div>
                          <h3 class="text-xl font-semibold">{{ sub.name }}</h3>
                          <p>{{ sub.instructor }} • {{ sub.type }}</p>
                        </div>
                      </div>
                      <icon-chevron-right />
                    </div>
                  </box>
                </template>
                <template #modal-content>
                  <div class="flex flex-col divide divide-y">
                    <!-- TODO: -->
                    <div :key="'rating_cat_' + i" v-for="i in 2" class="flex flex-col py-3 space-y-4">
                      <div>
                        <h3 class="text-lg font-semibold">Category {{ i }}</h3>
                        <p class="text-gray-600 dark:text-primary-200">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quas, voluptates.</p>
                      </div>
                      <div class="flex flex-col space-y-2" :key="'q_' + i + '_' + jj" v-for="jj in 10">
                        <div class="flex justify-between">
                          <p class="w-2/3">Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore nemo labore fuga doloremque!</p>
                          <select>
                            <option>Good</option>
                            <option>Very Good</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <template #modal-footer>
                  <div class="flex justify-end">
                    <button 
                      @click="$notify({ type: 'info', text: 'Evaluation is read-only.' })" 
                      class="button is-primary px-6 py-2">Submit</button>
                  </div>
                </template>
              </self-modal>
            </div>
            <!-- <h2 class="mt-4 text-3xl font-semibold">Completed</h2> -->
          </div>
          <div v-else>
            <skeleton custom-class="h-8 w-24 mt-2" />
            <div class="flex flex-col space-y-4 py-8">
              <box
                :key="'box_' + i"
                v-for="i in 6">
                <div class="flex flex-row justify-between items-center">
                  <div class="flex space-x-4 items-start">
                    <div class="h-13 w-13 flex-shrink-0">
                      <skeleton
                        custom-class="bg-gray-200 dark:bg-primary-500 rounded-full h-full w-full">
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
      </promise-loader>
    </main>
  </dashboard-scaffold>
</template>

<script lang="ts">
import Box from '../../components/ui/Box.vue';
import Loader from '../../components/ui/Loader.vue';
import LoadingContainer from '../../components/ui/LoadingContainer.vue';
import PromiseLoader from '../../components/ui/PromiseLoader.vue';
import IconChevronRight from '~icons/ion/chevron-right'
import { useSchedulesQuery } from '../../stores/scheduleStore';
import { useStudentStore } from '../../stores/studentStore';
import SelfModal from '../../components/ui/SelfModal.vue';
import DashboardScaffold from '../../components/ui/DashboardScaffold.vue';
import Skeleton from '../../components/ui/Skeleton.vue';

export default {
  components: { PromiseLoader, LoadingContainer, Loader, Box, IconChevronRight, SelfModal, DashboardScaffold, Skeleton },
  setup() {
    const studentStore = useStudentStore();
    const schedulesQuery = useSchedulesQuery();
    
    const getInstructorNameByCode = (code: string) => {
      if (!schedulesQuery.data.value) return 'Unknown';
      return schedulesQuery.data.value.courses.find(c => c.code === code)?.instructor ?? 'Unknown';
    }

    return {
      studentStore,
      getInstructorNameByCode
    }
  },
}
</script>