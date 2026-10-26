<script setup lang="ts">
import { VIEWS_SHOWN_FROM, compact } from '@/site'

defineProps<{ views: number }>()
</script>

<template>
  <span
    v-if="views >= VIEWS_SHOWN_FROM"
    class="inline-flex items-center gap-1"
    :title="`${views.toLocaleString('en')} views`"
  >
    <svg
      viewBox="0 0 24 24"
      class="size-3.5"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
    <span class="sr-only">Views:</span>{{ compact(views) }}
  </span>
</template>
