import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Check, ChevronLeft, MapPin, ShoppingCart, Trash2 } from 'lucide-react'

import { CategoryIcon, EmptyState, Stepper, tileClass } from '../components/ui'
import { FREE_DELIVERY_THRESHOLD, getProduct } from '../lib/data'
import { money } from '../lib/format'
import { cartTotals, placeOrder, removeFromCart, setCartQty, useAppState } from '../lib/store'
import type { Order } from '../lib/types'

export const Route = createFileRoute('/cart')({
  head: () => ({ title: 'Cart · PetSafeCare' }),
  component: CartPage,
})

function CartPage() {
  const { cart, profile } = useAppState()
  const { subtotal, delivery, total } = cartTotals(cart)

  const [stage, setStage] = useState<'cart' | 'checkout' | 'placed'>('cart')
  const [addressId, setAddressId] = useState(
    () => profile.addresses.find((a) => a.isDefault)?.id ?? profile.addresses[0]?.id ?? '',
  )
  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone)
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)

  const address = profile.addresses.find((a) => a.id === addressId)
  const missing = subtotal - FREE_DELIVERY_THRESHOLD

  function handlePlaceOrder() {
    if (!address) {
      setError('Choose a delivery address before placing the order.')
      return
    }
    if (card.replace(/\s/g, '').length < 12) {
      setError('That card number looks too short. Enter all digits, or try another card.')
      return
    }
    setError('')
    setPlacing(true)
    window.setTimeout(() => {
      const order = placeOrder(address.line)
      setPlacedOrder(order)
      setPlacing(false)
      setStage('placed')
    }, 900)
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
          <Link to="/orders" className="btn btn--primary">
            View order
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
            text="Food, treats, grooming — the shop has the everyday things pets run out of."
            actionLabel="Browse the shop"
            actionTo="/shop"
            icon={<ShoppingCart size={20} strokeWidth={1.75} />}
          />
        </div>
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
              {cart.map((item) => {
                const p = getProduct(item.productId)
                if (!p) return null
                return (
                  <div key={item.productId} className="card row">
                    <span className={`tile ${tileClass(p.category)}`} style={{ width: '2.75rem', height: '2.75rem' }}>
                      <CategoryIcon category={p.category} size={19} />
                    </span>
                    <span className="row__grow" style={{ minWidth: 0 }}>
                      <span className="row__title">{p.name}</span>
                      <span className="row__sub">
                        {p.unit} · {money(p.price)} each
                      </span>
                      <Stepper
                        value={item.qty}
                        onChange={(v) => setCartQty(p.id, v)}
                        label={`Quantity of ${p.name}`}
                      />
                    </span>
                    <span style={{ display: 'grid', justifyItems: 'end', gap: 'var(--space-2xs)' }}>
                      <span className="price price--lg">{money(p.price * item.qty)}</span>
                      <button
                        type="button"
                        className="btn btn--quiet btn--sm"
                        onClick={() => removeFromCart(p.id)}
                      >
                        <Trash2 size={14} strokeWidth={1.75} /> Remove
                      </button>
                    </span>
                  </div>
                )
              })}
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
                {missing > 0 && missing + delivery <= FREE_DELIVERY_THRESHOLD && (
                  <p className="row__sub">
                    Add {money(missing)} more for free delivery.
                  </p>
                )}
                <div className="summary__row summary__row--total">
                  <span>Total</span>
                  <span className="price">{money(total)}</span>
                </div>
              </div>

              <button type="button" className="btn btn--primary btn--block" onClick={() => setStage('checkout')}>
                Checkout · {money(total)}
              </button>
            </div>
          </div>
        </>
      )}

      {stage === 'checkout' && (
        <>
          <h1 className="page-title rise" style={{ '--i': 0 } as React.CSSProperties}>
            Checkout
          </h1>

          <div className="detail-grid rise" style={{ '--i': 1, alignItems: 'start' } as React.CSSProperties}>
            <div className="stack">
              <section>
                <div className="section-head">
                  <h2 className="section-head__title">Delivery address</h2>
                  <Link to="/profile" className="section-head__link">
                    Manage
                  </Link>
                </div>
                <div className="chips" role="radiogroup" aria-label="Delivery address">
                  {profile.addresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      role="radio"
                      aria-checked={addressId === a.id}
                      className="chip"
                      onClick={() => setAddressId(a.id)}
                    >
                      <MapPin size={13} strokeWidth={1.75} />
                      {a.label} — {a.line}
                    </button>
                  ))}
                </div>
              </section>

              <section className="stack">
                <div className="section-head">
                  <h2 className="section-head__title">Contact</h2>
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="co-name">
                    Full name
                  </label>
                  <input
                    id="co-name"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="co-phone">
                    Phone number
                  </label>
                  <input
                    id="co-phone"
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    inputMode="tel"
                  />
                  <p className="field__help">The courier calls this number on arrival.</p>
                </div>
              </section>

              <section className="stack">
                <div className="section-head">
                  <h2 className="section-head__title">Payment</h2>
                  <span className="tag">Demo — no charge</span>
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="co-card">
                    Card number
                  </label>
                  <input
                    id="co-card"
                    className="input"
                    value={card}
                    onChange={(e) =>
                      setCard(
                        e.target.value
                          .replace(/[^\d]/g, '')
                          .slice(0, 16)
                          .replace(/(\d{4})(?=\d)/g, '$1 '),
                      )
                    }
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    autoComplete="cc-number"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
                  <div className="field">
                    <label className="field__label" htmlFor="co-exp">
                      Expiry
                    </label>
                    <input
                      id="co-exp"
                      className="input"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
                      inputMode="numeric"
                      placeholder="09 / 29"
                      autoComplete="cc-exp"
                    />
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="co-cvc">
                      CVC
                    </label>
                    <input
                      id="co-cvc"
                      className="input"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      inputMode="numeric"
                      placeholder="123"
                      autoComplete="cc-csc"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="stack side-col">
              <div className="summary">
                <div className="summary__row">
                  <span>
                    {cart.reduce((n, i) => n + i.qty, 0)} item
                    {cart.reduce((n, i) => n + i.qty, 0) === 1 ? '' : 's'} · {address?.label ?? 'no address'}
                  </span>
                  <span className="price">{money(total)}</span>
                </div>
                <div className="summary__row">
                  <span>Delivery</span>
                  <span className="price">{delivery === 0 ? 'Free' : money(delivery)}</span>
                </div>
              </div>

              <div>
                {error && (
                  <p className="field__help field__help--error" role="alert" style={{ marginBottom: 'var(--space-2xs)' }}>
                    {error}
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
