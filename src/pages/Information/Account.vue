<template>
  <main>
    <!-- TODO: -->
    <form @submit.prevent="">
      <input type="hidden" name="account_id">
      <input type="hidden" name="username" :value="student.number">
      <div>
        <div class="form-group-info">
          <h2 class="title">Change Password</h2>
          <p class="description">Set new password for currently logged in account.</p>
        </div>

        <div class="form-group">
          <div class="form-control w-full">
            <label for="password">New Password</label>
            <input type="password" name="password" id="password">
          </div>
          <div class="form-control w-full">
            <label for="confirm_password">Confirm Password</label>
            <input type="password" name="confirm_password" id="confirm_password">
          </div>
          <div class="form-control ml-auto">
            <button class="button is-primary">Change Password</button>
          </div>
        </div>
      </div>
    </form>
  </main>
</template>

<script lang="ts">
import { computed, PropType } from 'vue';
import { Student } from '@myuic-api/types';
export default {
  emits: ['update:student'],
  props: {
    student: {
      type: Object as PropType<Student>,
      required: true
    }
  },
  setup(props, { emit }) {
    const student = computed({
      get: () => props.student,
      set: (v) => emit('update:student', v)
    });
    return { student: student }
  }
}
</script>
