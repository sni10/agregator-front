<script setup lang="ts">
import { useRoute } from 'vue-router'
import { search } from '@/api'
import { useLoad } from '@/composables/useLoad'
import { usePageMeta } from '@/composables/usePageMeta'
import { plural } from '@/site'
import StoryTile from '@/components/StoryTile.vue'
import PageLinks from '@/components/PageLinks.vue'

const route = useRoute()
const q = String(route.query.q ?? '').trim()
const page = Math.max(1, Number(route.query.page) || 1)
const { data, failed } = useLoad(`search:${q}:${page}`, () =>
  q ? search(q, page) : Promise.resolve({ count: 0, next: null, previous: null, results: [] }),
)

usePageMeta(() => ({ title: q ? `Search: ${q}` : 'Search', noindex: true }))
</script>

<template>
  <form action="/search" method="get" role="search" class="mb-8 flex gap-2">
    <input
      name="q"
      type="search"
      :value="q"
      placeholder="Search stories"
      aria-label="Search stories"
      class="w-full max-w-xl rounded-full border border-zinc-200 bg-white px-4 py-2 outline-none focus:border-violet-400 dark:border-zinc-700 dark:bg-zinc-900"
    />
    <button
      class="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900"
    >
      Search
    </button>
  </form>

  <h1 class="mb-6 text-2xl font-black tracking-tight">
    <template v-if="q">{{ data ? plural(data.count, 'story') : '…' }} for “{{ q }}”</template>
    <template v-else>Search the news</template>
  </h1>

  <p v-if="failed" class="text-zinc-500">Search is unavailable right now. Try again in a minute.</p>
  <template v-else-if="data">
    <section class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <StoryTile v-for="story in data.results" :key="story.slug" :story="story" />
    </section>
    <PageLinks :page="page" :count="data.count" />
  </template>
</template>
