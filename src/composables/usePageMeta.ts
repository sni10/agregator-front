import { computed, inject, watchEffect } from 'vue'
import { HEAD_KEY, type PageMeta } from '@/ssr'
import { SITE } from '@/site'

// Page <title>, description, og:* and JSON-LD. The server puts them into the HTML (entry-server.ts),
// the client keeps document.title/description in sync on navigation.
export function usePageMeta(meta: () => Partial<PageMeta>) {
  const head = inject(HEAD_KEY)!
  head.meta = computed(() => {
    const m = meta()
    return {
      ...m,
      title: m.title ? `${m.title} · ${SITE.name}` : `${SITE.name} — IT, AI and crypto news`,
      description: m.description ?? SITE.description,
    }
  })

  if (import.meta.env.SSR) return
  watchEffect(() => {
    const { title, description } = head.meta!.value
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  })
}
