<template>
  <main class="flex flex-col space-y-4">
    <div v-for="(n, i) in list">
      <div class="form-group-info">
        <h2 class="title">{{ n }}</h2>
      </div>

      <div class="form-group" v-if="!isLoading">
        <div class="form-control w-full md:w-1/2 lg:w-2/3">
          <label for="school_name">School Name</label>
          <input type="text" name="school_name" id="school_name" :value="student.educationalBackground[propertyNames[i]]?.school ?? ''" />
        </div>
        <div class="form-control w-full md:w-1/2 lg:w-1/3">
          <label for="school_year">School Year</label>
          <input type="text" name="school_year" id="school_year" :value="student.educationalBackground[propertyNames[i]]?.schoolYear ?? ''" />
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { useStudentQuery } from '../../stores/studentStore';
import { studentInjectionKey } from '../../keys';

const propertyNames = ['gradeSchool', 'juniorHighSchool', 'seniorHighSchool', 'college', 'graduateStudies', 'postGraduate'];
const list = ['Grade School', 'Junior High School', 'Senior High School', 'College (For Transferee / Graduates Only)', 'Graduate Studies', 'Post Graduate']
const student = inject(studentInjectionKey)!;
const { isLoading } = useStudentQuery();
</script>