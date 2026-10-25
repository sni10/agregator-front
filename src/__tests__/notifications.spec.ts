import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import NotifySettings from '../components/NotifySettings.vue'

// GET /me/notifications answers `settings`; PATCH answers `patch` (status, body); bodies are kept
function api(settings: object, patch: [number, object] = [200, {}]) {
  const sent: unknown[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: RequestInit = {}) => {
      if (init.method === 'PATCH') {
        sent.push(JSON.parse(String(init.body)))
        return new Response(JSON.stringify(patch[1]), { status: patch[0] })
      }
      return new Response(JSON.stringify(settings), { status: 200 })
    }),
  )
  return sent
}

async function opened() {
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.open = true
  }
  const wrapper = mount(NotifySettings, { attachTo: document.body })
  await wrapper.get('button[aria-label="Updates on your favorites"]').trigger('click')
  await flushPromises()
  return wrapper
}

const switches = (w: Awaited<ReturnType<typeof opened>>) =>
  w.findAll('[role=switch]').map((s) => s.attributes('aria-checked'))

describe('notification settings', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('shows the stored settings and saves a switch', async () => {
    const sent = api({ emailDigest: false, push: true }, [200, { emailDigest: true, push: true }])
    const w = await opened()
    expect(switches(w)).toEqual(['false', 'true', 'false'])
    expect(w.findAll('[role=switch]')[2]!.attributes('disabled')).toBeDefined() // Telegram: soon

    await w.findAll('[role=switch]')[0]!.trigger('click')
    await flushPromises()

    expect(sent).toEqual([{ emailDigest: true }])
    expect(switches(w)).toEqual(['true', 'true', 'false'])
  })

  it('puts the switch back when saving fails', async () => {
    api({ emailDigest: false, push: false }, [500, {}])
    const w = await opened()

    await w.findAll('[role=switch]')[1]!.trigger('click')
    await flushPromises()

    expect(switches(w)).toEqual(['false', 'false', 'false'])
    expect(w.text()).toContain('Something went wrong (500)')
  })
})
