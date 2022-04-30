<template>
  <main>
    <form @submit.prevent="updatePassword">
      <div>
        <div class="form-group-info">
          <h2 class="title">Change Password</h2>
          <p class="description">Set new password for currently logged in account.</p>
        </div>

        <div class="form-group">
          <div class="form-control w-full">
            <!-- TODO: create password component -->
            <label for="new_password">New Password</label>
            <input type="password" name="new_password" id="new_password" required>
          </div>
          <div class="form-control w-full">
            <label for="confirm_new_password">Confirm New Password</label>
            <input type="password" name="confirm_new_password" id="confirm_new_password" required>
          </div>
          <div class="form-control ml-auto">
            <button class="button is-primary" type="submit">Change Password</button>
          </div>
        </div>
      </div>
    </form>
  </main>
</template>

<script lang="ts">
import { inject } from 'vue';
import { studentInjectionKey } from '../../keys';
import { useChangePasswordMutation } from '../../stores/studentStore';
import { useRouter } from 'vue-router';
export default {
  setup() {
    const student = inject(studentInjectionKey)!;
    const { mutateAsync: changePassword } = useChangePasswordMutation();
    const router = useRouter();

    const updatePassword = async (e: SubmitEvent) => {
      if (!e.target || !(e.target instanceof HTMLFormElement)) return;
      const fd = new FormData(e.target);
      const newPassword = fd.get('new_password')?.toString()!;
      const confirmNewPassword = fd.get('confirm_new_password')?.toString()!;
      await changePassword({ newPassword, confirmNewPassword });
      e.target.reset();
      router.go(0);
    }

    return { student, updatePassword }
  }
}
</script>
