import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Check,
  HeartPulse,
  Home,
  MapPin,
  Minus,
  PawPrint,
  Plus,
  Search,
  ShoppingCart,
  Stethoscope,
  Store,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'

import { CategoryIcon, tileClass } from './ui'
import { CATEGORIES, FREE_DELIVERY_THRESHOLD, getProduct } from '../lib/data'
import { money } from '../lib/format'
import {
  cartCount,
  cartTotals,
  dismissToast,
  hydrateFromStorage,
  placeOrder,
  removeFromCart,
  setCartQty,
  useAppState,
  useToasts,
} from '../lib/store'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/shop', label: 'Shop', icon: Store, exact: false },
  { to: '/clinics', label: 'Clinics', icon: Stethoscope, exact: false },
  { to: '/health', label: 'Health', icon: HeartPulse, exact: false },
  { to: '/profile', label: 'Profile', icon: UserRound, exact: false },
] as const

function BrandMark() {
  return (
    <Link to="/" className="brand" aria-label="PetSafeCare home">
      <span className="brand__mark" aria-hidden>
        <PawPrint size={16} strokeWidth={2} />
      </span>
      <span className="brand__name">
        Pet<span>Safe</span>Care
      </span>
    </Link>
  )
}

/* ---------------------------------------------------------------- topbar (phone) */

export function Topbar() {
  const { cart } = useAppState()
  const count = cartCount(cart)

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <BrandMark />
        <span className="topbar__spacer" />
        <Link
          to="/cart"
          className="icon-btn"
          aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
        >
          <ShoppingCart size={18} strokeWidth={1.75} />
          {count > 0 && (
            <span key={count} className="icon-btn__badge">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}

/* ------------------------------------------------- site header (desktop, ecommerce) */

export function SiteHeader({ onOpenCart }: { onOpenCart: () => void }) {
  const { cart } = useAppState()
  const count = cartCount(cart)
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  useEffect(() => {
    const term = q.trim()
    if (!term) return
    const t = window.setTimeout(() => {
      navigate({ to: '/shop', search: (prev) => ({ ...prev, q: term }), replace: true })
    }, 350)
    return () => window.clearTimeout(t)
  }, [q, navigate])

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <BrandMark />
        <div className="site-search">
          <Search size={16} strokeWidth={1.75} aria-hidden />
          <input
            type="search"
            placeholder="Search supplies"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search supplies"
          />
        </div>
        <nav className="site-nav" aria-label="Primary">
          {NAV_ITEMS.filter((i) => !i.exact).map((item) => (
            <Link key={item.to} to={item.to} className="site-nav__link">
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="icon-btn site-header__cart"
          onClick={onOpenCart}
          aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
        >
          <ShoppingCart size={18} strokeWidth={1.75} />
          {count > 0 && (
            <span key={count} className="icon-btn__badge">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------- cart drawer (desktop) */

type DrawerMode = 'cart' | 'checkout' | 'placed'

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, profile } = useAppState()
  const { subtotal, delivery, total } = cartTotals(cart)
  const ref = useRef<HTMLDialogElement>(null)

  const [mode, setMode] = useState<DrawerMode>('cart')
  const [addressId, setAddressId] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [placedOrder, setPlacedOrder] = useState<{ id: string; total: number; addressLine: string } | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  // fresh session each time the drawer opens
  useEffect(() => {
    if (!open) return
    setMode('cart')
    setError('')
    setPlacing(false)
    setPlacedOrder(null)
    setAddressId(profile.addresses.find((a) => a.isDefault)?.id ?? profile.addresses[0]?.id ?? '')
    setName(profile.name)
    setPhone(profile.phone)
    setCard('')
    setExpiry('')
    setCvc('')
  }, [open, profile])

  const address = profile.addresses.find((a) => a.id === addressId)

  function placeDrawerOrder() {
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
      setPlacedOrder({ id: order.id, total: order.total, addressLine: order.addressLine })
      setPlacing(false)
      setMode('placed')
    }, 900)
  }

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-label="Cart"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      <div className="drawer__head">
        {mode === 'checkout' && (
          <button type="button" className="icon-btn" onClick={() => setMode('cart')} aria-label="Back to cart">
            <ArrowLeft size={16} strokeWidth={1.75} />
          </button>
        )}
        <h2 className="drawer__title">
          {mode === 'checkout' ? 'Checkout' : mode === 'placed' ? 'Order placed' : 'Cart'}
        </h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close cart">
          <X size={16} strokeWidth={1.75} />
        </button>
      </div>

      {mode === 'cart' && (
        <>
          {cart.length === 0 ? (
            <p className="row__sub" style={{ padding: 'var(--space-lg) 0' }}>
              Nothing here yet — add something from the shop.
            </p>
          ) : (
            <div className="drawer__items">
              {cart.map((item) => {
                const p = getProduct(item.productId)
                if (!p) return null
                return (
                  <div key={item.productId} className="drawer__item">
                    <span className={`tile ${tileClass(p.category)}`} style={{ width: '2.5rem', height: '2.5rem' }}>
                      <CategoryIcon category={p.category} size={16} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="row__title" style={{ display: 'block', fontSize: 'var(--text-sm)' }}>
                        {p.name}
                      </span>
                      <span className="row__sub num">{money(p.price)} each</span>
                    </span>
                    <span className="stepper" style={{ transform: 'scale(0.88)', transformOrigin: 'right center' }}>
                      <button
                        type="button"
                        className="stepper__btn"
                        onClick={() => setCartQty(p.id, item.qty - 1)}
                        aria-label={`Decrease quantity of ${p.name}`}
                      >
                        <Minus size={13} strokeWidth={2} />
                      </button>
                      <span className="stepper__val">{item.qty}</span>
                      <button
                        type="button"
                        className="stepper__btn"
                        onClick={() => setCartQty(p.id, item.qty + 1)}
                        aria-label={`Increase quantity of ${p.name}`}
                      >
                        <Plus size={13} strokeWidth={2} />
                      </button>
                    </span>
                    <button
                      type="button"
                      className="btn btn--quiet btn--sm"
                      onClick={() => removeFromCart(p.id)}
                      aria-label={`Remove ${p.name}`}
                    >
                      <Trash2 size={13} strokeWidth={1.75} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {cart.length > 0 && (
            <div className="drawer__foot">
              <div className="summary" style={{ padding: 'var(--space-sm)' }}>
                <div className="summary__row">
                  <span>Subtotal</span>
                  <span className="price">{money(subtotal)}</span>
                </div>
                <div className="summary__row">
                  <span>Delivery</span>
                  <span className="price">{delivery === 0 ? 'Free' : money(delivery)}</span>
                </div>
              </div>
              {subtotal < FREE_DELIVERY_THRESHOLD && (
                <p className="row__sub">
                  Add {money(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery.
                </p>
              )}
              <button type="button" className="btn btn--primary btn--block" onClick={() => setMode('checkout')}>
                Checkout · {money(total)}
              </button>
              <Link to="/cart" onClick={onClose} className="btn btn--quiet btn--sm" style={{ justifySelf: 'center' }}>
                Open full cart page
              </Link>
            </div>
          )}
        </>
      )}

      {mode === 'checkout' && (
        <>
          <div className="drawer__body">
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Delivery address</legend>
              <div className="chips">
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
            </fieldset>

            <div className="field">
              <label className="field__label" htmlFor="dr-name">Full name</label>
              <input id="dr-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="dr-phone">Phone number</label>
              <input id="dr-phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" />
            </div>

            <fieldset style={{ border: 0, padding: 0, margin: 'var(--space-sm) 0 0' }}>
              <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Payment</legend>
              <div className="field">
                <label className="field__label" htmlFor="dr-card">Card number</label>
                <input
                  id="dr-card"
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
                  <label className="field__label" htmlFor="dr-exp">Expiry</label>
                  <input id="dr-exp" className="input" value={expiry} onChange={(e) => setExpiry(e.target.value.slice(0, 5))} inputMode="numeric" placeholder="09 / 29" autoComplete="cc-exp" />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="dr-cvc">CVC</label>
                  <input id="dr-cvc" className="input" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" placeholder="123" autoComplete="cc-csc" />
                </div>
              </div>
              <p className="field__help">Demo — no charge is made.</p>
            </fieldset>

            <div className="summary" style={{ padding: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
              <div className="summary__row">
                <span>
                  {cart.reduce((n, i) => n + i.qty, 0)} item
                  {cart.reduce((n, i) => n + i.qty, 0) === 1 ? '' : 's'} · {address?.label ?? 'no address'}
                </span>
                <span className="price">{money(total)}</span>
              </div>
            </div>
          </div>

          <div className="drawer__foot">
            {error && (
              <p className="field__help field__help--error" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              className="btn btn--primary btn--block"
              data-loading={placing || undefined}
              disabled={placing}
              onClick={placeDrawerOrder}
            >
              Place order · {money(total)}
            </button>
          </div>
        </>
      )}

      {mode === 'placed' && placedOrder && (
        <div className="drawer__placed">
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
          <p className="row__title" style={{ fontSize: 'var(--text-md)', textAlign: 'center' }}>
            #{placedOrder.id} confirmed
          </p>
          <p className="row__sub" style={{ textAlign: 'center' }}>
            {money(placedOrder.total)} · arriving in 2–4 days at {placedOrder.addressLine}
          </p>
          <div style={{ display: 'grid', gap: 'var(--space-2xs)', marginTop: 'var(--space-md)' }}>
            <Link to="/orders" onClick={onClose} className="btn btn--primary btn--block">
              View order
            </Link>
            <button type="button" className="btn btn--ghost btn--block" onClick={onClose}>
              Keep shopping
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}

/* ------------------------------------------------------------- footer (desktop) */

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <BrandMark />
          <p className="row__sub">
            Shop, book clinic visits, and keep vaccinations on schedule — for the ones who wait
            up for you.
          </p>
        </div>
        <nav aria-label="Shop categories">
          <h3 className="tag">Shop</h3>
          <ul>
            {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
              <li key={c.id}>
                <Link to="/shop" search={{ cat: c.id }}>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Care">
          <h3 className="tag">Care</h3>
          <ul>
            <li><Link to="/clinics">Find a clinic</Link></li>
            <li><Link to="/health">Vaccinations</Link></li>
            <li><Link to="/bookings">My bookings</Link></li>
          </ul>
        </nav>
        <nav aria-label="Account">
          <h3 className="tag">Account</h3>
          <ul>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/orders">Orders</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </nav>
      </div>
      <div className="site-footer__baseline">
        <span className="mono-label">PetSafeCare — demo shop &amp; clinic booking</span>
        <span className="mono-label">Free delivery over {money(FREE_DELIVERY_THRESHOLD)} · 30-day returns</span>
      </div>
    </footer>
  )
}

/* ---------------------------------------------------------------- tabbar (phone) */

export function Tabbar() {
  return (
    <nav className="tabbar" aria-label="Primary">
      <div className="tabbar__inner">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="tab"
            activeOptions={item.exact ? { exact: true } : undefined}
          >
            <item.icon size={20} strokeWidth={1.75} />
            <span className="tab__label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

/* ----------------------------------------------------------------- toasts */

export function ToastRegion() {
  const toasts = useToasts()
  if (toasts.length === 0) return null
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="toast__msg">{t.message}</span>
          {t.actionLabel && (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                t.onAction?.()
                dismissToast(t.id)
              }}
            >
              {t.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------- app frame */

export function AppFrame() {
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    hydrateFromStorage()
  }, [])

  return (
    <div className="app">
      <Topbar />
      <SiteHeader onOpenCart={() => setCartOpen(true)} />
      <main className="app__main">
        <Outlet />
      </main>
      <SiteFooter />
      <Tabbar />
      <ToastRegion />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
