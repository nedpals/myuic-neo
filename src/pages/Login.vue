<template>
  <main :style="backgroundImageCss" class="h-screen w-screen !md:bg-cover bg-no-repeat !md:bg-center overflow-hidden">
    <div class="max-w-[1920px] mx-auto h-full relative flex flex-col md:flex-row">
      <div class="bg-gradient-to-r md:bg-gradient-to-b from-primary-500 to-transparent h-18 md:h-full w-full md:w-18">

      </div>
      <div class="relative flex md:items-center bg-white dark:bg-primary-800 <md:h-full w-full md:w-100 shadow-lg p-8 z-10">
        <loading-container :is-loading="isProcessing" v-slot="{ isLoading }">
          <div 
            v-if="isLoading" 
            class="bg-white dark:bg-primary-800 bg-opacity-50 dark:bg-opacity-50 h-full w-full absolute inset-0 rounded-lg flex items-center justify-center">
            <loader class="h-16 w-16" />
          </div>
        </loading-container>
      
        <div class="md:mb-48 w-full flex flex-col">
          <div class="flex justify-between mb-4">
            <div class="h-14 w-14">
              <icon-logo class="w-full h-full text-primary-500 dark:text-primary-400" />
            </div>

            <dark-mode-toggle class="self-start" />
          </div>
          <h2 class="text-3xl font-bold pb-6">Login</h2>
          <form @submit.prevent="login" autocomplete="off">
            <div class="flex flex-col space-y-2 py-2">
              <label for="student_id" class="font-lg">Student ID</label>
              <input type="text" name="student_id" id="student_id" placeholder="e.g. 20000000xxx" pattern="[0-9]{6,12}" required class="px-4 py-3 rounded-lg border bg-gray-100 border-gray-300" />
            </div>
            <div class="flex flex-col space-y-2 py-2">
              <label for="password" class="font-lg">Password</label>
              <input type="password" name="password" id="password" class="px-4 py-3 rounded-lg border bg-gray-100 border-gray-300" required />
            </div>
            <div class="flex flex-col-reverse md:flex-row justify-between pt-4">
              <div class="flex flex-col <md:mt-8 space-y-1">
                <a href="#" class="hover:underline text-primary-600 dark:text-primary-200">Forgot password?</a>
                <a href="#" class="hover:underline text-primary-600 dark:text-primary-200">Open a Support Ticket</a>
              </div>
              <button type="submit" class="button is-primary is-medium">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import backgroundImageUrl from '../assets/BG4.jpeg';
import Loader from '../components/ui/Loader.vue';
import LoadingContainer from '../components/ui/LoadingContainer.vue';
import { useLoginMutation } from '../auth';
import IconLogo from '~icons/custom/logo';
import DarkModeToggle from '../components/ui/DarkModeToggle.vue';
import { useQueryClient } from 'vue-query';

export default {
  components: { LoadingContainer, Loader, IconLogo, DarkModeToggle },
  setup() {
    const { login, isProcessing } = useLoginMutation();
    const queryClient = useQueryClient();
    return { login, isProcessing, queryClient };
  },
  computed: {
    backgroundImageCss(): Record<string, any> {
      return {
        'background-image': 'url('+backgroundImageUrl+')', 
        'background-size': '100%',
        'background-position': '100% -27%'
      }
    }
  },
  methods: {
    async login(e: SubmitEvent) {
      try {
        if (!e.target || !(e.target instanceof HTMLFormElement)) return;
        const fd = new FormData(e.target);
        const id = fd.get('student_id')?.toString()!;
        const pw = fd.get('password')?.toString()!;
        await this.login(id, pw);
        e.target.reset();
        this.$router.replace({ name: 'home' });
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>