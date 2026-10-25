// Search page helpers: the filters in the URL and the words to highlight in the results.
import type { LocationQuery } from 'vue-router'
import type { SearchQuery } from '@/api'

export const PERIODS = [
  { value: '', label: 'Any time' },
  { value: 'day', label: 'Past 24 hours' },
  { value: 'week', label: 'Past week' },
  { value: 'month', label: 'Past month' },
  { value: 'year', label: 'Past year' },
]
export const SOURCES = [
  { value: 0, label: 'Any number of sources' },
  { value: 2, label: '2+ sources' },
  { value: 3, label: '3+ sources' },
  { value: 5, label: '5+ sources' },
]
// the start page of the search: one click to a topic
export const TOPICS = [
  'Bitcoin',
  'Ethereum',
  'OpenAI',
  'Nvidia',
  'Data breach',
  'Regulation',
  'ETF',
]

const text = (value: LocationQuery[string] | undefined) =>
  typeof value === 'string' ? value.trim() : ''

export function readQuery(query: LocationQuery): SearchQuery {
  const since = text(query.since)
  const sources = Number(query.sources) || 0
  return {
    q: text(query.q).slice(0, 200),
    category: ['it', 'ai', 'crypto'].includes(text(query.category)) ? text(query.category) : '',
    since: PERIODS.some((p) => p.value === since) ? since : '',
    sources: SOURCES.some((s) => s.value === sources) ? sources : 0,
    sort: text(query.sort) === 'newest' ? 'newest' : '',
  }
}

// back to the URL: empty values left out, so the default search has a short, shareable link
export function writeQuery(query: SearchQuery) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== '' && value !== 0),
  ) as Record<string, string | number>
}

// The words to highlight: not the excluded ones (-word) or operators. A crude stem, so that
// "patches" also marks "patch" and "models" marks "model" (the backend searches by stems too).
export function searchTerms(q: string): string[] {
  const words = q.replace(/(^|\s)-\S+/g, ' ').match(/[\p{L}\p{N}]+/gu) ?? []
  const stems = words
    .filter((w) => w.toLowerCase() !== 'or')
    .map((w) => {
      const stem = w.toLowerCase().replace(/(ing|ed|es|s)$/, '')
      return stem.length >= 3 ? stem : w.toLowerCase()
    })
    .filter((w) => w.length >= 2)
  return [...new Set(stems)]
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// text split into plain and marked parts: words starting with a term
export function markParts(text: string, terms: string[]) {
  if (!terms.length) return [{ text, marked: false }]
  const re = new RegExp(
    `(?<![\\p{L}\\p{N}])(?:${terms.map(escape).join('|')})[\\p{L}\\p{N}]*`,
    'giu',
  )
  const parts: { text: string; marked: boolean }[] = []
  let last = 0
  for (const m of text.matchAll(re)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), marked: false })
    parts.push({ text: m[0], marked: true })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last), marked: false })
  return parts
}
