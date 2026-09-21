import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Check, ChevronLeft, PackageCheck, Truck } from 'lucide-react'

import { CategoryIcon, Pill, Price, Stars, Stepper, tileClass, useCopiedLabel } from '../components/ui'
import { getProduct } from '../lib/data'
import { money } from '../lib/format'
import { addToCart } from '../lib/store'
import { FREE_DELIVERY_THRESHOLD } from '../lib/data'

export const Route = createFileRoute('/shop/$id')({
  head: ({ params }) => ({ title: `${getProduct(params.id)?.name ?? 'Product'} · PetSafeCare` }),
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
            <p className="row__sub" style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 'var(--space-2xs)' }}>
              <Truck size={14} strokeWidth={1.75} />
              Free delivery on orders over {money(FREE_DELIVERY_THRESHOLD)}
            </p>
            <p className="row__sub" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <PackageCheck size={14} strokeWidth={1.75} />
              30-day returns, no questions asked
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
