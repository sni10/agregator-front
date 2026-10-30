import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ViewCount from '@/components/ViewCount.vue'
import { countView } from '@/api'
import { compact, sourcesLabel, timeAgo } from '@/site'

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

describe('card meta', () => {
  it('says how long ago, then the date', () => {
    const now = Date.parse('2026-10-30T12:00:00Z')
    expect(timeAgo('2026-10-30T11:59:40Z', now)).toBe('just now')
    expect(timeAgo('2026-10-30T11:35:00Z', now)).toBe('25 min ago')
    expect(timeAgo('2026-10-30T02:00:00Z', now)).toBe('10 h ago')
    expect(timeAgo('2026-10-28T09:05:00Z', now)).toMatch(/^Oct 28, 09:05 AM UTC$/)
  })

  it('names the publishers, the count when there are none', () => {
    expect(sourcesLabel({ publishers: ['LWN'], source_count: 1 })).toBe('LWN')
    expect(sourcesLabel({ publishers: ['A', 'B', 'C', 'D'], source_count: 5 })).toBe('A, B +2')
    expect(sourcesLabel({ publishers: [], source_count: 3 })).toBe('3 sources')
  })
})
