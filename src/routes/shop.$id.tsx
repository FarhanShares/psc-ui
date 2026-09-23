import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Check, ChevronLeft, MessageCircleQuestion, PackageCheck, Truck } from 'lucide-react'

import { ProductCard } from '../components/cards'
import { CategoryIcon, Pill, Price, Stars, Stepper, tileClass, useCopiedLabel } from '../components/ui'
import { FREE_DELIVERY_THRESHOLD, PRODUCTS, getProduct } from '../lib/data'
import { money } from '../lib/format'
import { addToCart } from '../lib/store'

const CATEGORY_NOTES: Record<string, string> = {
  food: 'Switch to a new food gradually over about a week, mixing growing amounts into the current diet.',
  treats: 'Treats work best as rewards — keep them under a tenth of the day’s calories.',
  grooming: 'For external use only. Avoid the eyes and ears, and rinse thoroughly.',
  toys: 'Pick a size your pet can’t swallow, supervise the first plays, and retire toys that start to fray.',
  health: 'Follow the schedule on the pack, and check with your vet before combining treatments.',
}

export const Route = createFileRoute('/shop/$id')({
  head: ({ params }) => ({ meta: [{ title: `${getProduct(params.id)?.name ?? 'Product'} · PetSafeCare` }] }),
  component: ProductPage,
})

function ProductPage() {
  const { id } = Route.useParams()
  const product = getProduct(id)
  const [qty, setQty] = useState(1)
  const [added, markAdded] = useCopiedLabel(1600)

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

  return (
    <div className="page">
      <Link to="/shop" className="thead rise" style={{ '--i': 0 } as React.CSSProperties}>
        <ChevronLeft size={15} strokeWidth={2} />
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Shop</span>
      </Link>

      <div className="detail-grid rise" style={{ '--i': 1 } as React.CSSProperties}>
        <div className="card">
          <span className={`tile tile--card ${tileClass(product.category)}`}>
            <CategoryIcon category={product.category} size={72} />
          </span>
          <div style={{ padding: 'var(--space-md)' }}>
            <p className="tag">{product.brand}</p>
            <h1 className="page-title" style={{ fontSize: 'var(--text-xl)', marginBlock: 'var(--space-3xs) var(--space-2xs)' }}>
              {product.name}
            </h1>
            <div className="split" style={{ marginBlock: 'var(--space-2xs) var(--space-xs)' }}>
              <Stars rating={product.rating} />
              <span className="row__sub num">{product.reviews} reviews</span>
            </div>
            <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink-2)' }}>{product.blurb}</p>
            <div className="split" style={{ marginTop: 'var(--space-sm)' }}>
              <Pill tone={stockTone}>{stockLabel}</Pill>
              <span className="row__sub num">{product.unit}</span>
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="card card--pad split" style={{ flexWrap: 'wrap' }}>
            <div>
              <Price value={product.price * qty} className="price--lg" />
              <p className="row__sub" style={{ marginTop: 2 }}>
                {money(product.price)} each · {product.unit}
              </p>
            </div>
            <Stepper value={qty} onChange={setQty} label={`Quantity of ${product.name}`} />
          </div>

          <div>
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={product.stock === 0}
              onClick={() => {
                addToCart(product.id, qty)
                markAdded()
              }}
            >
              {added ? (
                <>
                  <Check size={15} strokeWidth={2.25} /> Added to cart
                </>
              ) : product.stock === 0 ? (
                'Out of stock'
              ) : (
                'Add to cart'
              )}
            </button>
          </div>

          <section className="card card--pad stack" style={{ gap: 'var(--space-2xs)' }}>
            <div className="row__sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Truck size={14} strokeWidth={1.75} />
              Free delivery over {money(FREE_DELIVERY_THRESHOLD)} — arrives in 2–4 days
            </div>
            <div className="row__sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PackageCheck size={14} strokeWidth={1.75} />
              30-day returns, no questions asked
            </div>
            <div className="row__sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageCircleQuestion size={14} strokeWidth={1.75} />
              Not sure it fits? Ask at your next clinic visit
            </div>
          </section>

          <section className="card card--pad">
            <span className="tag">How to use</span>
            <p className="row__sub" style={{ marginTop: 'var(--space-2xs)' }}>
              {CATEGORY_NOTES[product.category]}
            </p>
          </section>
        </div>
      </div>

      <section className="card card--pad rise" style={{ '--i': 2 } as React.CSSProperties}>
        <span className="tag">At a glance</span>
        <dl className="spec-list">
          <div className="spec-list__row">
            <dt>Brand</dt>
            <dd>{product.brand}</dd>
          </div>
          <div className="spec-list__row">
            <dt>Category</dt>
            <dd className="num" style={{ textTransform: 'capitalize' }}>{product.category}</dd>
          </div>
          <div className="spec-list__row">
            <dt>Size</dt>
            <dd className="num">{product.unit}</dd>
          </div>
          <div className="spec-list__row">
            <dt>Rated</dt>
            <dd className="num">{product.rating.toFixed(1)} from {product.reviews} reviews</dd>
          </div>
          <div className="spec-list__row">
            <dt>SKU</dt>
            <dd className="num">PSC-{product.id.toUpperCase()}</dd>
          </div>
        </dl>
      </section>

      {related.length > 0 && (
        <section className="rise" style={{ '--i': 3 } as React.CSSProperties}>
          <div className="section-head">
            <h2 className="section-head__title">
              {inCategory.length > 1 ? `More ${product.category} picks` : 'You might also need'}
            </h2>
            <Link to="/shop" className="section-head__link">
              All supplies <ChevronLeft size={13} strokeWidth={2} style={{ rotate: '180deg' }} />
            </Link>
          </div>
          <div className="rail">
            {related.map((p, i) => (
              <ProductCard key={p.id} id={p.id} i={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
