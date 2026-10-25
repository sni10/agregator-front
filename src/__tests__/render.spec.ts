// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '../entry-server'
import type { Image, Page, Story, StoryDetail } from '../api'

const story: Story = {
  slug: 'php-patches',
  type: 'event',
  category: { slug: 'it', name: 'IT' },
  title: 'PHP releases emergency patches',
  summary: 'Two critical flaws are fixed.',
  event_at: null,
  published_at: '2026-10-21T14:00:00Z',
  source_count: 2,
  image: null,
}
const image: Image = {
  src: 'https://cdn.test/p-1200.webp',
  srcset: 'https://cdn.test/p-320.webp 320w, https://cdn.test/p-1200.webp 1200w',
  width: 1200,
  height: 675,
  author: 'geralt',
  author_url: 'https://pixabay.com/users/geralt-9301/',
  source: 'Pixabay',
  page_url: 'https://pixabay.com/photos/p-1/',
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
    expect(page.head).toContain('<title>PHP releases emergency patches · Renews</title>')
    expect(page.head).toContain('"mainEntityOfPage":"https://site.test/news/php-patches"')
    expect(page.head).toContain('<meta name="robots" content="max-image-preview:large">')
    expect(page.head).toContain('href="https://site.test/rss.xml"')
  })

  it('renders a story without a photo with the gradient cover and a small card', async () => {
    api({ '/publications/php-patches': detail, '/publications': feed })

    const page = await render('/news/php-patches', 'https://site.test')

    expect(page.html).toContain('bg-gradient-to-br')
    expect(page.html).not.toContain('<img')
    expect(page.html).not.toContain('Photo:')
    expect(page.head).toContain('<meta name="twitter:card" content="summary">')
    expect(page.head).not.toContain('og:image')
  })

  it('renders a story photo with its srcset, credit and large previews', async () => {
    api({ '/publications/php-patches': { ...detail, image }, '/publications': feed })

    const page = await render('/news/php-patches', 'https://site.test')

    expect(page.html).toMatch(/<img[^>]+srcset="https:\/\/cdn.test\/p-320.webp 320w,/)
    expect(page.html).toContain('fetchpriority="high"')
    expect(page.html).toContain('href="https://pixabay.com/users/geralt-9301/"')
    expect(page.html).toMatch(/rel="nofollow noopener" target="_blank"[^>]*>geralt<\/a>/)
    expect(page.head).toContain('<meta property="og:image" content="https://cdn.test/p-1200.webp">')
    expect(page.head).toContain('<meta property="og:image:height" content="675">')
    expect(page.head).toContain('<meta name="twitter:card" content="summary_large_image">')
    expect(page.head).toContain('"image":["https://cdn.test/p-1200.webp"]')
  })

  it('credits a photo author without a profile link as plain text', async () => {
    const photo = { ...image, author_url: '' }
    api({ '/publications/php-patches': { ...detail, image: photo }, '/publications': feed })

    const page = await render('/news/php-patches', 'https://site.test')

    expect(page.html).toContain('geralt')
    expect(page.html).not.toContain('pixabay.com/users')
  })

  it('loads feed photos lazily, except the top story', async () => {
    const tile = { ...story, slug: 'other', image }
    api({ '/publications': { ...feed, count: 2, results: [{ ...story, image }, tile] } })

    const page = await render('/', 'https://site.test')

    expect(page.html.match(/<img[^>]+fetchpriority="high"/g)).toHaveLength(1)
    expect(page.html.match(/<img[^>]+loading="lazy"/g)).toHaveLength(1)
    expect(page.html).toContain('sizes="(min-width: 768px) 33vw, 100vw"')
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
    expect(page.head).not.toContain('max-image-preview')
    expect(page.html).toContain('1 story for “php”')
  })
  it('renders the legal pages, linked from the footer, without the cookie banner', async () => {
    api({})

    for (const path of ['/privacy', '/cookies', '/terms', '/disclaimer']) {
      const page = await render(path, 'https://site.test')
      expect(page.status).toBe(200)
      expect(page.html).toContain(`href="${path}"`)
      expect(page.html).not.toContain('role="dialog"') // shown by the client only
    }
  })
})
