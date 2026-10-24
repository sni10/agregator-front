<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { PAGE_SIZE } from '@/api'

// Newer / Older links: plain URLs (?page=N), so crawlers reach every story without JavaScript.
const props = defineProps<{ page: number; count: number }>()
const route = useRoute()
const pages = computed(() => Math.max(1, Math.ceil(props.count / PAGE_SIZE)))
const to = (page: number) => ({
  path: route.path,
  query: { ...route.query, page: page > 1 ? page : undefined },
})
</script>

<template>
  <nav v-if="pages > 1" class="mt-10 flex items-center justify-between text-sm" aria-label="Pages">
    <RouterLink
      v-if="page > 1"
      :to="to(page - 1)"
      class="text-violet-600 hover:underline dark:text-violet-400"
      >← Newer</RouterLink
    >
    <span v-else />
    <span class="text-zinc-500">Page {{ page }} of {{ pages }}</span>
    <RouterLink
      v-if="page < pages"
      :to="to(page + 1)"
      class="text-violet-600 hover:underline dark:text-violet-400"
      >Older →</RouterLink
    >
    <span v-else />
  </nav>
</template>
