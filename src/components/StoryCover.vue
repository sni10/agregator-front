<script setup lang="ts">
import { computed } from 'vue'
import type { Image } from '@/api'
import { categoryStyle } from '@/site'

// The story's stock photo, or a gradient in the category's colours when it has none.
// The container sets the size; the photo fills it (object-cover).
const props = defineProps<{
  category: string
  image?: Image | null
  sizes?: string
  priority?: boolean // above the fold: load at once, not lazily
}>()
const style = computed(() => categoryStyle(props.category))
</script>

<template>
  <div
    class="relative overflow-hidden"
    :class="image ? 'bg-zinc-200 dark:bg-zinc-800' : ['bg-gradient-to-br', style.cover]"
    aria-hidden="true"
  >
    <!-- decorative: the headline carries the meaning -->
    <img
      v-if="image"
      :loading="priority ? undefined : 'lazy'"
      :fetchpriority="priority ? 'high' : undefined"
      :srcset="image.srcset"
      :sizes="sizes ?? '100vw'"
      :src="image.src"
      :width="image.width"
      :height="image.height"
      alt=""
      class="absolute inset-0 h-full w-full object-cover"
    />
    <span
      v-else
      class="absolute -right-4 -bottom-10 text-[9rem] leading-none text-white/20 select-none"
      >{{ style.glyph }}</span
    >
  </div>
</template>
