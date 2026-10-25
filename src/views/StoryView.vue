<script setup lang="ts">
import { computed } from 'vue'
import { getFeed, getStory } from '@/api'
import { useLoad } from '@/composables/useLoad'
import { usePageMeta } from '@/composables/usePageMeta'
import { SITE, categoryStyle, formatDate, plural } from '@/site'
import StoryCover from '@/components/StoryCover.vue'
import NotFoundView from './NotFoundView.vue'

const props = defineProps<{ slug: string }>()
// the story and "More in <category>": the newest others of its category (none if the feed fails)
const { data, missing, failed } = useLoad(`story:${props.slug}`, async () => {
  const story = await getStory(props.slug)
  const feed = await getFeed(story.category.slug, 1).catch(() => null)
  const more = feed?.results.filter((s) => s.slug !== props.slug).slice(0, 3) ?? []
  return { story, more }
})
const story = computed(() => data.value?.story)
const more = computed(() => data.value?.more)
const category = computed(() => story.value?.category.slug ?? '')
const style = computed(() => categoryStyle(category.value))

usePageMeta(() => {
  const s = story.value
  if (!s) return {}
  return {
    title: s.title,
    description: s.summary,
    type: 'article',
    publishedAt: s.published_at,
    modifiedAt: s.updated_at,
    image: s.image ?? undefined,
    // url and mainEntityOfPage (the canonical link) are added by the server render
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: s.title,
      description: s.summary,
      image: s.image ? [s.image.src] : undefined,
      datePublished: s.published_at,
      dateModified: s.updated_at,
      articleSection: s.category.name,
      author: { '@type': 'Organization', name: SITE.name },
      publisher: { '@type': 'Organization', name: SITE.name },
      isBasedOn: s.sources.map((source) => source.url),
    },
  }
})
</script>

<template>
  <NotFoundView v-if="missing" />
  <p v-else-if="failed" class="py-20 text-center text-zinc-500">
    This story is unavailable right now. Try again in a minute.
  </p>

  <div v-else-if="story" class="grid gap-10 lg:grid-cols-[1fr_18rem]">
    <article class="min-w-0">
      <RouterLink :to="`/${category}`" class="text-sm text-zinc-500 hover:underline"
        >← {{ style.label }}</RouterLink
      >
      <h1 class="mt-3 text-3xl leading-tight font-black tracking-tight md:text-5xl">
        {{ story.title }}
      </h1>
      <p
        class="mt-5 text-lg leading-relaxed font-medium text-zinc-700 md:text-xl dark:text-zinc-300"
      >
        {{ story.summary }}
      </p>
      <div class="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
        <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="style.badge">{{
          style.label
        }}</span>
        <time :datetime="story.published_at">{{ formatDate(story.published_at) }}</time>
        <span>·</span>
        <span>{{ plural(story.source_count, 'source') }}</span>
      </div>

      <p
        v-if="story.previous"
        class="mt-6 rounded-xl bg-zinc-100 px-4 py-3 text-sm dark:bg-zinc-900"
      >
        Follows up:
        <RouterLink :to="`/news/${story.previous.slug}`" class="font-semibold hover:underline">{{
          story.previous.title
        }}</RouterLink>
      </p>

      <figure class="mt-8">
        <StoryCover
          :category="category"
          :image="story.image"
          sizes="(min-width: 1024px) 720px, 100vw"
          priority
          class="h-64 rounded-2xl md:h-80"
        />
        <figcaption v-if="story.image" class="mt-2 text-xs text-zinc-500">
          Photo:
          <a
            v-if="story.image.author_url"
            :href="story.image.author_url"
            rel="nofollow noopener"
            target="_blank"
            class="hover:underline"
            >{{ story.image.author }}</a
          >
          <template v-else>{{ story.image.author }}</template>
          /
          <a
            :href="story.image.page_url"
            rel="nofollow noopener"
            target="_blank"
            class="hover:underline"
            >{{ story.image.source }}</a
          >
        </figcaption>
      </figure>

      <!-- body_html is rendered from Markdown and sanitized by the backend (nh3 allowlist) -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div
        class="story-body mt-8 space-y-5 text-[17px] leading-8 text-zinc-800 dark:text-zinc-200"
        v-html="story.body_html"
      />

      <section
        v-if="story.follow_ups.length"
        class="mt-10 rounded-2xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-500/30 dark:bg-violet-500/10"
      >
        <h2 class="text-sm font-bold tracking-wider text-violet-700 uppercase dark:text-violet-300">
          What happened next
        </h2>
        <ul class="mt-3 space-y-2">
          <li v-for="next in story.follow_ups" :key="next.slug">
            <RouterLink :to="`/news/${next.slug}`" class="font-semibold hover:underline">{{
              next.title
            }}</RouterLink>
            <span class="ml-2 text-xs text-zinc-500">{{ formatDate(next.published_at) }}</span>
          </li>
        </ul>
      </section>

      <section
        class="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 class="text-sm font-bold tracking-wider text-zinc-500 uppercase">Sources</h2>
        <ul class="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
          <li v-for="source in story.sources" :key="source.url" class="py-3">
            <a :href="source.url" target="_blank" rel="noopener" class="group block">
              <span class="text-xs font-semibold text-violet-600 dark:text-violet-400">{{
                source.publisher
              }}</span>
              <span class="block text-sm text-zinc-700 group-hover:underline dark:text-zinc-300"
                >{{ source.title }} ↗</span
              >
            </a>
          </li>
        </ul>
        <p class="mt-4 text-xs text-zinc-500">
          Every sentence of this story was checked against facts quoted from these articles.
          <RouterLink to="/about" class="underline">How we make the news</RouterLink>
        </p>
      </section>
    </article>

    <aside v-if="more?.length" class="lg:pt-10">
      <h2 class="text-sm font-bold tracking-wider text-zinc-500 uppercase">
        More in {{ style.label }}
      </h2>
      <div class="mt-4 space-y-4">
        <RouterLink
          v-for="other in more"
          :key="other.slug"
          :to="`/news/${other.slug}`"
          class="block rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 class="leading-snug font-bold">{{ other.title }}</h3>
          <p class="mt-1 text-xs text-zinc-500">
            {{ formatDate(other.published_at) }} · {{ plural(other.source_count, 'source') }}
          </p>
        </RouterLink>
      </div>
    </aside>
  </div>
</template>

<style scoped>
/* links and lists inside the rendered body */
.story-body :deep(a) {
  color: var(--color-violet-600);
  text-decoration: underline;
}
.story-body :deep(ul) {
  list-style: disc;
  padding-left: 1.5rem;
}
.story-body :deep(ol) {
  list-style: decimal;
  padding-left: 1.5rem;
}
</style>
