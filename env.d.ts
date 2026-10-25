/// <reference types="vite/client" />

// server-only (SSR branch in api.ts); the app tsconfig has no Node types
declare const process: { env: Record<string, string | undefined> }

// Cloudflare Turnstile (contact form), loaded on demand from challenges.cloudflare.com
interface Window {
  turnstile?: {
    render(
      el: HTMLElement,
      opts: { sitekey: string; callback: (token: string) => void; 'expired-callback': () => void },
    ): string
    reset(widget: string): void
    remove(widget: string): void
  }
}
