import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpDown, MapPinOff, SlidersHorizontal } from 'lucide-react'

import { ClinicCard } from '../components/cards'
import { OptionPicker, ResultRow, SearchControl } from '../components/pickers'
import { EmptyState, Sheet } from '../components/ui'
import { CLINICS, SERVICE_TYPES } from '../lib/data'
import { absoluteUrl, seo } from '../lib/seo'

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

const SERVICE_INTRO: Record<string, string> = {
  consultation: 'General and extended consultations for new symptoms, second opinions and ongoing conditions. Compare prices and book a slot today.',
  vaccination: 'Core and booster vaccinations for dogs and cats. Booking here marks the matching reminder on your Health tab as scheduled.',
  grooming: 'Baths, trims, nails and de-shedding from vet clinics and mobile groomers — calm handling for nervous pets.',
  dental: 'Dental checks and scale-and-polish under a vet’s care. Most need fasting from the night before.',
  surgery: 'Soft-tissue and emergency surgery with pre-op bloodwork. Call the clinic to talk through recovery before you book.',
  checkup: 'Annual wellness exams and critical-care checks — weight, heart, teeth and a full once-over.',
}

const CLINIC_SORTS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'distance', label: 'Nearest' },
  { id: 'rating', label: 'Top rated' },
]


export const Route = createFileRoute('/clinics/')({
  head: ({ match }) => {
    const svc = SERVICE_TYPES.find((t) => t.id === (match.search as { service?: string }).service)
    const title = svc ? `${svc.label} — vet clinics near you` : 'Vet clinics near you — book online'
    return seo({
      title,
      description: svc
        ? `Compare ${CLINICS.filter((c) => c.services.some((s) => s.type === svc.id)).length} clinics offering ${svc.label.toLowerCase()}: prices, ratings, opening hours and live availability. Book in under a minute.`
        : `Compare ${CLINICS.length} local vet clinics — consultations, vaccinations, grooming, dental and surgery. See prices and ratings, then book online.`,
      path: svc ? `/clinics?service=${svc.id}` : '/clinics',
      jsonLd: {
        '@type': 'ItemList',
        name: title,
        itemListElement: CLINICS.filter((c) => !svc || c.services.some((s) => s.type === svc.id)).map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: absoluteUrl(`/clinics/${c.id}`),
          name: c.name,
        })),
      },
    })
  },
  validateSearch: (search: Record<string, unknown>): { service?: string } => ({
    service: typeof search.service === 'string' ? search.service : undefined,
  }),
  component: ClinicsPage,
})


/** filter facets bound to whichever state object the caller passes */
function FilterFacets({
  value,
  onChange,
}: {
  value: Filters
  onChange: (patch: Partial<Filters>) => void
}) {
  return (
    <div className="stack">
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Service</legend>
        <div role="radiogroup" aria-label="Service">
          {[{ id: 'all', label: 'All services' }, ...SERVICE_TYPES.map((s) => ({ id: s.id, label: s.label }))].map(
            (o) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={value.service === o.id}
                className={`option-row facet-row${value.service === o.id ? ' is-selected' : ''}`}
                onClick={() => onChange({ service: o.id })}
              >
                <span className="option-row__label">{o.label}</span>
                <span className="option-row__hint">
                  {o.id === 'all' ? CLINICS.length : CLINICS.filter((c) => c.services.some((s) => s.type === o.id)).length}
                </span>
              </button>
            ),
          )}
        </div>
      </fieldset>

      <div className="switch-row">
        <span className="switch-row__text">
          <span className="row__title" style={{ fontSize: 'var(--text-body)' }}>Open now</span>
          <span className="row__sub">Hide clinics that are closed</span>
        </span>
        <input
          type="checkbox"
          role="switch"
          className="switch"
          checked={value.openNow}
          onChange={(e) => onChange({ openNow: e.target.checked })}
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
          checked={value.verifiedOnly}
          onChange={(e) => onChange({ verifiedOnly: e.target.checked })}
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
              aria-pressed={value.maxDistance === o.v}
              onClick={() => onChange({ maxDistance: o.v })}
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
              aria-pressed={value.minRating === o.v}
              onClick={() => onChange({ minRating: o.v })}
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
              aria-pressed={value.priceBand === o.v}
              onClick={() => onChange({ priceBand: o.v })}
            >
              {o.l}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

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

  // footer / home links change ?service= while this page is mounted
  useEffect(() => {
    const next = urlService && SERVICE_TYPES.some((s) => s.id === urlService) ? urlService : 'all'
    setApplied((f) => (f.service === next ? f : { ...f, service: next }))
  }, [urlService])

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

  // unfiltered matches for the mobile search sheet — search is about finding, not filtering
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return CLINICS.filter((c) => `${c.name} ${c.area}`.toLowerCase().includes(q)).slice(0, 8)
  }, [query])

  return (
    <div className="page">
      <header className="rise" style={{ '--i': 0 } as React.CSSProperties}>
        <h1 className="page-title">
          {applied.service !== 'all'
            ? `${SERVICE_TYPES.find((t) => t.id === applied.service)?.label ?? ''} clinics`
            : 'Clinics'}
        </h1>
        <p className="shop-intro">
          {SERVICE_INTRO[applied.service] ?? 'Consultations, vaccinations and grooming — booked in under a minute.'}
        </p>
      </header>

      <div className="shop-layout rise" style={{ '--i': 1 } as React.CSSProperties}>
        <aside className="shop-aside" aria-label="Clinic filters">
          <p className="tag" style={{ marginBottom: 'var(--space-sm)' }}>Filters</p>
          <FilterFacets value={applied} onChange={(patch) => setApplied((f) => ({ ...f, ...patch }))} />
          {activeCount > 0 && (
            <button
              type="button"
              className="btn btn--quiet btn--sm"
              style={{ justifySelf: 'start', marginTop: 'var(--space-2xs)' }}
              onClick={() => setApplied(DEFAULT_FILTERS)}
            >
              Clear {activeCount} filter{activeCount === 1 ? '' : 's'}
            </button>
          )}
        </aside>

        <div className="clinic-content">
          <div className="toolbar">
        <SearchControl placeholder="Search clinics or areas" value={query} onChange={setQuery}>
          {(close) =>
            query.trim() ? (
              searchResults.length > 0 ? (
                searchResults.map((c) => (
                  <ResultRow
                    key={c.id}
                    to="/clinics/$id"
                    params={{ id: c.id }}
                    onClose={close}
                    title={c.name}
                    meta={`${c.area} · ${c.distanceKm.toFixed(1)} km · ★ ${c.rating.toFixed(1)}`}
                    tile={
                      <span className="clinic-card__mono" aria-hidden>
                        {c.name
                          .split(' ')
                          .filter((w) => /^[A-Z]/.test(w))
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join('')}
                      </span>
                    }
                  />
                ))
              ) : (
                <p className="row__sub">No clinics match “{query.trim()}”.</p>
              )
            ) : (
              <p className="row__sub">Type to search {CLINICS.length} clinics by name or area.</p>
            )
          }
        </SearchControl>
        <span className="toolbar__sort">
          <OptionPicker
            icon={ArrowUpDown}
            title="Sort by"
            value={sort}
            options={CLINIC_SORTS}
            onChange={(id) => setSort(id as SortId)}
          />
        </span>
        <button
          type="button"
          className="picker-btn filter-btn"
          onClick={() => {
            setDraft(applied)
            setSheetOpen(true)
          }}
          aria-label={`Filters${activeCount > 0 ? `, ${activeCount} active` : ''}`}
        >
          <SlidersHorizontal size={17} strokeWidth={1.75} aria-hidden />
          {activeCount > 0 && <span className="picker-btn__badge">{activeCount}</span>}
        </button>
      </div>

      <div className="results-bar">
        <p className="mono-label" aria-live="polite">
          {results.length} clinic{results.length === 1 ? '' : 's'}
          {activeCount > 0 && ` · ${activeCount} filter${activeCount === 1 ? '' : 's'} on`}
        </p>
        <span className="results-bar__sort">
          <OptionPicker
            icon={ArrowUpDown}
            title="Sort by"
            variant="labeled"
            prefix="Sort"
            align="end"
            value={sort}
            options={CLINIC_SORTS}
            onChange={(id) => setSort(id as SortId)}
          />
        </span>
      </div>

      {results.length > 0 ? (
        <div className="clinic-grid rise" style={{ '--i': 3 } as React.CSSProperties}>
          {results.map((c) => (
            <ClinicCard key={c.id} id={c.id} />
          ))}
        </div>
      ) : (
        <div className="rise" style={{ '--i': 4 } as React.CSSProperties}>
          <EmptyState
            title="No clinics match these filters"
            text="Widen the distance or turn off a filter. In an emergency, the 24-hour hospital is always listed on the emergency page."
            actionLabel="Reset filters"
            onClick={() => setApplied(DEFAULT_FILTERS)}
            secondaryLabel="Emergency help"
            secondaryTo="/emergency"
            icon={<MapPinOff size={20} strokeWidth={1.75} />}
          />
        </div>
        )}
        </div>
      </div>

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
        <FilterFacets value={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
      </Sheet>
    </div>
  )
}
