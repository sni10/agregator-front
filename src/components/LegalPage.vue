<script setup lang="ts">
// Frame of the legal pages (privacy, cookies, terms, disclaimer): title, date, readable text.
defineProps<{ title: string; updated: string }>()
</script>

<template>
  <article class="legal mx-auto max-w-2xl text-[16px] leading-7 text-zinc-800 dark:text-zinc-200">
    <h1 class="text-3xl font-black tracking-tight md:text-4xl">{{ title }}</h1>
    <p class="mt-2 text-sm text-zinc-500">Last updated: {{ updated }}</p>
    <slot />
  </article>
</template>

<style scoped>
.legal :slotted(h2) {
  margin-top: 2rem;
  font-size: 1.25rem;
  font-weight: 700;
}
.legal :slotted(p),
.legal :slotted(ul) {
  margin-top: 0.75rem;
}
.legal :slotted(ul) {
  list-style: disc;
  padding-left: 1.5rem;
}
.legal :slotted(a) {
  color: var(--color-violet-600);
  text-decoration: underline;
}
.legal :slotted(table) {
  margin-top: 0.75rem;
  width: 100%;
  font-size: 0.875rem;
}
.legal :slotted(th),
.legal :slotted(td) {
  border-bottom: 1px solid var(--color-zinc-200);
  padding: 0.5rem 0.5rem 0.5rem 0;
  text-align: left;
  vertical-align: top;
}
</style>
