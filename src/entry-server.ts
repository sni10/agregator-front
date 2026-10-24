import { renderToString } from 'vue/server-renderer'
import { createApp } from './main'
import { SITE } from './site'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// `<` escaped so data can't close the <script> it's embedded in
const json = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')

export async function render(url: string, origin = '') {
  const { app, router, state, head } = createApp()

  await router.push(url)
  await router.isReady()

  // components may set ctx.status (e.g. 404 for an unknown story) via useSSRContext()
  const ctx: { status?: number } = {}
  const html = await renderToString(app, ctx)

  const m = head.meta?.value
  const status = router.currentRoute.value.name === 'not-found' ? 404 : (ctx.status ?? 200)
  // the feed's ?page=2 is a page of its own; other query strings (?q=) are not indexed anyway
  const page = router.currentRoute.value.query.page
  const path = router.currentRoute.value.path + (page && page !== '1' ? `?page=${page}` : '')
  const pageUrl = !m?.noindex && status === 200 ? origin + path : ''
  const tags = m
    ? [
        `<title>${esc(m.title)}</title>`,
        `<meta name="description" content="${esc(m.description)}">`,
        `<meta property="og:type" content="${m.type ?? 'website'}">`,
        `<meta property="og:site_name" content="${esc(SITE.name)}">`,
        `<meta property="og:title" content="${esc(m.title)}">`,
        `<meta property="og:description" content="${esc(m.description)}">`,
        `<meta name="twitter:card" content="summary">`,
        m.publishedAt
          ? `<meta property="article:published_time" content="${esc(m.publishedAt)}">`
          : '',
        m.modifiedAt
          ? `<meta property="article:modified_time" content="${esc(m.modifiedAt)}">`
          : '',
        m.noindex ? `<meta name="robots" content="noindex">` : '',
        pageUrl ? `<meta property="og:url" content="${esc(pageUrl)}">` : '',
        pageUrl ? `<link rel="canonical" href="${esc(pageUrl)}">` : '',
        m.jsonLd
          ? `<script type="application/ld+json">${json({ ...m.jsonLd, url: pageUrl || undefined })}</script>`
          : '',
      ]
        .filter(Boolean)
        .join('\n    ')
    : ''

  return {
    html,
    head: tags,
    state: `<script>window.__SSR_STATE__=${json(state)}</script>`,
    status,
  }
}
