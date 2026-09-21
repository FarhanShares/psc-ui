import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search, SlidersHorizontal } from 'lucide-react'

import { ClinicCard } from '../components/cards'
import { EmptyState, Sheet } from '../components/ui'
import { CLINICS, SERVICE_TYPES } from '../lib/data'

type Filters = {
  service: string // service type id or 'all'
  maxDistance: number // 0 = any
  minRating: number // 0 = any
  priceBand: number // 0 = any
  openNow: boolean
  verifiedOnly: boolean
}

const DEFAULT_FILTERS: Filters = {
  service: 'all',
  maxDistance: 0,
  minRating: 0,
  priceBand: 0,
  openNow: false,
  verifiedOnly: false,
}

type SortId = 'recommended' | 'distance' | 'rating'

export const Route = createFileRoute('/clinics/')({
  head: () => ({ title: 'Clinics · PetSafeCare' }),
  validateSearch: (search: Record<string, unknown>): { service?: string } => ({
    service: typeof search.service === 'string' ? search.service : undefined,
  }),
  component: ClinicsPage,
})

function ClinicsPage() {
  const { service: urlService } = Route.useSearch()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortId>('recommended')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [applied, setApplied] = useState<Filters>({
    ...DEFAULT_FILTERS,
    service: urlService && SERVICE_TYPES.some((s) => s.id === urlService) ? urlService : 'all',
  })
  const [draft, setDraft] = useState<Filters>(applied)

  const activeCount =
    (applied.service !== 'all' ? 1 : 0) +
    (applied.maxDistance > 0 ? 1 : 0) +
    (applied.minRating > 0 ? 1 : 0) +
    (applied.priceBand > 0 ? 1 : 0) +
    (applied.openNow ? 1 : 0) +
    (applied.verifiedOnly ? 1 : 0)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = CLINICS.filter((c) => {
      if (applied.service !== 'all' && !c.services.some((s) => s.type === applied.service)) return false
      if (applied.maxDistance > 0 && c.distanceKm > applied.maxDistance) return false
      if (applied.minRating > 0 && c.rating < applied.minRating) return false
      if (applied.priceBand > 0 && c.priceBand !== applied.priceBand) return false
      if (applied.openNow && !c.openNow) return false
      if (applied.verifiedOnly && !c.verified) return false
      if (q && !`${c.name} ${c.area}`.toLowerCase().includes(q)) return false
      return true
    })
    if (sort === 'distance') list = [...list].sort((a, b) => a.distanceKm - b.distanceKm)
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    if (sort === 'recommended')
      list = [...list].sort(
        (a, b) =>
          Number(b.verified) - Number(a.verified) ||
          b.rating - a.rating ||
          a.distanceKm - b.distanceKm,
      )
    return list
  }, [query, applied, sort])

  return (
    <div className="page">
      <header className="rise" style={{ '--i': 0 } as React.CSSProperties}>
        <h1 className="page-title">Clinics</h1>
        <p className="muted" style={{ fontSize: 'var(--text-sm)', marginTop: 2 }}>
          Consultations, vaccinations and grooming — booked in under a minute.
        </p>
      </header>

      <div className="rise" style={{ '--i': 1 } as React.CSSProperties}>
        <div className="search">
          <Search size={16} strokeWidth={1.75} aria-hidden />
          <input
            type="search"
            className="input"
            placeholder="Search clinics or areas"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search clinics"
          />
        </div>
      </div>

      <div
        className="chips rise"
        style={{ '--i': 2 } as React.CSSProperties}
        role="radiogroup"
        aria-label="Filter by service"
      >
        <button
          type="button"
          role="radio"
          aria-checked={applied.service === 'all'}
          className="chip"
          onClick={() => setApplied((f) => ({ ...f, service: 'all' }))}
        >
          All services
        </button>
        {SERVICE_TYPES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={applied.service === s.id}
            className="chip"
            onClick={() => setApplied((f) => ({ ...f, service: s.id }))}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        className="split rise"
        style={{ '--i': 3, gap: 'var(--space-sm)' } as React.CSSProperties}
      >
        <p className="mono-label" aria-live="polite">
          {results.length} clinic{results.length === 1 ? '' : 's'}
        </p>
        <div className="thead">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              setDraft(applied)
              setSheetOpen(true)
            }}
          >
            <SlidersHorizontal size={14} strokeWidth={1.75} />
            Filters{activeCount > 0 ? ` · ${activeCount}` : ''}
          </button>
          <select
            className="select"
            style={{ width: 'auto', flex: 'none' }}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
            aria-label="Sort clinics"
          >
            <option value="recommended">Recommended</option>
            <option value="distance">Nearest</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      {results.length > 0 ? (
        <div className="clinic-grid rise" style={{ '--i': 4 } as React.CSSProperties}>
          {results.map((c) => (
            <ClinicCard key={c.id} id={c.id} />
          ))}
        </div>
      ) : (
        <div className="rise" style={{ '--i': 4 } as React.CSSProperties}>
          <EmptyState
            title="No clinics match these filters"
            text="Widen the distance, or turn off a filter or two."
            actionLabel="Reset filters"
            onClick={() => setApplied(DEFAULT_FILTERS)}
          />
        </div>
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filters"
        footer={
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2xs)' }}>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setDraft({ ...DEFAULT_FILTERS, service: applied.service })}
            >
              Reset
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setApplied(draft)
                setSheetOpen(false)
              }}
            >
              Show {CLINICS.filter((c) => {
                if (draft.service !== 'all' && !c.services.some((s) => s.type === draft.service)) return false
                if (draft.maxDistance > 0 && c.distanceKm > draft.maxDistance) return false
                if (draft.minRating > 0 && c.rating < draft.minRating) return false
                if (draft.priceBand > 0 && c.priceBand !== draft.priceBand) return false
                if (draft.openNow && !c.openNow) return false
                if (draft.verifiedOnly && !c.verified) return false
                return true
              }).length} clinics
            </button>
          </div>
        }
      >
        <div className="stack">
          <div className="switch-row">
            <span className="switch-row__text">
              <span className="row__title" style={{ fontSize: 'var(--text-body)' }}>Open now</span>
              <span className="row__sub">Hide clinics that are closed</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              className="switch"
              checked={draft.openNow}
              onChange={(e) => setDraft((d) => ({ ...d, openNow: e.target.checked }))}
              aria-label="Open now only"
            />
          </div>
          <div className="switch-row">
            <span className="switch-row__text">
              <span className="row__title" style={{ fontSize: 'var(--text-body)' }}>Verified only</span>
              <span className="row__sub">Licence checked by PetSafeCare</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              className="switch"
              checked={draft.verifiedOnly}
              onChange={(e) => setDraft((d) => ({ ...d, verifiedOnly: e.target.checked }))}
              aria-label="Verified clinics only"
            />
          </div>

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Distance</legend>
            <div className="chips">
              {[
                { v: 0, l: 'Any' },
                { v: 2, l: 'Within 2 km' },
                { v: 5, l: 'Within 5 km' },
                { v: 10, l: 'Within 10 km' },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  className="chip"
                  aria-pressed={draft.maxDistance === o.v}
                  onClick={() => setDraft((d) => ({ ...d, maxDistance: o.v }))}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Rating</legend>
            <div className="chips">
              {[
                { v: 0, l: 'Any' },
                { v: 4, l: '4.0+' },
                { v: 4.5, l: '4.5+' },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  className="chip"
                  aria-pressed={draft.minRating === o.v}
                  onClick={() => setDraft((d) => ({ ...d, minRating: o.v }))}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Price level</legend>
            <div className="chips">
              {[
                { v: 0, l: 'Any' },
                { v: 1, l: '$' },
                { v: 2, l: '$$' },
                { v: 3, l: '$$$' },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  className="chip"
                  aria-pressed={draft.priceBand === o.v}
                  onClick={() => setDraft((d) => ({ ...d, priceBand: o.v }))}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </Sheet>
    </div>
  )
}
