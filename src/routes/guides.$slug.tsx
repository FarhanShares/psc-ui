import { createFileRoute, notFound, Link } from '@tanstack/react-router'
import { BookOpen, CalendarDays, ChevronRight, Clock, Info, Share2, Siren } from 'lucide-react'

import { Crumbs } from '../components/blocks'
import { GuideCard } from '../components/guide-card'
import { ProductRail } from '../components/product-rail'
import { EmptyState, PetGlyph, ServiceIcon } from '../components/ui'
import { SERVICE_TYPES, getProduct } from '../lib/data'
import { dateFromOffset, isoDay, longDate } from '../lib/format'
import { GUIDES, GUIDE_TOPICS, getGuide } from '../lib/guides'
import { SITE, absoluteUrl, breadcrumbLd, seo } from '../lib/seo'
import { pushToast } from '../lib/store'

export const Route = createFileRoute('/guides/$slug')({
  // unknown ids are real 404s (status + noindex), not soft "not found" pages
  beforeLoad: ({ params }) => {
    if (!getGuide(params.slug)) throw notFound()
  },
  head: ({ params }) => {
    const g = getGuide(params.slug)
    if (!g) return seo({ title: 'Guide not found', noindex: true })
    const updated = isoDay(dateFromOffset(-g.updatedDaysAgo))
    return seo({
      title: g.title,
      description: g.description,
      path: `/guides/${g.slug}`,
      type: 'article',
      jsonLd: [
        {
          '@type': 'Article',
          headline: g.title,
          description: g.description,
          url: absoluteUrl(`/guides/${g.slug}`),
          image: absoluteUrl(SITE.image),
          dateModified: updated,
          datePublished: updated,
          author: { '@type': 'Organization', name: `${SITE.name} care team` },
          publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: absoluteUrl('/icon-512.png') } },
          about: g.species.map((s) => (s === 'dog' ? 'Dogs' : 'Cats')),
          timeRequired: `PT${g.readMin}M`,
        },
        breadcrumbLd([
          ['Home', '/'],
          ['Care guides', '/guides'],
          [g.title, `/guides/${g.slug}`],
        ]),
      ],
    })
  },
  component: GuidePage,
})

function GuidePage() {
  const { slug } = Route.useParams()
  const guide = getGuide(slug)

  if (!guide) {
    return (
      <div className="page">
        <Crumbs items={[{ label: 'Care guides', to: '/guides' }, { label: 'Not found' }]} />
        <EmptyState
          title="We can’t find that guide"
          text="It may have moved. The full list is one tap away."
          actionLabel="All guides"
          actionTo="/guides"
          icon={<BookOpen size={20} strokeWidth={1.75} />}
        />
      </div>
    )
  }

  const topic = GUIDE_TOPICS.find((t) => t.id === guide.topic)
  const service = SERVICE_TYPES.find((s) => s.id === guide.service)
  const products = (guide.products ?? []).filter((id) => getProduct(id))
  const related = (guide.related ?? []).map(getGuide).filter((g) => g !== undefined)
  const more = related.length ? related : GUIDES.filter((g) => g.slug !== guide.slug && g.topic === guide.topic).slice(0, 2)

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: guide!.title, url })
      else {
        await navigator.clipboard.writeText(url)
        pushToast('Link copied')
      }
    } catch {
      /* share sheet dismissed */
    }
  }

  return (
    <div className="page">
      <Crumbs
        items={[
          { label: 'Care guides', to: '/guides' },
          { label: topic?.label ?? 'Guide', to: '/guides', search: { topic: guide.topic } },
          { label: guide.title },
        ]}
      />

      <header className="rise prose-head" style={{ '--i': 0 } as React.CSSProperties}>
        <p className="tag">{topic?.label}</p>
        <h1 className="page-title">{guide.title}</h1>
        <p className="lede">{guide.description}</p>
        <div className="article-meta">
          <span>
            <Clock size={13} strokeWidth={1.75} aria-hidden /> {guide.readMin} min read
          </span>
          <span>
            <CalendarDays size={13} strokeWidth={1.75} aria-hidden /> Updated{' '}
            <time dateTime={isoDay(dateFromOffset(-guide.updatedDaysAgo))}>{longDate(dateFromOffset(-guide.updatedDaysAgo))}</time>
          </span>
          <span>
            {guide.species.map((s) => (
              <PetGlyph key={s} species={s} size={14} />
            ))}
            For {guide.species.map((s) => `${s}s`).join(' & ')}
          </span>
          <button type="button" className="link-btn" onClick={share}>
            <Share2 size={13} strokeWidth={2} /> Share
          </button>
        </div>
      </header>

      <div className="legal rise" style={{ '--i': 1 } as React.CSSProperties}>
        <nav className="legal__toc" aria-label="In this guide">
          <p className="tag">In this guide</p>
          <ol>
            {guide.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.heading}</a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="prose">
          <aside className="takeaways" aria-label="Key points">
            <p className="tag">Key points</p>
            <ul className="check-list">
              {guide.takeaways.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </aside>

          {guide.sections.map((s) => (
            <section key={s.id} id={s.id}>
              <h2>{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {s.list && (
                <ul className="prose__list">
                  {s.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <p className="disclaimer">
            <Info size={15} strokeWidth={1.75} aria-hidden />
            <span>
              General information, not veterinary advice. If you’re worried about your pet, call your vet — or see{' '}
              <Link to="/emergency">what counts as an emergency</Link>.
            </span>
          </p>

          {service && (
            <section className="guide-cta" aria-label="Next step">
              <span className="menu-row__icon" aria-hidden>
                <ServiceIcon type={service.id} size={18} />
              </span>
              <span className="row__grow">
                <span className="row__title">Talk it through with a vet</span>
                <span className="row__sub">Compare clinics offering {service.label.toLowerCase()} and book a slot online.</span>
              </span>
              <Link to="/clinics" search={{ service: service.id }} className="btn btn--primary btn--sm">
                Find a clinic
              </Link>
            </section>
          )}
        </article>
      </div>

      {products.length > 0 && (
        <section className="rise" style={{ '--i': 2 } as React.CSSProperties}>
          <h2 className="section-head__title section-head">Useful for this</h2>
          <ProductRail ids={products} label="Products for this guide" />
        </section>
      )}

      {more.length > 0 && (
        <section className="rise" style={{ '--i': 3 } as React.CSSProperties}>
          <div className="section-head">
            <h2 className="section-head__title">Keep reading</h2>
            <Link to="/guides" className="section-head__link">
              All guides <ChevronRight size={13} strokeWidth={2} />
            </Link>
          </div>
          <div className="guide-grid">
            {more.map((g, i) => (
              <GuideCard key={g.slug} guide={g} i={i} />
            ))}
          </div>
        </section>
      )}

      <Link to="/emergency" className="emergency-strip">
        <Siren size={18} strokeWidth={1.75} aria-hidden />
        <span className="row__grow">
          <span className="row__title">Think it’s an emergency?</span>
          <span className="row__sub">Signs to watch for and the nearest 24-hour clinic</span>
        </span>
      </Link>
    </div>
  )
}
