import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  Heart,
  Info,
  LifeBuoy,
  LogIn,
  LogOut,
  Package,
  PawPrint,
  Pencil,
  Plus,
  Settings,
  Shield,
  Trash2,
  Truck,
  Undo2,
} from 'lucide-react'

import { AddPetSheet } from '../components/add-pet'
import { MenuRow } from '../components/blocks'
import { PetGlyph, Sheet } from '../components/ui'
import { plural } from '../lib/format'
import { seo } from '../lib/seo'
import {
  pushToast,
  removeAddress,
  saveAddress,
  signOut,
  updateProfile,
  useAppState,
  useUnreadCount,
} from '../lib/store'
import type { Address } from '../lib/types'
import { formatWeight } from '../lib/species'

export const Route = createFileRoute('/profile')({
  head: () => seo({ title: 'Profile', path: '/profile', noindex: true }),
  component: ProfilePage,
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ProfilePage() {
  const { profile, pets, orders, bookings, savedProducts, savedClinics, signedIn, cards } = useAppState()
  const unread = useUnreadCount()
  const navigate = useNavigate()

  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft] = useState({ name: profile.name, phone: profile.phone, email: profile.email })
  const [saved, setSaved] = useState(false)

  const [addPetOpen, setAddPetOpen] = useState(false)
  const [addr, setAddr] = useState<Address | null>(null)
  const [signOutOpen, setSignOutOpen] = useState(false)

  const emailOk = EMAIL_RE.test(draft.email.trim())

  function saveDetails() {
    if (!emailOk) return
    updateProfile({ name: draft.name.trim() || profile.name, phone: draft.phone.trim(), email: draft.email.trim() })
    setSaved(true)
    window.setTimeout(() => {
      setSaved(false)
      setEditOpen(false)
    }, 700)
  }

  if (!signedIn) {
    return (
      <div className="page">
        <header className="rise">
          <p className="tag">Profile</p>
          <h1 className="page-title">You’re signed out</h1>
        </header>
        <section className="card card--pad stack rise" style={{ '--i': 1 } as React.CSSProperties}>
          <p className="row__sub" style={{ fontSize: 'var(--text-body)' }}>
            Sign in to see your pets, orders, bookings and reminders.
          </p>
          <div className="btn-pair">
            <Link to="/login" search={{ redirect: '/profile' }} className="btn btn--primary">
              <LogIn size={15} strokeWidth={2} /> Sign in
            </Link>
            <Link to="/signup" className="btn btn--ghost">Create account</Link>
          </div>
        </section>
        <div className="menu rise" style={{ '--i': 2 } as React.CSSProperties}>
          <MenuRow to="/help" icon={<LifeBuoy size={16} strokeWidth={1.75} />} title="Help centre" />
          <MenuRow to="/about" icon={<Info size={16} strokeWidth={1.75} />} title="About PetSafeCare" />
        </div>
      </div>
    )
  }

  const activeOrders = orders.filter((o) => o.status !== 'delivered').length
  const upcoming = bookings.filter((b) => b.status === 'upcoming').length

  return (
    <div className="page">
      <section className="profile-head rise" style={{ '--i': 0 } as React.CSSProperties}>
        <span className="profile-head__ava" aria-hidden>
          {profile.name.charAt(0).toUpperCase()}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 className="page-title" style={{ fontSize: 'var(--text-xl)' }}>{profile.name}</h1>
          <p className="row__sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.email}</p>
          <p className="row__sub num">{profile.phone}</p>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={() => {
            setDraft({ name: profile.name, phone: profile.phone, email: profile.email })
            setEditOpen(true)
          }}
          aria-label="Edit profile"
        >
          <Pencil size={16} strokeWidth={1.75} />
        </button>
      </section>

      <div className="form-grid rise" style={{ '--i': 1 } as React.CSSProperties}>
        <div className="stack" style={{ gap: 'var(--space-lg)' }}>
          <section>
            <div className="section-head">
              <h2 className="section-head__title">Pets</h2>
              <button type="button" className="link-btn" onClick={() => setAddPetOpen(true)}>
                <Plus size={14} strokeWidth={2} /> Add pet
              </button>
            </div>
            {pets.length === 0 ? (
              <button type="button" className="card card--press row add-tile" onClick={() => setAddPetOpen(true)}>
                <span className="menu-row__icon"><PawPrint size={16} strokeWidth={1.75} /></span>
                <span className="row__grow">
                  <span className="row__title">Add your first pet</span>
                  <span className="row__sub">Unlocks reminders and faster booking</span>
                </span>
              </button>
            ) : (
              <div className="grid-list">
                {pets.map((pet) => (
                  <Link key={pet.id} to="/pets/$id" params={{ id: pet.id }} className="card card--press row">
                    <span className={`pet-card__ava pet-card__ava--${pet.species}`}>
                      <PetGlyph species={pet.species} size={17} />
                    </span>
                    <span className="row__grow">
                      <span className="row__title">{pet.name}</span>
                      <span className="row__sub">
                        {pet.breed} · {plural(pet.ageYears, 'yr')} · {formatWeight(pet.weightKg)}
                      </span>
                    </span>
                    <ChevronRight size={16} strokeWidth={1.75} className="muted" aria-hidden />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="section-head__title section-head">Activity</h2>
            <div className="menu">
              <MenuRow
                to="/orders"
                icon={<Package size={16} strokeWidth={1.75} />}
                title="Orders"
                sub={activeOrders > 0 ? `${activeOrders} on the way` : plural(orders.length, 'order')}
              />
              <MenuRow
                to="/bookings"
                icon={<CalendarDays size={16} strokeWidth={1.75} />}
                title="Bookings"
                sub={upcoming > 0 ? `${upcoming} upcoming` : 'Nothing booked'}
              />
              <MenuRow
                to="/saved"
                icon={<Heart size={16} strokeWidth={1.75} />}
                title="Saved"
                sub={plural(savedProducts.length + savedClinics.length, 'item')}
              />
              <MenuRow to="/notifications" icon={<Bell size={16} strokeWidth={1.75} />} title="Notifications" badge={unread} />
              <MenuRow
                to="/settings"
                icon={<Settings size={16} strokeWidth={1.75} />}
                title="Account settings"
                sub={`Password, ${cards.length ? plural(cards.length, 'saved card') : 'payment methods'}, your data`}
              />
            </div>
          </section>
        </div>

        <div className="stack" style={{ gap: 'var(--space-lg)' }}>
          <section>
            <div className="section-head">
              <h2 className="section-head__title">Addresses</h2>
              <button type="button" className="link-btn" onClick={() => setAddr({ id: '', label: '', line: '', isDefault: false })}>
                <Plus size={14} strokeWidth={2} /> Add
              </button>
            </div>
            <div className="grid-list">
              {profile.addresses.map((a) => (
                <button key={a.id} type="button" className="card card--press row" style={{ textAlign: 'left', width: '100%' }} onClick={() => setAddr(a)}>
                  <span className="row__grow">
                    <span className="row__title">{a.label}</span>
                    <span className="row__sub">{a.line}</span>
                  </span>
                  {a.isDefault && <span className="pill pill--info">Default</span>}
                  <Pencil size={14} strokeWidth={1.75} className="muted" aria-hidden />
                </button>
              ))}
            </div>
          </section>

          <section id="notifications" className="card card--pad" style={{ scrollMarginTop: '5rem' }}>
            <h2 className="section-head__title" style={{ marginBottom: 'var(--space-2xs)' }}>Reminders & alerts</h2>
            {(
              [
                ['notifyVaccines', 'Vaccine reminders', 'A nudge two weeks before a due date'],
                ['notifyOrders', 'Order updates', 'Dispatch and delivery pings'],
                ['notifyOffers', 'Shop offers', 'Occasional discounts, nothing more'],
              ] as const
            ).map(([key, title, sub]) => (
              <div key={key} className="switch-row">
                <span className="switch-row__text">
                  <span className="row__title" style={{ fontSize: 'var(--text-body)' }}>{title}</span>
                  <span className="row__sub">{sub}</span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  className="switch"
                  checked={profile[key]}
                  onChange={(e) => updateProfile({ [key]: e.target.checked })}
                  aria-label={title}
                />
              </div>
            ))}
          </section>

          <section>
            <h2 className="section-head__title section-head">Support</h2>
            <div className="menu">
              <MenuRow to="/help" icon={<LifeBuoy size={16} strokeWidth={1.75} />} title="Help centre" sub="FAQs and contact" />
              <MenuRow to="/guides" icon={<BookOpen size={16} strokeWidth={1.75} />} title="Care guides" sub="Vaccines, food, fleas and more" />
              <MenuRow to="/about" icon={<Info size={16} strokeWidth={1.75} />} title="About PetSafeCare" />
            </div>
          </section>

          <section>
            <h2 className="section-head__title section-head">Policies</h2>
            <div className="menu">
              <MenuRow to="/delivery" icon={<Truck size={16} strokeWidth={1.75} />} title="Delivery policy" sub="Timing, costs, missed parcels" />
              <MenuRow to="/refund" icon={<Undo2 size={16} strokeWidth={1.75} />} title="Refund policy" sub="30-day returns and refunds" />
              <MenuRow to="/privacy" icon={<Shield size={16} strokeWidth={1.75} />} title="Privacy policy" />
              <MenuRow to="/terms" icon={<FileText size={16} strokeWidth={1.75} />} title="Terms of service" />
            </div>
          </section>

          <button type="button" className="btn btn--ghost btn--danger" onClick={() => setSignOutOpen(true)}>
            <LogOut size={15} strokeWidth={1.75} /> Sign out
          </button>
          <p className="mono-label" style={{ textAlign: 'center' }}>PetSafeCare · v1.4.0</p>
        </div>
      </div>

      {/* edit profile */}
      <Sheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        footer={
          <button type="button" className="btn btn--primary btn--block" disabled={!emailOk} onClick={saveDetails}>
            {saved ? (
              <>
                <Check size={15} strokeWidth={2.25} /> Saved
              </>
            ) : (
              'Save changes'
            )}
          </button>
        }
      >
        <div className="stack">
          <div className="field">
            <label className="field__label" htmlFor="pf-name">Full name</label>
            <input id="pf-name" className="input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} autoComplete="name" />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="pf-phone">Phone number</label>
            <input id="pf-phone" className="input" value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} inputMode="tel" autoComplete="tel" />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="pf-email">Email address</label>
            <input
              id="pf-email"
              className="input"
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              inputMode="email"
              autoComplete="email"
              aria-invalid={!emailOk || undefined}
              aria-describedby="pf-email-help"
            />
            <p id="pf-email-help" className={`field__help${emailOk ? '' : ' field__help--error'}`}>
              {emailOk ? 'Receipts and reminders go here.' : 'That email doesn’t look complete.'}
            </p>
          </div>
        </div>
      </Sheet>

      <AddPetSheet open={addPetOpen} onClose={() => setAddPetOpen(false)} />

      {/* add / edit address */}
      <Sheet
        open={addr !== null}
        onClose={() => setAddr(null)}
        title={addr?.id ? `Edit ${addr.label}` : 'Add an address'}
        footer={
          addr && (
            <div className="stack" style={{ gap: 'var(--space-2xs)' }}>
              <button
                type="button"
                className="btn btn--primary btn--block"
                disabled={!addr.label.trim() || !addr.line.trim()}
                onClick={() => {
                  const next = { ...addr, id: addr.id || `ad-${Date.now().toString(36)}`, label: addr.label.trim(), line: addr.line.trim() }
                  if (next.isDefault) {
                    profile.addresses.filter((a) => a.id !== next.id && a.isDefault).forEach((a) => saveAddress({ ...a, isDefault: false }))
                  }
                  saveAddress(next)
                  setAddr(null)
                }}
              >
                Save address
              </button>
              {addr.id && !addr.isDefault && profile.addresses.find((a) => a.id === addr.id)?.isDefault === false && (
                <button
                  type="button"
                  className="btn btn--quiet btn--danger"
                  onClick={() => {
                    removeAddress(addr.id)
                    setAddr(null)
                    pushToast(`${addr.label} address removed`)
                  }}
                >
                  <Trash2 size={14} strokeWidth={1.75} /> Remove address
                </button>
              )}
            </div>
          )
        }
      >
        {addr && (
          <div className="stack">
            <div className="field">
              <label className="field__label" htmlFor="ad-label">Label</label>
              <input id="ad-label" className="input" value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} placeholder="Home, work, mum’s place" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ad-line">Street address</label>
              <input id="ad-line" className="input" value={addr.line} onChange={(e) => setAddr({ ...addr, line: e.target.value })} placeholder="14 Alder Lane, Apt 3" autoComplete="street-address" />
            </div>
            <label className="check-row">
              <input type="checkbox" className="check" checked={addr.isDefault} onChange={(e) => setAddr({ ...addr, isDefault: e.target.checked })} />
              <span>Use as my default delivery address</span>
            </label>
          </div>
        )}
      </Sheet>

      <Sheet
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        title="Sign out?"
        footer={
          <div className="btn-pair">
            <button type="button" className="btn btn--ghost" onClick={() => setSignOutOpen(false)}>
              Stay signed in
            </button>
            <button
              type="button"
              className="btn btn--danger-fill"
              onClick={() => {
                setSignOutOpen(false)
                signOut()
                navigate({ to: '/login' })
              }}
            >
              Sign out
            </button>
          </div>
        }
      >
        <p className="row__sub" style={{ fontSize: 'var(--text-body)' }}>
          Your pets, orders and bookings stay safe on your account. Anything in your cart will be cleared.
        </p>
      </Sheet>
    </div>
  )
}
