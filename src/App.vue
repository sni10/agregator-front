<script setup lang="ts">
import { NAV, SITE } from '@/site'
import { consentOpen } from '@/consent'
import CookieBanner from '@/components/CookieBanner.vue'

const LEGAL = [
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/cookies', label: 'Cookies' },
  { to: '/terms', label: 'Terms' },
  { to: '/disclaimer', label: 'Disclaimer' },
]
</script>

<template>
  <div
    class="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100"
  >
    <header
      class="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80"
    >
      <div class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:gap-6">
        <RouterLink to="/" class="text-lg font-black tracking-tight">
          {{ SITE.name }}<span class="text-violet-500">.</span>
        </RouterLink>
        <nav class="flex gap-1 text-sm" aria-label="Categories">
          <RouterLink
            v-for="item in NAV"
            :key="item.slug"
            :to="`/${item.slug}`"
            class="rounded-full px-3 py-1 font-medium"
            :class="
              $route.path === `/${item.slug}`
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            "
            >{{ item.label }}</RouterLink
          >
        </nav>
        <form action="/search" method="get" role="search" class="ml-auto hidden sm:block">
          <input
            name="q"
            type="search"
            placeholder="Search"
            aria-label="Search stories"
            :value="$route.name === 'search' ? $route.query.q : ''"
            class="w-44 rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm outline-none focus:border-violet-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </form>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <!-- keyed by URL: every page loads its own data once (useLoad) -->
      <RouterView :key="$route.fullPath" />
    </main>

    <footer
      class="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800"
    >
      <nav class="flex flex-wrap justify-center gap-x-4 gap-y-2 px-4" aria-label="Site">
        <RouterLink
          v-for="link in LEGAL"
          :key="link.to"
          :to="link.to"
          class="underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >{{ link.label }}</RouterLink
        >
        <button
          type="button"
          class="underline hover:text-zinc-700 dark:hover:text-zinc-300"
          @click="consentOpen = true"
        >
          Cookie settings
        </button>
        <!-- served next to the app, not one of its routes -->
        <a href="/rss.xml" class="underline hover:text-zinc-700 dark:hover:text-zinc-300">RSS</a>
      </nav>
      <p class="mt-3">© {{ new Date().getFullYear() }} {{ SITE.name }}</p>
    </footer>
    <CookieBanner />
  </div>
</template>
