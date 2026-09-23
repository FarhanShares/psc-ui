import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, HeartPulse, PawPrint, Plus, RefreshCw, Siren, Stethoscope, Store, Syringe } from 'lucide-react'

import { AddPetSheet } from '../components/add-pet'
import { BookingCard } from '../components/cards'
import { ProductRail } from '../components/product-rail'
import { PetGlyph } from '../components/ui'
import { greeting, longDate, dateFromOffset } from '../lib/format'
import { seo } from '../lib/seo'
import { useAppState } from '../lib/store'

export const Route = createFileRoute('/')({
  head: () => seo({ title: 'PetSafeCare', path: '/' }),
  component: HomePage,
})

const QUICK = [
  { to: '/clinics', label: 'Book a vet', icon: Stethoscope },
  { to: '/shop', label: 'Shop', icon: Store },
  { to: '/health', label: 'Vaccines', icon: HeartPulse },
  { to: '/emergency', label: 'Emergency', icon: Siren },
] as const

const PICKS = ['p04', 'p11', 'p06', 'p09', 'p02', 'p12', 'p01', 'p08']

function HomePage() {
  const { profile, pets, vaccines, bookings, orders, lastSyncLabel } = useAppState()
  const [addPetOpen, setAddPetOpen] = useState(false)

  // records only count when their pet still exists
  const liveVaccines = vaccines.filter((v) => pets.some((p) => p.id === v.petId))

  const needsAttention = [...liveVaccines]
    .filter((v) => v.status === 'overdue' || v.status === 'due')
    .sort((a, b) => a.dueInDays - b.dueInDays)[0]
  const needsPet = pets.find((p) => p.id === needsAttention?.petId)
  const nextBooking = bookings
    .filter((b) => b.status === 'upcoming')
    .sort((a, b) => a.dayOffset - b.dayOffset)[0]
  const activeOrders = orders.filter((o) => o.status !== 'delivered').length
  const upcomingCount = bookings.filter((b) => b.status === 'upcoming').length

  return (
    <div className="page home-grid">
      <header className="rise span-hero">
        <p className="tag" style={{ color: 'var(--color-accent-deep)' }}>{greeting()}</p>
        <h1 className="home-title">Hi, {profile.name}</h1>
      </header>

      <nav className="quick-grid rise span-hero" style={{ '--i': 1 } as React.CSSProperties} aria-label="Quick actions">
        {QUICK.map((q) => (
          <Link key={q.to} to={q.to} className={`quick${q.to === '/emergency' ? ' quick--sos' : ''}`}>
            <span className="quick__icon" aria-hidden>
              <q.icon size={20} strokeWidth={1.75} />
            </span>
            {q.label}
          </Link>
        ))}
      </nav>

      {needsAttention && needsPet && (
        <section className="band rise span-8" style={{ '--i': 1 } as React.CSSProperties} aria-label="Vaccination due">
          <div className="band__row">
            <span className="band__icon">
              <Syringe size={18} strokeWidth={1.75} />
            </span>
            <div style={{ minWidth: 0 }}>
              <h2 className="band__title">
                {needsAttention.name}
                {needsAttention.status === 'overdue' ? ' is overdue' : ' is due soon'}
              </h2>
              <p className="band__meta">
                {needsPet.name} · {needsAttention.source}
              </p>
            </div>
          </div>
          <div className="split" style={{ marginTop: 'var(--space-sm)' }}>
            <span className="tag">
              {needsAttention.status === 'overdue'
                ? `${Math.abs(needsAttention.dueInDays)} days overdue`
                : `Due ${longDate(dateFromOffset(needsAttention.dueInDays)).toLowerCase()}`}
            </span>
            <Link
              to="/clinics"
              search={{ service: 'vaccination' }}
              className="btn btn--primary btn--sm"
            >
              Book vaccination
            </Link>
          </div>
        </section>
      )}

      <section className="stack rise span-4" style={{ '--i': 2, gap: 'var(--space-sm)' } as React.CSSProperties} aria-label="Today">
        {nextBooking ? (
          <>
            <div className="split" style={{ marginBottom: 'calc(-1 * var(--space-sm))', gap: 'var(--space-md)' }}>
              <span className="tag">Next appointment</span>
              <Link to="/bookings" className="section-head__link">
                All bookings <ChevronRight size={13} strokeWidth={2} />
              </Link>
            </div>
            <BookingCard booking={nextBooking} />
          </>
        ) : (
          <Link to="/clinics" className="card card--press card--pad">
            <span className="tag">No appointment booked</span>
            <h2 className="section-head__title" style={{ marginTop: 2 }}>
              Browse clinics and book a visit
            </h2>
          </Link>
        )}
      </section>

      {pets.length === 0 ? (
        <section className="card card--pad span-8 rise" style={{ '--i': 2 } as React.CSSProperties} aria-label="Add your first pet">
          <div className="split" style={{ flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', minWidth: 0 }}>
              <span className="band__icon" aria-hidden>
                <PawPrint size={18} strokeWidth={1.75} />
              </span>
              <div style={{ minWidth: 0 }}>
                <h2 className="section-head__title">Add your first pet</h2>
                <p className="row__sub">
                  Vaccination reminders, clinic bookings and the right food for the right
                  animal — it all starts here.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2xs)', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn--primary" onClick={() => setAddPetOpen(true)}>
                <Plus size={15} strokeWidth={2} /> Add a pet
              </button>
              <Link to="/shop" className="btn btn--ghost">Browse shop</Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="pet-strip rise span-7" style={{ '--i': 3 } as React.CSSProperties} aria-label="Your pets">
          {pets.slice(0, 2).map((pet) => (
            <Link key={pet.id} to="/pets/$id" params={{ id: pet.id }} className="card card--press pet-card">
              <span className={`pet-card__ava pet-card__ava--${pet.species}`}>
                <PetGlyph species={pet.species} size={17} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span className="pet-card__name">{pet.name}</span>
                <span className="row__sub" style={{ display: 'block' }}>
                  {pet.breed}
                </span>
              </span>
            </Link>
          ))}
          <Link to="/pets" className="card card--press pet-card pet-card--more" aria-label="Manage pets">
            <span className="pet-card__ava" aria-hidden>
              {pets.length > 2 ? <span className="pet-card__plus num">+{pets.length - 2}</span> : <PawPrint size={16} strokeWidth={1.75} />}
            </span>
            <span style={{ minWidth: 0 }}>
              <span className="pet-card__name">{pets.length > 2 ? 'More pets' : 'Manage pets'}</span>
              <span className="row__sub" style={{ display: 'block' }}>
                {pets.length > 2 ? `${pets.length} in total` : 'Add or edit'}
              </span>
            </span>
          </Link>
        </section>
      )}

      <section className="stack rise span-5" style={{ '--i': 4, gap: 'var(--space-sm)' } as React.CSSProperties} aria-label="Records">
        <Link to="/orders" className="card card--press row">
          <span className="row__grow">
            <span className="row__title">Orders</span>
            <span className="row__sub">
              {activeOrders > 0
                ? `${activeOrders} order${activeOrders === 1 ? '' : 's'} on the way`
                : 'Everything delivered'}
            </span>
          </span>
          <ChevronRight size={16} strokeWidth={1.75} className="muted" />
        </Link>
        <Link to="/bookings" className="card card--press row">
          <span className="row__grow">
            <span className="row__title">Service bookings</span>
            <span className="row__sub">
              {upcomingCount > 0
                ? `${upcomingCount} upcoming appointment${upcomingCount === 1 ? '' : 's'}`
                : 'No upcoming appointments'}
            </span>
          </span>
          <ChevronRight size={16} strokeWidth={1.75} className="muted" />
        </Link>
        <Link to="/health" className="card card--press card--pad">
          <div className="split">
            <span className="thead">
              <span className="sync-dot" aria-hidden />
              <span className="tag">Clinic sync</span>
            </span>
            <RefreshCw size={14} strokeWidth={1.75} className="muted" />
          </div>
          <p className="row__title" style={{ marginTop: 'var(--space-2xs)' }}>
            Green Valley Veterinary
          </p>
          <p className="row__sub">
            Records last synced {lastSyncLabel} · {liveVaccines.length} vaccination records
          </p>
        </Link>
      </section>

      <section className="rise span-hero" style={{ '--i': 5 } as React.CSSProperties}>
        <div className="section-head">
          <h2 className="section-head__title">Shop picks</h2>
          <Link to="/shop" className="section-head__link">
            All supplies <ChevronRight size={13} strokeWidth={2} />
          </Link>
        </div>
        <ProductRail ids={PICKS} />
      </section>

      <AddPetSheet open={addPetOpen} onClose={() => setAddPetOpen(false)} />
    </div>
  )
}
