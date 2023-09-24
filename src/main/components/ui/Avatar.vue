<template>
  <skeleton
      :custom-class="(attrs.class ? attrs.class.toString() : '') + ' rounded-full bg-zinc-200 dark:bg-uic-500'">
    <img
        @error="loadFallbackImage"
        :class="attrs.class ? attrs.class.toString() : ''"
        class="user-avatar bg-primary-200 rounded-full object-cover"
        :src="src ? src : fallbackSrc" :alt="alt"/>
  </skeleton>
</template>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import Skeleton from './Skeleton.vue';
import {useAttrs} from "vue";

const attrs = useAttrs();

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  fallbackSrc: {
    type: String,
    default: '/default_avatar.png'
  },
  alt: {
    type: String,
    default: ''
  }
});

function loadFallbackImage(evt: Event) {
  if (evt.target instanceof HTMLImageElement && evt.target.src !== props.fallbackSrc) {
    evt.target.src = props.fallbackSrc;
  }
}
</script>
