import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, CircleAlert, Clock, HeartPulse, PawPrint, Plus, RefreshCw, Siren, Stethoscope, Store, Syringe } from 'lucide-react'

import { AddPetSheet } from '../components/add-pet'
import { Landing } from '../components/landing'
import { BookingCard, ReorderCard, runningLow } from '../components/cards'
import { ProductRail } from '../components/product-rail'
import { PetGlyph } from '../components/ui'
import { greeting, longDate, dateFromOffset } from '../lib/format'
import { seo } from '../lib/seo'
import { markVaccineGiven, useAppState } from '../lib/store'

export const Route = createFileRoute('/')({
  head: () => seo({ title: 'PetSafeCare', path: '/' }),
  component: Home,
})

/** members get their dashboard; visitors (and the server render) get the landing */
function Home() {
  const { signedIn, recentlyViewed } = useAppState()
  return signedIn ? <HomePage /> : <Landing recentlyViewed={recentlyViewed} />
}

const QUICK = [
  { to: '/clinics', label: 'Book a vet', icon: Stethoscope },
  { to: '/shop', label: 'Shop', icon: Store },
  { to: '/health', label: 'Vaccines', icon: HeartPulse },
  { to: '/emergency', label: 'Emergency', icon: Siren },
] as const

const PICKS = ['p04', 'p14', 'p11', 'p15', 'p06', 'p09', 'p02', 'p12', 'p01', 'p16']

function HomePage() {
  const { profile, pets, vaccines, bookings, orders, lastSyncLabel, clinicLinked, recentlyViewed } = useAppState()
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
  // three is a nudge; the rest are one tap away in All orders
  const lowOn = runningLow(orders, 3)

  return (
    <div className="page home-grid">
      <header className="rise span-hero">
        <p className="tag" style={{ color: 'var(--color-accent-deep)' }}>{greeting()}</p>
        <h1 className="home-title">Hi, {profile.name.split(' ')[0] || 'there'}</h1>
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
                {needsPet.name}’s {needsAttention.name}
              </h2>
              <p className="band__meta">
                {needsAttention.shieldsAgainst} · {needsAttention.source}
              </p>
            </div>
          </div>
          <div className="urgent__foot">
            <span className={`urgent__pill urgent__pill--${needsAttention.status === 'overdue' ? 'bad' : 'warn'}`}>
              {needsAttention.status === 'overdue' ? (
                <CircleAlert size={13} strokeWidth={2} aria-hidden />
              ) : (
                <Clock size={13} strokeWidth={2} aria-hidden />
              )}
              {needsAttention.status === 'overdue'
                ? `${Math.abs(needsAttention.dueInDays)} days overdue`
                : needsAttention.dueInDays === 0
                  ? 'Due today'
                  : `Due ${longDate(dateFromOffset(needsAttention.dueInDays))}`}
            </span>
            <div className="urgent__actions">
              <button
                type="button"
                className="btn btn--ghost-dark btn--sm"
                onClick={() => markVaccineGiven(needsAttention.id)}
                aria-label={`${needsAttention.name} already given to ${needsPet.name}`}
              >
                Already done
              </button>
              <Link to="/clinics" search={{ service: 'vaccination' }} className="btn btn--primary btn--sm">
                Book vaccination
              </Link>
            </div>
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
        <section className="card card--pad span-hero rise" style={{ '--i': 2 } as React.CSSProperties} aria-label="Add your first pet">
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
        <section className="pet-strip rise span-hero" style={{ '--i': 3 } as React.CSSProperties} aria-label="Your pets">
          {pets.slice(0, 2).map((pet) => {
            const recs = liveVaccines.filter((v) => v.petId === pet.id)
            const overdue = recs.filter((v) => v.status === 'overdue')
            const due = recs.filter((v) => v.status === 'due')
            const tone = overdue.length ? 'bad' : due.length ? 'warn' : 'ok'
            const status = overdue.length
              ? `${overdue[0].name} overdue`
              : due.length
                ? `${due.length} due soon`
                : recs.length
                  ? 'Vaccines current'
                  : 'No records yet'
            return (
              <Link key={pet.id} to="/pets/$id" params={{ id: pet.id }} className="card card--press pet-card">
                <span className={`pet-card__ava pet-card__ava--${pet.species}`}>
                  <PetGlyph species={pet.species} size={17} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span className="pet-card__name">{pet.name}</span>
                  <span className="row__sub pet-card__breed">{pet.breed}</span>
                  <span className={`pet-card__status pet-card__status--${tone}`}>{status}</span>
                </span>
              </Link>
            )
          })}
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

      <section className="records-row rise span-hero" style={{ '--i': 4 } as React.CSSProperties} aria-label="Records">
        <Link to="/orders" className="card card--press row">
          <span className="row__grow">
            <span className="row__title">Orders</span>
            <span className="row__sub">
              {activeOrders > 0
                ? `${activeOrders} order${activeOrders === 1 ? '' : 's'} on the way`
                : orders.length > 0
                  ? 'Everything delivered'
                  : 'No orders yet'}
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
        {clinicLinked ? (
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
        ) : (
          <Link to="/health" className="card card--press card--pad">
            <span className="tag">Health records</span>
            <p className="row__title" style={{ marginTop: 'var(--space-2xs)' }}>
              {liveVaccines.length > 0 ? `${liveVaccines.length} vaccination records` : 'Add vaccination records'}
            </p>
            <p className="row__sub">No clinic linked yet — records sync after your first booked visit</p>
          </Link>
        )}
      </section>

      {lowOn.length > 0 && (
        <section className="rise span-hero" style={{ '--i': 5 } as React.CSSProperties} aria-labelledby="low-h">
          <div className="section-head">
            <h2 id="low-h" className="section-head__title">Running low?</h2>
            <Link to="/orders" className="section-head__link">
              All orders <ChevronRight size={13} strokeWidth={2} />
            </Link>
          </div>
          <div className="reorder-grid">
            {lowOn.map((pick) => (
              <ReorderCard key={`${pick.productId}-${pick.variantId ?? ''}`} pick={pick} />
            ))}
          </div>
        </section>
      )}

      <section className="rise span-hero" style={{ '--i': 5 } as React.CSSProperties}>
        <div className="section-head">
          <h2 className="section-head__title">Shop picks</h2>
          <Link to="/shop" className="section-head__link">
            All supplies <ChevronRight size={13} strokeWidth={2} />
          </Link>
        </div>
        <ProductRail ids={PICKS} />
      </section>

      {recentlyViewed.length > 1 && (
        <section className="rise span-hero" style={{ '--i': 6 } as React.CSSProperties}>
          <div className="section-head">
            <h2 className="section-head__title">Recently viewed</h2>
          </div>
          <ProductRail ids={recentlyViewed} label="Recently viewed" />
        </section>
      )}

      <AddPetSheet open={addPetOpen} onClose={() => setAddPetOpen(false)} />
    </div>
  )
}
