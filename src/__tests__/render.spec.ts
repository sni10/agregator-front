// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '../entry-server'
import type { Page, Story, StoryDetail } from '../api'

const story: Story = {
  slug: 'php-patches',
  type: 'event',
  category: { slug: 'it', name: 'IT' },
  title: 'PHP releases emergency patches',
  summary: 'Two critical flaws are fixed.',
  event_at: null,
  published_at: '2026-10-21T14:00:00Z',
  source_count: 2,
}
const detail: StoryDetail = {
  ...story,
  body_html: '<p>The fixes are in <strong>PHP 8.5.12</strong>.</p>',
  sources: [
    { title: 'PHP patches', url: 'https://lwn.net/a', publisher: 'LWN', published_at: null },
  ],
  previous: null,
  follow_ups: [
    { slug: 'php-next', title: 'Another PHP flaw', published_at: '2026-10-23T10:00:00Z' },
  ],
  updated_at: '2026-10-21T15:00:00Z',
}
const feed: Page<Story> = { count: 1, next: null, previous: null, results: [story] }

// the read API, by path
function api(routes: Record<string, unknown>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const path = new URL(url).pathname
      return path in routes
        ? new Response(JSON.stringify(routes[path]), { status: 200 })
        : new Response('{}', { status: 404 })
    }),
  )
}

describe('server render', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('renders the feed with the newest story leading', async () => {
    api({ '/publications': feed })

    const page = await render('/', 'https://site.test')

    expect(page.status).toBe(200)
    expect(page.html).toContain('Top story')
    expect(page.html).toContain('PHP releases emergency patches')
    expect(page.head).toContain('<link rel="canonical" href="https://site.test/">')
    expect(page.state).toContain('feed::1') // the client reuses it instead of loading again
  })

  it('renders a story with its text, sources, follow-ups and NewsArticle data', async () => {
    api({ '/publications/php-patches': detail, '/publications': feed })

    const page = await render('/news/php-patches', 'https://site.test')

    expect(page.status).toBe(200)
    expect(page.html).toContain('<strong>PHP 8.5.12</strong>')
    expect(page.html).toContain('https://lwn.net/a')
    expect(page.html).toContain('What happened next')
    expect(page.head).toContain('"@type":"NewsArticle"')
    expect(page.head).toContain('<meta property="og:type" content="article">')
    expect(page.head).toContain('<title>PHP releases emergency patches · agregator</title>')
  })

  it('answers 404 for an unknown story and an unknown page', async () => {
    api({})

    expect((await render('/news/gone')).status).toBe(404)
    expect((await render('/no/such/page')).status).toBe(404)
  })

  it('answers 503 without caching hints when the API is down', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))

    const page = await render('/')

    expect(page.status).toBe(503)
    expect(page.head).not.toContain('canonical')
  })

  it('keeps search results out of the index', async () => {
    api({ '/search': feed })

    const page = await render('/search?q=php')

    expect(page.head).toContain('<meta name="robots" content="noindex">')
    expect(page.html).toContain('1 story for “php”')
  })
})
