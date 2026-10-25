import { reactive, ref } from 'vue'
import { ApiError, getFavoriteSlugs, getMe, hasSession, logout, setFavorite, type Me } from './api'

// The signed-in reader, browser only. The server render is always a guest's page: these stay empty
// there, and the client fills them after hydration (initSession), so the HTML always matches.
export const me = ref<Me | null>(null)
export const signedIn = ref<boolean | null>(null) // null: not known yet (server render, first paint)
export const favorites = reactive(new Set<string>()) // slugs, loaded once per session

// The sign-in / sign-up window. `pending`: the story a guest hearted, added once they are signed in.
export const authDialog = ref(false)
const PENDING = 'pending-favorite'

function pending(slug?: string | null) {
  try {
    if (slug === undefined) return localStorage.getItem(PENDING)
    if (slug === null) localStorage.removeItem(PENDING)
    else localStorage.setItem(PENDING, slug)
  } catch {
    // storage blocked: the heart just isn't remembered
  }
  return null
}

// After hydration, and again after every sign-in (login, email link, password reset)
export async function initSession() {
  if (!hasSession()) {
    signedIn.value = false
    return
  }
  try {
    const [user, slugs] = await Promise.all([getMe(), getFavoriteSlugs()])
    me.value = user
    favorites.clear()
    for (const slug of slugs) favorites.add(slug)
    signedIn.value = true
  } catch (e) {
    // a dead session was dropped by the API layer; other failures: try again on the next page load
    signedIn.value = hasSession() && !(e instanceof ApiError && e.status === 401)
    return
  }
  const slug = pending()
  if (slug) {
    pending(null)
    await toggleFavorite(slug, true)
  }
}

export async function signOut() {
  await logout()
  endSession()
}

export function endSession() {
  me.value = null
  favorites.clear()
  signedIn.value = false
}

// Heart: flips at once, rolls back if the request fails. A guest gets the sign-in window instead.
export async function toggleFavorite(slug: string, on = !favorites.has(slug)) {
  if (!hasSession()) {
    pending(slug)
    authDialog.value = true
    return
  }
  if (on) favorites.add(slug)
  else favorites.delete(slug)
  try {
    await setFavorite(slug, on)
  } catch (e) {
    if (on) favorites.delete(slug)
    else favorites.add(slug)
    if (!hasSession()) {
      // the session died meanwhile
      endSession()
      pending(on ? slug : null)
      authDialog.value = true
    } else if (!(e instanceof ApiError && e.status === 404)) throw e
  }
}
