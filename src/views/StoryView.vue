<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { countView, getFeed, getStory } from '@/api'
import { useLoad } from '@/composables/useLoad'
import { usePageMeta } from '@/composables/usePageMeta'
import { SOURCE_REL, SITE, categoryStyle, formatDate, plural } from '@/site'
import StoryCover from '@/components/StoryCover.vue'
import StoryRow from '@/components/StoryRow.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import CoinPrices from '@/components/CoinPrices.vue'
import TimeAgo from '@/components/TimeAgo.vue'
import ViewCount from '@/components/ViewCount.vue'
import NotFoundView from './NotFoundView.vue'

const props = defineProps<{ slug: string }>()
// the story, "More on <its first tag>" and "More in <category>": the newest others, each story in one
// list only (none if a feed fails)
const { data, missing, failed } = useLoad(`story:${props.slug}`, async () => {
  const story = await getStory(props.slug)
  const tag = story.tags?.[0]
  const [byCategory, byTag] = await Promise.all([
    getFeed(story.category.slug, 1).catch(() => null),
    tag ? getFeed('', 1, tag.slug).catch(() => null) : null,
  ])
  const onTag = byTag?.results.filter((s) => s.slug !== props.slug).slice(0, 3) ?? []
  const shown = new Set([props.slug, ...onTag.map((s) => s.slug)])
  const more = byCategory?.results.filter((s) => !shown.has(s.slug)).slice(0, 3) ?? []
  return { story, more, tag: onTag.length ? { tag: tag!, stories: onTag } : null }
})
const story = computed(() => data.value?.story)
const more = computed(() => data.value?.more)
const onTag = computed(() => data.value?.tag)
const category = computed(() => story.value?.category.slug ?? '')
const style = computed(() => categoryStyle(category.value))

// in the browser only, also when the router reuses this page for another story
onMounted(() => countView(props.slug))
watch(
  () => props.slug,
  (slug) => countView(slug),
)

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
      keywords: s.tags?.map((tag) => tag.name).join(', ') || undefined,
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
        <TimeAgo :iso="story.published_at" />
        <span>·</span>
        <span>{{ plural(story.source_count, 'source') }}</span>
        <ViewCount :views="story.views" />
        <FavoriteButton
          :slug="story.slug"
          class="ml-auto border border-zinc-200 dark:border-zinc-700"
        />
      </div>
      <CoinPrices v-if="story.coins?.length" :ids="story.coins" class="mt-4" />

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
            :rel="SOURCE_REL"
            target="_blank"
            class="hover:underline"
            >{{ story.image.author }}</a
          >
          <template v-else>{{ story.image.author }}</template>
          /
          <a
            :href="story.image.page_url"
            :rel="SOURCE_REL"
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

      <ul v-if="story.tags?.length" class="mt-8 flex flex-wrap gap-2" aria-label="Topics">
        <li v-for="tag in story.tags" :key="tag.slug">
          <RouterLink
            :to="`/tag/${tag.slug}`"
            class="block rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600 hover:border-violet-400 hover:text-violet-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-violet-300"
            >#&nbsp;{{ tag.name }}</RouterLink
          >
        </li>
      </ul>

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
            <a :href="source.url" target="_blank" :rel="SOURCE_REL" class="group block">
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
        <p class="mt-2 text-xs text-zinc-500">
          Spotted an error?
          <RouterLink
            :to="{
              path: '/contact',
              query: { topic: 'correction', pageUrl: `${SITE.url}/news/${story.slug}` },
            }"
            class="underline"
            >Tell us</RouterLink
          >
        </p>
      </section>
    </article>

    <aside v-if="more?.length || onTag" class="space-y-10 lg:pt-10">
      <section v-if="onTag">
        <h2 class="text-sm font-bold tracking-wider text-zinc-500 uppercase">
          More on
          <RouterLink
            :to="`/tag/${onTag.tag.slug}`"
            class="text-violet-600 hover:underline dark:text-violet-400"
            >#&nbsp;{{ onTag.tag.name }}</RouterLink
          >
        </h2>
        <div class="mt-2 divide-y divide-zinc-200 dark:divide-zinc-800">
          <StoryRow v-for="other in onTag.stories" :key="other.slug" :story="other" />
        </div>
      </section>
      <section v-if="more?.length">
        <h2 class="text-sm font-bold tracking-wider text-zinc-500 uppercase">
          More in {{ style.label }}
        </h2>
        <div class="mt-2 divide-y divide-zinc-200 dark:divide-zinc-800">
          <StoryRow v-for="other in more" :key="other.slug" :story="other" photo />
        </div>
      </section>
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
