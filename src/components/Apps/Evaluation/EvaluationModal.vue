<template>
  <self-modal 
    :title="course.name + ' / ' + course.code" 
    content-class="px-6 pb-8 min-h-[60vh] max-h-[80vh] flex overflow-y-hidden"
    modal-class="max-w-4xl w-full">
    <template #default="{ openModal }">
      <slot :openModal="openModal" />
    </template>

    <template #modal-content>
      <loading-container :is-loading="isFetching || isIdle" v-slot="{ isLoading }">
        <div v-if="isLoading" class="flex justify-center items-center py-8">
          <loader class="h-14 w-14" />
        </div>

        <div class="flex h-full" v-else>
          <tab-group vertical :selected-index="step" @change="step = $event">
            <tab-list class="w-1/3 flex flex-col">
              <tab v-slot="{ selected }" class="border-r-2">
                Welcome
              </tab>
              <tab v-slot="{ selected }" class="border-r-2" :key="cat.title" v-for="cat in data.categories">
                {{ cat.title }}
              </tab>
            </tab-list>
            <tab-panels>
              <tab-panel class="text-center">
                <p v-html="data.instructions"></p>
              </tab-panel>
          
              <tab-panel :key="cat.title" v-for="cat in data.categories" class="w-2/3 flex flex-col divide divide-y">
                <div class="flex flex-col py-3 space-y-4">
                  <div>
                    <h3 class="text-lg font-semibold">{{ cat.title }}</h3>
                    <p class="text-gray-600 dark:text-uic-200">{{ cat.description }}</p>
                  </div>
                  <div class="flex flex-col space-y-2" :key="'q_' + i + '_' + qi" v-for="(q, qi) in cat.questions">
                    <div class="flex justify-between items-center">
                      <p class="w-2/3">{{ q }}</p>
                      <select>
                        <option
                          :key="'r_' + r"
                          v-for="(rLabel, r) in ratings" :value="r">{{ rLabel }}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </tab-panel>
            </tab-panels>
          </tab-group>
        </div>
      </loading-container>
    </template>

    <template #modal-footer>
      <div class="flex justify-end space-x-2">
        <button class="button is-default" :disabled="step < 0">
          Previous
        </button>

        <button 
          @click="$notify({ type: 'info', text: 'Evaluation is read-only.' })" 
          class="button is-primary px-6 py-2">Submit</button>
      </div>
    </template>
  </self-modal>
</template>

<script lang="ts">
import { PropType, ref } from 'vue-demi'
import SelfModal from '../../ui/SelfModal.vue'
import { CourseEvaluationEntry } from '@myuic-api/types'
import { useFacultyEvaluationQuestionnaire } from '../../../stores/evaluationStore'
import LoadingContainer from '../../ui/LoadingContainer.vue'
import Loader from '../../ui/Loader.vue'
import { TabGroup, Tab, TabList, TabPanels, TabPanel } from '@headlessui/vue'
import { ratings } from '@myuic-api/types'

export default {
  components: { 
    SelfModal, 
    LoadingContainer, 
    Loader,
    Tab,
    TabGroup,
    TabList,
    TabPanels,
    TabPanel
  },
  props: {
    course: {
      type: Object as PropType<CourseEvaluationEntry>,
      required: true
    } 
  },
  setup() {
    const step = ref(0);
    const { isFetching, isIdle, data } = useFacultyEvaluationQuestionnaire();

    return {
      data,
      isFetching,
      isIdle,
      ratings,
      step
    }
  }
}
</script>