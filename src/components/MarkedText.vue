<script setup lang="ts">
import { computed } from 'vue'
import { markParts } from '@/search'

// Text with the searched words highlighted. Plain text in, <mark> around the matches: no v-html.
const props = defineProps<{ text: string; terms?: string[] }>()
const parts = computed(() => markParts(props.text, props.terms ?? []))
</script>

<template>
  <template v-for="(part, i) in parts" :key="i">
    <mark
      v-if="part.marked"
      class="rounded bg-amber-200/70 px-0.5 text-inherit dark:bg-amber-400/30"
      >{{ part.text }}</mark
    >
    <template v-else>{{ part.text }}</template>
  </template>
</template>
