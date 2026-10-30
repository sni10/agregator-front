<script setup lang="ts">
import { computed } from 'vue'
import type { Story } from '@/api'
import { categoryStyle, sourcesLabel } from '@/site'
import StoryCover from './StoryCover.vue'
import TimeAgo from './TimeAgo.vue'

// A story as one line of a list: a small photo, the headline and the meta. rank: the place in Most read.
const props = defineProps<{ story: Story; rank?: number; photo?: boolean }>()
const style = computed(() => categoryStyle(props.story.category.slug))
</script>

<template>
  <RouterLink :to="`/news/${story.slug}`" class="group flex gap-4 py-3">
    <span
      v-if="rank"
      class="w-6 shrink-0 text-2xl leading-none font-black text-zinc-300 tabular-nums dark:text-zinc-700"
      >{{ rank }}</span
    >
    <StoryCover
      v-if="photo"
      :category="story.category.slug"
      :image="story.image"
      sizes="160px"
      class="h-16 w-24 shrink-0 rounded-lg"
    />
    <div class="min-w-0">
      <h3
        class="leading-snug font-bold group-hover:text-violet-700 dark:group-hover:text-violet-300"
      >
        {{ story.title }}
      </h3>
      <p class="mt-1 flex items-center gap-2 text-xs whitespace-nowrap text-zinc-500">
        <span class="font-semibold" :class="style.text">{{ style.label }}</span>
        <TimeAgo :iso="story.published_at" />
        <span class="truncate">{{ sourcesLabel(story) }}</span>
      </p>
    </div>
  </RouterLink>
</template>
