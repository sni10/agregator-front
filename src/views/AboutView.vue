<script setup lang="ts">
import { usePageMeta } from '@/composables/usePageMeta'
import { SITE } from '@/site'

usePageMeta(() => ({
  title: 'About',
  description: `${SITE.name} is a daily news aggregator for IT, AI and crypto: the day's stories from trusted sources, in one place.`,
}))
</script>

<template>
  <article class="mx-auto max-w-2xl space-y-5 text-[17px] leading-8">
    <h1 class="text-3xl font-black tracking-tight md:text-4xl">About {{ SITE.name }}</h1>
    <p>
      {{ SITE.name }} is a news aggregator for people who work with technology or simply follow it.
      Every day we gather the latest news on IT, artificial intelligence and crypto from leading
      tech publications, so you can catch up on what matters in a few minutes instead of an hour of
      browsing.
    </p>
    <h2 class="pt-2 text-xl font-bold">One story instead of ten tabs</h2>
    <p>
      When several outlets cover the same event, you don't get the same headline over and over. We
      bring their reports together into one short story with the key facts, and link every original
      article under it, so you can read more from the source you trust.
    </p>
    <h2 class="pt-2 text-xl font-bold">Fresh, all day long</h2>
    <p>
      The feed updates throughout the day. Pick a topic (IT, AI or Crypto) to see only what you care
      about, search for anything we have covered, or follow us by
      <a href="/rss.xml" class="text-violet-600 underline dark:text-violet-400">RSS</a>. When a
      story develops, follow-ups are linked to the original, so you can see what happened next.
    </p>
    <h2 class="pt-2 text-xl font-bold">Facts and sources</h2>
    <p>
      Every story is based on the linked articles only. Sensitive topics such as hacks, lawsuits or
      crypto prices need more than one independent source. We don't give investment advice or
      predict prices.
    </p>
    <p>
      Questions, corrections or copyright notices:
      <RouterLink to="/contact" class="text-violet-600 underline dark:text-violet-400"
        >contact us</RouterLink
      >.
    </p>
  </article>
</template>
