// SSR server: `npm run dev` (Vite middleware, HMR) or `npm run preview` (built dist/).
import fs from 'node:fs/promises'
import express from 'express'

const prod = process.argv.includes('--prod') || process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT) || 5173 // 5173: the origin the API allows via CORS

// Micro-cache (production only): a rendered page is served from memory for a short while, so one CPU
// copes with traffic. Feeds change a few times a day, stories almost never.
const CACHE_MAX = 500 // pages
const ttl = (path) => (path.startsWith('/news/') ? 300 : 60) // seconds
const cache = new Map() // url -> { html, status, expires }

const app = express()
app.set('trust proxy', 1) // Caddy in front: req.protocol/host come from X-Forwarded-*
let vite
let template = ''

if (prod) {
  const sirv = (await import('sirv')).default
  template = await fs.readFile('./dist/client/index.html', 'utf-8')
  const assets = sirv('./dist/client', { extensions: [] })
  // static files, but never the raw index.html template — pages always go through render()
  app.use((req, res, next) =>
    req.path === '/' || req.path.endsWith('.html') ? next() : assets(req, res, next),
  )
} else {
  const { createServer } = await import('vite')
  vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  app.use(vite.middlewares)
}

app.use('*all', async (req, res) => {
  const url = req.originalUrl
  const hit = prod && cache.get(url)
  if (hit && hit.expires > Date.now()) return send(res, hit.status, hit.html, req.path)

  try {
    let tpl = template
    let render
    if (prod) {
      render = (await import('./dist/server/entry-server.js')).render
    } else {
      tpl = await vite.transformIndexHtml(url, await fs.readFile('./index.html', 'utf-8'))
      render = (await vite.ssrLoadModule('/src/entry-server.ts')).render
    }

    const r = await render(url, `${req.protocol}://${req.get('host')}`)
    const html = tpl
      .replace('<!--app-head-->', r.head)
      .replace('<!--app-html-->', r.html)
      .replace('<!--app-state-->', r.state)

    if (prod && (r.status === 200 || r.status === 404)) {
      if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value) // oldest first
      cache.set(url, { html, status: r.status, expires: Date.now() + ttl(req.path) * 1000 })
    }
    send(res, r.status, html, req.path)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.error(e)
    res.status(500).end(prod ? 'Internal Server Error' : e.stack)
  }
})

function send(res, status, html, path) {
  res
    .status(status)
    .set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': prod && status === 200 ? `public, max-age=${ttl(path)}` : 'no-store',
    })
    .send(html)
}

app.listen(port, () => console.log(`http://localhost:${port}`))
