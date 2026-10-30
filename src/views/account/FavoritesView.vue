<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { errorMessage, getFavorites, hasSession, type Page, type Story } from '@/api'
import { usePageMeta } from '@/composables/usePageMeta'
import { plural } from '@/site'
import StoryTile from '@/components/StoryTile.vue'
import PageLinks from '@/components/PageLinks.vue'
import NotifySettings from '@/components/NotifySettings.vue'

// Client only: the server has no token. An un-hearted story stays until reload (click again to undo).
const route = useRoute()
const router = useRouter()
const page = Math.max(1, Number(route.query.page) || 1)
usePageMeta(() => ({ title: 'Favorites', noindex: true }))

const data = ref<Page<Story> | null>(null)
const error = ref('')

onMounted(async () => {
  if (!hasSession()) return router.replace({ name: 'login', query: { next: route.fullPath } })
  try {
    data.value = await getFavorites(page)
  } catch (e) {
    error.value = errorMessage(e)
  }
})
</script>

<template>
  <div class="mb-6 flex items-center justify-between gap-4">
    <h1 class="text-2xl font-black tracking-tight">
      Favorites
      <span v-if="data" class="text-base font-medium text-zinc-500">{{
        plural(data.count, 'story')
      }}</span>
    </h1>
    <NotifySettings />
  </div>

  <p v-if="error" class="text-zinc-500" role="alert">{{ error }}</p>
  <p v-else-if="!data" class="text-zinc-500" role="status">Loading…</p>
  <p v-else-if="!data.results.length" class="py-20 text-center text-zinc-500">
    No favorites yet. Tap ♥ on a story to keep it here.
  </p>
  <template v-else>
    <section class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <StoryTile v-for="story in data.results" :key="story.slug" :story="story" />
    </section>
    <PageLinks :page="page" :count="data.count" />
  </template>
</template>
