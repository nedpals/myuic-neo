<template>
  <main style="padding-top: calc(var(--safe-area-inset-top) + 3rem)" class="relative flex flex-col h-screen max-w-7xl px-8 pb-8 mx-auto md:border-x border-zinc-300 dark:border-primary-700">
    <div
      v-if="isProcessing || isProfilesLoading"
      class="z-10 bg-white dark:bg-primary-900 bg-opacity-50 dark:bg-opacity-50 h-full max-w-7xl mx-auto absolute inset-0 rounded-lg flex items-center justify-center">
      <loader class="h-16 w-16" />
    </div>
    <div
      class="z-[-1] bg-gradient-to-b from-primary-50 dark:from-primary-800 h-64 absolute inset-0">
    </div>
    <div style="top: var(--safe-area-inset-top)" class="pt-6 pr-6 md:pr-8 absolute left-0 flex justify-end mb-8 w-full">
      <dark-mode-toggle class="self-start" />
    </div>
    <div class="md:mt-8 flex flex-col items-center text-center mb-12">
      <div class="w-24 md:w-48 mb-3 md:mb-8">
        <icon-logo class="w-full h-full text-primary-400" />
      </div>
      <h1 class="text-3xl md:text-4xl font-bold mb-2">MyUIC <span class="font-medium">Neo</span></h1>
    </div>
    <div class="w-full max-w-lg mx-auto relative flex flex-col">
      <h2 class="text-xl md:text-2xl font-bold pb-3 md:pb-6">
        {{ showForm ? 'Login' : 'Login with existing account' }}
      </h2>

      <form v-show="showForm" @submit.prevent="(e) => loginFromForm(e as SubmitEvent)" :ref="el => loginForm = el" class="flex flex-col">
        <div class="flex flex-col space-y-2 py-2">
          <label for="student_id" class="font-lg">Student ID</label>
          <input
            type="text"
            name="student_id"
            id="student_id"
            placeholder="e.g. 20000000xxx"
            pattern="[0-9]{6,13}" required />
        </div>
        <div class="flex flex-col space-y-2 py-2">
          <label for="password" class="font-lg">Password</label>
          <input type="password" name="password" id="password" placeholder="Enter your password" required />
        </div>

        <Button type="submit" theme="primary" size="medium" :ref="el => loginButton = el as any" class="w-full mt-12" text="Login" />
        <Button type="button" theme="light" size="medium" v-if="supportsBiometrics" @click="loginFromBiometrics" class="mt-2" with-icon>
          <icon-biometrics class="text-primary-500" />
          <span>Login with biometrics</span>
        </Button>

        <box
          as="button"
          no-padding
          v-if="profiles && profiles.length !== 0" type="button"
          @click="fillLoginForm(false, ''); showForm = false"
          class="self-start mt-4 w-full text-center py-3 hover:bg-zinc-100 dark:hover:bg-primary-700">
          Login with existing account
        </box>
      </form>

      <div v-show="!showForm" class="flex flex-col space-y-4 -mx-2">
        <box v-for="profile in profiles" no-padding :key="'profile_' + profile.id" class="flex">
          <button @click="fillLoginForm(profile.hasBiometrics, profile.id)" class="hover:bg-zinc-100 dark:hover:bg-primary-700 p-3 flex rounded-l-md w-full h-full flex-1">
            <div class="aspect-square w-16">
              <avatar :src="profile.avatarUrl" />
            </div>
            <div class="flex-1 pl-3 flex flex-col h-full justify-center items-start">
              <span class="block text-xl font-bold">{{ profile.id }}</span>
              <span class="block text-zinc-500 dark:text-primary-300">{{ profile.name }}</span>
              <span v-if="profile.hasBiometrics" class="block text-sm text-zinc-400 dark:text-primary-400 italic">Supports biometrics</span>
            </div>
          </button>

          <button v-tooltip="'Delete profile'" class="text-danger-500 px-3 hover:bg-zinc-100 dark:hover:bg-primary-700 rounded-r-md" @click="deleteProfile(profile.id, profile.hasBiometrics)">
            <icon-trash />
          </button>
        </box>

        <div class="pt-8">
          <box as="button" no-padding @click="fillLoginForm(false, '')" class="hover:bg-zinc-100 dark:hover:bg-primary-700 px-3 py-3 flex items-center justify-between rounded-md w-full h-full">
            <span>Login with another account</span>
            <icon-right class="text-primary-400" />
          </box>
        </div>
      </div>
    </div>
    <footer class="mt-auto text-center pt-3">
      <p>Made with ❤️ by <a class="text-primary-400 hover:underline" href="https://twitter.com/npned">Ned Palacios</a></p>
    </footer>
  </main>
</template>

<script lang="ts" setup>
import Button from '../components/ui/Button.vue';
import IconLogo from '~icons/custom/logo';
import IconRight from '~icons/ion/chevron-right';
import IconTrash from '~icons/ion/trash';
import IconBiometrics from '~icons/ion/finger-print';
import Loader from '../components/ui/Loader.vue';
import { useLoginMutation, useProfiles, useProfileMutation, removeProfile } from '../composables/auth';
import DarkModeToggle from '../components/ui/DarkModeToggle.vue';
import { useRouter } from 'vue-router';
import { onBeforeUnmount, ref, watch } from 'vue';
import Avatar from '../components/ui/Avatar.vue';
import { showDialog } from '../composables/modal';
import appEvents from '../event';
import { notify } from 'notiwind';
import { catchAndNotifyError } from '../utils.js';
import Box from '../components/ui/Box.vue';

const { data: profiles, isLoading: isProfilesLoading, refetch } = useProfiles();
const showForm = ref(false);
const loginButton = ref<InstanceType<typeof Button>>();
const loginForm = ref();
const router = useRouter();
const supportsBiometrics = ref(false);

const { login, isProcessing } = useLoginMutation();
const { mutateAsync: saveProfile } = useProfileMutation();

const deleteProfile = async (id: string, hasBiometrics: boolean) => {
  await removeProfile(id);
  await refetch();
  await appEvents.onDestroyProfile?.({ hasBiometrics });
}

const fillLoginForm = async (hasBiometrics: boolean, id: string, password?: string) => {
  if (!(loginForm.value instanceof HTMLFormElement) || (!loginButton.value || !(loginButton.value.$el instanceof HTMLButtonElement))) {
    return;
  }

  showForm.value = true;
  supportsBiometrics.value = hasBiometrics;

  const studentIdField = loginForm.value.querySelector('input[name="student_id"]');
  if (studentIdField && studentIdField instanceof HTMLInputElement) {
    studentIdField.value = id;
    if (id) {
      studentIdField.readOnly = true;
    } else {
      studentIdField.readOnly = false;
    }
  }

  const passwordField = loginForm.value.querySelector('input[name="password"]');
  if (passwordField && passwordField instanceof HTMLInputElement) {
    if (password) {
      passwordField.value = password;
    } else if (hasBiometrics) {
      const credsFromBiometrics = await fetchCredsFromBiometrics();
      if (credsFromBiometrics) {
        passwordField.value = credsFromBiometrics.password;
      }
    }

    if (passwordField.value) {
      loginButton.value.$el.click();
    }
  }
}

const loginFromForm = async (e: SubmitEvent) => {
  if (!e.target || !(e.target instanceof HTMLFormElement)) return;
  const fd = new FormData(e.target);
  const id = fd.get('student_id')?.toString()!;
  const password = fd.get('password')?.toString()!;

  if (supportsBiometrics.value && !password) {
    await fillLoginForm(true, id);
    return;
  }

  login({ id, password }, {
    onSuccess: async () => {
      (e.target! as HTMLFormElement).reset();
      await router.replace({ name: 'home' });
      await maybePromptSaveProfile(id, password);
    },
    onError: (err) => {
      console.error(err);
    }
  });
}

const fetchCredsFromBiometrics = async () => {
  if (!supportsBiometrics.value) return;

  try {
    if (appEvents.onFetchCredentials) {
      await appEvents.onAuthenticateProfile?.({ isSave: false });
      return await appEvents.onFetchCredentials();
    }

    throw Error();
  } catch(err) {

    notify({
      type: 'error',
      //@ts-ignore
      text: `Unable to authenticate with biometrics. Reason: ${err.toString()}`
    });

    console.error(err);
    return null;
  }
}

const loginFromBiometrics = async () => {
  const creds = await fetchCredsFromBiometrics();
  if (creds) {
    fillLoginForm(false, creds.id, creds.password);
  }
}

const maybePromptSaveProfile = async (id: string, password: string) => {
  if (!profiles.value || profiles.value.findIndex(p => p.id === id) !== -1) {
    return;
  }

  const answer = await showDialog({
    title: 'Save Profile',
    content: 'Would you like to save your profile? Saving your profile helps you login faster the next time around.',
    actions: [
      {
        answer: 'yes',
        theme: 'primary',
        label: 'Yes'
      },
      {
        answer: 'no',
        theme: 'light',
        label: 'No'
      }
    ]
  });

  if (answer === 'yes') {
    let hasBiometrics = false;
    if (profiles.value.every(p => !p.hasBiometrics) && appEvents.onAuthenticateProfile) {
      try {
        await appEvents.onAuthenticateProfile({ isSave: true, id, password });
        if (appEvents.onFetchCredentials && await appEvents.onFetchCredentials()) {
          hasBiometrics = true;
        }
      } catch(e) {
        catchAndNotifyError(e);
        hasBiometrics = false;
      }
    }

    await saveProfile({
      avatarUrl: '',
      id: id,
      hasBiometrics
    });

    await refetch();
  }
}

const unsubscribe = watch(profiles, (profiles) => {
  if (profiles && profiles.length === 0) {
    showForm.value = true;
    loginForm.value.reset();
  }
});

onBeforeUnmount(unsubscribe)
</script>

<style lang="postcss" scoped>
input[name="student_id"], input[name="password"] {
  @apply px-4 py-3 rounded-lg !border-2  outline-primary-500 dark:outline-white focus:border-primary-500 border-zinc-300 dark:focus:border-white dark:border-primary-700 dark:placeholder-primary-400;
}
</style>
