import { createFileRoute } from '@tanstack/react-router'

import { CATEGORIES, CLINICS, PRODUCTS, SERVICE_TYPES } from '../lib/data'
import { BRANDS } from '../lib/shop-landing'
import { GUIDES, GUIDE_TOPICS } from '../lib/guides'
import { absoluteUrl } from '../lib/seo'
import { SPECIES } from '../lib/species'

/** public, indexable URLs only — account pages are noindex and left out */
type Entry = { loc: string; priority: string; changefreq: string; images?: string[] }

function urls(): Entry[] {
  const out: Entry[] = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/shop', priority: '0.9', changefreq: 'daily' },
    { loc: '/clinics', priority: '0.9', changefreq: 'weekly' },
    { loc: '/emergency', priority: '0.7', changefreq: 'monthly' },
    { loc: '/help', priority: '0.6', changefreq: 'monthly' },
    { loc: '/about', priority: '0.4', changefreq: 'yearly' },
    { loc: '/privacy', priority: '0.2', changefreq: 'yearly' },
    { loc: '/terms', priority: '0.2', changefreq: 'yearly' },
  ]
  const cats = CATEGORIES.filter((c) => c.id !== 'all')
  for (const c of cats) out.push({ loc: `/shop?cat=${c.id}`, priority: '0.8', changefreq: 'weekly' })
  // pet landings, and category × pet only where products exist (no thin pages)
  for (const pet of SPECIES.map((sp) => sp.id)) {
    out.push({ loc: `/shop?for=${pet}`, priority: '0.8', changefreq: 'weekly' })
    for (const c of cats) {
      if (PRODUCTS.some((p) => p.category === c.id && p.suits.includes(pet)))
        out.push({ loc: `/shop?cat=${c.id}&for=${pet}`, priority: '0.7', changefreq: 'weekly' })
    }
  }
  for (const b of BRANDS) out.push({ loc: `/shop?brand=${encodeURIComponent(b)}`, priority: '0.6', changefreq: 'weekly' })
  for (const s of SERVICE_TYPES) out.push({ loc: `/clinics?service=${s.id}`, priority: '0.7', changefreq: 'weekly' })
  for (const p of PRODUCTS) {
    // image sitemap: pack shots plus the share card, so image search finds every product
    out.push({ loc: `/shop/${p.id}`, priority: '0.7', changefreq: 'weekly', images: [...(p.images ?? []), `/og/${p.id}.jpg`] })
    out.push({ loc: `/shop/${p.id}/reviews`, priority: '0.5', changefreq: 'weekly' })
  }
  for (const c of CLINICS) {
    out.push({ loc: `/clinics/${c.id}`, priority: '0.7', changefreq: 'weekly' })
    out.push({ loc: `/clinics/${c.id}/reviews`, priority: '0.5', changefreq: 'weekly' })
  }
  out.push({ loc: '/guides', priority: '0.8', changefreq: 'weekly' })
  for (const t of GUIDE_TOPICS) {
    if (GUIDES.filter((g) => g.topic === t.id).length >= 2) out.push({ loc: `/guides?topic=${t.id}`, priority: '0.6', changefreq: 'monthly' })
  }
  for (const g of GUIDES) out.push({ loc: `/guides/${g.slug}`, priority: '0.8', changefreq: 'monthly' })
  return out
}

const esc = (s: string) => s.replace(/&/g, '&amp;')

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const body =
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
          urls()
            .map(
              (u) =>
                `  <url><loc>${esc(absoluteUrl(u.loc))}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority>${(u.images ?? [])
                  .map((src) => `<image:image><image:loc>${esc(absoluteUrl(src))}</image:loc></image:image>`)
                  .join('')}</url>`,
            )
            .join('\n') +
          '\n</urlset>\n'
        return new Response(body, {
          headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
        })
      },
    },
  },
})
