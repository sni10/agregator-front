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
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Browser: VITE_API_URL (baked in at build). Server render in Docker: API_INTERNAL_URL at runtime,
// since localhost inside the container is the container itself.
const API_URL = (
  import.meta.env.SSR
    ? (process.env.API_INTERNAL_URL ?? import.meta.env.VITE_API_URL)
    : import.meta.env.VITE_API_URL
) as string | undefined

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

export const search = (q: string, page: number) =>
  get<Page<Story>>('/search', { q, page: page > 1 ? page : undefined })
