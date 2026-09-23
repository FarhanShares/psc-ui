import { createFileRoute, Link } from '@tanstack/react-router'

import { Crumbs } from '../components/blocks'
import { GuideCard } from '../components/guide-card'
import { EmptyState, PetGlyph } from '../components/ui'
import { GUIDES, GUIDE_TOPICS, type GuideTopic } from '../lib/guides'
import { absoluteUrl, breadcrumbLd, seo } from '../lib/seo'
import type { Species } from '../lib/types'

type Search = { topic?: GuideTopic; for?: Species }

function filtered({ topic, for: sp }: Search) {
  return GUIDES.filter((g) => (!topic || g.topic === topic) && (!sp || g.species.includes(sp)))
}

function heading({ topic, for: sp }: Search): string {
  const t = GUIDE_TOPICS.find((x) => x.id === topic)?.label
  const who = sp === 'dog' ? 'dogs' : sp === 'cat' ? 'cats' : ''
  if (t && who) return `${t} guides for ${who}`
  if (t) return `${t} guides`
  if (who) return `Care guides for ${who}`
  return 'Care guides'
}

export const Route = createFileRoute('/guides/')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    topic: GUIDE_TOPICS.some((t) => t.id === s.topic) ? (s.topic as GuideTopic) : undefined,
    for: s.for === 'dog' || s.for === 'cat' ? s.for : undefined,
  }),
  head: ({ match }) => {
    const search = match.search as Search
    const list = filtered(search)
    const params = new URLSearchParams()
    if (search.topic) params.set('topic', search.topic)
    if (search.for) params.set('for', search.for)
    const qs = params.toString()
    const path = `/guides${qs ? `?${qs}` : ''}`
    return seo({
      title: heading(search),
      description:
        'Plain-English pet care guides: vaccination schedules, flea and tick prevention, switching food, dental care, toxic foods and calmer vet visits.',
      path,
      // a thin filter combination is not worth indexing
      noindex: list.length < 2,
      jsonLd: [
        {
          '@type': 'CollectionPage',
          name: heading(search),
          url: absoluteUrl(path),
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: list.map((g, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: absoluteUrl(`/guides/${g.slug}`),
              name: g.title,
            })),
          },
        },
        breadcrumbLd([
          ['Home', '/'],
          ['Care guides', '/guides'],
        ]),
      ],
    })
  },
  component: GuidesPage,
})

function GuidesPage() {
  const search = Route.useSearch()
  const list = filtered(search)
  const [first, ...rest] = list
  const showFeatured = !search.topic && !search.for

  return (
    <div className="page">
      <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Care guides' }]} />
      <header className="rise prose-head" style={{ '--i': 0 } as React.CSSProperties}>
        <p className="tag">Care guides</p>
        <h1 className="page-title">{heading(search)}</h1>
        <p className="muted">
          Short, practical answers to the questions pet parents ask most. General guidance — your vet knows your pet best.
        </p>
      </header>

      <div className="guide-filters rise" style={{ '--i': 1 } as React.CSSProperties}>
        <div className="chips" role="group" aria-label="Topic">
          <Link to="/guides" search={{ for: search.for }} className="chip" aria-pressed={!search.topic}>
            All topics
          </Link>
          {GUIDE_TOPICS.map((t) => (
            <Link key={t.id} to="/guides" search={{ topic: t.id, for: search.for }} className="chip" aria-pressed={search.topic === t.id}>
              {t.label}
            </Link>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Pet">
          {(['dog', 'cat'] as const).map((sp) => (
            <Link
              key={sp}
              to="/guides"
              search={{ topic: search.topic, for: search.for === sp ? undefined : sp }}
              className="chip"
              aria-pressed={search.for === sp}
            >
              <PetGlyph species={sp} size={14} /> {sp === 'dog' ? 'Dogs' : 'Cats'}
            </Link>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No guides here yet" text="Try another topic, or all guides." actionLabel="All guides" actionTo="/guides" />
      ) : (
        <div className="guide-grid">
          {showFeatured && first && <GuideCard guide={first} featured i={2} />}
          {(showFeatured ? rest : list).map((g, i) => (
            <GuideCard key={g.slug} guide={g} i={Math.min(i + 3, 8)} />
          ))}
        </div>
      )}
    </div>
  )
}
