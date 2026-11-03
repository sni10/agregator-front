<script setup lang="ts">
import { thousands } from '@/site'

defineProps<{ rating: number }>()
</script>

<template>
  <span
    class="font-semibold text-violet-600 dark:text-violet-400"
    :title="`Rating ${rating.toLocaleString('en')}`"
  >
    <span aria-hidden="true">R {{ thousands(rating) }}K</span>
    <span class="sr-only">Rating: {{ rating }}</span>
  </span>
</template>
