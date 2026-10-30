<script setup lang="ts">
import { getFeed, getTag } from '@/api'
import { useLoad } from '@/composables/useLoad'
import { usePageMeta } from '@/composables/usePageMeta'
import { plural } from '@/site'
import { useRoute } from 'vue-router'
import StoryTile from '@/components/StoryTile.vue'
import PageLinks from '@/components/PageLinks.vue'
import NotFoundView from './NotFoundView.vue'

// Every story on one subject (a company, a coin, a topic), newest first. Tags with only a story or two
// stay out of search engines: a page that thin would count against the site.
const props = defineProps<{ slug: string }>()
const route = useRoute()
const page = Math.max(1, Number(route.query.page) || 1)

const { data, missing, failed } = useLoad(`tag:${props.slug}:${page}`, async () => {
  const [tag, feed] = await Promise.all([getTag(props.slug), getFeed('', page, props.slug)])
  return { tag, feed }
})

usePageMeta(() => {
  const tag = data.value?.tag
  if (!tag) return {}
  return {
    title: [`${tag.name} news`, page > 1 && `page ${page}`].filter(Boolean).join(', '),
    description: `All stories about ${tag.name}: each brings several sources together, every claim checked against them.`,
    noindex: !tag.indexed,
  }
})
</script>

<template>
  <NotFoundView v-if="missing" />
  <p v-else-if="failed" class="py-20 text-center text-zinc-500">
    The news is unavailable right now. Try again in a minute.
  </p>

  <template v-else-if="data">
    <header class="mb-8">
      <p class="text-xs font-bold tracking-wider text-violet-600 uppercase dark:text-violet-400">
        Topic
      </p>
      <h1 class="mt-1 text-3xl font-black tracking-tight md:text-4xl">{{ data.tag.name }}</h1>
      <p class="mt-2 text-sm text-zinc-500">{{ plural(data.tag.count, 'story') }}</p>
    </header>
    <section class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <StoryTile v-for="story in data.feed.results" :key="story.slug" :story="story" />
    </section>
    <PageLinks :page="page" :count="data.feed.count" />
  </template>
</template>
