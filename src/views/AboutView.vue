<script setup lang="ts">
import { usePageMeta } from '@/composables/usePageMeta'
import { SITE } from '@/site'

usePageMeta(() => ({
  title: 'How we make the news',
  description: `How ${SITE.name} writes its stories: sources, fact checks and a language model.`,
}))
</script>

<template>
  <article class="mx-auto max-w-2xl space-y-5 text-[17px] leading-8">
    <h1 class="text-3xl font-black tracking-tight md:text-4xl">How we make the news</h1>
    <p>
      {{ SITE.name }} follows IT, AI and crypto publications. When several of them report the same
      event, we bring their articles together into one story and link every one of them under it.
    </p>
    <h2 class="pt-2 text-xl font-bold">Facts first</h2>
    <p>
      From the articles we take only checkable facts: who did what, when, how much, which version.
      Each fact keeps the exact quote it comes from, and a program makes sure the quote, its numbers
      and names really are in that article.
    </p>
    <h2 class="pt-2 text-xl font-bold">Written by a model, checked sentence by sentence</h2>
    <p>
      A language model running on our own computer writes the story from those facts only. Then
      every sentence is checked against them again; a sentence the facts do not support is removed.
      Stories about hacks, lawsuits, fines, regulation or crypto prices need at least two
      independent sources, or a human looks at them first.
    </p>
    <h2 class="pt-2 text-xl font-bold">What we don't do</h2>
    <p>
      We don't copy articles, give investment advice or predict prices. Mistakes still happen: the
      sources linked under every story are the place to read the full details.
    </p>
  </article>
</template>
