import { useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowUpDown, PackageCheck, SearchX, ShieldCheck, SlidersHorizontal, Truck } from 'lucide-react'

import { ProductCard } from '../components/cards'
import { OptionPicker, ResultRow, SearchControl } from '../components/pickers'
import { CategoryIcon, PetGlyph, Sheet, tileClass } from '../components/ui'
import { CATEGORIES, FREE_DELIVERY_THRESHOLD, PRODUCTS } from '../lib/data'
import { money } from '../lib/format'
import { absoluteUrl, breadcrumbLd, seo } from '../lib/seo'
import { optionKeywords, variantForQuery, variantLabel } from '../lib/catalog'
import type { ProductCategory, Species } from '../lib/types'
import { BRANDS, parseBrands, shopLanding } from '../lib/shop-landing'
import { SPECIES, isSpecies, speciesInfo } from '../lib/species'
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

/** only species the catalogue actually stocks — a new species appears here
 *  once it has products, so the filter never offers an empty shelf */
const PETS = SPECIES.map((sp) => ({
  id: sp.id,
  label: sp.many,
  count: PRODUCTS.filter((p) => p.suits.includes(sp.id)).length,
})).filter((sp) => sp.count > 0)

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
  }, [category, pet, brands, query, sort, filters])

  // few or no results: offer the one-step ways out, each with what it would show
  const widen = useMemo(() => {
    const q = query.trim().toLowerCase()
    const count = (scope: { category: ProductCategory | 'all'; pet?: Species; brands: string[] }, f: Filters, text: string) =>
      PRODUCTS.filter(
        (p) =>
          matchesFilters(p, scope, f) &&
          (!text || `${p.name} ${p.brand} ${p.category} ${optionKeywords(p)}`.toLowerCase().includes(text)),
      ).length
    const scope = { category, pet, brands }
    const petWord = pet ? speciesInfo(pet).one.toLowerCase() : ''
    const catLabel = CATEGORIES.find((c) => c.id === category)?.label
    const moves: { id: string; label: string; n: number; run: () => void }[] = []
    if (category !== 'all')
      moves.push({
        id: 'cat',
        label: petWord ? `All ${petWord} supplies` : 'All supplies',
        n: count({ ...scope, category: 'all' }, filters, q),
        run: () => setCategory('all'),
      })
    if (pet)
      moves.push({
        id: 'pet',
        label: `${catLabel ?? 'Supplies'} for every pet`,
        n: count({ ...scope, pet: undefined }, filters, q),
        run: () => setPet('all'),
      })
    if (brands.length > 0)
      moves.push({
        id: 'brand',
        label: 'Every brand',
        n: count({ ...scope, brands: [] }, filters, q),
        run: () => navigate({ to: '/shop', search: (prev) => ({ ...prev, brand: undefined }), replace: true }),
      })
    if (filters.price !== 'any' || filters.minRating > 0 || filters.inStockOnly)
      moves.push({
        id: 'filters',
        label: 'Any price or rating',
        n: count(scope, NO_FILTERS, q),
        run: () => setFilters(NO_FILTERS),
      })
    if (q)
      moves.push({
        id: 'q',
        label: `Without “${query.trim()}”`,
        n: count(scope, filters, ''),
        run: () => setQuery(''),
      })
    return moves.filter((m) => m.n > results.length)
  }, [category, pet, brands, query, filters, results.length])


  // changing this remounts the grid so cards re-stagger — it signals "new results"
  const resultKey = `${category}|${pet}|${brands.join()}|${query}|${sort}|${JSON.stringify(filters)}`


  const filterPanel = (
    <div className="stack shop-filter-panel">
      <fieldset className="plain-fieldset">
        <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Pet</legend>
        <div className="chips" role="group" aria-label="Pet">
          {PETS.map((o) => (
            <button
              key={o.id}
              type="button"
              className="chip pet-chip"
              aria-pressed={pet === o.id}
              onClick={() => setPet(pet === o.id ? 'all' : o.id)}
            >
              <PetGlyph species={o.id} size={14} />
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
              className={`option-row facet-row${category === c.id ? ' is-selected' : ''}`}
              onClick={() => setCategory(c.id)}
            >
              <span className="option-row__label">{c.id === 'all' ? 'All supplies' : c.label}</span>
              <span className="option-row__hint">
                {c.id === 'all' ? PRODUCTS.length : counts.get(c.id) ?? 0}
              </span>
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

          {results.length > 0 && (
            <div className="grid-products" key={resultKey}>
              {results.map((p, i) => (
                <ProductCard key={p.id} id={p.id} i={i} variantId={query ? variantForQuery(p, query)?.id : undefined} />
              ))}
              {results.length < 4 && widen.length > 0 && (
                <WidenCard
                  title={query.trim() ? `That’s everything matching “${query.trim()}”` : `That’s all our ${land.h1.toLowerCase()}`}
                  text="Widen the search to see more."
                  moves={widen}
                />
              )}
            </div>
          )}
          {results.length === 0 && (
            <WidenCard
              empty
              title={query.trim() ? `Nothing matches “${query.trim()}” here` : 'Nothing matches these filters'}
              text={widen.length > 0 ? 'One of these will bring results back.' : 'Try a shorter word, or clear everything.'}
              moves={widen}
              clearAll={() => {
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

/** the way out of a thin result set: each button is one step wider, with its count */
function WidenCard({
  title,
  text,
  moves,
  empty = false,
  clearAll,
}: {
  title: string
  text: string
  moves: { id: string; label: string; n: number; run: () => void }[]
  empty?: boolean
  clearAll?: () => void
}) {
  return (
    <section className={`widen${empty ? ' widen--empty' : ''}`} aria-label="Widen your search">
      {empty && (
        <span className="empty__icon" aria-hidden>
          <SearchX size={20} strokeWidth={1.75} />
        </span>
      )}
      <h2 className="widen__title">{title}</h2>
      <p className="row__sub">{text}</p>
      <div className="widen__moves">
        {moves.map((m) => (
          <button key={m.id} type="button" className="chip" onClick={m.run}>
            {m.label}
            <span className="chip__count">{m.n}</span>
          </button>
        ))}
        {clearAll && (
          <button type="button" className="btn btn--primary btn--sm" onClick={clearAll}>
            Clear everything
          </button>
        )}
      </div>
    </section>
  )
}
