import { createApp } from './main'
import { initConsent } from './consent'
import { initSession } from './session'

declare global {
  interface Window {
    __SSR_STATE__?: Record<string, unknown>
  }
}

// Same data the server rendered with, so hydration matches the HTML.
const { app, router } = createApp(window.__SSR_STATE__)

router.isReady().then(() => {
  app.mount('#app')
  initConsent()
  initSession() // the reader's menu and hearts, after hydration: the HTML is a guest's page
})
