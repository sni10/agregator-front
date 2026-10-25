<script setup lang="ts">
import { computed } from 'vue'
import type { Story } from '@/api'
import { categoryStyle, formatDate, plural } from '@/site'
import StoryCover from './StoryCover.vue'
import FavoriteButton from './FavoriteButton.vue'
import MarkedText from './MarkedText.vue'

// marks: searched words to highlight in the title and summary
const props = defineProps<{ story: Story; lead?: boolean; marks?: string[] }>()
const style = computed(() => categoryStyle(props.story.category.slug))
</script>

<!-- the heart sits on top of the link, not inside it: a button inside <a> is invalid HTML -->
<template>
  <div class="relative flex flex-col">
    <RouterLink
      v-if="lead"
      :to="`/news/${story.slug}`"
      class="group grid overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm md:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <StoryCover
        :category="story.category.slug"
        :image="story.image"
        sizes="(min-width: 1024px) 720px, 100vw"
        priority
        class="h-56 min-h-[16rem] md:h-full"
      />
      <div class="p-6 md:p-10">
        <span
          class="text-xs font-bold tracking-wider text-violet-600 uppercase dark:text-violet-400"
          >Top story</span
        >
        <h2
          class="mt-2 text-3xl leading-tight font-black tracking-tight group-hover:text-violet-700 md:text-4xl dark:group-hover:text-violet-300"
        >
          {{ story.title }}
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-400">{{ story.summary }}</p>
        <p class="mt-6 text-xs text-zinc-500">
          {{ formatDate(story.published_at) }} · {{ plural(story.source_count, 'source') }}
        </p>
      </div>
    </RouterLink>

    <RouterLink
      v-else
      :to="`/news/${story.slug}`"
      class="group flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <StoryCover
        :category="story.category.slug"
        :image="story.image"
        sizes="(min-width: 768px) 33vw, 100vw"
        class="h-36"
      />
      <div class="flex flex-1 flex-col p-5">
        <h3
          class="text-lg leading-snug font-bold group-hover:text-violet-700 dark:group-hover:text-violet-300"
        >
          <MarkedText :text="story.title" :terms="marks" />
        </h3>
        <p class="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
          <MarkedText :text="story.summary" :terms="marks" />
        </p>
        <div class="mt-auto flex items-center gap-2 pt-4 text-xs text-zinc-500">
          <span class="rounded-full px-2 py-0.5 font-medium" :class="style.badge">{{
            style.label
          }}</span>
          <span>{{ formatDate(story.published_at) }}</span>
          <span class="ml-auto">{{ plural(story.source_count, 'source') }}</span>
        </div>
      </div>
    </RouterLink>
    <FavoriteButton :slug="story.slug" class="absolute top-3 right-3" />
  </div>
</template>
