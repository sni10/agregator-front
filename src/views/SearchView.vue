<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { search, type SearchQuery } from '@/api'
import { useLoad } from '@/composables/useLoad'
import { usePageMeta } from '@/composables/usePageMeta'
import { NAV, plural } from '@/site'
import { PERIODS, SOURCES, TOPICS, readQuery, searchTerms, writeQuery } from '@/search'
import SearchBox from '@/components/SearchBox.vue'
import StoryTile from '@/components/StoryTile.vue'
import PageLinks from '@/components/PageLinks.vue'

// Words and filters live in the URL: a search can be shared, Back works, and every change is a new
// page (App.vue keys views by URL), so the data loads once per URL like any other page.
const route = useRoute()
const router = useRouter()
const query = readQuery(route.query)
const page = Math.max(1, Number(route.query.page) || 1)
const filtered = !!(query.category || query.since || query.sources)
const asked = !!query.q || filtered
const marks = searchTerms(query.q)

const { data, failed } = useLoad(`search:${JSON.stringify(writeQuery(query))}:${page}`, () =>
  asked
    ? search(writeQuery(query), page)
    : Promise.resolve({ count: 0, next: null, previous: null, results: [], fuzzy: false }),
)

function change(patch: Partial<SearchQuery>) {
  router.push({ name: 'search', query: writeQuery({ ...query, ...patch }) })
}
const clearFilters = () => change({ category: '', since: '', sources: 0 })

const heading = computed(() => {
  if (!query.q) return filtered ? 'Filtered stories' : 'Search the news'
  return `${data.value ? plural(data.value.count, 'story') : '…'} for “${query.q}”`
})

usePageMeta(() => ({ title: query.q ? `Search: ${query.q}` : 'Search', noindex: true }))
</script>

<template>
  <SearchBox large class="mb-5 max-w-2xl" />

  <div class="mb-8 flex flex-wrap items-center gap-2 text-sm" role="group" aria-label="Filters">
    <button
      v-for="item in NAV"
      :key="item.slug"
      type="button"
      class="rounded-full px-3 py-1 font-medium"
      :class="
        query.category === item.slug
          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
          : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800 dark:hover:bg-zinc-800'
      "
      :aria-pressed="query.category === item.slug"
      @click="change({ category: item.slug })"
    >
      {{ item.label }}
    </button>
    <select
      :value="query.since"
      aria-label="Published"
      class="rounded-full border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-800 dark:bg-zinc-900"
      @change="change({ since: ($event.target as HTMLSelectElement).value })"
    >
      <option v-for="p in PERIODS" :key="p.value" :value="p.value">{{ p.label }}</option>
    </select>
    <select
      :value="query.sources"
      aria-label="Sources"
      class="rounded-full border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-800 dark:bg-zinc-900"
      @change="change({ sources: Number(($event.target as HTMLSelectElement).value) })"
    >
      <option v-for="s in SOURCES" :key="s.value" :value="s.value">{{ s.label }}</option>
    </select>
    <select
      v-if="query.q"
      :value="query.sort"
      aria-label="Sort"
      class="rounded-full border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-800 dark:bg-zinc-900"
      @change="change({ sort: ($event.target as HTMLSelectElement).value })"
    >
      <option value="">Best match</option>
      <option value="newest">Newest first</option>
    </select>
    <button v-if="filtered" type="button" class="link text-xs" @click="clearFilters">
      Clear filters
    </button>
  </div>

  <h1 class="mb-2 text-2xl font-black tracking-tight">{{ heading }}</h1>

  <template v-if="!asked">
    <p class="text-zinc-500">
      Search every story by its words, or pick a topic. Tip: <code>"exact phrase"</code>,
      <code>-word</code> to leave a word out, <kbd>/</kbd> jumps to the search box.
    </p>
    <div class="mt-6 flex flex-wrap gap-2">
      <RouterLink
        v-for="topic in TOPICS"
        :key="topic"
        :to="{ name: 'search', query: { q: topic } }"
        class="rounded-full bg-white px-4 py-1.5 text-sm font-medium ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:bg-zinc-800"
        >{{ topic }}</RouterLink
      >
    </div>
  </template>

  <p v-else-if="failed" class="text-zinc-500">
    Search is unavailable right now. Try again in a minute.
  </p>
  <template v-else-if="data">
    <p v-if="data.fuzzy && data.count" class="mb-6 text-sm text-zinc-500">
      No exact matches. Showing stories with similar titles.
    </p>
    <div v-if="!data.count" class="mt-4 text-zinc-500">
      <p>Nothing found. Check the spelling, try fewer or more general words.</p>
      <button v-if="filtered" type="button" class="link mt-2" @click="clearFilters">
        Search without the filters
      </button>
    </div>
    <section class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <StoryTile
        v-for="story in data.results"
        :key="story.slug"
        :story="story"
        :marks="data.fuzzy ? undefined : marks"
      />
    </section>
    <PageLinks :page="page" :count="data.count" />
  </template>
</template>
