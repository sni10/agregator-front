<script setup lang="ts">
import { useSSRContext } from 'vue'
import { usePageMeta } from '@/composables/usePageMeta'

// also shown by StoryView for a story that is gone: the page answers 404 either way
if (import.meta.env.SSR) useSSRContext<{ status?: number }>()!.status = 404
usePageMeta(() => ({ title: 'Page not found', noindex: true }))
</script>

<template>
  <section class="py-20 text-center" aria-labelledby="nf-title">
    <p class="text-8xl font-black text-zinc-200 dark:text-zinc-800">404</p>
    <h1 id="nf-title" class="mt-4 text-2xl font-bold">Page not found</h1>
    <RouterLink
      to="/"
      class="mt-6 inline-block rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900"
      >Latest news</RouterLink
    >
  </section>
</template>
