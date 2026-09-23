import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpDown, PenLine, Star } from 'lucide-react'

import { Crumbs, RatingSummary, ReviewList, SuccessMark } from './blocks'
import { OptionPicker } from './pickers'
import { CategoryIcon, EmptyState, Sheet, tileClass } from './ui'
import { CATEGORIES, allReviews, getClinic, getProduct, ratingBreakdown } from '../lib/data'
import { initials } from '../lib/format'
import { addUserReview, pushToast, toggleHelpful, useAppState } from '../lib/store'
import type { Review, ReviewKind } from '../lib/types'

const PAGE = 10

type SortId = 'recent' | 'helpful' | 'high' | 'low'

const SORTS: { id: SortId; label: string }[] = [
  { id: 'recent', label: 'Most recent' },
  { id: 'helpful', label: 'Most helpful' },
  { id: 'high', label: 'Highest rated' },
  { id: 'low', label: 'Lowest rated' },
]

/**
 * One "all reviews" page for products and clinics: summary with clickable
 * star bars, star/topic filters, sort, helpful votes, load more, and a
 * write-a-review sheet. Routes pass `kind` + `id` and nothing else.
 */
export function ReviewsPage({ kind, id }: { kind: ReviewKind; id: string }) {
  const { userReviews, helpfulVotes, signedIn } = useAppState()
  const product = kind === 'product' ? getProduct(id) : undefined
  const clinic = kind === 'clinic' ? getClinic(id) : undefined
  const item = product ?? clinic

  const [stars, setStars] = useState(0)
  const [topic, setTopic] = useState('')
  const [sort, setSort] = useState<SortId>('recent')
  const [shown, setShown] = useState(PAGE)
  const [writeOpen, setWriteOpen] = useState(false)
  const [draft, setDraft] = useState({ rating: 0, text: '', topic: '' })
  const [sent, setSent] = useState(false)

  const base = useMemo(() => allReviews(kind, id), [kind, id])
  const mine = userReviews.filter((r) => r.kind === kind && r.targetId === id)
  const reviews: Review[] = [...mine, ...base]

  const list = useMemo(() => {
    let out = reviews.filter((r) => (!stars || r.rating === stars) && (!topic || r.topic === topic))
    const score = (r: Review) => (r.helpful ?? 0) + (helpfulVotes.includes(r.id) ? 1 : 0)
    if (sort === 'recent') out = [...out].sort((a, b) => a.daysAgo - b.daysAgo)
    if (sort === 'helpful') out = [...out].sort((a, b) => score(b) - score(a))
    if (sort === 'high') out = [...out].sort((a, b) => b.rating - a.rating || a.daysAgo - b.daysAgo)
    if (sort === 'low') out = [...out].sort((a, b) => a.rating - b.rating || a.daysAgo - b.daysAgo)
    return out
    // reviews is rebuilt each render from stable inputs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, mine.length, stars, topic, sort, helpfulVotes])

  if (!item) return null

  const total = item.reviews + mine.length
  const topics = clinic ? clinic.services.map((s) => s.name) : []
  const detailTo = kind === 'product' ? '/shop/$id' : '/clinics/$id'
  const parent =
    kind === 'product'
      ? { label: CATEGORIES.find((c) => c.id === product!.category)?.label ?? 'Shop', to: '/shop', search: { cat: product!.category } }
      : { label: 'Clinics', to: '/clinics' }

  function resetPaging<T>(fn: (v: T) => void) {
    return (v: T) => {
      fn(v)
      setShown(PAGE)
    }
  }

  function openWrite() {
    setDraft({ rating: 0, text: '', topic: topics[0] ?? '' })
    setSent(false)
    setWriteOpen(true)
  }

  return (
    <div className="page">
      <Crumbs
        items={[
          parent,
          { label: item.name, to: detailTo, params: { id } },
          { label: 'Reviews' },
        ]}
      />

      <header className="reviews-head rise">
        <Link to={detailTo} params={{ id }} className="reviews-head__item" aria-label={`Back to ${item.name}`}>
          {product ? (
            <span className={`tile ${tileClass(product.category)}`} style={{ width: '3rem', height: '3rem' }}>
              <CategoryIcon category={product.category} size={20} />
            </span>
          ) : (
            <span className="clinic-card__mono" style={{ width: '3rem', height: '3rem' }} aria-hidden>
              {initials(item.name)}
            </span>
          )}
        </Link>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="tag">{product ? product.brand : clinic!.area}</p>
          <h1 className="page-title reviews-head__title">Reviews of {item.name}</h1>
        </div>
      </header>

      <div className="detail-grid rise" style={{ '--i': 1 } as React.CSSProperties}>
        <div className="stack">
          <div className="toolbar reviews-toolbar">
            <div className="chips" role="group" aria-label="Filter by rating">
              <button type="button" className="chip" aria-pressed={!stars && !topic} onClick={resetPaging(() => { setStars(0); setTopic('') })}>
                All
              </button>
              {[5, 4, 3, 2, 1].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="chip"
                  aria-pressed={stars === n}
                  onClick={resetPaging(() => setStars(stars === n ? 0 : n))}
                >
                  {n} <Star size={12} strokeWidth={2} fill="currentColor" aria-hidden />
                </button>
              ))}
            </div>
            <OptionPicker
              icon={ArrowUpDown}
              title="Sort reviews"
              value={sort}
              options={SORTS}
              onChange={resetPaging((v: string) => setSort(v as SortId))}
            />
          </div>

          {topics.length > 1 && (
            <div className="chips" role="group" aria-label="Filter by service">
              {topics.map((t) => (
                <button key={t} type="button" className="chip" aria-pressed={topic === t} onClick={resetPaging(() => setTopic(topic === t ? '' : t))}>
                  {t}
                </button>
              ))}
            </div>
          )}

          <p className="mono-label" aria-live="polite">
            Showing {Math.min(shown, list.length)} of {list.length}
            {stars ? ` · ${stars}-star` : ''}
            {topic ? ` · ${topic}` : ''} — a sample of {total} reviews
          </p>

          {list.length === 0 ? (
            <EmptyState
              title="No reviews match"
              text="Try another star rating, or clear the filters."
              actionLabel="Show all reviews"
              onClick={() => {
                setStars(0)
                setTopic('')
              }}
            />
          ) : (
            <div className="card card--pad reviews-card">
              <ReviewList reviews={list.slice(0, shown)} kind={kind} votes={helpfulVotes} onHelpful={toggleHelpful} />
            </div>
          )}

          {shown < list.length && (
            <button type="button" className="btn btn--ghost btn--block" onClick={() => setShown((n) => n + PAGE)}>
              Show {Math.min(PAGE, list.length - shown)} more
            </button>
          )}
        </div>

        <aside className="stack side-col">
          <section className="card card--pad">
            <RatingSummary
              rating={item.rating}
              total={total}
              breakdown={ratingBreakdown(item.rating, item.reviews)}
              selected={stars}
              onPick={resetPaging((n: number) => setStars(stars === n ? 0 : n))}
            />
          </section>
          {signedIn ? (
            <button type="button" className="btn btn--primary btn--block" onClick={openWrite}>
              <PenLine size={15} strokeWidth={2} /> Write a review
            </button>
          ) : (
            <Link to="/login" search={{ redirect: `${kind === 'product' ? '/shop' : '/clinics'}/${id}/reviews` }} className="btn btn--ghost btn--block">
              Sign in to write a review
            </Link>
          )}
          <Link to={detailTo} params={{ id }} className="btn btn--quiet" style={{ justifySelf: 'center' }}>
            {kind === 'product' ? 'Back to product' : 'Back to clinic'}
          </Link>
        </aside>
      </div>

      <Sheet
        open={writeOpen}
        onClose={() => setWriteOpen(false)}
        title={sent ? 'Thanks for your review' : `Review ${item.name}`}
        footer={
          sent ? (
            <button type="button" className="btn btn--primary btn--block" onClick={() => setWriteOpen(false)}>
              Done
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={!draft.rating || draft.text.trim().length < 10}
              onClick={() => {
                addUserReview({ kind, targetId: id, rating: draft.rating, text: draft.text.trim(), topic: draft.topic || undefined })
                setSent(true)
                setSort('recent')
                setStars(0)
                setTopic('')
                pushToast('Review posted')
              }}
            >
              Post review
            </button>
          )
        }
      >
        {sent ? (
          <div style={{ textAlign: 'center', paddingBlock: 'var(--space-md)' }}>
            <SuccessMark />
            <p className="row__sub">It’s at the top of the list — other pet parents will thank you.</p>
          </div>
        ) : (
          <div className="stack">
            <div className="star-input" role="radiogroup" aria-label="Your rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={draft.rating === n}
                  aria-label={`${n} star${n === 1 ? '' : 's'}`}
                  className={n <= draft.rating ? 'is-on' : undefined}
                  onClick={() => setDraft((d) => ({ ...d, rating: n }))}
                >
                  <Star size={28} strokeWidth={1.5} fill={n <= draft.rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            {topics.length > 0 && (
              <div className="field">
                <label className="field__label" htmlFor="rw-topic">Service</label>
                <select id="rw-topic" className="select" value={draft.topic} onChange={(e) => setDraft((d) => ({ ...d, topic: e.target.value }))}>
                  {topics.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="field">
              <label className="field__label" htmlFor="rw-text">Your review</label>
              <textarea
                id="rw-text"
                className="input textarea"
                rows={5}
                value={draft.text}
                onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                placeholder={kind === 'product' ? 'How did your pet take to it? Would you buy it again?' : 'How was the visit — staff, waiting time, advice?'}
              />
              <p className="field__help">{draft.text.trim().length < 10 ? 'A sentence or two is plenty.' : ' '}</p>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
