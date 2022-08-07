<template>
<div>
    <div class="flex flex-col justify-center text-center items-center">
        <IconSM class="text-xl" />
        <h2>SM Davao / GenSan</h2>
    </div>

    <div>
        
    </div>
</div>
</template>

<script setup lang="ts">
import IconSM from '~icons/payment-center-logos/sm';
import { Student } from '@myuic-api/types';
import { PropType } from 'vue';

defineProps({
    student: {
        type: Object as PropType<Student>,
        required: true
    },
    campus: {
        type: String,
        required: true
    }
});
</script>