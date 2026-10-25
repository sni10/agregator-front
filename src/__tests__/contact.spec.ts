import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter } from '../router'
import { HEAD_KEY } from '../ssr'
import ContactView from '../views/ContactView.vue'

// POST /contact answers with `reply`; the request bodies are kept
function api(reply: [number, unknown?]) {
  const bodies: unknown[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: RequestInit = {}) => {
      bodies.push(JSON.parse(String(init.body)))
      const [status, body] = reply
      return new Response(body === undefined ? null : JSON.stringify(body), { status })
    }),
  )
  return bodies
}

// Turnstile solves at once with a fresh token each time
function captcha() {
  let n = 0
  type Render = NonNullable<Window['turnstile']>['render']
  const turnstile = {
    render: vi.fn<Render>((_el, opts) => {
      turnstile.solve = () => opts.callback(`token-${++n}`)
      turnstile.solve()
      return 'w1'
    }),
    reset: vi.fn<(widget: string) => void>(() => turnstile.solve()),
    remove: vi.fn<(widget: string) => void>(),
    solve: () => {},
  }
  window.turnstile = turnstile
  return turnstile
}

async function open(url: string) {
  const router = createRouter()
  await router.push(url)
  await router.isReady()
  const wrapper = mount(ContactView, {
    global: { plugins: [router], provide: { [HEAD_KEY as symbol]: {} } },
  })
  await flushPromises()
  return wrapper
}

describe('contact form', () => {
  beforeEach(() => captcha())
  afterEach(() => {
    vi.unstubAllGlobals()
    delete window.turnstile
  })

  it('comes from "Spotted an error?" with the topic and the story filled in, and sends it', async () => {
    const bodies = api([204])
    const page = await open('/contact?topic=correction&pageUrl=https://renews.me/news/model-x')

    expect((page.get('#contact-topic').element as HTMLSelectElement).value).toBe('correction')
    expect((page.get('#contact-page').element as HTMLInputElement).value).toBe(
      'https://renews.me/news/model-x',
    )
    await page.get('#contact-email').setValue('anna@example.com')
    await page.get('#contact-message').setValue('The price in the second paragraph is wrong.')
    await page.get('form').trigger('submit')
    await flushPromises()

    expect(bodies).toEqual([
      {
        topic: 'correction',
        email: 'anna@example.com',
        pageUrl: 'https://renews.me/news/model-x',
        message: 'The price in the second paragraph is wrong.',
        captcha: 'token-1',
      },
    ])
    expect(page.text()).toContain("We'll reply to anna@example.com")
  })

  it('shows a field error and gets a new captcha token after a refusal', async () => {
    api([400, { captcha: ['The check did not pass, please try again.'] }])
    const page = await open('/contact')

    await page.get('#contact-email').setValue('anna@example.com')
    await page.get('#contact-message').setValue('A question about the site.')
    await page.get('form').trigger('submit')
    await flushPromises()

    expect(page.text()).toContain('The check did not pass, please try again.')
    expect(window.turnstile?.reset).toHaveBeenCalledWith('w1')
    expect((page.get('#contact-topic').element as HTMLSelectElement).value).toBe('question')
  })
})
