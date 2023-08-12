<template>
    <div class="items-center justify-center flex flex-col">
        <slot name="icon">
            <component
                :is="icon"
                class="text-7xl text-zinc-400 dark:text-primary-200" />
        </slot>

        <h2 class="mt-2 text-2xl text-center text-zinc-500 dark:text-white">
            {{ title }}
        </h2>

        <p v-if="description" class="text-lg text-center text-zinc-400 dark:text-primary-200">
            {{ description }}
        </p>

        <div v-if="!!$slots.actions">
            <slot name="actions"></slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { FunctionalComponent, PropType } from 'vue';

defineProps({
    title: {
        type: String,
        required: true
    },
    icon: {
        type: Object as PropType<FunctionalComponent>
    },
    description: {
        type: String
    }
});
</script>
