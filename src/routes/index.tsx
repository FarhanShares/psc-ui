import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, RefreshCw, Syringe } from 'lucide-react'

import { BookingCard, ProductCard } from '../components/cards'
import { PetGlyph } from '../components/ui'
import { greeting, longDate, dateFromOffset } from '../lib/format'
import { useAppState } from '../lib/store'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const { profile, pets, vaccines, bookings, orders, lastSyncLabel } = useAppState()

  const needsAttention = [...vaccines]
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

      <section className="pet-strip rise span-7" style={{ '--i': 3 } as React.CSSProperties} aria-label="Your pets">
        {pets.map((pet) => (
          <Link key={pet.id} to="/health" className="card card--press pet-card">
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
      </section>

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
            Records last synced {lastSyncLabel} · {vaccines.length} vaccination records
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
        <div className="rail">
          {['p04', 'p11', 'p06', 'p09', 'p02'].map((id) => (
            <ProductCard key={id} id={id} />
          ))}
        </div>
      </section>
    </div>
  )
}
