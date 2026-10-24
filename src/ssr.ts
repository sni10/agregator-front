import { inject, toRef, type InjectionKey, type Ref, type ComputedRef } from 'vue'

// Data loaded during server render, serialized into the page and reused by the client on hydration.
export type SsrState = Record<string, unknown>
export const STATE_KEY: InjectionKey<SsrState> = Symbol('ssr-state')

export function useSsrState<T>(key: string, init: () => T): Ref<T> {
  const state = inject(STATE_KEY)!
  if (!(key in state)) state[key] = init()
  return toRef(state, key) as Ref<T>
}

// <title>, description, og:*, JSON-LD — the server reads it after render, the client mirrors the title.
export interface PageMeta {
  title: string
  description: string
  type?: 'website' | 'article'
  publishedAt?: string // article:published_time
  modifiedAt?: string
  jsonLd?: Record<string, unknown> // schema.org NewsArticle on a story page
  noindex?: boolean // search results
}
export interface Head {
  meta?: ComputedRef<PageMeta>
}
export const HEAD_KEY: InjectionKey<Head> = Symbol('head')
