<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getPrices, type Price } from '@/api'

// Live coin prices: the coins a story names (`ids`), or the top ones (`limit`) on the Crypto page.
// Browser only: a price in the server render would be as old as the page cache. Nothing on failure.
const props = defineProps<{ ids?: string[]; limit?: number }>()

const all = ref<Price[] | null>(null)
onMounted(async () => {
  all.value = await loadPrices().catch(() => [])
})
const shown = computed(() => {
  const rows = all.value ?? []
  const picked = props.ids ? rows.filter((p) => props.ids!.includes(p.id)) : rows
  return props.limit ? picked.slice(0, props.limit) : picked
})

function money(usd: number) {
  const digits = usd >= 1000 ? 0 : usd >= 1 ? 2 : 4
  return usd.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: usd < 1 ? undefined : digits,
    maximumFractionDigits: digits,
    maximumSignificantDigits: usd < 1 ? 4 : undefined,
  })
}
const change = (pct: number) => `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(2)}%`
</script>

<script lang="ts">
// one request for every box on the page, again after a minute (the backend caches 2 minutes anyway)
let cached: { at: number; prices: Promise<Price[]> } | undefined
export function loadPrices() {
  if (!cached || Date.now() - cached.at > 60_000) {
    const prices = getPrices()
    cached = { at: Date.now(), prices }
    prices.catch(() => (cached = undefined))
  }
  return cached.prices
}
</script>

<template>
  <section
    v-if="shown.length"
    aria-label="Coin prices"
    class="flex flex-wrap items-center gap-2 text-xs"
  >
    <span
      v-for="coin in shown"
      :key="coin.id"
      class="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 dark:border-zinc-800 dark:bg-zinc-900"
      :title="`${coin.name}, change over 24 hours`"
    >
      <span class="font-bold">{{ coin.symbol }}</span>
      <span class="tabular-nums">{{ money(coin.usd) }}</span>
      <span
        v-if="coin.change_24h !== null"
        class="tabular-nums"
        :class="
          coin.change_24h >= 0
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-rose-600 dark:text-rose-400'
        "
        >{{ change(coin.change_24h) }}</span
      >
    </span>
    <a
      href="https://www.coingecko.com/"
      target="_blank"
      rel="nofollow noopener"
      class="text-zinc-400 hover:underline"
      >Prices: CoinGecko</a
    >
  </section>
</template>
