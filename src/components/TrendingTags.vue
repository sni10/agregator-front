<script setup lang="ts">
import { getTrendingTags } from '@/api'
import { useLoad } from '@/composables/useLoad'

// The subjects of the moment under the menu: tag pages as a second navigation. Nothing when the API
// has none or fails; the page itself is not affected (optional).
const { data } = useLoad('trending-tags', getTrendingTags, { optional: true })
</script>

<template>
  <nav
    v-if="data?.length"
    aria-label="Trending topics"
    class="flex items-center gap-2 overflow-x-auto text-sm whitespace-nowrap [scrollbar-width:none]"
  >
    <span class="text-xs font-bold tracking-wider text-zinc-400 uppercase">Trending</span>
    <RouterLink
      v-for="tag in data"
      :key="tag.slug"
      :to="`/tag/${tag.slug}`"
      class="rounded-full px-2.5 py-0.5 text-zinc-600 hover:bg-zinc-100 hover:text-violet-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-violet-300"
      :class="
        $route.path === `/tag/${tag.slug}` &&
        'bg-zinc-100 text-violet-700 dark:bg-zinc-800 dark:text-violet-300'
      "
      >#&nbsp;{{ tag.name }}</RouterLink
    >
  </nav>
</template>
