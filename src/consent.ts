import { ref } from 'vue'

// Cookie consent (GDPR / ePrivacy). Google Analytics is the only non-essential thing on the site:
// gtag.js is not even loaded until the visitor accepts. The choice lives in localStorage.
export const GA_ID = 'G-9X1SBB3PJX'
const KEY = 'cookie-consent'
type Choice = 'granted' | 'denied'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void // defined by the inline script in index.html
  }
}

// the banner: shown until the visitor chooses, reopened by "Cookie settings" in the footer
export const consentOpen = ref(false)

function stored(): Choice | null {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null // storage blocked: ask again, track nothing
  }
}

// config only after the update: the first page view must not go out before consent
function grant() {
  window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
  if (document.querySelector('script[data-gtag]')) return
  window.gtag?.('config', GA_ID)
  const script = document.createElement('script')
  script.async = true
  script.dataset.gtag = ''
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.append(script)
}

function revoke() {
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
  // _ga, _ga_<id>: set on the bare domain (.renews.me) or the host itself
  const host = location.hostname
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`]
  for (const name of document.cookie.split(/;\s*/).map((c) => c.split('=')[0]!)) {
    if (!name.startsWith('_ga')) continue
    for (const domain of domains)
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`
  }
}

// after hydration: the server never renders the banner
export function initConsent() {
  const choice = stored()
  if (choice === 'granted') grant()
  consentOpen.value = !choice
}

export function setConsent(choice: Choice) {
  try {
    localStorage.setItem(KEY, choice)
  } catch {
    // not remembered: the banner comes back next visit
  }
  consentOpen.value = false
  if (choice === 'granted') grant()
  else revoke()
}
