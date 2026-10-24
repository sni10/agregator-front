<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getFeed } from '@/api'
import { useLoad } from '@/composables/useLoad'
import { usePageMeta } from '@/composables/usePageMeta'
import { categoryStyle } from '@/site'
import StoryTile from '@/components/StoryTile.vue'
import PageLinks from '@/components/PageLinks.vue'

const props = defineProps<{ category?: string }>()
const route = useRoute()
const page = Math.max(1, Number(route.query.page) || 1)
const category = props.category ?? ''
const label = category ? categoryStyle(category).label : ''

const { data, failed } = useLoad(`feed:${category}:${page}`, () => getFeed(category, page))
// the first page leads with the newest story; later pages are a plain grid
const lead = computed(() => (page === 1 ? data.value?.results[0] : undefined))
const rest = computed(() => data.value?.results.slice(lead.value ? 1 : 0) ?? [])

usePageMeta(() => ({
  title:
    [label && `${label} news`, page > 1 && `page ${page}`].filter(Boolean).join(', ') || undefined,
  description: label
    ? `${label} news: each story brings several sources together, every claim checked against them.`
    : undefined,
}))
</script>

<template>
  <h1 class="sr-only">{{ label ? `${label} news` : 'Latest IT, AI and crypto news' }}</h1>

  <p v-if="failed" class="py-20 text-center text-zinc-500">
    The news is unavailable right now. Try again in a minute.
  </p>
  <p v-else-if="data && !data.results.length" class="py-20 text-center text-zinc-500">
    No stories here yet.
  </p>

  <template v-else-if="data">
    <section v-if="lead" class="mb-10"><StoryTile :story="lead" lead /></section>
    <h2 class="mb-4 text-sm font-bold tracking-wider text-zinc-500 uppercase">
      {{ label ? `Latest in ${label}` : 'Latest' }}
    </h2>
    <section class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <StoryTile v-for="story in rest" :key="story.slug" :story="story" />
    </section>
    <PageLinks :page="page" :count="data.count" />
  </template>
</template>
