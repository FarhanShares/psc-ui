import { Link } from '@tanstack/react-router'
import { BadgeCheck, Check, ChevronRight, Clock, MapPin, Syringe, Truck } from 'lucide-react'

import { money, relativeDue, shortDate, dateFromOffset } from '../lib/format'
import { getProduct, getService, getClinic } from '../lib/data'
import { addToCart, useAppState } from '../lib/store'
import type { Booking, Order, VaccineRecord } from '../lib/types'
import { SaveButton } from './blocks'
import { CategoryIcon, OrderStatusLabel, PetGlyph, Pill, Price, ServiceIcon, Stars, tileClass, useCopiedLabel } from './ui'

/* ------------------------------------------------------------ product card */

export function ProductCard({ id, i = 0 }: { id: string; i?: number }) {
  const product = getProduct(id)
  const [added, markAdded] = useCopiedLabel(1400)
  if (!product) return null

  return (
    <article
      className="card card--press product-card rise"
      style={{ '--i': i } as React.CSSProperties}
    >
      <Link
        to="/shop/$id"
        params={{ id: product.id }}
        className="product-card__link"
        aria-label={`${product.name}, ${money(product.price)}`}
      >
        <span className={`tile tile--card ${tileClass(product.category)}`}>
          <CategoryIcon category={product.category} size={34} />
          {product.stock === 0 && <span className="product-card__flag">Out of stock</span>}
        </span>
        <span className="product-card__body">
          <span className="tag">{product.brand}</span>
          <span className="product-card__name">{product.name}</span>
          <span className="row__sub num" style={{ marginTop: 'calc(-1 * var(--space-3xs))' }}>
            {product.unit}
          </span>
          <span className="product-card__foot">
            <Price value={product.price} />
            <Stars rating={product.rating} />
          </span>
        </span>
      </Link>
      <SaveButton kind="product" id={product.id} name={product.name} variant="overlay" />
      <button
        type="button"
        className="btn btn--ghost btn--sm product-card__add"
        onClick={() => {
          if (product.stock === 0) return
          addToCart(product.id)
          markAdded()
        }}
        disabled={product.stock === 0}
        aria-label={`Add ${product.name} to cart`}
      >
        {added ? (
          <>
            <Check size={14} strokeWidth={2.25} /> Added
          </>
        ) : (
          'Add'
        )}
      </button>
    </article>
  )
}

/* ------------------------------------------------------------- clinic card */

export function ClinicCard({ id }: { id: string }) {
  const clinic = getClinic(id)
  if (!clinic) return null
  const initials = clinic.name
    .split(' ')
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

  return (
    <article className="card clinic-card">
      <div className="clinic-card__top">
        <Link
          to="/clinics/$id"
          params={{ id: clinic.id }}
          className="clinic-card__link"
          aria-label={`View ${clinic.name} details`}
        >
          <span className="clinic-card__mono" aria-hidden>
            {initials}
          </span>
          <span style={{ minWidth: 0 }}>
            <h3 className="clinic-card__name">{clinic.name}</h3>
            <span className="clinic-card__meta">
              <MapPin size={13} strokeWidth={1.75} />
              {clinic.area} · {clinic.distanceKm.toFixed(1)} km
            </span>
          </span>
        </Link>
        <Stars rating={clinic.rating} />
        <ChevronRight size={16} strokeWidth={1.75} className="muted" aria-hidden />
      </div>

      <span className="clinic-card__meta">
        <Clock size={13} strokeWidth={1.75} />
        {clinic.hours}
        {clinic.verified && (
          <span className="verified">
            <BadgeCheck size={13} strokeWidth={1.75} /> Verified
          </span>
        )}
      </span>

      <div className="clinic-card__foot">
        <span className="mono-label">
          {clinic.services.length} services · from {money(Math.min(...clinic.services.map((s) => s.price)))}
        </span>
        <span style={{ display: 'inline-flex', gap: 'var(--space-2xs)', alignItems: 'center' }}>
          <SaveButton kind="clinic" id={clinic.id} name={clinic.name} />
          <Link to="/clinics/$id" params={{ id: clinic.id }} className="btn btn--primary btn--sm">
            Book
          </Link>
        </span>
      </div>
    </article>
  )
}

/* -------------------------------------------------------------- order card */

export function OrderCard({ order }: { order: Order }) {
  const count = order.items.reduce((n, i) => n + i.qty, 0)
  return (
    <Link to="/orders/$id" params={{ id: order.id }} className="card card--press card--pad order-card">
      <span className="split">
        <span className="mono-label">#{order.id}</span>
        <OrderStatusLabel status={order.status} />
      </span>
      <span className="order-card__tiles" aria-hidden>
        {order.items.slice(0, 4).map((item) => {
          const p = getProduct(item.productId)
          if (!p) return null
          return (
            <span key={item.productId} className={`tile ${tileClass(p.category)}`}>
              <CategoryIcon category={p.category} size={16} />
            </span>
          )
        })}
        {order.items.length > 4 && <span className="tile num">+{order.items.length - 4}</span>}
      </span>
      <span className="split">
        <span className="row__sub num">
          {shortDate(dateFromOffset(-order.placedAtDaysAgo))} · {count} item{count === 1 ? '' : 's'}
        </span>
        <span className="price price--lg">{money(order.total)}</span>
      </span>
      {order.status !== 'delivered' && (
        <span className="row__sub icon-line" style={{ marginTop: 'var(--space-2xs)' }}>
          <Truck size={14} strokeWidth={1.75} aria-hidden />
          {order.status === 'transit' ? 'Arriving tomorrow before 8 pm' : 'Packing now'}
        </span>
      )}
    </Link>
  )
}

/* ------------------------------------------------------------ booking card */

export function BookingCard({ booking }: { booking: Booking }) {
  const { pets } = useAppState()
  const clinic = getClinic(booking.clinicId)
  const service = getService(booking.clinicId, booking.serviceId)
  const pet = pets.find((p) => p.id === booking.petId)
  if (!clinic || !service) return null

  return (
    <Link to="/bookings/$id" params={{ id: booking.id }} className="card card--pad card--press booking-card">
      <div className="split" style={{ marginBottom: 'var(--space-2xs)' }}>
        <span className="tile" style={{ width: '2.25rem', height: '2.25rem' }}>
          <ServiceIcon type={service.type} size={16} />
        </span>
        <span className="row__grow" style={{ minWidth: 0, marginInline: 'var(--space-xs) 0' }}>
          <span className="row__title">{service.name}</span>
          <span className="row__sub">
            {clinic.name}
            {pet ? ` · ${pet.name}` : ''}
          </span>
        </span>
        <span className="price price--lg">{money(service.price)}</span>
      </div>
      <div className="split">
        <span className="mono-label">
          {shortDate(dateFromOffset(booking.dayOffset))} · {booking.time} · #{booking.id}
        </span>
        {booking.status === 'upcoming' && <Pill tone="info">→ Upcoming</Pill>}
        {booking.status === 'completed' && <Pill tone="ok">Completed</Pill>}
        {booking.status === 'cancelled' && <Pill tone="bad">Cancelled</Pill>}
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------- vaccine row */

export function VaccineRow({
  vax,
  showPet = true,
  action,
}: {
  vax: VaccineRecord
  showPet?: boolean
  /** optional inline action (e.g. Book) shown under the status pill */
  action?: React.ReactNode
}) {
  const found = useAppState().pets.find((p) => p.id === vax.petId)?.name
  const petName = showPet ? found : undefined
  const tone =
    vax.status === 'overdue' ? 'bad' : vax.status === 'due' ? 'warn' : vax.status === 'scheduled' ? 'info' : 'ok'
  const label =
    vax.status === 'overdue'
      ? 'Overdue'
      : vax.status === 'due'
        ? 'Due soon'
        : vax.status === 'scheduled'
          ? `Booked ${vax.scheduledFor ?? ''}`
          : 'Up to date'

  return (
    <div className={`vax-row vax-row--${vax.status}`}>
      <span className="vax-row__icon">
        <Syringe size={15} strokeWidth={1.75} />
      </span>
      <span className="row__grow" style={{ minWidth: 0 }}>
        <span className="row__title">
          {vax.name}
          {petName ? <span className="row__sub"> · {petName}</span> : null}
        </span>
        <span className="row__sub">
          {vax.shieldsAgainst} · {relativeDue(vax.dueInDays)}
        </span>
      </span>
      <span className="vax-row__end">
        <Pill tone={tone}>{label}</Pill>
        {action}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ misc */

export function PetPill({ petId }: { petId: string }) {
  const pet = useAppState().pets.find((p) => p.id === petId)
  if (!pet) return null
  return (
    <span className="chip chip--static">
      <PetGlyph species={pet.species} size={14} />
      {pet.name}
    </span>
  )
}
