import { useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowUpDown, Check, PackageCheck, ShieldCheck, SlidersHorizontal, Truck } from 'lucide-react'

import { ProductCard } from '../components/cards'
import { OptionPicker, ResultRow, SearchControl } from '../components/pickers'
import { CategoryIcon, EmptyState, PetGlyph, Sheet, tileClass } from '../components/ui'
import { CATEGORIES, FREE_DELIVERY_THRESHOLD, PRODUCTS } from '../lib/data'
import { money } from '../lib/format'
import { absoluteUrl, breadcrumbLd, seo } from '../lib/seo'
import { optionKeywords, variantForQuery, variantLabel } from '../lib/catalog'
import type { ProductCategory, Species } from '../lib/types'
import { BRANDS, parseBrands, shopLanding } from '../lib/shop-landing'
import { SPECIES, isSpecies } from '../lib/species'
import { FeaturedSlider } from '../components/featured-slider'

type ShopSearch = { q?: string; cat?: string; for?: Species; brand?: string }

export const Route = createFileRoute('/shop/')({
  head: ({ match }) => {
    const sp = match.search as ShopSearch
    const land = shopLanding({ cat: sp.cat, pet: sp.for, brands: parseBrands(sp.brand) })
    const list = PRODUCTS.filter(
      (p) =>
        (!sp.cat || p.category === sp.cat) &&
        (!sp.for || p.suits.includes(sp.for)) &&
        (!sp.brand || (parseBrands(sp.brand) ?? []).includes(p.brand)),
    )
    return seo({
      title: land.title,
      description: land.description,
      path: land.canonical,
      // free-text searches and multi-brand filter mixes shouldn't compete with the landings
      noindex: !!sp.q || !land.indexable,
      jsonLd: [
        {
          '@type': 'CollectionPage',
          name: land.h1,
          url: absoluteUrl(land.canonical),
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: list.length,
            itemListElement: list.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: absoluteUrl(`/shop/${p.id}`),
              name: p.name,
            })),
          },
        },
        breadcrumbLd(
          land.canonical === '/shop'
            ? [['Shop', '/shop']]
            : [['Shop', '/shop'], [land.h1, land.canonical]],
        ),
      ],
    })
  },
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    cat:
      typeof search.cat === 'string' && CATEGORIES.some((c) => c.id === search.cat && c.id !== 'all')
        ? search.cat
        : undefined,
    for: isSpecies(search.for) ? search.for : undefined,
    brand: parseBrands(search.brand)?.join(','),
  }),
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

/** local (non-URL) refinements; category, pet and brand live in the URL */
interface Filters {
  price: PriceBand
  minRating: number
  inStockOnly: boolean
}

const NO_FILTERS: Filters = { price: 'any', minRating: 0, inStockOnly: false }

const PETS: { id: Species | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  ...SPECIES.map((sp) => ({ id: sp.id, label: sp.many })),
]

function matchesFilters(
  p: (typeof PRODUCTS)[number],
  scope: { category: ProductCategory | 'all'; pet?: Species; brands: string[] },
  f: Filters,
) {
  if (scope.category !== 'all' && p.category !== scope.category) return false
  if (scope.pet && !p.suits.includes(scope.pet)) return false
  if (scope.brands.length > 0 && !scope.brands.includes(p.brand)) return false
  if (!PRICE_BANDS.find((b) => b.id === f.price)!.test(p.price)) return false
  if (f.minRating > 0 && p.rating < f.minRating) return false
  if (f.inStockOnly && p.stock === 0) return false
  return true
}

function ShopPage() {
  const navigate = useNavigate()
  const { q: urlQ, cat: urlCat, for: pet, brand: urlBrand } = Route.useSearch()
  const brands = useMemo(() => parseBrands(urlBrand) ?? [], [urlBrand])
  const land = shopLanding({ cat: urlCat, pet, brands })
  // query + category live in the URL so the global header search and footer
  // category links can drive this page directly
  const query = urlQ ?? ''
  const category = (urlCat ?? 'all') as ProductCategory | 'all'
  const setQuery = (v: string) =>
    navigate({ to: '/shop', search: (prev) => ({ ...prev, q: v.trim() || undefined }), replace: true })
  const setCategory = (id: ProductCategory | 'all') =>
    navigate({
      to: '/shop',
      search: (prev) => ({ ...prev, cat: id === 'all' ? undefined : id }),
      replace: true,
    })
  const setPet = (id: Species | 'all') =>
    navigate({ to: '/shop', search: (prev) => ({ ...prev, for: id === 'all' ? undefined : id }), replace: true })
  const toggleBrand = (brand: string) => {
    const next = brands.includes(brand) ? brands.filter((b) => b !== brand) : [...brands, brand]
    navigate({ to: '/shop', search: (prev) => ({ ...prev, brand: next.length ? next.join(',') : undefined }), replace: true })
  }

  const [sort, setSort] = useState<SortId>('popular')
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const [sheetOpen, setSheetOpen] = useState(false)

  const activeCount =
    (filters.price !== 'any' ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    brands.length +
    (pet ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0)

  const clearFilters = () => {
    setFilters(NO_FILTERS)
    navigate({ to: '/shop', search: (prev) => ({ ...prev, for: undefined, brand: undefined }), replace: true })
  }

  const counts = useMemo(() => {
    const byCat = new Map<string, number>()
    for (const p of PRODUCTS) byCat.set(p.category, (byCat.get(p.category) ?? 0) + 1)
    return byCat
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = PRODUCTS.filter((p) => {
      if (!matchesFilters(p, { category, pet, brands }, filters)) return false
      if (q && !`${p.name} ${p.brand} ${p.category} ${optionKeywords(p)}`.toLowerCase().includes(q)) return false
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
  const resultKey = `${category}|${pet}|${brands.join()}|${query}|${sort}|${JSON.stringify(filters)}`


  const filterPanel = (
    <div className="stack shop-filter-panel">
      <fieldset className="plain-fieldset">
        <legend className="tag">Pet</legend>
        <div className="segmented pet-toggle" role="radiogroup" aria-label="Pet">
          {PETS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={(pet ?? 'all') === o.id}
              aria-pressed={(pet ?? 'all') === o.id}
              onClick={() => setPet(o.id)}
            >
              {o.id !== 'all' && <PetGlyph species={o.id} size={14} />}
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Category</legend>
        <div role="radiogroup" aria-label="Category">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={category === c.id}
              className={`option-row${category === c.id ? ' is-selected' : ''}`}
              onClick={() => setCategory(c.id)}
            >
              <span className="option-row__label">{c.id === 'all' ? 'All supplies' : c.label}</span>
              <span className="option-row__hint">
                {c.id === 'all' ? PRODUCTS.length : counts.get(c.id) ?? 0}
              </span>
              {category === c.id && <Check size={15} strokeWidth={2.25} aria-hidden />}
            </button>
          ))}
        </div>
      </fieldset>

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
              aria-pressed={brands.includes(brand)}
              onClick={() => toggleBrand(brand)}
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
          onClick={clearFilters}
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
        <h1 className="shop-title">{land.h1}</h1>
        <p className="shop-intro">{land.intro}</p>
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

      <div className="rise" style={{ '--i': 1 } as React.CSSProperties}>
        <FeaturedSlider />
      </div>

      <div className="shop-layout rise" style={{ '--i': 2 } as React.CSSProperties}>
        <aside className="shop-aside" aria-label="Product filters">
          <p className="tag" style={{ marginBottom: 'var(--space-sm)' }}>Filters</p>
          {filterPanel}
        </aside>

        <div className="shop-content">
          <div className="toolbar toolbar--shop">
            <SearchControl placeholder="Search supplies" value={query} onChange={setQuery}>
              {(close) =>
                query.trim() ? (
                  results.length > 0 ? (
                    results.map((p) => (
                      <ResultRow
                        key={p.id}
                        to="/shop/$id"
                        params={{ id: p.id }}
                        onClose={close}
                        title={p.name}
                        meta={(() => {
                          const hit = variantForQuery(p, query)
                          return hit
                            ? `${variantLabel(p, hit)} · ${money(hit.price)}`
                            : `${p.brand} · ${money(p.price)} · ${p.unit}`
                        })()}
                        search={(() => {
                          const hit = variantForQuery(p, query)
                          return hit ? { v: hit.id } : undefined
                        })()}
                        tile={
                          <span className={`tile ${tileClass(p.category)}`} style={{ width: '2.5rem', height: '2.5rem' }}>
                            <CategoryIcon category={p.category} size={16} />
                          </span>
                        }
                      />
                    ))
                  ) : (
                    <p className="row__sub">Nothing matches “{query.trim()}”.</p>
                  )
                ) : (
                  <p className="row__sub">Type to search all {PRODUCTS.length} supplies.</p>
                )
              }
            </SearchControl>
            <span className="toolbar__sort">
              <OptionPicker
                icon={ArrowUpDown}
                title="Sort by"
                value={sort}
                options={SORTS.map((s) => ({ id: s.id, label: s.label }))}
                onChange={(id) => setSort(id as SortId)}
              />
            </span>
        <button
          type="button"
          className="picker-btn filter-btn"
          onClick={() => setSheetOpen(true)}
          aria-label={`Filters${activeCount > 0 ? `, ${activeCount} active` : ''}`}
        >
              <SlidersHorizontal size={17} strokeWidth={1.75} aria-hidden />
              {activeCount > 0 && <span className="picker-btn__badge">{activeCount}</span>}
            </button>
          </div>

          <div className="results-bar">
            <p className="mono-label" aria-live="polite">
              {results.length} item{results.length === 1 ? '' : 's'}
              {query.trim() && ` for “${query.trim()}”`}
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
                options={SORTS.map((s) => ({ id: s.id, label: s.label }))}
                onChange={(id) => setSort(id as SortId)}
              />
            </span>
          </div>

          {results.length > 0 ? (
            <div className="grid-products" key={resultKey}>
              {results.map((p, i) => (
                <ProductCard key={p.id} id={p.id} i={i} variantId={query ? variantForQuery(p, query)?.id : undefined} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nothing matches these filters"
              text="Try a shorter word, or clear a filter or two."
              actionLabel="Clear everything"
              onClick={() => {
                setFilters(NO_FILTERS)
                navigate({ to: '/shop', search: {}, replace: true })
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
