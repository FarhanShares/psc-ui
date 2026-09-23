import { Link } from '@tanstack/react-router'
import { Check, ChevronLeft, ChevronRight, Heart } from 'lucide-react'

import { daysAgoLabel } from '../lib/format'
import { toggleSavedClinic, toggleSavedProduct, useAppState } from '../lib/store'
import type { Review } from '../lib/types'
import { Stars } from './ui'

/* ------------------------------------------------------------ breadcrumbs */

export interface Crumb {
  label: string
  to?: string
  params?: Record<string, string>
  search?: Record<string, string>
}

/**
 * Full trail on tablet/desktop; on phones it collapses to a single
 * "‹ Parent" back link so detail screens read like a native app.
 */
export function Crumbs({ items }: { items: Crumb[] }) {
  const parent = [...items].reverse().find((c) => c.to)
  return (
    <nav className="crumbs rise" aria-label="Breadcrumb">
      {parent?.to && (
        <Link
          to={parent.to}
          params={parent.params as never}
          search={parent.search as never}
          className="crumbs__back"
        >
          <ChevronLeft size={15} strokeWidth={2} aria-hidden />
          {parent.label}
        </Link>
      )}
      <ol className="crumbs__trail">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`}>
            {c.to && i < items.length - 1 ? (
              <Link to={c.to} params={c.params as never} search={c.search as never}>
                {c.label}
              </Link>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
            {i < items.length - 1 && <ChevronRight size={12} strokeWidth={2} aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* ------------------------------------------------------------ save toggle */

export function SaveButton({
  kind,
  id,
  name,
  variant = 'icon',
}: {
  kind: 'product' | 'clinic'
  id: string
  name: string
  variant?: 'icon' | 'overlay' | 'labeled' | 'tile'
}) {
  const { savedProducts, savedClinics } = useAppState()
  const on = (kind === 'product' ? savedProducts : savedClinics).includes(id)
  const toggle = kind === 'product' ? toggleSavedProduct : toggleSavedClinic

  return (
    <button
      type="button"
      className={variant === 'tile' ? 'action-tile save-tile' : `save-btn save-btn--${variant}`}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from saved` : `Save ${name}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(id)
      }}
    >
      <Heart size={variant === 'overlay' ? 16 : 18} strokeWidth={1.9} fill={on ? 'currentColor' : 'none'} aria-hidden />
      {(variant === 'labeled' || variant === 'tile') && <span>{on ? 'Saved' : 'Save'}</span>}
    </button>
  )
}

/* --------------------------------------------------------------- reviews */

export function RatingSummary({
  rating,
  total,
  breakdown,
}: {
  rating: number
  total: number
  breakdown: number[]
}) {
  const max = Math.max(...breakdown, 1)
  return (
    <div className="rating-summary">
      <div className="rating-summary__score">
        <span className="rating-summary__big">{rating.toFixed(1)}</span>
        <span className="row__sub num">out of 5 · {total} reviews</span>
      </div>
      <ul className="rating-bars" aria-label="Rating breakdown">
        {breakdown.map((n, i) => (
          <li key={i}>
            <span className="num">{5 - i}</span>
            <span className="rating-bars__track" aria-hidden>
              <span className="rating-bars__fill" style={{ width: `${(n / max) * 100}%` }} />
            </span>
            <span className="num muted">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <ul className="review-list">
      {reviews.map((r) => (
        <li key={r.id} className="review">
          <div className="split">
            <span className="review__who">
              <span className="review__ava" aria-hidden>
                {r.author.charAt(0)}
              </span>
              <span>
                <span className="row__title" style={{ display: 'block' }}>{r.author}</span>
                <span className="row__sub">
                  {r.pet ? `${r.pet} · ` : ''}
                  {daysAgoLabel(r.daysAgo)}
                </span>
              </span>
            </span>
            <Stars rating={r.rating} />
          </div>
          <p className="review__text">{r.text}</p>
        </li>
      ))}
    </ul>
  )
}

/* --------------------------------------------------------------- timeline */

export interface TimelineStep {
  label: string
  detail?: string
  state: 'done' | 'current' | 'todo'
}

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="timeline">
      {steps.map((s) => (
        <li key={s.label} className={`timeline__step timeline__step--${s.state}`}>
          <span className="timeline__dot" aria-hidden>
            {s.state === 'done' && <Check size={11} strokeWidth={3} />}
          </span>
          <span>
            <span className="row__title" style={{ display: 'block' }}>
              {s.label}
              {s.state === 'current' && <span className="visually-hidden"> (current)</span>}
            </span>
            {s.detail && <span className="row__sub">{s.detail}</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}

/* -------------------------------------------------------------- menu rows */

export function MenuRow({
  to,
  search,
  icon,
  title,
  sub,
  badge,
}: {
  to: string
  search?: Record<string, string>
  icon: React.ReactNode
  title: string
  sub?: string
  badge?: number
}) {
  return (
    <Link to={to} search={search as never} className="menu-row">
      <span className="menu-row__icon" aria-hidden>
        {icon}
      </span>
      <span className="row__grow">
        <span className="row__title">{title}</span>
        {sub && <span className="row__sub">{sub}</span>}
      </span>
      {badge ? <span className="count-badge num">{badge}</span> : null}
      <ChevronRight size={16} strokeWidth={1.75} className="muted" aria-hidden />
    </Link>
  )
}

/* ---------------------------------------------------------- success mark */

export function SuccessMark() {
  return (
    <span className="success-mark" aria-hidden>
      <Check size={26} strokeWidth={2.25} />
    </span>
  )
}

/* ---------------------------------------------------------- stat readout */

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="stat">
      <span className="tag">{label}</span>
      <span className="stat__value">{value}</span>
      {hint && <span className="row__sub">{hint}</span>}
    </div>
  )
}
