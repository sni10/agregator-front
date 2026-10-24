import { createApp } from './main'

declare global {
  interface Window {
    __SSR_STATE__?: Record<string, unknown>
  }
}

// Same data the server rendered with, so hydration matches the HTML.
const { app, router } = createApp(window.__SSR_STATE__)

router.isReady().then(() => app.mount('#app'))
