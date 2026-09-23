import { useEffect, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Check, ChevronRight, MessageCircleQuestion, PackageCheck, Truck } from 'lucide-react'

import { Crumbs, RatingSummary, ReviewList, SaveButton } from '../components/blocks'
import { ProductCard } from '../components/cards'
import { CategoryIcon, PetGlyph, Pill, Price, Stars, Stepper, tileClass, useCopiedLabel } from '../components/ui'
import { CATEGORIES, FREE_DELIVERY_THRESHOLD, PRODUCTS, getProduct, productReviews, ratingBreakdown } from '../lib/data'
import { money } from '../lib/format'
import { absoluteUrl, breadcrumbLd, seo } from '../lib/seo'
import { addToCart, cartCount, useAppState } from '../lib/store'

const CATEGORY_NOTES: Record<string, string> = {
  food: 'Switch to a new food gradually over about a week, mixing growing amounts into the current diet.',
  treats: 'Treats work best as rewards — keep them under a tenth of the day’s calories.',
  grooming: 'For external use only. Avoid the eyes and ears, and rinse thoroughly.',
  toys: 'Pick a size your pet can’t swallow, supervise the first plays, and retire toys that start to fray.',
  health: 'Follow the schedule on the pack, and check with your vet before combining treatments.',
}

export const Route = createFileRoute('/shop/$id')({
  head: ({ params }) => {
    const p = getProduct(params.id)
    if (!p) return seo({ title: 'Product not found', noindex: true })
    const cat = CATEGORIES.find((c) => c.id === p.category)?.label ?? p.category
    return seo({
      title: `${p.name} — ${p.unit}`,
      description: `${p.blurb} ${money(p.price)} from ${p.brand}. Free delivery over ${money(FREE_DELIVERY_THRESHOLD)}.`,
      path: `/shop/${p.id}`,
      type: 'product',
      jsonLd: [
        {
          '@type': 'Product',
          name: p.name,
          sku: `PSC-${p.id.toUpperCase()}`,
          brand: { '@type': 'Brand', name: p.brand },
          category: cat,
          description: p.blurb,
          image: absoluteUrl('/og-image.png'),
          aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
          offers: {
            '@type': 'Offer',
            url: absoluteUrl(`/shop/${p.id}`),
            priceCurrency: 'USD',
            price: p.price.toFixed(2),
            availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
          },
        },
        breadcrumbLd([
          ['Shop', '/shop'],
          [cat, `/shop?cat=${p.category}`],
          [p.name, `/shop/${p.id}`],
        ]),
      ],
    })
  },
  component: ProductPage,
})

function ProductPage() {
  const { id } = Route.useParams()
  const product = getProduct(id)
  const [qty, setQty] = useState(1)
  const [added, markAdded] = useCopiedLabel(1600)
  const { cart } = useAppState()
  const buyRef = useRef<HTMLDivElement>(null)
  const [buyInView, setBuyInView] = useState(true)

  // related-product links reuse this component — start each product at qty 1
  useEffect(() => setQty(1), [id])

  // the sticky phone bar appears only after the inline buy row leaves the screen
  useEffect(() => {
    const el = buyRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setBuyInView(entry.isIntersecting), {
      rootMargin: '0px 0px -72px 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [id])

  if (!product) {
    return (
      <div className="page">
        <p className="muted">This product is no longer listed.</p>
        <Link to="/shop" className="btn btn--ghost btn--sm" style={{ width: 'fit-content' }}>
          Back to shop
        </Link>
      </div>
    )
  }

  const stockTone = product.stock === 0 ? 'bad' : product.stock <= 5 ? 'warn' : 'ok'
  const stockLabel =
    product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Low stock · ${product.stock} left` : 'In stock'
  const inCategory = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id)
  const fillers = PRODUCTS.filter(
    (p) => p.category !== product.category && p.id !== product.id,
  ).sort((a, b) => b.rating - a.rating)
  const related = [...inCategory, ...fillers].slice(0, 4)
  const reviews = productReviews(product.id)
  const catLabel = CATEGORIES.find((c) => c.id === product.category)?.label ?? product.category
  const inCart = cartCount(cart.filter((i) => i.productId === product.id))

  function add() {
    addToCart(product!.id, qty)
    markAdded()
  }

  return (
    <div className="page">
      <Crumbs
        items={[
          { label: 'Shop', to: '/shop' },
          { label: catLabel, to: '/shop', search: { cat: product.category } },
          { label: product.name },
        ]}
      />

      <div className="pdp rise" style={{ '--i': 1 } as React.CSSProperties}>
        <div className="pdp__media">
          <span className={`tile pdp__tile ${tileClass(product.category)}`}>
            <CategoryIcon category={product.category} size={88} />
            {product.stock === 0 && <span className="product-card__flag">Out of stock</span>}
          </span>
          <SaveButton kind="product" id={product.id} name={product.name} variant="overlay" />
        </div>

        <div className="pdp__info">
          <div>
            <p className="tag">{product.brand}</p>
            <h1 className="pdp__title">{product.name}</h1>
            <div className="pdp__meta">
              <Stars rating={product.rating} />
              <a href="#reviews" className="row__sub num">{product.reviews} reviews</a>
              <span className="pdp__suits">
                {product.suits.map((sp) => (
                  <span key={sp} className="chip chip--static">
                    <PetGlyph species={sp} size={13} /> {sp === 'dog' ? 'Dogs' : 'Cats'}
                  </span>
                ))}
              </span>
            </div>
          </div>

          <div className="pdp__price">
            <Price value={product.price} className="pdp__amount" />
            <span className="row__sub num">{product.unit}</span>
            <Pill tone={stockTone}>{stockLabel}</Pill>
          </div>

          <p className="pdp__blurb">{product.blurb}</p>

          <div className="pdp__buy" ref={buyRef}>
            <Stepper value={qty} onChange={setQty} label={`Quantity of ${product.name}`} />
            <button
              type="button"
              className="btn btn--primary pdp__add"
              disabled={product.stock === 0}
              onClick={add}
            >
              {added ? (
                <>
                  <Check size={15} strokeWidth={2.25} /> Added to cart
                </>
              ) : product.stock === 0 ? (
                'Out of stock'
              ) : qty > 1 ? (
                `Add ${qty} · ${money(product.price * qty)}`
              ) : (
                'Add to cart'
              )}
            </button>
            <SaveButton kind="product" id={product.id} name={product.name} variant="icon" />
          </div>
          {inCart > 0 && (
            <p className="row__sub">
              {inCart} in your cart · <Link to="/cart">Review cart</Link>
            </p>
          )}

          <ul className="pdp__trust">
            <li>
              <Truck size={15} strokeWidth={1.75} aria-hidden />
              Free delivery over {money(FREE_DELIVERY_THRESHOLD)} — arrives in 2–4 days
            </li>
            <li>
              <PackageCheck size={15} strokeWidth={1.75} aria-hidden />
              30-day returns, no questions asked
            </li>
            <li>
              <MessageCircleQuestion size={15} strokeWidth={1.75} aria-hidden />
              Not sure it fits? Ask at your next clinic visit
            </li>
          </ul>
        </div>
      </div>

      <div className="pdp__details rise" style={{ '--i': 2 } as React.CSSProperties}>
        <div className="stack">
          <section className="card card--pad">
            <h2 className="section-head__title">How to use</h2>
            <p className="pdp__blurb" style={{ marginTop: 'var(--space-2xs)' }}>
              {CATEGORY_NOTES[product.category]}
            </p>
          </section>
          <section className="card card--pad">
            <h2 className="section-head__title">At a glance</h2>
            <dl className="spec-list">
              <div className="spec-list__row">
                <dt>Brand</dt>
                <dd>{product.brand}</dd>
              </div>
              <div className="spec-list__row">
                <dt>Category</dt>
                <dd>{catLabel}</dd>
              </div>
              <div className="spec-list__row">
                <dt>Suits</dt>
                <dd>{product.suits.map((sp) => (sp === 'dog' ? 'Dogs' : 'Cats')).join(' & ')}</dd>
              </div>
              <div className="spec-list__row">
                <dt>Size</dt>
                <dd className="num">{product.unit}</dd>
              </div>
              <div className="spec-list__row">
                <dt>SKU</dt>
                <dd className="num">PSC-{product.id.toUpperCase()}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section id="reviews" className="card card--pad" style={{ scrollMarginTop: '5rem' }}>
          <h2 className="section-head__title section-head">Reviews</h2>
          <RatingSummary rating={product.rating} total={product.reviews} breakdown={ratingBreakdown(product.rating, product.reviews)} />
          <div style={{ marginTop: 'var(--space-md)' }}>
            <ReviewList reviews={reviews} />
          </div>
        </section>
      </div>

      {related.length > 0 && (
        <section className="rise" style={{ '--i': 3 } as React.CSSProperties}>
          <div className="section-head">
            <h2 className="section-head__title">
              {inCategory.length > 1 ? `More ${catLabel.toLowerCase()}` : 'You might also need'}
            </h2>
            <Link to="/shop" className="section-head__link">
              All supplies <ChevronRight size={13} strokeWidth={2} />
            </Link>
          </div>
          <div className="grid-products">
            {related.map((p, i) => (
              <ProductCard key={p.id} id={p.id} i={i} />
            ))}
          </div>
        </section>
      )}

      {product.stock > 0 && (
        <div className="buy-bar" aria-label="Quick add" data-hidden={buyInView} aria-hidden={buyInView || undefined}>
          <span style={{ minWidth: 0 }}>
            <Price value={product.price * qty} className="price--lg" />
            <span className="row__sub" style={{ display: 'block' }}>{qty > 1 ? `${qty} × ${money(product.price)}` : product.unit}</span>
          </span>
          <button type="button" className="btn btn--primary" onClick={add}>
            {added ? (
              <>
                <Check size={15} strokeWidth={2.25} /> Added
              </>
            ) : (
              'Add to cart'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
