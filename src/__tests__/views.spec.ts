import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ViewCount from '@/components/ViewCount.vue'
import { countView } from '@/api'
import { compact } from '@/site'

describe('view count', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('stays hidden while the count is small', () => {
    expect(mount(ViewCount, { props: { views: 99 } }).text()).toBe('')
    expect(mount(ViewCount, { props: { views: 1234 } }).text()).toContain('1.2K')
  })

  it('formats compactly', () => {
    expect([950, 34_000, 1_500_000].map(compact)).toEqual(['950', '34K', '1.5M'])
  })

  it('posts the view and ignores failures', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockRejectedValue(new Error('offline'))
    vi.stubGlobal('fetch', fetch)
    countView('a b')
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/publications\/a%20b\/view$/), {
      method: 'POST',
      keepalive: true,
    })
  })
})
