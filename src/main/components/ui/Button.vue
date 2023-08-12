<template>
    <component :is="as" class="button" :class="[`is-${theme}`, size && `is-${size}`, { 'with-icon': icon || withIcon }]">
        <slot>
            <template v-if="icon">
                <component :is="icon" />
                <span v-if="text">{{ text }}</span>
            </template>
            <template v-else>
                {{ text }}
            </template>
        </slot>
    </component>
</template>

<script setup lang="ts">
import { FunctionalComponent, PropType } from 'vue';

defineProps({
    as: {
        type: String,
        default: 'button'
    },
    icon: {
        type: [Function, Object] as PropType<FunctionalComponent>
    },
    withIcon: {
        type: Boolean,
        default: false
    },
    text: {
        type: String
    },
    theme: {
        type: String as PropType<'light' | 'primary' | 'danger' | 'warning' | 'success' | 'info'>,
        validator: (input: string) => ['light', 'primary', 'danger', 'warning', 'success', 'info'].includes(input),
        default: 'light'
    },
    size: {
        type: String as PropType<'medium'>
    }
});
</script>

<style lang="postcss" scoped>
/* Button */
.button {
  @apply px-3 py-2 rounded-lg font-semibold;
}

.button:disabled {
  @apply pointer-events-none opacity-50;
}

.button.is-medium {
  @apply px-8 py-4;
}

.button.is-primary,
.button.is-light {
  @apply shadow border;
}

.button.is-primary,
.dark .button.dark\:is-primary {
  @apply bg-gradient-to-tr border-primary-500 hover:border-primary-700 text-white from-primary-500 to-primary-400 hover:from-primary-700 hover:to-primary-700;
}

.button.is-light {
  @apply bg-gradient-to-t from-zinc-100 to-white hover:from-zinc-200 hover:to-zinc-200 text-zinc-900;
}

.button.with-icon {
    @apply flex items-center justify-center space-x-2;
}
</style>
