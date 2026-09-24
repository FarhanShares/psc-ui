import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Check, ChevronLeft, ShoppingCart } from 'lucide-react'

import { EmptyState } from '../components/ui'
import { CATEGORIES, FREE_DELIVERY_THRESHOLD, PRODUCTS, getProduct } from '../lib/data'
import { ProductCard } from '../components/cards'
import { CartLine } from '../components/cart-line'
import { lineKey } from '../lib/catalog'
import { money } from '../lib/format'
import { cartTotals, placeOrder, useAppState } from '../lib/store'
import type { Order } from '../lib/types'
import { seo } from '../lib/seo'
import { CheckoutFields, useCheckout } from '../components/checkout'

export const Route = createFileRoute('/cart')({
  head: () => seo({ title: 'Cart', path: '/cart', noindex: true }),
  component: CartPage,
})

function CartPage() {
  const { cart, savedProducts, signedIn, orders } = useAppState()
  const navigate = useNavigate()
  const savedInStock = savedProducts.filter((id) => (getProduct(id)?.stock ?? 0) > 0)
  const { subtotal, delivery, total } = cartTotals(cart)

  const [stage, setStage] = useState<'cart' | 'checkout' | 'placed'>('cart')
  const co = useCheckout()
  const [placing, setPlacing] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)

  const missing = FREE_DELIVERY_THRESHOLD - subtotal
  // cheapest in-stock items that close the free-delivery gap, then top-rated fillers
  const topUps = PRODUCTS.filter((p) => p.stock > 0 && !cart.some((i) => i.productId === p.id))
    .sort((a, b) => {
      const aFits = a.price >= missing ? 0 : 1
      const bFits = b.price >= missing ? 0 : 1
      return aFits - bFits || (aFits === 0 ? a.price - b.price : b.rating - a.rating)
    })
    .slice(0, 4)

  function handlePlaceOrder() {
    const details = co.submit()
    if (!details) return
    setPlacing(true)
    window.setTimeout(() => {
      const order = placeOrder(details.addressLine, details.paidWith)
      setPlacedOrder(order)
      setPlacing(false)
      setStage('placed')
    }, 900)
  }

  function goToCheckout() {
    // guests keep their cart through sign-in — it merges into the account
    if (!signedIn) {
      navigate({ to: '/login', search: { redirect: '/cart' } })
      return
    }
    co.start()
    setStage('checkout')
  }


  /* ------------------------------------------------------------ placed */
  if (stage === 'placed' && placedOrder) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingBlock: 'var(--space-2xl)' }}>
        <span
          className="tile"
          style={{
            width: '3.5rem',
            height: '3.5rem',
            margin: '0 auto var(--space-sm)',
            borderRadius: '50%',
            background: 'var(--color-ok-tint)',
            color: 'var(--color-ok)',
          }}
        >
          <Check size={26} strokeWidth={2.25} />
        </span>
        <h1 className="page-title">Order placed</h1>
        <p className="muted" style={{ marginTop: 'var(--space-2xs)' }}>
          #{placedOrder.id} · {money(placedOrder.total)} · arriving in 2–4 days at{' '}
          {placedOrder.addressLine}
        </p>
        <div style={{ display: 'grid', gap: 'var(--space-2xs)', marginTop: 'var(--space-md)' }}>
          <Link to="/orders/$id" params={{ id: placedOrder.id }} className="btn btn--primary">
            Track order
          </Link>
          <Link to="/shop" className="btn btn--ghost">
            Keep shopping
          </Link>
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------------- empty */
  if (cart.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title rise" style={{ '--i': 0 } as React.CSSProperties}>
          Cart
        </h1>
        <div className="rise" style={{ '--i': 1 } as React.CSSProperties}>
          <EmptyState
            title="Your cart is empty"
            text={`Food, treats and everyday care, delivered in 2–4 days — free over ${money(FREE_DELIVERY_THRESHOLD)}.`}
            actionLabel="Browse the shop"
            actionTo="/shop"
            secondaryLabel={signedIn && orders.length > 0 ? 'Buy again from an order' : undefined}
            secondaryTo={signedIn && orders.length > 0 ? '/orders' : undefined}
            icon={<ShoppingCart size={20} strokeWidth={1.75} />}
          >
            <span className="tag">Shop by category</span>
            <div className="chips">
              {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                <Link key={c.id} to="/shop" search={{ cat: c.id }} className="chip">
                  {c.label}
                </Link>
              ))}
            </div>
          </EmptyState>
        </div>
        {savedInStock.length > 0 && (
          <section className="rise" style={{ '--i': 2 } as React.CSSProperties}>
            <div className="section-head">
              <h2 className="section-head__title">From your saved list</h2>
              <Link to="/saved" className="section-head__link">All saved</Link>
            </div>
            <div className="grid-products">
              {savedInStock.slice(0, 4).map((id, i) => (
                <ProductCard key={id} id={id} i={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    )
  }

  /* -------------------------------------------------------------- cart */
  return (
    <div className="page">
      {stage === 'checkout' && (
        <button
          type="button"
          className="thead rise"
          style={{ '--i': 0, background: 'none', border: 0, cursor: 'pointer', padding: 0 } as React.CSSProperties}
          onClick={() => setStage('cart')}
        >
          <ChevronLeft size={15} strokeWidth={2} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Back to cart</span>
        </button>
      )}

      {stage === 'cart' && (
        <>
          <h1 className="page-title rise" style={{ '--i': 0 } as React.CSSProperties}>
            Cart
          </h1>

          <div
            className="detail-grid rise"
            style={{ '--i': 1, alignItems: 'start' } as React.CSSProperties}
          >
            <div className="grid-list">
              {cart.map((item) => (
                <CartLine key={lineKey(item.productId, item.variantId)} item={item} />
              ))}
            </div>

            <div className="stack side-col">
              <div className="summary">
                <div className="summary__row">
                  <span>Subtotal</span>
                  <span className="price">{money(subtotal)}</span>
                </div>
                <div className="summary__row">
                  <span>Delivery</span>
                  <span className="price">{delivery === 0 ? 'Free' : money(delivery)}</span>
                </div>
                {missing > 0 && (
                  <div className="free-meter">
                    <span className="free-meter__track" aria-hidden>
                      <span style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }} />
                    </span>
                    <p className="row__sub">Add {money(missing)} more for free delivery.</p>
                  </div>
                )}
                <div className="summary__row summary__row--total">
                  <span>Total</span>
                  <span className="price">{money(total)}</span>
                </div>
              </div>

              <button type="button" className="btn btn--primary btn--block" onClick={goToCheckout}>
                {signedIn ? `Checkout · ${money(total)}` : 'Sign in to check out'}
              </button>
              {!signedIn && (
                <p className="row__sub" style={{ textAlign: 'center' }}>
                  Your cart comes with you when you sign in.
                </p>
              )}
              <Link to="/shop" className="btn btn--quiet" style={{ justifySelf: 'center' }}>
                Continue shopping
              </Link>
            </div>
          </div>

          {topUps.length > 0 && (
            <section className="rise" style={{ '--i': 2 } as React.CSSProperties}>
              <div className="section-head">
                <h2 className="section-head__title">
                  {missing > 0 ? 'Top up for free delivery' : 'Often added'}
                </h2>
              </div>
              <div className="grid-products">
                {topUps.map((p, i) => (
                  <ProductCard key={p.id} id={p.id} i={i} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {stage === 'checkout' && (
        <>
          <h1 className="page-title rise" style={{ '--i': 0 } as React.CSSProperties}>
            Checkout
          </h1>

          <div className="detail-grid rise" style={{ '--i': 1, alignItems: 'start' } as React.CSSProperties}>
            <CheckoutFields co={co} prefix="co" />

            <div className="stack side-col">
              <div className="summary">
                <div className="summary__row">
                  <span>
                    {cart.reduce((n, i) => n + i.qty, 0)} item
                    {cart.reduce((n, i) => n + i.qty, 0) === 1 ? '' : 's'} · {co.addressLabel ?? 'no address'}
                  </span>
                  <span className="price">{money(total)}</span>
                </div>
                <div className="summary__row">
                  <span>Delivery</span>
                  <span className="price">{delivery === 0 ? 'Free' : money(delivery)}</span>
                </div>
              </div>

              <div>
                {co.error && (
                  <p className="field__help field__help--error" role="alert" style={{ marginBottom: 'var(--space-2xs)' }}>
                    {co.error}
                  </p>
                )}
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  data-loading={placing || undefined}
                  disabled={placing}
                  onClick={handlePlaceOrder}
                >
                  Place order · {money(total)}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
