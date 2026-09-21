import { useEffect } from 'react'
import { Link, Outlet } from '@tanstack/react-router'
import {
  HeartPulse,
  Home,
  PawPrint,
  ShoppingCart,
  Stethoscope,
  Store,
  UserRound,
} from 'lucide-react'

import { cartCount, dismissToast, hydrateFromStorage, useAppState, useToasts } from '../lib/store'

/* ---------------------------------------------------------------- topbar */

export function Topbar() {
  const { cart } = useAppState()
  const count = cartCount(cart)

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link to="/" className="brand" aria-label="PetSafeCare home">
          <span className="brand__mark" aria-hidden>
            <PawPrint size={15} strokeWidth={2} />
          </span>
          <span className="brand__name">
            Pet<span>Safe</span>Care
          </span>
        </Link>
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

/* ------------------------------------------------------------- side rail */

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

export function RailNav() {
  const { cart } = useAppState()
  const count = cartCount(cart)

  return (
    <nav className="rail-nav" aria-label="Primary">
      <BrandMark />
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="rail-nav__link"
          activeOptions={item.exact ? { exact: true } : undefined}
        >
          <item.icon size={18} strokeWidth={1.75} />
          {item.label}
        </Link>
      ))}
      <span className="rail-nav__spacer" />
      <Link to="/cart" className="rail-nav__cart">
        <ShoppingCart size={18} strokeWidth={1.75} />
        Cart
        <span key={count} className="rail-nav__badge">
          {count > 9 ? '9+' : count}
        </span>
      </Link>
    </nav>
  )
}

/* ---------------------------------------------------------------- tabbar */

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
  useEffect(() => {
    hydrateFromStorage()
  }, [])

  return (
    <div className="app">
      <Topbar />
      <RailNav />
      <main className="app__main">
        <Outlet />
      </main>
      <Tabbar />
      <ToastRegion />
    </div>
  )
}
