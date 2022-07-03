<template>
  <main style="padding-top: calc(3rem + var(--safe-area-inset-top))" class="relative flex flex-col h-screen max-w-7xl px-8 pb-8 mx-auto md:border-x border-gray-300 dark:border-primary-700">
    <div 
      v-if="isProcessing" 
      class="z-10 bg-white dark:bg-primary-900 bg-opacity-50 dark:bg-opacity-50 h-full max-w-7xl mx-auto absolute inset-0 rounded-lg flex items-center justify-center">
      <loader class="h-16 w-16" />
    </div>
    <div class="pt-6 pr-6 md:pr-8 absolute top-0 left-0 flex justify-end mb-8 w-full">
      <dark-mode-toggle class="self-start" />
    </div>
    <div class="md:mt-8 flex flex-col items-center text-center mb-12">
      <div class="w-24 md:w-48 mb-3 md:mb-8">
        <icon-logo class="w-full h-full text-primary-400" />
      </div>
      <h1 class="text-3xl md:text-4xl font-bold mb-2">MyUIC <span class="font-medium">Neo</span></h1>
      <p class="w-80 md:w-90 text-gray-600 dark:text-primary-200 text-xl md:text-2xl">A new student portal concept for UICians in the 21st century.</p>
    </div>
    <div class="w-full max-w-lg mx-auto relative flex flex-col">
      <h2 class="text-xl md:text-2xl font-bold pb-3 md:pb-6">Login</h2>
      <form @submit.prevent="(e) => loginFromForm(e as SubmitEvent)" autocomplete="off">
        <div class="flex flex-col space-y-2 py-2">
          <label for="student_id" class="font-lg">Student ID</label>
          <input 
            type="text" 
            name="student_id"
            id="student_id" 
            placeholder="e.g. 20000000xxx" 
            pattern="[0-9]{6,12}" required />
        </div>
        <div class="flex flex-col space-y-2 py-2">
          <label for="password" class="font-lg">Password</label>
          <input type="password" name="password" id="password" placeholder="Enter your password" required />
        </div>
        <button type="submit" class="button is-primary is-medium w-full mt-12">Login</button>
      </form>
    </div>
    <footer class="mt-auto text-center pt-3">
      <p>Made with ❤️ by <a class="text-primary-400 hover:underline" href="https://twitter.com/npned">Ned Palacios</a></p>
    </footer>
  </main>
</template>

<script lang="ts" setup>
import Loader from '../components/ui/Loader.vue';
import { useLoginMutation } from '../composables/auth';
import IconLogo from '~icons/custom/logo';
import DarkModeToggle from '../components/ui/DarkModeToggle.vue';
import { SafeArea } from 'capacitor-plugin-safe-area';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { login, isProcessing } = useLoginMutation();
const loginFromForm = async (e: SubmitEvent) => {
  try {
    if (!e.target || !(e.target instanceof HTMLFormElement)) return;
    const fd = new FormData(e.target);
    const id = fd.get('student_id')?.toString()!;
    const pw = fd.get('password')?.toString()!;
    await login(id, pw);
    e.target.reset();
    router.replace({ name: 'home' });
  } catch (e) {
    console.error(e);
  }
}
</script>

<style lang="postcss" scoped>
input[name="student_id"], input[name="password"] {
  @apply px-4 py-3 rounded-lg !border-2  outline-primary-500 dark:outline-white focus:border-primary-500 border-gray-300 dark:focus:border-white dark:border-primary-700 dark:placeholder-primary-400;
}
</style>