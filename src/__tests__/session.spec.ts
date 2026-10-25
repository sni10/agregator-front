import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Call = { method: string; path: string; auth?: string; body?: unknown }

// The accounts API, by "METHOD /path"; a function decides by the request (e.g. by its token)
function api(routes: Record<string, (call: Call) => [number, unknown?]>) {
  const calls: Call[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const method = init.method ?? 'GET'
      const path = new URL(url).pathname
      const headers = (init.headers ?? {}) as Record<string, string>
      const call = {
        method,
        path,
        auth: headers.Authorization,
        body: init.body ? JSON.parse(String(init.body)) : undefined,
      }
      calls.push(call)
      const route = routes[`${method} ${path}`]
      const [status, body] = route ? route(call) : [404, {}]
      return new Response(body === undefined ? null : JSON.stringify(body), { status })
    }),
  )
  return calls
}

const me = {
  id: '1',
  email: 'reader@example.com',
  dateJoined: '2026-10-25T00:00:00Z',
  isAdmin: false,
}

// fresh modules per test: the access token lives in module state
const load = async () => ({ ...(await import('../api')), ...(await import('../session')) })

describe('session', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('signs in, keeps the refresh token and loads the favorites once', async () => {
    const calls = api({
      'POST /auth/login': () => [200, { access: 'a1', refresh: 'r1' }],
      'GET /me': ({ auth }) => (auth === 'Bearer a1' ? [200, me] : [401, {}]),
      'GET /me/favorites/slugs': () => [200, ['php-patches']],
    })
    const s = await load()

    await s.login('reader@example.com', 'secret')
    await s.initSession()

    expect(localStorage.getItem('refresh')).toBe('r1')
    expect(s.me.value?.email).toBe('reader@example.com')
    expect(s.signedIn.value).toBe(true)
    expect(s.favorites.has('php-patches')).toBe(true)
    expect(calls.filter((c) => c.path === '/me/favorites/slugs')).toHaveLength(1)
  })

  it('refreshes an expired access token and repeats the request unnoticed', async () => {
    localStorage.setItem('refresh', 'r1')
    const calls = api({
      'POST /auth/refresh': ({ body }) =>
        (body as { refresh: string }).refresh === 'r1'
          ? [200, { access: 'a2', refresh: 'r2' }]
          : [401, {}],
      'GET /me': ({ auth }) => (auth === 'Bearer a2' ? [200, me] : [401, {}]),
    })
    const s = await load()

    await expect(s.getMe()).resolves.toEqual(me)
    expect(localStorage.getItem('refresh')).toBe('r2') // single-use: the new one replaces it
    expect(calls.filter((c) => c.path === '/auth/refresh')).toHaveLength(1)
  })

  it('shares one refresh between parallel requests', async () => {
    localStorage.setItem('refresh', 'r1')
    let refreshes = 0
    api({
      'POST /auth/refresh': () =>
        refreshes++ ? [401, {}] : [200, { access: 'a2', refresh: 'r2' }],
      'GET /me': ({ auth }) => (auth === 'Bearer a2' ? [200, me] : [401, {}]),
      'GET /me/favorites/slugs': ({ auth }) => (auth === 'Bearer a2' ? [200, []] : [401, {}]),
    })
    const s = await load()

    await s.initSession()

    expect(refreshes).toBe(1)
    expect(s.signedIn.value).toBe(true)
  })

  it('drops a dead session and shows the site as to a guest', async () => {
    localStorage.setItem('refresh', 'stale')
    api({ 'POST /auth/refresh': () => [401, {}], 'GET /me': () => [401, {}] })
    const s = await load()

    await s.initSession()

    expect(localStorage.getItem('refresh')).toBeNull()
    expect(s.signedIn.value).toBe(false)
  })

  it('asks a guest to sign in from a heart and adds the story after sign-in', async () => {
    const calls = api({
      'POST /auth/login': () => [200, { access: 'a1', refresh: 'r1' }],
      'GET /me': () => [200, me],
      'GET /me/favorites/slugs': () => [200, []],
      'PUT /me/favorites/php-patches': () => [204],
    })
    const s = await load()

    await s.toggleFavorite('php-patches')
    expect(s.authDialog.value).toBe(true)
    expect(calls).toHaveLength(0)

    await s.login('reader@example.com', 'secret')
    await s.initSession()

    expect(s.favorites.has('php-patches')).toBe(true)
    expect(calls.some((c) => c.method === 'PUT' && c.auth === 'Bearer a1')).toBe(true)
    expect(localStorage.getItem('pending-favorite')).toBeNull()
  })

  it('rolls a heart back when saving fails', async () => {
    localStorage.setItem('refresh', 'r1')
    api({
      'POST /auth/refresh': () => [200, { access: 'a1', refresh: 'r2' }],
      'DELETE /me/favorites/php-patches': () => [500, {}],
    })
    const s = await load()
    s.favorites.add('php-patches')

    await expect(s.toggleFavorite('php-patches')).rejects.toThrow('DELETE /me/favorites/php-patches: 500')

    expect(s.favorites.has('php-patches')).toBe(true)
  })

  it('signs out: the refresh token is revoked and forgotten', async () => {
    localStorage.setItem('refresh', 'r1')
    const calls = api({ 'POST /auth/logout': () => [204] })
    const s = await load()
    s.favorites.add('php-patches')

    await s.signOut()

    expect(calls[0]).toMatchObject({ path: '/auth/logout', body: { refresh: 'r1' } })
    expect(localStorage.getItem('refresh')).toBeNull()
    expect(s.favorites.size).toBe(0)
    expect(s.signedIn.value).toBe(false)
  })

  it('turns 400 field errors and rate limits into messages', async () => {
    api({
      'POST /auth/register': () => [400, { password: ['This password is too short.'] }],
      'POST /auth/password-reset': () => [429, {}],
    })
    const s = await load()

    const weak = await s.register('reader@example.com', '1').catch((e) => e)
    expect(s.fieldErrors(weak)).toEqual({ password: 'This password is too short.' })
    const limited = await s.requestPasswordReset('reader@example.com').catch((e) => e)
    expect(s.errorMessage(limited)).toMatch(/try again later/)
  })
})
