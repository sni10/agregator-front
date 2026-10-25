// Site name and the look of each category (cover gradient, badge colours), as in the mockups.
export const SITE = {
  name: 'Renews',
  contact: 'contact@renews.me', // privacy requests, corrections, copyright notices
  description:
    'IT, AI and crypto news: each story brings several sources together, with every claim checked against them.',
}

export interface CategoryStyle {
  label: string
  badge: string
  cover: string
  glyph: string
}

const STYLES: Record<string, CategoryStyle> = {
  ai: {
    label: 'AI',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
    cover: 'from-violet-500 via-fuchsia-500 to-pink-500',
    glyph: '◆',
  },
  it: {
    label: 'IT',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    cover: 'from-sky-500 via-cyan-500 to-teal-400',
    glyph: '▲',
  },
  crypto: {
    label: 'Crypto',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    cover: 'from-amber-500 via-orange-500 to-rose-500',
    glyph: '●',
  },
}

export const NAV = [
  { slug: '', label: 'All' },
  ...Object.entries(STYLES).map(([slug, style]) => ({ slug, label: style.label })),
]

export const categoryStyle = (slug: string): CategoryStyle => STYLES[slug] ?? STYLES.it!

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

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
