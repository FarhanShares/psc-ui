import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { BadgeCheck, Check, ChevronDown, ChevronRight, Clock, MapPin, Syringe, Truck } from 'lucide-react'

import { money, relativeDue, shortDate, dateFromOffset } from '../lib/format'
import { getProduct, getService, getClinic } from '../lib/data'
import { addToCart, useAppState } from '../lib/store'
import type { Booking, Order, VaccineRecord } from '../lib/types'
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
        <Link to="/clinics/$id" params={{ id: clinic.id }} className="btn btn--primary btn--sm">
          Book
        </Link>
      </div>
    </article>
  )
}

/* -------------------------------------------------------------- order card */

export function OrderCard({ order }: { order: Order }) {
  return (
    <details className="card">
      <summary className="row order-summary" style={{ cursor: 'pointer', listStyle: 'none' }}>
        <span className="row__grow" style={{ minWidth: 0 }}>
          <span className="split" style={{ marginBottom: 2 }}>
            <span className="mono-label">#{order.id}</span>
            <OrderStatusLabel status={order.status} />
          </span>
          <span className="row__sub num">
            {shortDate(dateFromOffset(-order.placedAtDaysAgo))} · {order.items.reduce((n, i) => n + i.qty, 0)}{' '}
            item{order.items.reduce((n, i) => n + i.qty, 0) === 1 ? '' : 's'}
          </span>
        </span>
        <span className="order-summary__side">
          <ChevronDown size={14} strokeWidth={1.75} className="order-chev" aria-hidden />
          <span className="price price--lg">{money(order.total)}</span>
        </span>
      </summary>
      <div style={{ padding: '0 var(--space-sm) var(--space-sm)' }}>
        <hr className="hr" style={{ marginBottom: 'var(--space-2xs)' }} />
        {order.items.map((item) => {
          const p = getProduct(item.productId)
          if (!p) return null
          return (
            <div key={item.productId} className="row" style={{ padding: 'var(--space-2xs) 0', gap: 'var(--space-xs)' }}>
              <span className={`tile ${tileClass(p.category)}`} style={{ width: '2rem', height: '2rem' }}>
                <CategoryIcon category={p.category} size={15} />
              </span>
              <span className="row__grow" style={{ minWidth: 0 }}>
                <span className="row__title" style={{ fontSize: 'var(--text-sm)' }}>{p.name}</span>
              </span>
              <span className="row__sub num">×{item.qty}</span>
              <span className="price">{money(item.priceAtPurchase * item.qty)}</span>
            </div>
          )
        })}
        {order.delivery > 0 && (
          <p className="row__sub" style={{ textAlign: 'right' }}>
            incl. {money(order.delivery)} delivery
          </p>
        )}
        <p className="row__sub num" style={{ paddingTop: 'var(--space-2xs)' }}>
          Deliver to {order.addressLine}
        </p>
        {order.status !== 'delivered' && (
          <p className="row__sub" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'var(--space-2xs)' }}>
            <Truck size={14} strokeWidth={1.75} />
            {order.status === 'transit'
              ? 'Courier expects delivery tomorrow before 8 pm.'
              : 'Packing now — we email when it ships.'}
          </p>
        )}
      </div>
    </details>
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
    <article className="card card--pad">
      <div className="split" style={{ marginBottom: 'var(--space-2xs)' }}>
        <span className="tile" style={{ width: '2.25rem', height: '2.25rem' }}>
          <ServiceIcon type={service.type} size={16} />
        </span>
        <span className="row__grow" style={{ minWidth: 0, marginInline: 'var(--space-xs) 0' }}>
          <h3 className="row__title">{service.name}</h3>
          <span className="row__sub">
            {clinic.name} · {pet?.name}
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
    </article>
  )
}

/* ------------------------------------------------------------- vaccine row */

export function VaccineRow({ vax }: { vax: VaccineRecord }) {
  const petName = useAppState().pets.find((p) => p.id === vax.petId)?.name
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
      <Pill tone={tone}>{label}</Pill>
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
