import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ChevronRight, Clock, HelpCircle, Search, X } from 'lucide-react'

import { ProductCard } from '../components/cards'
import { CategoryIcon, EmptyState, ServiceIcon, Stars, tileClass } from '../components/ui'
import { CATEGORIES, CLINICS, FAQS, PRODUCTS, SERVICE_TYPES } from '../lib/data'
import { initials, money } from '../lib/format'
import { seo } from '../lib/seo'
import { optionKeywords, variantForQuery } from '../lib/catalog'
import { clearRecentSearches, rememberSearch, useAppState } from '../lib/store'
import type { ProductCategory, ServiceType } from '../lib/types'

export const Route = createFileRoute('/search')({
  validateSearch: (s: Record<string, unknown>): { q?: string } => ({
    q: typeof s.q === 'string' && s.q.trim() ? s.q : undefined,
  }),
  head: () => seo({ title: 'Search', path: '/search', noindex: true }),
  component: SearchPage,
})

const POPULAR = ['Kitten', 'Salmon', 'Wet', 'Flea', 'Dental', 'Vaccination']

function SearchPage() {
  const { q = '' } = Route.useSearch()
  const navigate = useNavigate()
  const { recentSearches } = useAppState()
  const [text, setText] = useState(q)
  const inputRef = useRef<HTMLInputElement>(null)

  // keep the box in sync when the URL changes (back/forward, chip taps)
  useEffect(() => setText(q), [q])

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (text.trim() === q.trim()) return
      navigate({ to: '/search', search: { q: text.trim() || undefined }, replace: true })
    }, 250)
    return () => window.clearTimeout(t)
  }, [text, q, navigate])

  useEffect(() => {
    if (!q.trim()) return
    const t = window.setTimeout(() => rememberSearch(q), 1200)
    return () => window.clearTimeout(t)
  }, [q])

  const term = q.trim().toLowerCase()
  const results = useMemo(() => {
    if (!term) return null
    const has = (s: string) => s.toLowerCase().includes(term)
    return {
      products: PRODUCTS.filter((p) => has(`${p.name} ${p.brand} ${p.category} ${p.blurb} ${optionKeywords(p)}`)),
      clinics: CLINICS.filter((c) => has(`${c.name} ${c.area} ${c.services.map((s) => `${s.name} ${s.type}`).join(' ')}`)),
      services: SERVICE_TYPES.filter((s) => has(s.label)),
      help: FAQS.filter((f) => has(`${f.q} ${f.a}`)).slice(0, 3),
    }
  }, [term])

  const total = results ? results.products.length + results.clinics.length + results.services.length + results.help.length : 0

  return (
    <div className="page">
      <h1 className="visually-hidden">Search</h1>
      <form
        className="search search--page rise"
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          rememberSearch(text)
          inputRef.current?.blur()
        }}
      >
        <Search size={18} strokeWidth={1.75} aria-hidden />
        <input
          ref={inputRef}
          type="search"
          className="input"
          placeholder="Search supplies, clinics, help"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Search supplies, clinics and help"
          autoFocus
          enterKeyHint="search"
        />
        {text && (
          <button type="button" className="search__clear" aria-label="Clear search" onClick={() => { setText(''); inputRef.current?.focus() }}>
            <X size={15} strokeWidth={2} />
          </button>
        )}
      </form>

      {!results && (
        <>
          {recentSearches.length > 0 && (
            <section className="rise" style={{ '--i': 1 } as React.CSSProperties}>
              <div className="section-head">
                <h2 className="section-head__title">Recent</h2>
                <button type="button" className="link-btn" onClick={clearRecentSearches}>Clear</button>
              </div>
              <div className="chips">
                {recentSearches.map((s) => (
                  <Link key={s} to="/search" search={{ q: s }} className="chip">
                    <Clock size={13} strokeWidth={1.75} /> {s}
                  </Link>
                ))}
              </div>
            </section>
          )}
          <section className="rise" style={{ '--i': 2 } as React.CSSProperties}>
            <h2 className="section-head__title section-head">Popular</h2>
            <div className="chips">
              {POPULAR.map((s) => (
                <Link key={s} to="/search" search={{ q: s }} className="chip">
                  {s}
                </Link>
              ))}
            </div>
          </section>
          <section className="rise" style={{ '--i': 3 } as React.CSSProperties}>
            <h2 className="section-head__title section-head">Shop by category</h2>
            <div className="cat-grid">
              {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                <Link key={c.id} to="/shop" search={{ cat: c.id }} className={`cat-tile ${tileClass(c.id as ProductCategory)}`}>
                  <CategoryIcon category={c.id as ProductCategory} size={22} />
                  {c.label}
                </Link>
              ))}
            </div>
          </section>
          <section className="rise" style={{ '--i': 4 } as React.CSSProperties}>
            <h2 className="section-head__title section-head">Book a service</h2>
            <div className="chips">
              {SERVICE_TYPES.map((s) => (
                <Link key={s.id} to="/clinics" search={{ service: s.id }} className="chip">
                  <ServiceIcon type={s.id as ServiceType} size={14} /> {s.label}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {results && (
        <>
          <p className="mono-label" aria-live="polite">
            {total} result{total === 1 ? '' : 's'} for “{q.trim()}”
          </p>

          {total === 0 && (
            <EmptyState
              title="No matches"
              text="Check the spelling, or try a broader word like “food” or “vaccine”."
              actionLabel="Browse the shop"
              actionTo="/shop"
            />
          )}

          {results.services.length > 0 && (
            <section>
              <h2 className="section-head__title section-head">Services</h2>
              <div className="chips">
                {results.services.map((s) => (
                  <Link key={s.id} to="/clinics" search={{ service: s.id }} className="chip">
                    <ServiceIcon type={s.id as ServiceType} size={14} /> {s.label} clinics
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.products.length > 0 && (
            <section>
              <div className="section-head">
                <h2 className="section-head__title">Supplies</h2>
                <Link to="/shop" search={{ q: q.trim() }} className="section-head__link">
                  Filter in shop <ChevronRight size={13} strokeWidth={2} />
                </Link>
              </div>
              <div className="grid-products">
                {results.products.slice(0, 8).map((p, i) => (
                  <ProductCard key={p.id} id={p.id} i={i} variantId={variantForQuery(p, q)?.id} />
                ))}
              </div>
            </section>
          )}

          {results.clinics.length > 0 && (
            <section>
              <h2 className="section-head__title section-head">Clinics</h2>
              <div className="grid-list">
                {results.clinics.map((c) => (
                  <Link key={c.id} to="/clinics/$id" params={{ id: c.id }} className="card card--press row">
                    <span className="clinic-card__mono" aria-hidden>{initials(c.name)}</span>
                    <span className="row__grow">
                      <span className="row__title">{c.name}</span>
                      <span className="row__sub">
                        {c.area} · {c.distanceKm.toFixed(1)} km · from {money(Math.min(...c.services.map((s) => s.price)))}
                      </span>
                    </span>
                    <Stars rating={c.rating} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.help.length > 0 && (
            <section>
              <h2 className="section-head__title section-head">Help</h2>
              <div className="menu">
                {results.help.map((f) => (
                  <Link key={f.q} to="/help" search={{ topic: f.topic }} className="menu-row">
                    <span className="menu-row__icon" aria-hidden><HelpCircle size={16} strokeWidth={1.75} /></span>
                    <span className="row__grow">
                      <span className="row__title">{f.q}</span>
                    </span>
                    <ChevronRight size={16} strokeWidth={1.75} className="muted" aria-hidden />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
