<template>
  <modal-window
    title="Evaluate Course"
    :subtitle="course.name + ' / ' + course.code"
    :open="isOpen"
    :should-close="warnUserOnClose"
    @update:open="handleModal"
    content-class="flex overflow-hidden"
    modal-class="max-w-4xl w-full">
      <loading-container :is-loading="isLoading || isProcessing" v-slot="{ isLoading }">
        <div v-if="isLoading" class="w-full sticky left-0 inset-y-0 flex justify-center items-center py-32">
          <loader class="h-13 w-13" />
        </div>

        <div class="flex w-full h-full" v-else-if="!isDone">
          <tab-group vertical manual :selected-index="step" @change="step = $event">
            <tab-list class="steps-nav">
              <Tab as="div">
                <button class="tab-section-link">Reminders</button>
              </Tab>
              <Tab v-if="!isSingle" as="div">
                <button class="tab-section-link" :disabled="1 > step">Notice</button>
              </Tab>
              <Tab v-for="(cat, ci) in data!.categories" :key="cat.title" as="div">
                <button class="tab-section-link" :disabled="ci + tabOffsetStart > step">{{ cat.title }}</button>
              </Tab>
              <Tab as="div">
                <button class="tab-section-link" :disabled="categoriesLength + tabOffsetStart > step">Comments</button>
              </Tab>
              <Tab as="div">
                <button class="tab-section-link" :disabled="categoriesLength + tabOffsetStart + 1 > step">Summary</button>
              </Tab>
            </tab-list>
            <tab-panels ref="panelRef" class="w-full lg:w-3/4 md:min-h-[60vh] md:max-h-[60vh] pt-3 pb-6 overflow-y-auto">
              <tab-panel class="px-3 md:px-6">
                <div class="mb-3 text-center">
                  <h3 class="text-2xl font-semibold">Reminders</h3>
                  <p class="text-lg text-zinc-600 dark:text-primary-200">
                    Please consider the following be considered when evaluating the teacher:
                  </p>
                </div>
                <ol class="list-inside list-decimal space-y-2">
                  <li>Read all the items in each of the category the instructor will be evaluated.</li>
                  <li>Read the description of each of the rating code.</li>
                  <li>
                    Rate the faculty according to the rubric of the rating scale. The Rating Scale for this classroom evaluation instrument is as follows:
                    <ul class="mt-2 ml-2 list-inside list-disc space-y-1">
                      <li class="font-bold">4 - Very Evident</li>
                      <li class="font-bold">3 - Evident</li>
                      <li class="font-bold">2 - Slightly Evident</li>
                      <li class="font-bold">1 - Not evident</li>
                    </ul>
                  </li>
                </ol>
              </tab-panel>

              <tab-panel v-if="!isSingle" class="mx-auto px-3 md:px-6 pb-6">
                <div class="mb-3 text-center">
                  <h3 class="text-2xl font-semibold">Notice</h3>
                </div>
                <p>The following courses have been detected by the evaluation utility:</p>
                <div class="flex flex-col space-y-4 py-2">
                  <box :key="'sub_' + sub.code + '_' + sub.type" v-for="(sub, si) in courses">
                    <div class="flex flex-row space-x-4 items-center">
                      <div class="h-13 w-13 flex-shrink-0">
                        <div
                          :style="{ backgroundImage: `url(${sub.instructorImageUrl})` }"
                          class="bg-zinc-200 dark:bg-uic-500 rounded-full h-full w-full bg-cover bg-center"></div>
                      </div>
                      <div>
                        <h3 class="text-xl font-semibold">{{ sub.name }}</h3>
                        <p>{{ sub.instructor }} • {{ sub.type }}{{ si == 0 || shouldEvaluateAll ? ' • SELECTED' : '' }} </p>
                      </div>
                    </div>
                  </box>
                </div>
                <div class="form-group">
                  <div class="form-control is-horizontal w-full">
                    <input type="checkbox" id="should_evaluate_all" v-model="shouldEvaluateAll">
                    <label for="should_evaluate_all">Evaluate all of the courses aforementioned at once.</label>
                  </div>
                </div>
              </tab-panel>

              <tab-panel :key="cat.title" v-for="(cat, i) in data!.categories" class="flex flex-col divide divide-y">
                <div class="flex flex-col">
                  <div class="mb-3 text-center px-3 md:px-6">
                    <h3 class="text-2xl font-semibold">{{ cat.title }}</h3>
                    <p class="text-lg text-zinc-600 dark:text-primary-200">{{ cat.description }}</p>
                  </div>
                  <div
                    class="border-t flex"
                    :class="{ 'border-b': qi == cat.questions.length - 1 }"
                    :key="'q_' + i + '_' + qi" v-for="(q, qi) in cat.questions">
                    <div class="pl-4 py-4">
                      <span
                        :class="{ 'border-primary-400 bg-primary-400 text-white': isQuestionAnswered(i, qi) }"
                        class="block text-center rounded-full p-2 border dark:border-primary-600 h-10 w-10">{{ qi + 1 }}</span>
                    </div>

                    <div class="flex flex-col flex-1 p-4">
                      <p class="pb-3">{{ q }}</p>

                      <div
                        :disabled="qi != 0 && !isQuestionAnswered(i, qi - 1)"
                        class="disabled:opacity-40 w-full flex md:space-x-2 space-y-2 sm:space-y-0 flex-wrap sm:flex-nowrap">
                        <Button
                          v-for="(rLabel, r) in ratings"
                          @click="setRatingAnswers(getQIndex(i, qi), r)"
                          :key="'r_' + r"
                          :disabled="qi != 0 && !isQuestionAnswered(i, qi - 1)"
                          :theme="isQuestionEqualsTo(i, qi, r) ? 'primary' : 'light'"
                          class="w-full md:flex-1">
                          {{ rLabel }}
                        </Button>
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
                    <p class="text-lg text-zinc-600 dark:text-primary-200">Review first your inputs before submitting.</p>
                  </div>

                  <section :key="cat.title" v-for="(cat, i) in data!.categories" class="border-t py-3 px-3 md:px-6">
                    <h3 class="font-semibold mb-2">{{ cat.title }}</h3>
                    <div class="flex flex-col space-y-4">
                      <div
                        :key="'summary_q_' + i + '_' + qi" v-for="(q, qi) in cat.questions"
                        class="flex justify-between">
                        <p class="w-3/4">{{ q }}</p>
                        <p class="w-1/4 font-semibold text-right">
                          {{ isQuestionEqualsTo(i, qi, 0) ? 'None' : ratings[ratingAnswers[getQIndex(i, qi)]] }}
                        </p>
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

        <div class="flex flex-col items-center justify-center w-full h-full py-16" v-else>
          <icon-done class="w-36 h-36 text-zinc-400 mb-4" />
          <h2 class="text-3xl font-semibold">Your evaluation is done!</h2>
          <p class="text-xl text-zinc-500">Please wait for the evaluation utility to close.</p>
        </div>
      </loading-container>

    <template #footer>
      <div v-if="shouldShowButtons" class="flex justify-end space-x-2">
        <Button v-if="step > 0" @click="step--" theme="light">Previous</button>
        <Button v-if="step <= categoriesLength + tabOffsetStart" @click="step++" :disabled="!shouldProceed(step)" theme="primary" class="px-6 py-2">Next</Button>
        <Button v-else @click="submitEvaluation" theme="primary" class="px-6 py-2">Submit</Button>
      </div>
    </template>
  </modal-window>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, PropType, readonly, ref, watch } from 'vue'
import ModalWindow from '../../ui/ModalWindow.vue'
import { ratings, CourseEvaluationEntry } from '@myuic-api/types'
import { useEvaluationMutation, useEvaluationQuery } from '../../../stores/evaluationStore'
import LoadingContainer from '../../ui/LoadingContainer.vue'
import Loader from '../../ui/Loader.vue'
import { TabGroup, Tab, TabList, TabPanels, TabPanel } from '@headlessui/vue'
import { showDialog } from '../../../composables/modal'
import Box from '../../ui/Box.vue'
import { notify } from 'notiwind'
import { useQueryClient } from '@tanstack/vue-query'
import IconDone from '~icons/ion/happy-outline';
import Button from '../../ui/Button.vue'
import { useLoadingFactory } from '../../../utils'

const emit = defineEmits(['close']);
const { courses } = defineProps({
  courses: {
    type: [Object, Array] as PropType<CourseEvaluationEntry[]>,
    required: true
  }
});

const panelRef = ref<typeof TabPanels>();
const step = ref(0);
const isOpen = ref(true);
const course = !Array.isArray(courses) ? courses : courses[0];
const isSingle = !Array.isArray(courses) ? true : courses.length == 1;
const shouldEvaluateAll = ref(isSingle);
const tabOffsetStart = isSingle ? 1 : 2;
const queryClient = useQueryClient();
const isDone = ref(false);

const {
  questionnaireQuery: { data, ...questionnaireQuery },
  idQueries
} = useEvaluationQuery(
  !Array.isArray(courses)
  ? [{classId: course.classID ?? course.code, classType: course.classType ?? '3'}]
  : courses.map(c => ({classId: c.classID ?? course.code, classType: c.classType ?? '3'})));
const isLoading = useLoadingFactory(questionnaireQuery);
const { mutateAsync, isLoading: isProcessing } = useEvaluationMutation();
const totalQuestionsCount = computed(() => {
  if (isLoading.value) {
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

const categoriesLength = computed(() => data.value?.categories.length ?? 5);

const shouldProceed = (catIdx: number) => {
  if (isLoading.value) return false;
  if (step.value < categoriesLength.value + tabOffsetStart) {
    return isCategoryHasAnswers(catIdx);
  }
  return isCommentsFilledUp.value;
}

const shouldShowButtons = computed(() => {
  if (isDone.value || isProcessing.value || isLoading.value) {
    return false;
  }
  return true;
});

const isQuestionAnswered = (idx: number, qi: number) => {
  const qIdx = getQIndex(idx, qi);
  if (qIdx >= ratingAnswers.value.length) {
    // set the rating to 0 if it's not yet set
    setRatingAnswers(qIdx, 0);
  }
  return ratingAnswers.value[qIdx] !== 0;
}

const isQuestionEqualsTo = (idx: number, qi: number, val: number) => {
  const qIdx = getQIndex(idx, qi);
  if (qIdx >= ratingAnswers.value.length) {
    return false;
  }
  return ratingAnswers.value[qIdx] === val;
}

const isCategoryHasAnswers = (catIdx: number) => {
  if (catIdx < tabOffsetStart) {
    return true;
  }

  const idx = catIdx - tabOffsetStart;
  return data.value?.categories[idx]
    .questions.every((_, qi) => isQuestionAnswered(idx, qi)) ?? false;
}

const isCommentsFilledUp = computed(() => {
  return comments.value.every(c => c.length !== 0);
});

const commentQuestions = readonly([
  'Comments'
]);

const handleModal = (newOpen: boolean) => {
  isOpen.value = newOpen;

  if (!newOpen)
    emit('close');
}

const warnUserOnClose = async () => {
  if (isDone.value || isProcessing.value) {
    return false;
  }

  const ans = await showDialog({
    title: 'Warning',
    content: 'Closing this will lose your progress. Would you like to proceed?',
    actions: [
      {
        label: 'Yes',
        theme: 'primary',
        answer: 'yes'
      },
      {
        label: 'No',
        theme: 'light',
        answer: 'no'
      }
    ],
  });

  return ans === 'yes';
}

// data
const ratingAnswers = ref<number[]>([]);
const setRatingAnswers = (idx: number, val: number) => {
  if (idx >= ratingAnswers.value.length) {
    for (let i = ratingAnswers.value.length; i <= idx; i++) {
      ratingAnswers.value.push(0);
    }
  }
  ratingAnswers.value[idx] = val;
}

const comments = ref<[string]>(['']);
const submitEvaluation = async () => {
  const ans = await showDialog({
    title: 'Confirmation',
    content: `By clicking "Confirm", you agree to the inputs of your evaluation for <b>${course.name}</b> is final.`,
    actions: [
      {
        label: 'Confirm',
        theme: 'primary',
        answer: 'confirm'
      },
      {
        label: 'Cancel',
        theme: 'light',
        answer: 'cancel'
      }
    ]
  });

  if (ans === 'confirm') {
    let successCount = 0;
    let msg = '';
    const toBeEvaluated = Array.isArray(courses) && shouldEvaluateAll.value ? courses.slice() : [course];
    const ratings = ratingAnswers.value.slice(0, totalQuestionsCount.value);
    for (const i of toBeEvaluated.keys()) {
      await mutateAsync({
        ratings,
        comments: comments.value,
        classID: idQueries[i].data!.classID!,
        classType: idQueries[i].data!.classType!,
        instructorID: idQueries[i].data!.instructorID!
      }, {
        onSuccess: ({ data }) => {
          successCount++
          msg = data.message;
        }
      });
    }
    if (import.meta.env.DEV) {
      console.log({toBeEvaluated, successCount});
    }
    if (successCount === toBeEvaluated.length) {
      notify({
        type: 'success',
        text: msg
      });
      isDone.value = true;
      setTimeout(() => handleModal(false), 2000);
      await queryClient.refetchQueries({
        exact: true,
        queryKey: ['evaluation']
      });
    }
  }
}

const unwatchScroll = watch(step, () => {
  panelRef.value?.$el.scrollTo({ top: 0 });
});

onBeforeUnmount(() => {
  idQueries.forEach(q => q.remove());
  questionnaireQuery.remove();
  unwatchScroll();
});
</script>

<style lang="postcss" scoped>
.steps-nav {
  @apply w-1/4 flex-col border-r dark:border-primary-600 hidden md:flex;
}

.steps-nav > div {
  @apply w-full;
}

.tab-section-link {
  @apply w-full px-6 py-4 font-semibold text-left disabled:cursor-default disabled:text-zinc-300 dark:disabled:text-white dark:disabled:text-opacity-50 enabled:hover:bg-zinc-100;
}

.tab-section-link.is-selected, .steps-nav > div[aria-selected="true"] > .tab-section-link {
  @apply text-primary-500 dark:text-primary-100 bg-gradient-to-r from-transparent to-primary-100 dark:to-primary-600;
}
</style>
