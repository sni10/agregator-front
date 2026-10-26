import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter } from '../router'
import { HEAD_KEY, STATE_KEY } from '../ssr'
import { markParts, readQuery, searchTerms, writeQuery } from '../search'
import SearchBox from '../components/SearchBox.vue'
import SearchView from '../views/SearchView.vue'
import CoinPrices from '../components/CoinPrices.vue'

// the read API by path; the requested URLs are kept
function api(routes: Record<string, unknown>) {
  const urls: URL[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const u = new URL(url)
      urls.push(u)
      return u.pathname in routes
        ? new Response(JSON.stringify(routes[u.pathname]), { status: 200 })
        : new Response('{}', { status: 503 })
    }),
  )
  return urls
}

async function mountAt<T>(component: T, url: string, props = {}) {
  const router = createRouter()
  await router.push(url)
  await router.isReady()
  const wrapper = mount(component as never, {
    props: props as never,
    attachTo: document.body,
    global: {
      plugins: [router],
      provide: { [HEAD_KEY as symbol]: {}, [STATE_KEY as symbol]: reactive({}) },
    },
  })
  await flushPromises()
  return { wrapper, router }
}

describe('search helpers', () => {
  it('highlights words starting with a stem, not the excluded ones', () => {
    const terms = searchTerms('PHP patches -windows OR model')
    expect(terms).toEqual(['php', 'patch', 'model'])
    const parts = markParts('PHP ships a patch; models and remodels', terms)
    expect(parts.filter((p) => p.marked).map((p) => p.text)).toEqual(['PHP', 'patch', 'models'])
    expect(parts.map((p) => p.text).join('')).toBe('PHP ships a patch; models and remodels')
  })

  it('keeps only known filters in the URL', () => {
    const query = readQuery({ q: ' etf ', category: 'ai', since: 'forever', sources: '3', x: '1' })
    expect(query).toEqual({ q: 'etf', category: 'ai', since: '', sources: 3, sort: '' })
    expect(writeQuery(query)).toEqual({ q: 'etf', category: 'ai', sources: 3 })
  })
})

describe('search box', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('suggests titles while typing and opens the one picked with the keyboard', async () => {
    const urls = api({
      '/search/suggest': [
        { slug: 'etf', title: 'Bitcoin ETFs see outflows', category: 'crypto' },
        { slug: 'mining', title: 'Bitcoin mining in Texas', category: 'it' },
      ],
    })
    const { wrapper, router } = await mountAt(SearchBox, '/')
    const push = vi.spyOn(router, 'push')
    const input = wrapper.get('input')
    ;(input.element as HTMLInputElement).focus()

    await input.setValue('bitc')
    await vi.advanceTimersByTimeAsync(250)
    await flushPromises()

    expect(urls.map((u) => `${u.pathname}${u.search}`)).toEqual(['/search/suggest?q=bitc'])
    expect(wrapper.findAll('[role=option]').map((o) => o.text())).toEqual([
      'CryptoBitcoin ETFs see outflows',
      'ITBitcoin mining in Texas',
      'All results for “bitc” →',
    ])
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(push).toHaveBeenCalledWith('/news/mining') // the story page itself loads lazily
  })

  it('Enter without a pick searches, keeping the filters of the search page', async () => {
    api({})
    const { wrapper, router } = await mountAt(SearchBox, '/search?q=old&category=ai&page=2')

    await wrapper.get('input').setValue('ethereum')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ q: 'ethereum', category: 'ai' })
  })
})

describe('search page', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  const story = {
    slug: 'etf',
    type: 'event',
    category: { slug: 'crypto', name: 'Crypto' },
    title: 'Bitcoin ETFs see outflows',
    summary: 'Funds lost money.',
    image: null,
    event_at: null,
    published_at: '2026-10-21T14:00:00Z',
    source_count: 3,
    views: 0,
  }

  it('sends the filters, marks the words and changes a filter through the URL', async () => {
    const urls = api({
      '/search': { count: 1, next: null, previous: null, results: [story], fuzzy: false },
    })
    const { wrapper, router } = await mountAt(SearchView, '/search?q=bitcoin&sources=3')

    expect(Object.fromEntries(urls[0]!.searchParams)).toEqual({ q: 'bitcoin', sources: '3' })
    await vi.waitFor(() => expect(wrapper.text()).toContain('1 story for “bitcoin”'))
    expect(wrapper.findAll('mark').map((m) => m.text())).toEqual(['Bitcoin'])

    await wrapper.findAll('[aria-label=Filters] button')[3]!.trigger('click') // Crypto
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({
      q: 'bitcoin',
      category: 'crypto',
      sources: '3',
    })
  })

  it('says when the results are close matches', async () => {
    api({ '/search': { count: 1, next: null, previous: null, results: [story], fuzzy: true } })
    const { wrapper } = await mountAt(SearchView, '/search?q=bitcoen')

    await vi.waitFor(() => expect(wrapper.text()).toContain('No exact matches'))
    expect(wrapper.findAll('mark')).toEqual([])
  })
})

describe('coin prices', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('shows the coins of a story with the 24 h change', async () => {
    api({
      '/prices': [
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', usd: 80602, change_24h: 0.6 },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', usd: 2345.63, change_24h: -1.3 },
        { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', usd: 0.123456, change_24h: null },
      ],
    })
    const { wrapper } = await mountAt(CoinPrices, '/', { ids: ['ethereum', 'dogecoin'] })

    expect(wrapper.text()).toBe('ETH$2,346▼ 1.30%DOGE$0.1235Prices: CoinGecko')
  })
})
