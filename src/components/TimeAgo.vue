<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { formatDate, timeAgo } from '@/site'

// The date as the server prints it, "5 min ago" once in the browser (the same text on hydration)
const props = defineProps<{ iso: string }>()
const text = ref(formatDate(props.iso))
onMounted(() => (text.value = timeAgo(props.iso)))
</script>

<template>
  <time :datetime="iso" :title="formatDate(iso)">{{ text }}</time>
</template>
