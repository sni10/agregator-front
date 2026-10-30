// Site name and the look of each category (cover gradient, badge colours), as in the mockups.
export const SITE = {
  name: 'Renews',
  url: 'https://renews.me', // the story a contact message is about: editors open it from the email
  description:
    'IT, AI and crypto news: each story brings several sources together, with every claim checked against them.',
}

export interface CategoryStyle {
  label: string
  badge: string
  text: string // the label as plain coloured text
  cover: string
  glyph: string
}

const STYLES: Record<string, CategoryStyle> = {
  ai: {
    label: 'AI',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
    text: 'text-violet-700 dark:text-violet-400',
    cover: 'from-violet-500 via-fuchsia-500 to-pink-500',
    glyph: '◆',
  },
  it: {
    label: 'IT',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    text: 'text-sky-700 dark:text-sky-400',
    cover: 'from-sky-500 via-cyan-500 to-teal-400',
    glyph: '▲',
  },
  crypto: {
    label: 'Crypto',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    text: 'text-amber-700 dark:text-amber-400',
    cover: 'from-amber-500 via-orange-500 to-rose-500',
    glyph: '●',
  },
}

export const NAV = [
  { slug: '', label: 'All' },
  ...Object.entries(STYLES).map(([slug, style]) => ({ slug, label: style.label })),
]

export const categoryStyle = (slug: string): CategoryStyle => STYLES[slug] ?? STYLES.it!

// Today's date for the header: in UTC, like every date here (server and browser print the same)
export const today = (now = new Date()) =>
  now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

// "5 min ago", "3 h ago"; older than a day: the date. Browser only (TimeAgo.vue): the server render is
// cached, its "5 min ago" would be wrong a minute later
export function timeAgo(iso: string, now = Date.now()) {
  const minutes = Math.floor((now - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} h ago`
  return formatDate(iso)
}

// The publishers on a card: "The Register, Decrypt +2"; the count when the API sent no names
export function sourcesLabel(story: { publishers?: string[]; source_count: number }) {
  const names = story.publishers ?? []
  if (!names.length) return plural(story.source_count, 'source')
  return names.length > 2
    ? `${names.slice(0, 2).join(', ')} +${names.length - 2}`
    : names.join(', ')
}

export function formatDate(iso: string | null) {
  if (!iso) return ''
  const date = new Date(iso)
  // UTC: the server and the browser must print the same text, or hydration mismatches
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  })
}

// rel of links to the sources of a story and its photo: cited, but passed no ranking weight
export const SOURCE_REL = 'nofollow noopener'

export const plural = (n: number, word: string) =>
  `${n} ${n === 1 ? word : word.endsWith('y') ? `${word.slice(0, -1)}ies` : `${word}s`}`

// A small count says "nobody reads this": the eye shows up only from here
export const VIEWS_SHOWN_FROM = 100

// 950, 1.2K, 34K, 1.5M
export const compact = (n: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
