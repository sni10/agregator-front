// The read API of agregator-backend (OpenAPI: <API>/api/docs/). Published stories only, no auth.

export interface Category {
  slug: string
  name: string
}

// Stock photo of a story: 16:9 WebP variants, absolute URLs
export interface Image {
  src: string // the 1200 px variant
  srcset: string
  width: number
  height: number
  author: string
  author_url: string // '' when the author has no profile link
  source: string // e.g. Pixabay
  page_url: string
}

export interface Story {
  slug: string
  type: 'event' | 'digest'
  category: Category
  title: string
  summary: string
  event_at: string | null // when it happened (earliest source)
  published_at: string
  source_count: number
  views: number // readers who opened it; the front shows it only from VIEWS_SHOWN_FROM
  image: Image | null // null: the category gradient stands in
}

export interface StoryLink {
  slug: string
  title: string
  published_at: string
}

export interface Source {
  title: string
  url: string
  publisher: string
  published_at: string | null
}

export interface StoryDetail extends Story {
  body_html: string // rendered and sanitized by the backend: safe for v-html
  sources: Source[]
  previous: StoryLink | null // the story this one follows up
  follow_ups: StoryLink[]
  coins: string[] // CoinGecko ids of the coins the story names: their prices come from getPrices()
  updated_at: string
}

export interface Page<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const PAGE_SIZE = 20 // the backend's FeedPagination

export class ApiError extends Error {
  status: number
  data: Record<string, unknown> // response body: field errors {field: [msg]}, {code}, …
  constructor(status: number, message: string, data: Record<string, unknown> = {}) {
    super(message)
    this.status = status
    this.data = data
  }
}

// 400 field errors -> {field: first message}
export function fieldErrors(e: unknown): Record<string, string> {
  if (!(e instanceof ApiError) || e.status !== 400) return {}
  return Object.fromEntries(
    Object.entries(e.data).map(([k, v]) => [k, String(Array.isArray(v) ? v[0] : v)]),
  )
}

// One line for the reader, for any failure that isn't a form field error
export function errorMessage(e: unknown) {
  if (!(e instanceof ApiError)) return 'Something went wrong. Try again.'
  if (e.status === 0) return 'No connection. Check your internet and try again.'
  if (e.status === 429) return 'Too many attempts. Please try again later.'
  return `Something went wrong (${e.status}). Try again in a minute.`
}

// Browser: VITE_API_URL (baked in at build). Server render in Docker: API_INTERNAL_URL at runtime,
// since localhost inside the container is the container itself.
const API_URL = (
  import.meta.env.SSR
    ? (process.env.API_INTERNAL_URL ?? import.meta.env.VITE_API_URL)
    : import.meta.env.VITE_API_URL
) as string | undefined

// Public reads: never with a token, so the server render and the micro-cache see the same pages for
// everybody (and a dead token can't turn them into 401s).
async function get<T>(path: string, query: Record<string, string | number | undefined> = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, String(value))
  const url = `${API_URL}${path}${params.size ? `?${params}` : ''}`
  const res = await fetch(url).catch(() => {
    throw new ApiError(0, `GET ${path}: network error`) // status 0 = no connection
  })
  if (!res.ok) throw new ApiError(res.status, `GET ${path}: ${res.status}`)
  return (await res.json()) as T
}

export const getFeed = (category: string, page: number) =>
  get<Page<Story>>('/publications', { category, page: page > 1 ? page : undefined })

export const getStory = (slug: string) =>
  get<StoryDetail>(`/publications/${encodeURIComponent(slug)}`)

// A reader opened the story: sent from the browser only (bots mostly run no scripts). Once a day per IP is
// counted by the server; failures don't matter. keepalive: it survives a quick move to another page.
export function countView(slug: string) {
  fetch(`${API_URL}/publications/${encodeURIComponent(slug)}/view`, {
    method: 'POST',
    keepalive: true,
  }).catch(() => {})
}

// Search with filters, all optional; no words but a filter = the filtered feed, newest first.
// fuzzy: nothing matched exactly, these are titles that look like the words (a typo).
export interface SearchQuery {
  q: string
  category: string // it | ai | crypto
  since: string // day | week | month | year
  sources: number // at least this many
  sort: string // relevance (default) | newest
}

export const search = (query: Partial<SearchQuery>, page: number) =>
  get<Page<Story> & { fuzzy: boolean }>('/search', {
    ...query,
    page: page > 1 ? page : undefined,
  })

export interface Suggestion {
  slug: string
  title: string
  category: string
}

// titles while the reader types: the last word counts as a prefix
export const suggest = (q: string) => get<Suggestion[]>('/search/suggest', { q })

// USD prices of the coins stories name, a couple of minutes old; 503 when there are none
export interface Price {
  id: string
  symbol: string
  name: string
  usd: number
  change_24h: number | null // percent
}

export const getPrices = () => get<Price[]>('/prices')

// --- accounts (browser only: the server render never has a token) ---

export interface Me {
  id: string
  email: string
  dateJoined: string
  isAdmin: boolean // admins can't delete their account here (403)
}

interface Tokens {
  access: string // JWT, 15 minutes
  refresh: string // 7 days, single-use: every refresh returns a new pair
}

// Date of the current Terms of Use (shown on /terms). Change it together with the backend when the text
// changes: the backend stores which version each reader accepted.
export const TERMS_VERSION = '2026-10-25'

// Session: access token in memory, refresh token in localStorage.
const REFRESH = 'refresh'
const store = typeof localStorage === 'undefined' ? undefined : localStorage
let access: string | null = null
let refreshing: Promise<void> | null = null

export const hasSession = () => !!store?.getItem(REFRESH)

function setTokens(t: Tokens) {
  access = t.access
  store?.setItem(REFRESH, t.refresh)
}

export function clearTokens() {
  access = null
  store?.removeItem(REFRESH)
}

function send(method: string, path: string, body?: unknown) {
  return fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(access && { Authorization: `Bearer ${access}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).catch(() => {
    throw new ApiError(0, `${method} ${path}: network error`)
  })
}

// One refresh at a time: the refresh token is single-use, parallel 401s must share the new pair.
function refreshTokens() {
  refreshing ??= (async () => {
    const refresh = store?.getItem(REFRESH)
    access = null
    if (!refresh) return
    const res = await send('POST', '/auth/refresh', { refresh })
    if (res.ok) setTokens(await res.json())
    else if (res.status === 400 || res.status === 401)
      clearTokens() // dead session -> guest
    else throw new ApiError(res.status, `POST /auth/refresh: ${res.status}`)
  })().finally(() => (refreshing = null))
  return refreshing
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (!access && hasSession()) await refreshTokens()
  const used = access
  let res = await send(method, path, body)
  // expired access: refresh (or drop the dead session) and repeat once, the reader notices nothing
  if (res.status === 401 && used) {
    if (access === used) await refreshTokens()
    res = await send(method, path, body)
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) // a proxy may answer with HTML (502…)
    throw new ApiError(res.status, `${method} ${path}: ${res.status}`, data)
  }
  const text = await res.text() // 201/204 may come without a body
  return (text ? JSON.parse(text) : undefined) as T
}

const post = <T>(path: string, body: unknown) => request<T>('POST', path, body)

export const getMe = () => request<Me>('GET', '/me')

// 401 = wrong email or password; 403 {code: 'email_not_confirmed'}; 429 = rate limit
export const login = (email: string, password: string) =>
  post<Tokens>('/auth/login', { email, password }).then(setTokens)

export const register = (email: string, password: string) =>
  post<unknown>('/auth/register', {
    email,
    password,
    termsAccepted: true, // the form can't be sent without the checkbox
    termsVersion: TERMS_VERSION,
  })

// both always 204: they don't tell whether an account exists
export const resendConfirmation = (email: string) =>
  post<void>('/auth/resend-confirmation', { email })
export const requestPasswordReset = (email: string) => post<void>('/auth/password-reset', { email })

// links from the emails; 400 {token} = bad or expired link. The first two sign the reader in.
export const confirmEmail = (token: string) =>
  post<Tokens>('/auth/confirm-email', { token }).then(setTokens)
export const resetPassword = (token: string, password: string) =>
  post<Tokens>('/auth/password-reset/confirm', { token, password }).then(setTokens)
export const confirmEmailChange = (token: string) =>
  post<{ email?: string }>('/auth/confirm-email-change', { token })

// a confirmation link goes to the new address
export const changeEmail = (newEmail: string, password: string) =>
  post<void>('/me/email', { newEmail, password })

// other devices are signed out; this one may get a fresh pair
export const changePassword = (currentPassword: string, newPassword: string) =>
  post<Tokens | undefined>('/me/password', { currentPassword, newPassword }).then(
    (t) => t && setTokens(t),
  )

export async function logout() {
  const refresh = store?.getItem(REFRESH)
  access = null // plain send: request() would spend the refresh token on a refresh first
  if (refresh) await send('POST', '/auth/logout', { refresh }).catch(() => {})
  clearTokens()
}

// for good, with the favorites. 400 {password} = wrong password; 403 = admin account
export async function deleteAccount(password: string) {
  await request<void>('DELETE', '/me', { password })
  clearTokens()
}

// both idempotent (204)
export const setFavorite = (slug: string, on: boolean) =>
  request<void>(on ? 'PUT' : 'DELETE', `/me/favorites/${encodeURIComponent(slug)}`)

// recently added first, paged like /publications
export const getFavorites = (page: number) =>
  request<Page<Story>>('GET', `/me/favorites${page > 1 ? `?page=${page}` : ''}`)

export const getFavoriteSlugs = () => request<string[]>('GET', '/me/favorites/slugs')

// how the reader hears about follow-ups of their favorites; all off at first. PATCH changes only what is sent.
export interface Notifications {
  emailDigest: boolean
  push: boolean
}
export const getNotifications = () => request<Notifications>('GET', '/me/notifications')
export const setNotifications = (change: Partial<Notifications>) =>
  request<Notifications>('PATCH', '/me/notifications', change)

// The contact form: the backend emails it to the editors (the address never reaches the browser).
// 400 {field: [msg]}, {captcha} = the token didn't pass (get a new one); 429 = 5 an hour per IP
export type ContactTopic = 'question' | 'correction' | 'copyright' | 'other'
export const sendContact = (message: {
  topic: ContactTopic
  email: string
  pageUrl: string
  message: string
  captcha: string
}) => post<void>('/contact', message)
