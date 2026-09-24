/**
 * SEO helpers — every public route builds its <head> through `seo()` so
 * titles, descriptions, canonicals, Open Graph and JSON-LD stay consistent.
 * Account pages (cart, orders, profile…) pass `noindex`.
 */

export const SITE = {
  name: 'PetSafeCare',
  url: (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? 'https://petsafecare.app',
  tagline: 'Pet supplies, vet visits & vaccine reminders',
  description:
    'Shop pet food and supplies, book verified vet clinics near you, and keep every vaccination on schedule — all in one app.',
  locale: 'en_US',
  image: '/og-image.jpg',
  themeColor: '#f7f5f0',
} as const

type Json = Record<string, unknown>

export interface SeoInput {
  title: string
  description?: string
  /** path beginning with `/` — used for the canonical and og:url */
  path?: string
  /** social card: a 1200×630 PNG/JPG (SVG is not accepted by social networks) */
  image?: string
  imageAlt?: string
  type?: 'website' | 'product' | 'article' | 'profile'
  noindex?: boolean
  jsonLd?: Json | Json[]
}

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`
}

/** results pages show ~60 characters; a long title keeps its words and drops the brand suffix */
export const TITLE_MAX = 60

export function pageTitle(title: string): string {
  if (title === SITE.name) return `${SITE.name} — ${SITE.tagline}`
  const branded = `${title} · ${SITE.name}`
  return branded.length <= TITLE_MAX ? branded : title
}

/** meta descriptions are cut around 155–160 characters: end on a whole word instead */
export function clampText(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:—–-]+$/, '')}…`
}

export function seo({
  title,
  description = SITE.description,
  path,
  image = SITE.image,
  imageAlt,
  type = 'website',
  noindex = false,
  jsonLd,
}: SeoInput) {
  const fullTitle = pageTitle(title)
  const desc = clampText(description)
  const alt = imageAlt ?? (image === SITE.image ? `${SITE.name} — ${SITE.tagline}` : title)
  const meta: Array<Record<string, string>> = [
    { title: fullTitle },
    { name: 'description', content: desc },
    // indexable pages let search show large image previews and full snippets
    { name: 'robots', content: noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1' },
    { property: 'og:site_name', content: SITE.name },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: desc },
    { property: 'og:type', content: type },
    { property: 'og:image', content: absoluteUrl(image) },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: alt },
    { property: 'og:locale', content: SITE.locale },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: desc },
    { name: 'twitter:image', content: absoluteUrl(image) },
    { name: 'twitter:image:alt', content: alt },
  ]
  if (path) meta.push({ property: 'og:url', content: absoluteUrl(path) })

  const links = path && !noindex ? [{ rel: 'canonical', href: absoluteUrl(path) }] : []

  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
  const scripts = blocks.map((block) => ({
    type: 'application/ld+json',
    children: JSON.stringify({ '@context': 'https://schema.org', ...block }),
  }))

  return { meta, links, scripts }
}

/** BreadcrumbList JSON-LD from `[label, path]` pairs */
export function breadcrumbLd(items: Array<[string, string]>): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: absoluteUrl(path),
    })),
  }
}
