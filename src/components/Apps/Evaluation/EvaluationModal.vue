<template>
  <slot :openModal="openModal" />

  <modal-window 
    :title="course.name + ' / ' + course.code" 
    :open="isOpen"
    @update:open="handleModalOpen"
    content-class="flex overflow-hidden"
    modal-class="max-w-4xl w-full">
      <loading-container :is-loading="isFetching || isIdle" v-slot="{ isLoading }">
        <div v-if="isLoading" class="sticky left-0 inset-y-0 flex justify-center items-center py-8">
          <loader class="h-14 w-14" />
        </div>

        <div class="flex h-full" v-if="!isLoading">
          <tab-group vertical manual :selected-index="step" @change="step = $event">
            <tab-list class="w-1/4 flex flex-col border-r <md:hidden">
              <tab v-slot="{ selected }" as="div" class="w-full">
                <button 
                  :class="{ 'text-primary-500 bg-gradient-to-r from-transparent to-primary-100': selected }" 
                  class="w-full px-6 py-4 hover:bg-gray-100 font-semibold text-left">
                  Instructions
                </button>
              </tab>
              <tab v-slot="{ selected }" as="div" class="w-full" :key="cat.title" v-for="(cat, ci) in data.categories">
                <button 
                  :disabled="ci + 1 > step"
                  :class="{ 'text-primary-500 bg-gradient-to-r from-transparent to-primary-100': selected }" 
                  class="w-full px-6 py-4 disabled:cursor-default disabled:text-gray-300 not-disabled:hover:bg-gray-100 font-semibold text-left">
                  {{ cat.title }}
                </button>
              </tab>
            </tab-list>
            <tab-panels ref="panelRef" class="w-full lg:w-3/4 md:min-h-[60vh] md:max-h-[60vh] pt-3 pb-6 overflow-y-auto">
              <tab-panel class="text-center px-6">
                <p v-html="data.instructions"></p>
              </tab-panel>
          
              <tab-panel :key="cat.title" v-for="(cat, i) in data.categories" class="flex flex-col divide divide-y">
                <div class="flex flex-col">
                  <div class="mb-3 text-center px-3 md:px-6">
                    <h3 class="text-2xl font-semibold">{{ cat.title }}</h3>
                    <p class="text-lg text-gray-600 dark:text-primary-200">{{ cat.description }}</p>
                  </div>
                  <div class="border-t flex" :class="{ 'border-b': qi == cat.questions.length - 1 }" :key="'q_' + i + '_' + qi" v-for="(q, qi) in cat.questions">
                    <div class="flex items-center justify-center border-r px-3 md:px-6 py-3 w-1/8">
                      <span>{{ qi + 1 }}</span>
                    </div>
                    
                    <div class="flex flex-col w-7/8 px-3 md:px-6 py-2 md:py-4">
                      <p class="pb-3">{{ q }}</p>
                      
                      <div class="w-full flex md:space-x-2 <sm:space-y-2 <sm:flex-wrap">
                        <button v-for="(rLabel, r) in ratings" :key="'r_' + r" class="button is-light w-full md:flex-1">
                          {{ rLabel }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </tab-panel>
            </tab-panels>
          </tab-group>
        </div>
      </loading-container>

    <template #modal-footer>
      <div class="flex justify-end space-x-2">
        <button @click="step--" class="button is-light" v-if="step > 0">
          Previous
        </button>

        <button @click="step++" v-if="step < 4" class="button is-primary px-6 py-2">Next</button>

        <button 
          v-else
          @click="$notify({ type: 'info', text: 'Evaluation is read-only.' })" 
          class="button is-primary px-6 py-2">Submit</button>
      </div>
    </template>
  </modal-window>
</template>

<script lang="ts">
import { onBeforeUnmount, PropType, ref, watch } from 'vue'
import ModalWindow from '../../ui/ModalWindow.vue'
import { CourseEvaluationEntry } from '@myuic-api/types'
import { useFacultyEvaluationQuestionnaire } from '../../../stores/evaluationStore'
import LoadingContainer from '../../ui/LoadingContainer.vue'
import Loader from '../../ui/Loader.vue'
import { TabGroup, Tab, TabList, TabPanels, TabPanel } from '@headlessui/vue'
import { ratings } from '@myuic-api/types'
import { showDialog } from '../../../modal'

export default {
  components: { 
    ModalWindow, 
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
    const panelRef = ref<typeof TabPanels>();
    const step = ref(0);
    const { isFetching, isIdle, data } = useFacultyEvaluationQuestionnaire();
    const isOpen = ref(false);

    const openModal = () => {
      isOpen.value = true;
    }

    const handleModalOpen = (newOpen: boolean) => {
      if (!newOpen) {
        showDialog({
          title: 'Warning',
          content: 'Closing this will lose your progress. Would you like to proceed?',
          actions: [
            {
              label: 'Yes',
              class: 'is-primary',
              onClick: () => 'yes'
            },
            {
              label: 'No',
              onClick: () => 'no'
            }
          ],
          onResult: (ans: string) => {
            if (ans === 'yes') {
              isOpen.value = newOpen;
            }
            return true;
          }
        });
        return;
      }

      isOpen.value = newOpen;
    }

    const unwatchScroll = watch(step, () => {
      panelRef.value?.$el.scrollTo({ top: 0 });
    });
    
    onBeforeUnmount(() => {
      unwatchScroll();
    });

    return {
      data,
      isFetching,
      isIdle,
      ratings,
      panelRef,
      isOpen,
      handleModalOpen,
      openModal,
      step
    }
  }
}
</script>