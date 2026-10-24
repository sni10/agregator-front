<script setup lang="ts">
import { computed } from 'vue'
import { categoryStyle } from '@/site'

// Stand-in for the stock photo (spec §9.1, later): a gradient in the category's colours.
const props = defineProps<{ category: string }>()
const style = computed(() => categoryStyle(props.category))
</script>

<template>
  <div class="relative overflow-hidden bg-gradient-to-br" :class="style.cover" aria-hidden="true">
    <span class="absolute -right-4 -bottom-10 text-[9rem] leading-none text-white/20 select-none">{{
      style.glyph
    }}</span>
    <span
      class="absolute top-3 left-3 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white uppercase"
      >{{ style.label }}</span
    >
  </div>
</template>
