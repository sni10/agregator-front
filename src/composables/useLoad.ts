import { onMounted, onServerPrefetch, ref, useSSRContext } from 'vue'
import { ApiError } from '@/api'
import { useSsrState } from '@/ssr'

// Data for a page: loaded during server render and reused on hydration, or loaded in the browser after
// client-side navigation. The page's key must not change while it lives (App.vue keys views by URL).
export function useLoad<T>(key: string, load: () => Promise<T>) {
  const ssr = import.meta.env.SSR ? useSSRContext<{ status?: number }>() : undefined
  const data = useSsrState<T | null>(key, () => null)
  const missing = ref(false) // the API said 404
  const failed = ref(false) // the API is down or broke

  async function run() {
    if (data.value !== null) return
    try {
      data.value = await load()
    } catch (e) {
      missing.value = e instanceof ApiError && e.status === 404
      failed.value = !missing.value
      // real status codes for crawlers; the server does not cache an error page
      if (ssr) ssr.status = missing.value ? 404 : 503
    }
  }
  onServerPrefetch(run)
  onMounted(run)

  return { data, missing, failed }
}
