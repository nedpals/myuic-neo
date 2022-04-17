<template>
  <div class="sticky inset-x-0 top-0">
    <div class="bg-white dark:bg-primary-900 border-b border-gray-300 dark:border-primary-700 px-3 md:px-5 md:py-0" v-if="title ? true : $route.meta.useHeader ?? true">
      <div class="flex justify-between py-3 md:py-5">
        <span class="text-xl font-bold block">{{ pageTitle ?? 'Unknown page name' }}</span>
        <div class="dashboard-header-actions">
          <slot name="actions"></slot>
        </div>
      </div>
      <div class="overflow-x-auto">
        <ul class="flex space-x-2">
          <li :key="r.name" v-for="r in childRouteLinks" class="inline-flex flex-shrink-0">
            <router-link
              :to="r"
              style="transition: ease 150ms background-color "
              exact-active-class="bg-primary-100 dark:bg-primary-700 !border-primary-500 !dark:border-primary-600 hover:bg-primary-200 dark:hover:bg-primary-800"
              class="px-4 py-2 md:py-3 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-t-lg border-b-4 border-transparent">
              {{ r.meta.pageTitle ?? r.name }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
  
  <main :class="containerClass">
    <slot></slot>
  </main>
</template>

<script>
import { useTitle } from '@vueuse/core';
export default {
  emits: ['reload'],
  props: {
    title: {
      type: String
    },
    containerClass: {
      type: String
    }
  },
  watch: {
    '$route': {
      handler() {
        useTitle(`${this.pageTitle} | MyUIC`);
      },
      immediate: true
    }
  },
  computed: {
    pageTitle() {
      if (this.title) return this.title;
      if (this.$route.matched.length < 3) return this.$route.meta.pageTitle;
      const routes = this.$router.getRoutes();
      const currentRouteData = routes.find(r => r.name === this.$route.matched[this.$route.matched.length - 2].name);
      if (!currentRouteData) return this.$route.meta.pageTitle;
      return currentRouteData.meta.pageTitle;
    },
    childRouteLinks() {
      if (this.$route.matched.length < 3) return [];
      const routes = this.$router.getRoutes();
      const currentRouteData = routes.find(r => r.name === this.$route.matched[this.$route.matched.length - 2].name);
      if (!currentRouteData) return [];
      return currentRouteData.children;
    }
  }
}
</script>

<style lang="postcss">
.dashboard-header-actions .button {
  @apply text-primary-400 hover:text-primary-500 flex items-center space-x-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 px-3 py-3 -my-3 -mx-3 dark:hover:bg-opacity-20;
}
</style>