import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PackageCheck, Search, ShieldCheck, SlidersHorizontal, Truck } from 'lucide-react'

import { ProductCard } from '../components/cards'
import { EmptyState, Sheet } from '../components/ui'
import { CATEGORIES, FREE_DELIVERY_THRESHOLD, PRODUCTS } from '../lib/data'
import { money } from '../lib/format'
import type { ProductCategory } from '../lib/types'

export const Route = createFileRoute('/shop/')({
  head: () => ({ title: 'Shop · PetSafeCare' }),
  component: ShopPage,
})

type SortId = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'name'
type PriceBand = 'any' | 'u10' | '10-20' | 'o20'

const SORTS: { id: SortId; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'price-asc', label: 'Price · low to high' },
  { id: 'price-desc', label: 'Price · high to low' },
  { id: 'rating', label: 'Top rated' },
  { id: 'name', label: 'Name · A to Z' },
]

const PRICE_BANDS: { id: PriceBand; label: string; test: (p: number) => boolean }[] = [
  { id: 'any', label: 'Any price', test: () => true },
  { id: 'u10', label: 'Under $10', test: (p) => p < 10 },
  { id: '10-20', label: '$10 – $20', test: (p) => p >= 10 && p <= 20 },
  { id: 'o20', label: 'Over $20', test: (p) => p > 20 },
]

const RATINGS = [
  { v: 0, l: 'Any rating' },
  { v: 4, l: '4.0+' },
  { v: 4.5, l: '4.5+' },
]

const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort()

interface Filters {
  price: PriceBand
  minRating: number
  brands: string[]
  inStockOnly: boolean
}

const NO_FILTERS: Filters = { price: 'any', minRating: 0, brands: [], inStockOnly: false }

function matchesFilters(
  p: (typeof PRODUCTS)[number],
  category: ProductCategory | 'all',
  f: Filters,
) {
  if (category !== 'all' && p.category !== category) return false
  if (!PRICE_BANDS.find((b) => b.id === f.price)!.test(p.price)) return false
  if (f.minRating > 0 && p.rating < f.minRating) return false
  if (f.brands.length > 0 && !f.brands.includes(p.brand)) return false
  if (f.inStockOnly && p.stock === 0) return false
  return true
}

function ShopPage() {
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortId>('popular')
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const [sheetOpen, setSheetOpen] = useState(false)

  const activeCount =
    (filters.price !== 'any' ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    filters.brands.length +
    (filters.inStockOnly ? 1 : 0)

  const counts = useMemo(() => {
    const byCat = new Map<string, number>()
    for (const p of PRODUCTS) byCat.set(p.category, (byCat.get(p.category) ?? 0) + 1)
    return byCat
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = PRODUCTS.filter((p) => {
      if (!matchesFilters(p, category, filters)) return false
      if (q && !`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q)) return false
      return true
    })
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'popular') list = [...list].sort((a, b) => b.reviews - a.reviews)
    return list
  }, [category, query, sort, filters])

  // changing this remounts the grid so cards re-stagger — it signals "new results"
  const resultKey = `${category}|${query}|${sort}|${JSON.stringify(filters)}`

  const activeCategory = category === 'all' ? undefined : CATEGORIES.find((c) => c.id === category)

  const filterPanel = (
    <div className="stack shop-filter-panel">
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Price</legend>
        <div className="chips">
          {PRICE_BANDS.map((b) => (
            <button
              key={b.id}
              type="button"
              className="chip"
              aria-pressed={filters.price === b.id}
              onClick={() => setFilters((f) => ({ ...f, price: b.id }))}
            >
              {b.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Rating</legend>
        <div className="chips">
          {RATINGS.map((r) => (
            <button
              key={r.v}
              type="button"
              className="chip"
              aria-pressed={filters.minRating === r.v}
              onClick={() => setFilters((f) => ({ ...f, minRating: r.v }))}
            >
              {r.l}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Brand</legend>
        <div className="chips">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              type="button"
              className="chip"
              aria-pressed={filters.brands.includes(brand)}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  brands: f.brands.includes(brand)
                    ? f.brands.filter((b) => b !== brand)
                    : [...f.brands, brand],
                }))
              }
            >
              {brand}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="switch-row" style={{ paddingBlock: 'var(--space-2xs)' }}>
        <span className="switch-row__text">
          <span className="row__title" style={{ fontSize: 'var(--text-body)' }}>In stock only</span>
          <span className="row__sub">Hide what’s sold out</span>
        </span>
        <input
          type="checkbox"
          role="switch"
          className="switch"
          checked={filters.inStockOnly}
          onChange={(e) => setFilters((f) => ({ ...f, inStockOnly: e.target.checked }))}
          aria-label="In stock only"
        />
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          className="btn btn--quiet btn--sm"
          style={{ justifySelf: 'start' }}
          onClick={() => setFilters(NO_FILTERS)}
        >
          Clear {activeCount} filter{activeCount === 1 ? '' : 's'}
        </button>
      )}
    </div>
  )

  return (
    <div className="page">
      <header className="rise" style={{ '--i': 0 } as React.CSSProperties}>
        <p className="tag">Shop</p>
        <h1 className="shop-title">{activeCategory ? activeCategory.label : 'Supplies'}</h1>
        <p className="muted" style={{ fontSize: 'var(--text-sm)', marginTop: 2 }}>
          {activeCategory
            ? `${counts.get(category) ?? 0} ${activeCategory.label.toLowerCase()} essentials — delivered.`
            : 'Food, treats and daily care — delivered.'}
        </p>
      </header>

      <ul className="value-strip rise" style={{ '--i': 1 } as React.CSSProperties} aria-label="Shop policies">
        <li>
          <Truck size={15} strokeWidth={1.75} aria-hidden />
          Free delivery over {money(FREE_DELIVERY_THRESHOLD)}
        </li>
        <li>
          <PackageCheck size={15} strokeWidth={1.75} aria-hidden />
          30-day returns
        </li>
        <li>
          <ShieldCheck size={15} strokeWidth={1.75} aria-hidden />
          No fillers, no mystery brands
        </li>
      </ul>

      <div className="shop-layout rise" style={{ '--i': 2 } as React.CSSProperties}>
        <aside className="shop-aside" aria-label="Product filters">
          <p className="tag" style={{ marginBottom: 'var(--space-sm)' }}>Filters</p>
          {filterPanel}
        </aside>

        <div className="shop-content">
          <div className="shop-toolbar">
            <div className="search">
              <Search size={16} strokeWidth={1.75} aria-hidden />
              <input
                type="search"
                className="input"
                placeholder="Search supplies"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search supplies"
              />
            </div>
            <select
              className="select select--auto"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortId)}
              aria-label="Sort products"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn--ghost btn--sm shop-filter-btn"
              onClick={() => setSheetOpen(true)}
            >
              <SlidersHorizontal size={14} strokeWidth={1.75} />
              Filters{activeCount > 0 ? ` · ${activeCount}` : ''}
            </button>
          </div>

          <div className="chips" aria-label="Filter by category">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className="chip"
                aria-pressed={category === c.id}
                onClick={() => setCategory(c.id)}
              >
                {c.id === 'all' ? 'All' : c.label}
                {c.id !== 'all' && <span className="chip__count">{counts.get(c.id) ?? 0}</span>}
              </button>
            ))}
          </div>

          <p className="mono-label" aria-live="polite">
            {results.length} item{results.length === 1 ? '' : 's'}
            {activeCount > 0 && ` · ${activeCount} filter${activeCount === 1 ? '' : 's'} on`}
          </p>

          {results.length > 0 ? (
            <div className="grid-products" key={resultKey}>
              {results.map((p, i) => (
                <ProductCard key={p.id} id={p.id} i={i} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nothing matches these filters"
              text="Try a shorter word, or clear a filter or two."
              actionLabel="Clear everything"
              onClick={() => {
                setQuery('')
                setCategory('all')
                setFilters(NO_FILTERS)
              }}
            />
          )}
        </div>
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        footer={
          <button type="button" className="btn btn--primary btn--block" onClick={() => setSheetOpen(false)}>
            Show {results.length} item{results.length === 1 ? '' : 's'}
          </button>
        }
      >
        {filterPanel}
      </Sheet>
    </div>
  )
}
