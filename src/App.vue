<script setup lang="ts">
import { NAV, SITE, today } from '@/site'
import { consentOpen } from '@/consent'
import CookieBanner from '@/components/CookieBanner.vue'
import AuthDialog from '@/components/AuthDialog.vue'
import UserMenu from '@/components/UserMenu.vue'
import SearchBox from '@/components/SearchBox.vue'
import CoinPrices from '@/components/CoinPrices.vue'
import TrendingTags from '@/components/TrendingTags.vue'

const SECTIONS = [
  { to: '/latest', label: 'All news' },
  ...NAV.filter((item) => item.slug).map((item) => ({ to: `/${item.slug}`, label: item.label })),
]
const ABOUT = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]
const LEGAL = [
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
      <!-- the date and the markets: a news front page, not a blog -->
      <div
        class="mx-auto hidden max-w-7xl items-center gap-6 border-b border-zinc-100 px-4 py-1.5 text-xs text-zinc-500 md:flex dark:border-zinc-900"
      >
        <span class="shrink-0">{{ today() }}</span>
        <div class="ml-auto hidden lg:block"><CoinPrices :limit="5" /></div>
      </div>
      <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:gap-6">
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
        <SearchBox hotkey class="ml-auto hidden w-56 sm:block lg:w-72" />
        <!-- phones: no room for the box, the search page has a big one -->
        <RouterLink
          to="/search"
          class="ml-auto flex size-9 items-center justify-center rounded-full hover:bg-zinc-100 sm:hidden dark:hover:bg-zinc-800"
          aria-label="Search"
        >
          <svg
            viewBox="0 0 24 24"
            class="size-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" stroke-linecap="round" />
          </svg>
        </RouterLink>
        <UserMenu />
      </div>
      <!-- account pages: nothing loaded on the server for them -->
      <TrendingTags v-if="!$route.meta.private" class="mx-auto max-w-7xl px-4 pb-2" />
    </header>

    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <!-- keyed by URL: every page loads its own data once (useLoad) -->
      <RouterView :key="$route.fullPath" />
    </main>

    <footer class="border-t border-zinc-200 text-sm dark:border-zinc-800">
      <div class="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <RouterLink to="/" class="text-lg font-black tracking-tight">
            {{ SITE.name }}<span class="text-violet-500">.</span>
          </RouterLink>
          <p class="mt-2 max-w-xs text-zinc-500">
            IT, AI and crypto news from several sources at once.
          </p>
        </div>
        <nav aria-label="Sections">
          <h2 class="text-xs font-bold tracking-wider text-zinc-400 uppercase">Sections</h2>
          <ul class="mt-3 space-y-2">
            <li v-for="link in SECTIONS" :key="link.to">
              <RouterLink :to="link.to" class="text-zinc-600 hover:underline dark:text-zinc-400">{{
                link.label
              }}</RouterLink>
            </li>
          </ul>
        </nav>
        <nav aria-label="Renews">
          <h2 class="text-xs font-bold tracking-wider text-zinc-400 uppercase">{{ SITE.name }}</h2>
          <ul class="mt-3 space-y-2">
            <li v-for="link in ABOUT" :key="link.to">
              <RouterLink :to="link.to" class="text-zinc-600 hover:underline dark:text-zinc-400">{{
                link.label
              }}</RouterLink>
            </li>
            <!-- served next to the app, not one of its routes -->
            <li>
              <a href="/rss.xml" class="text-zinc-600 hover:underline dark:text-zinc-400">RSS</a>
            </li>
          </ul>
        </nav>
        <nav aria-label="Legal">
          <h2 class="text-xs font-bold tracking-wider text-zinc-400 uppercase">Legal</h2>
          <ul class="mt-3 space-y-2">
            <li v-for="link in LEGAL" :key="link.to">
              <RouterLink :to="link.to" class="text-zinc-600 hover:underline dark:text-zinc-400">{{
                link.label
              }}</RouterLink>
            </li>
            <li>
              <button
                type="button"
                class="text-zinc-600 hover:underline dark:text-zinc-400"
                @click="consentOpen = true"
              >
                Cookie settings
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <p
        class="border-t border-zinc-200 py-4 text-center text-xs text-zinc-500 dark:border-zinc-800"
      >
        © {{ new Date().getFullYear() }} {{ SITE.name }}
      </p>
    </footer>
    <CookieBanner />
    <AuthDialog />
  </div>
</template>
