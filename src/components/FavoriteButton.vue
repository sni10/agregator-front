<script setup lang="ts">
import { computed, ref } from 'vue'
import { favorites, toggleFavorite } from '@/session'

// ♥ on a tile and on the story page. The server renders it empty (a guest's page); the reader's
// marks come after hydration from the favorites loaded once per session.
const props = defineProps<{ slug: string }>()
const on = computed(() => favorites.has(props.slug))
const failed = ref(false)

async function toggle() {
  failed.value = false
  await toggleFavorite(props.slug).catch(() => (failed.value = true)) // rolled back already
}
</script>

<template>
  <button
    type="button"
    class="inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-sm transition hover:scale-110 dark:bg-zinc-900/90"
    :class="on ? 'text-rose-500' : 'text-zinc-400 hover:text-rose-500'"
    :aria-pressed="on"
    :aria-label="on ? 'Remove from favorites' : 'Add to favorites'"
    :title="
      failed ? `Couldn't save. Try again.` : on ? 'Remove from favorites' : 'Add to favorites'
    "
    @click="toggle"
  >
    <span aria-hidden="true">{{ on ? '♥' : '♡' }}</span>
  </button>
</template>
