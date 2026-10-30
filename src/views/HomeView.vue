<script setup lang="ts">
import { getHome } from '@/api'
import { useLoad } from '@/composables/useLoad'
import { usePageMeta } from '@/composables/usePageMeta'
import { categoryStyle } from '@/site'
import StoryTile from '@/components/StoryTile.vue'
import StoryRow from '@/components/StoryRow.vue'
import CoinPrices from '@/components/CoinPrices.vue'

// The front page in blocks: the top story with the next ones beside it, the latest, then a block per
// category (a big card and a list, or a grid, in turn), Most read and the markets on the side.
// The whole feed, newest first, is /latest.
const { data, failed } = useLoad('home', getHome)

usePageMeta(() => ({}))
</script>

<template>
  <h1 class="sr-only">Latest IT, AI and crypto news</h1>

  <p v-if="failed" class="py-20 text-center text-zinc-500">
    The news is unavailable right now. Try again in a minute.
  </p>
  <p v-else-if="data && !data.lead.length" class="py-20 text-center text-zinc-500">
    No stories here yet.
  </p>

  <template v-else-if="data">
    <section class="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]" aria-label="Top stories">
      <StoryTile :story="data.lead[0]!" lead />
      <div
        v-if="data.lead.length > 1"
        class="divide-y divide-zinc-200 rounded-3xl border border-zinc-200 bg-white px-5 py-2 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <StoryRow v-for="story in data.lead.slice(1)" :key="story.slug" :story="story" photo />
      </div>
    </section>

    <div class="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_20rem]">
      <div class="min-w-0 space-y-12">
        <section v-if="data.latest.length" aria-labelledby="latest">
          <div
            class="mb-4 flex items-baseline justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800"
          >
            <h2 id="latest" class="text-xl font-black tracking-tight">Latest</h2>
            <RouterLink
              to="/latest"
              class="text-sm text-violet-600 hover:underline dark:text-violet-400"
              >All news →</RouterLink
            >
          </div>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <StoryTile v-for="story in data.latest" :key="story.slug" :story="story" />
          </div>
        </section>

        <section
          v-for="(section, i) in data.sections"
          :key="section.category.slug"
          :aria-labelledby="`section-${section.category.slug}`"
        >
          <div
            class="mb-4 flex items-baseline justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800"
          >
            <h2
              :id="`section-${section.category.slug}`"
              class="text-xl font-black tracking-tight"
              :class="categoryStyle(section.category.slug).text"
            >
              {{ categoryStyle(section.category.slug).label }}
            </h2>
            <RouterLink
              :to="`/${section.category.slug}`"
              class="text-sm text-violet-600 hover:underline dark:text-violet-400"
              >All {{ categoryStyle(section.category.slug).label }} news →</RouterLink
            >
          </div>
          <!-- a big card and a list, then a grid, in turn: the page doesn't read as one long grid -->
          <div v-if="i % 2 === 0" class="grid grid-cols-1 gap-6 md:grid-cols-[3fr_2fr]">
            <StoryTile :story="section.stories[0]!" large />
            <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
              <StoryRow
                v-for="story in section.stories.slice(1)"
                :key="story.slug"
                :story="story"
                photo
              />
            </div>
          </div>
          <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <StoryTile v-for="story in section.stories" :key="story.slug" :story="story" />
          </div>
        </section>

        <p class="text-center">
          <RouterLink to="/latest" class="btn">All news, newest first →</RouterLink>
        </p>
      </div>

      <aside class="space-y-10">
        <section v-if="data.most_read.length" aria-labelledby="most-read">
          <h2
            id="most-read"
            class="border-b border-zinc-200 pb-2 text-xl font-black tracking-tight dark:border-zinc-800"
          >
            Most read
          </h2>
          <ol class="divide-y divide-zinc-200 dark:divide-zinc-800">
            <li v-for="(story, i) in data.most_read" :key="story.slug">
              <StoryRow :story="story" :rank="i + 1" />
            </li>
          </ol>
        </section>
        <CoinPrices :limit="10" heading="Markets" />
      </aside>
    </div>
  </template>
</template>
