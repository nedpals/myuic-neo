<template>
  <modal-window title="About" modal-class="max-w-4xl w-full">
    <div class="max-w-lg w-full mx-auto flex flex-col justify-center text-center items-center py-6">
      <icon-logo class="text-primary-400 h-36 w-36 mb-4" />
      <h1 class="text-4xl font-bold mb-2">MyUIC <span class="font-medium">Neo</span></h1>
      <p class="max-w-sm text-gray-600 dark:text-primary-200 text-2xl">A new student portal concept for UICians in the 21st century.</p>

      <div class="mt-24">
        <p class="mb-18">Version {{ fullVersion }}</p>
        <p>Copyright &copy; 2022 by Ned Palacios and its contributors. Licensed under the <a class="text-primary-500 underline" href="https://github.com/nedpals/myuic-neo/blob/master/LICENSE">AGPL3 license</a>.</p>
      </div>
    </div>
  </modal-window>
</template>

<script lang="ts" setup>
import ModalWindow from './ui/ModalWindow.vue';
import IconLogo from '~icons/custom/logo';
import { useMeta } from '../composables/meta';

const { fullVersion } = useMeta();
</script>