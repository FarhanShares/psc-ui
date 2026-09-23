/**
 * SEO helpers — every public route builds its <head> through `seo()` so
 * titles, descriptions, canonicals, Open Graph and JSON-LD stay consistent.
 * Account pages (cart, orders, profile…) pass `noindex`.
 */

export const SITE = {
  name: 'PetSafeCare',
  url: (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? 'https://petsafecare.app',
  tagline: 'Pet supplies, vet bookings and vaccine reminders',
  description:
    'Shop pet food and supplies, book verified vet clinics near you, and keep every vaccination on schedule — all in one app.',
  locale: 'en_US',
  image: '/og-image.png',
  themeColor: '#f7f5f0',
} as const

type Json = Record<string, unknown>

export interface SeoInput {
  title: string
  description?: string
  /** path beginning with `/` — used for the canonical and og:url */
  path?: string
  image?: string
  type?: 'website' | 'product' | 'article' | 'profile'
  noindex?: boolean
  jsonLd?: Json | Json[]
}

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`
}

export function pageTitle(title: string): string {
  return title === SITE.name ? `${SITE.name} — ${SITE.tagline}` : `${title} · ${SITE.name}`
}

export function seo({
  title,
  description = SITE.description,
  path,
  image = SITE.image,
  type = 'website',
  noindex = false,
  jsonLd,
}: SeoInput) {
  const fullTitle = pageTitle(title)
  const meta: Array<Record<string, string>> = [
    { title: fullTitle },
    { name: 'description', content: description },
    { property: 'og:site_name', content: SITE.name },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:image', content: absoluteUrl(image) },
    { property: 'og:locale', content: SITE.locale },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: absoluteUrl(image) },
  ]
  if (path) meta.push({ property: 'og:url', content: absoluteUrl(path) })
  if (noindex) meta.push({ name: 'robots', content: 'noindex, follow' })

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
