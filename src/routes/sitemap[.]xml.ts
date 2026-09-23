import { createFileRoute } from '@tanstack/react-router'

import { CATEGORIES, CLINICS, PRODUCTS } from '../lib/data'
import { absoluteUrl } from '../lib/seo'

/** public, indexable URLs only — account pages are noindex and left out */
function urls(): Array<{ loc: string; priority: string; changefreq: string }> {
  const out = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/shop', priority: '0.9', changefreq: 'daily' },
    { loc: '/clinics', priority: '0.9', changefreq: 'weekly' },
    { loc: '/emergency', priority: '0.7', changefreq: 'monthly' },
    { loc: '/help', priority: '0.6', changefreq: 'monthly' },
    { loc: '/about', priority: '0.4', changefreq: 'yearly' },
    { loc: '/privacy', priority: '0.2', changefreq: 'yearly' },
    { loc: '/terms', priority: '0.2', changefreq: 'yearly' },
  ]
  for (const c of CATEGORIES) if (c.id !== 'all') out.push({ loc: `/shop?cat=${c.id}`, priority: '0.8', changefreq: 'weekly' })
  for (const p of PRODUCTS) out.push({ loc: `/shop/${p.id}`, priority: '0.7', changefreq: 'weekly' })
  for (const c of CLINICS) out.push({ loc: `/clinics/${c.id}`, priority: '0.7', changefreq: 'weekly' })
  return out
}

const esc = (s: string) => s.replace(/&/g, '&amp;')

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const body =
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          urls()
            .map(
              (u) =>
                `  <url><loc>${esc(absoluteUrl(u.loc))}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
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
