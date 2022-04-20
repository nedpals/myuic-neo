<template>
  <modal-window 
    :title="course.name + ' / ' + course.code" 
    :open="isOpen"
    @update:open="warnUserOnClose"
    content-class="flex overflow-hidden"
    modal-class="max-w-4xl w-full">
      <loading-container :is-loading="isFetching || isIdle || isProcessing" v-slot="{ isLoading }">
        <div v-if="isLoading" class="w-full sticky left-0 inset-y-0 flex justify-center items-center py-32">
          <loader class="h-14 w-14" />
        </div>

        <div class="flex h-full" v-if="!isLoading">
          <tab-group vertical manual :selected-index="step" @change="step = $event">
            <tab-list class="w-1/4 flex flex-col border-r <md:hidden">
              <tab v-slot="{ selected }" as="div" class="w-full">
                <button 
                  :class="{ 'text-primary-500 bg-gradient-to-r from-transparent to-primary-100': selected }" 
                  class="w-full px-6 py-4 hover:bg-gray-100 font-semibold text-left">
                  Reminders
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
              <tab v-slot="{ selected }" as="div" class="w-full">
                <button 
                  :disabled="data.categories.length + 1 > step"
                  :class="{ 'text-primary-500 bg-gradient-to-r from-transparent to-primary-100': selected }" 
                  class="w-full px-6 py-4 disabled:cursor-default disabled:text-gray-300 not-disabled:hover:bg-gray-100 font-semibold text-left">
                  Comments
                </button>
              </tab>
              <tab v-slot="{ selected }" as="div" class="w-full">
                <button 
                  :disabled="data.categories.length + 2 > step"
                  :class="{ 'text-primary-500 bg-gradient-to-r from-transparent to-primary-100': selected }" 
                  class="w-full px-6 py-4 disabled:cursor-default disabled:text-gray-300 not-disabled:hover:bg-gray-100 font-semibold text-left">
                  Summary
                </button>
              </tab>
            </tab-list>
            <tab-panels ref="panelRef" class="w-full lg:w-3/4 md:min-h-[60vh] md:max-h-[60vh] pt-3 pb-6 overflow-y-auto">
              <tab-panel class="px-3 md:px-6">
                <div class="mb-3 text-center">
                  <h3 class="text-2xl font-semibold">Reminders</h3>
                  <p class="text-lg text-gray-600 dark:text-primary-200">
                    Please consider the following be considered when evaluating the teacher
                  </p>
                </div>
                <ol class="list-inside list-decimal space-y-2">
                  <li>Read all the items in each of the category the instructor will be evaluated.</li>
                  <li>Read the description of each of the rating code.</li>
                  <li>
                    Rate the faculty according to the rubric of the rating scale. The Rating Scale for this classroom evaluation instrument is as follows:
                    <ul class="mt-2 ml-2 list-inside list-disc space-y-1">
                      <li class="font-bold">4 - Excellent</li>
                      <li class="font-bold">3 - Very Good</li>
                      <li class="font-bold">2 - Good</li>
                      <li class="font-bold">1 - Fair</li>
                    </ul>
                  </li>
                </ol>
              </tab-panel>
          
              <tab-panel :key="cat.title" v-for="(cat, i) in data.categories" class="flex flex-col divide divide-y">
                <div class="flex flex-col">
                  <div class="mb-3 text-center px-3 md:px-6">
                    <h3 class="text-2xl font-semibold">{{ cat.title }}</h3>
                    <p class="text-lg text-gray-600 dark:text-primary-200">{{ cat.description }}</p>
                  </div>
                  <div 
                    class="border-t flex" 
                    :class="{ 'border-b': qi == cat.questions.length - 1 }" 
                    :key="'q_' + i + '_' + qi" v-for="(q, qi) in cat.questions">
                    <div class="flex items-center justify-center border-r px-3 md:px-6 py-3 w-1/8">
                      <span>{{ qi + 1 }}</span>
                    </div>
                    
                    <div class="flex flex-col w-7/8 px-3 md:px-6 py-2 md:py-4">
                      <p class="pb-3">{{ q }}</p>
                      
                      <div 
                        :disabled="qi != 0 && ratingAnswers[getQIndex(i, qi - 1)] == '0'" 
                        class="disabled:opacity-40 w-full flex md:space-x-2 <sm:space-y-2 <sm:flex-wrap">
                        <button 
                          v-for="(rLabel, r) in ratings" 
                          @click="ratingAnswers[getQIndex(i, qi)] = parseInt(r)"
                          :key="'r_' + r" 
                          :disabled="qi != 0 && ratingAnswers[getQIndex(i, qi - 1)] == '0'"
                          :class="[ratingAnswers[getQIndex(i, qi)].toString() === r  ? 'is-primary' : 'is-light']" 
                          class="button w-full md:flex-1">
                          {{ rLabel }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </tab-panel>

              <tab-panel class="flex flex-col divide divide-y px-3 md:px-6">
                <div class="flex flex-col">
                  <div class="mb-3 text-center">
                    <h3 class="text-2xl font-semibold">Comments</h3>
                  </div>

                  <form @submit.prevent="">
                    <div class="form-group">
                      <div class="form-control w-full" :key="'comment_' + ci" v-for="(cq, ci) in commentQuestions">
                        <label for="address">{{ cq }}</label>
                        <textarea class="h-24" v-model="comments[ci]" required />
                      </div>
                    </div>
                  </form>
                </div>
              </tab-panel>

              <tab-panel class="flex flex-col">
                <div class="flex flex-col">
                  <div class="mb-4 text-center px-3 md:px-6">
                    <h3 class="text-2xl font-semibold">Summary</h3>
                    <p class="text-lg text-gray-600 dark:text-primary-200">Review first your inputs before submitting.</p>
                  </div>

                  <section :key="cat.title" v-for="(cat, i) in data.categories" class="border-t py-3 px-3 md:px-6">
                    <h3 class="font-semibold mb-2">{{ cat.title }}</h3>
                    <div class="flex flex-col space-y-4">
                      <div 
                        :key="'summary_q_' + i + '_' + qi" v-for="(q, qi) in cat.questions" 
                        class="flex justify-between">
                        <p class="w-3/4">{{ q }}</p>
                        <p class="w-1/4 font-semibold text-right">{{ ratingAnswers[getQIndex(i, qi)] === 0 ? 'None' : ratings[parseInt(ratingAnswers[getQIndex(i, qi)])] }}</p>
                      </div>
                    </div>
                  </section>

                  <section :key="'summary_comment_' + ci" v-for="(cq, ci) in commentQuestions" class="border-t py-3 px-3 md:px-6">
                    <h3 class="mb-2">{{ cq }}</h3>
                    <p class="font-semibold">{{ comments[ci].length === 0 ? 'N/A' : comments[ci] }}</p>
                  </section>
                </div>
              </tab-panel>
            </tab-panels>
          </tab-group>
        </div>
      </loading-container>

    <template #footer>
      <div class="flex justify-end space-x-2">
        <button v-if="step > 0" @click="step--" class="button is-light">Previous</button>
        <button v-if="step < 6" @click="step++" :disabled="!shouldProceed(step)" class="button is-primary px-6 py-2">Next</button>
        <button v-else @click="submitEvaluation" class="button is-primary px-6 py-2">Submit</button>
      </div>
    </template>
  </modal-window>
</template>

<script lang="ts">
import { computed, onBeforeUnmount, PropType, readonly, ref, watch } from 'vue'
import ModalWindow from '../../ui/ModalWindow.vue'
import { ratings, CourseEvaluationEntry } from '@myuic-api/types'
import { useEvaluationMutation, useEvaluationQuery } from '../../../stores/evaluationStore'
import LoadingContainer from '../../ui/LoadingContainer.vue'
import Loader from '../../ui/Loader.vue'
import { TabGroup, Tab, TabList, TabPanels, TabPanel } from '@headlessui/vue'
import { showDialog } from '../../../modal'

export default {
  emits: ['close'],
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
  setup({ course }, { emit }) {
    const panelRef = ref<typeof TabPanels>();
    const step = ref(0);
    const isOpen = ref(true);
    const { 
      questionnaireQuery: { isFetching, isIdle, data, ...questionnaireQuery }, 
      idQuery: { data: idQueryData, ...idQuery }
    } = useEvaluationQuery(course.classID ?? course.code, course.classType ?? '3');
    const { mutateAsync, isLoading: isProcessing } = useEvaluationMutation();
    const totalQuestionsCount = computed(() => {
      if (isFetching.value || isIdle.value) {
        return 30;
      }
      return data.value?.categories.map(c => 
          c.questions.length).reduce((p,v) => p + v, 0);
    });

    const accQuestionIdxs = computed(() => {
      return data.value?.categories
        .map((_,i,a) => i == 0 ? 0 : a[i - 1].questions.length)
        .reduce<number[]>((p,v,i) => {
          p.push(i > 0 ? p[i - 1] + v : v);
          return p;
        }, []) ?? [];
    });

    const getQIndex = (cIndex: number, qIndex: number) => {
      const prevLen = cIndex >= 0 ? accQuestionIdxs.value[cIndex] : 0;
      const idx = prevLen + qIndex ?? 0;
      return idx;
    }

    const shouldProceed = (catIdx: number) => {
      if (isFetching.value || isIdle.value) return false;
      return step.value < 5 ? isCategoryHasAnswers(catIdx) : isCommentsFilledUp.value;
    }

    const isCategoryHasAnswers = (catIdx: number) => {
      const questionOffsetStart = 1;
      if (catIdx < questionOffsetStart || catIdx > (data.value?.categories.length ?? 0) + questionOffsetStart) return true;
      const idx = catIdx - questionOffsetStart;
      return data.value?.categories[idx]
        .questions.every((_, qi) => ratingAnswers.value[getQIndex(idx, qi)] !== 0) ?? false;
    }

    const isCommentsFilledUp = computed(() => {
      return comments.value.every(c => c.length !== 0);
    });

    const commentQuestions = readonly([
      'What do you believe the instructor has done especially well in conducting this course?',
      'What might the instructor do to enhance the course?',
      'Additional comments'
    ]);

    const warnUserOnClose = async (newOpen: boolean) => {
      if (newOpen || (!newOpen && isOpen.value === newOpen)) return;
      const ans = await showDialog({
        title: 'Warning',
        content: 'Closing this will lose your progress. Would you like to proceed?',
        actions: [
          {
            label: 'Yes',
            class: 'is-primary',
            answer: 'yes'
          },
          {
            label: 'No',
            class: 'is-light',
            answer: 'no'
          }
        ],
      });

      if (ans === 'yes') {
        isOpen.value = false;
        emit('close');
      }
    }

    // data
    const ratingAnswers = ref([...Array(29).keys()].map(() => 0)); 
    const comments = ref<[string, string, string]>(['', '', '']);
    const submitEvaluation = async () => {
      const ans = await showDialog({
        title: 'Confirmation',
        content: `By clicking "Confirm", you agree to the inputs of your evaluation for <b>${course.name}</b> is final.`,
        actions: [
          {
            label: 'Confirm',
            class: 'is-primary',
            answer: 'confirm'
          },
          {
            label: 'Cancel',
            class: 'is-light',
            answer: 'cancel'
          }
        ]
      });

      if (ans === 'confirm') {
        await mutateAsync({
          ratings: ratingAnswers.value.splice(0, totalQuestionsCount.value),
          comments: comments.value,
          classID: idQueryData.value?.classID!,
          classType: idQueryData.value?.classType!,
          instructorID: idQueryData.value?.instructorID!
        }, {
          onSuccess: () => {
            isOpen.value = false;
            emit('close');
          }
        });
      }
    }

    const unwatchScroll = watch(step, () => {
      panelRef.value?.$el.scrollTo({ top: 0 });
    });
    
    onBeforeUnmount(() => {
      idQuery.remove.value();
      questionnaireQuery.remove.value();
      unwatchScroll();
    });

    return {
      data,
      isFetching,
      isIdle,
      isOpen,
      getQIndex,
      ratings,
      panelRef,
      isProcessing,
      ratingAnswers,
      comments,
      submitEvaluation,
      warnUserOnClose,
      commentQuestions,
      shouldProceed,
      step
    }
  }
}
</script>