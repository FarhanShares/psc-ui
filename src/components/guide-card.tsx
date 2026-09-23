import { Link } from '@tanstack/react-router'
import { BookOpen, Clock } from 'lucide-react'

import { GUIDE_TOPICS, type Guide } from '../lib/guides'
import { PetGlyph } from './ui'

/** a guide teaser — topic, title, one line of why, reading time and who it's for */
export function GuideCard({ guide, i = 0, featured = false }: { guide: Guide; i?: number; featured?: boolean }) {
  const topic = GUIDE_TOPICS.find((t) => t.id === guide.topic)?.label
  return (
    <Link
      to="/guides/$slug"
      params={{ slug: guide.slug }}
      className={`card card--press guide-card rise${featured ? ' guide-card--featured' : ''}`}
      style={{ '--i': i } as React.CSSProperties}
    >
      <span className={`guide-card__band guide-card__band--${guide.topic}`} aria-hidden>
        <BookOpen size={featured ? 26 : 20} strokeWidth={1.75} />
      </span>
      <span className="guide-card__body">
        <span className="tag">{topic}</span>
        <span className="guide-card__title">{guide.title}</span>
        {featured && <span className="row__sub guide-card__desc">{guide.description}</span>}
        <span className="guide-card__meta">
          <span className="mono-label">
            <Clock size={11} strokeWidth={2} aria-hidden /> {guide.readMin} min read
          </span>
          <span className="guide-card__species" aria-label={`For ${guide.species.map((s) => `${s}s`).join(' and ')}`}>
            {guide.species.map((s) => (
              <PetGlyph key={s} species={s} size={14} />
            ))}
          </span>
        </span>
      </span>
    </Link>
  )
}
