import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { BadgeCheck, CalendarCheck, Check, ChevronRight, CircleAlert, Clock, MapPin, Syringe, Truck } from 'lucide-react'

import { money, relativeDue, shortDate, dateFromOffset } from '../lib/format'
import { getProduct, getService, getClinic } from '../lib/data'
import { addToCart, markVaccineGiven, useAppState } from '../lib/store'
import type { Booking, Order, VaccineRecord } from '../lib/types'
import { SaveButton } from './blocks'
import { QuickAddSheet } from './variant-picker'
import { CardMedia } from './product-media'
import { defaultVariant, hasOptions, optionSummary, priceRange, variantLabel, variantsOf } from '../lib/catalog'
import { CategoryIcon, OrderStatusLabel, PetGlyph, Pill, Price, ServiceIcon, Stars, tileClass, useCopiedLabel } from './ui'

/* ------------------------------------------------------------ product card */

export function ProductCard({ id, i = 0, variantId }: { id: string; i?: number; /** a matched option (e.g. from search) to show and link to */ variantId?: string }) {
  const product = getProduct(id)
  const [added, markAdded] = useCopiedLabel(1400)
  const [chooseOpen, setChooseOpen] = useState(false)
  if (!product) return null

  const options = hasOptions(product)
  const { min, max } = priceRange(product)
  const def = defaultVariant(product)
  const matched = variantId ? variantsOf(product).find((v) => v.id === variantId) : undefined
  const onSale = variantsOf(product).some((v) => v.compareAt && v.compareAt > v.price)

  return (
    <article
      className="card card--press product-card rise"
      style={{ '--i': i } as React.CSSProperties}
    >
      <Link
        to="/shop/$id"
        params={{ id: product.id }}
        search={matched ? { v: matched.id } : {}}
        className="product-card__link"
        aria-label={`${product.name}, ${min !== max ? 'from ' : ''}${money(min)}`}
      >
        <CardMedia product={product}>
          {product.stock === 0 ? (
            <span className="product-card__flag">Out of stock</span>
          ) : onSale ? (
            <span className="product-card__flag product-card__flag--sale">Offer</span>
          ) : null}
        </CardMedia>
        <span className="product-card__body">
          <span className="tag">{product.brand}</span>
          <span className="product-card__name">{product.name}</span>
          <span className="row__sub num" style={{ marginTop: 'calc(-1 * var(--space-3xs))' }}>
            {matched ? variantLabel(product, matched) : options ? optionSummary(product) : product.unit}
          </span>
          <span className="product-card__foot">
            <span className="product-card__price">
              {!matched && min !== max && <span className="product-card__from">from</span>}
              <Price value={matched ? matched.price : min} />
            </span>
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
          if (options) {
            setChooseOpen(true)
            return
          }
          addToCart(product.id, 1, def.id)
          markAdded()
        }}
        disabled={product.stock === 0}
        aria-label={options ? `Choose options for ${product.name}` : `Add ${product.name} to cart`}
        aria-haspopup={options ? 'dialog' : undefined}
      >
        {added ? (
          <>
            <Check size={14} strokeWidth={2.25} /> Added
          </>
        ) : options ? (
          'Choose'
        ) : (
          'Add'
        )}
      </button>
      {chooseOpen && <QuickAddSheet product={product} open onClose={() => setChooseOpen(false)} />}
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
            <span key={`${item.productId}-${item.variantId ?? ""}`} className={`tile ${tileClass(p.category)}`}>
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

/**
 * A pet's vaccinations as a timeline, most urgent first. Each state is an
 * icon + words (never colour alone), and anything due carries its own next
 * step: book it, or say it was already given.
 */
export function VaccineTimeline({ records, petName }: { records: VaccineRecord[]; petName: string }) {
  const sorted = [...records].sort((a, b) => a.dueInDays - b.dueInDays)
  return (
    <ol className="vax-tl" aria-label={`${petName}’s vaccinations`}>
      {sorted.map((v) => {
        const d = v.dueInDays
        const when = shortDate(dateFromOffset(d))
        const status =
          v.status === 'overdue'
            ? `${Math.abs(d)} day${Math.abs(d) === 1 ? '' : 's'} overdue`
            : v.status === 'due'
              ? d === 0
                ? 'Due today'
                : `Due in ${d} day${d === 1 ? '' : 's'}`
              : v.status === 'scheduled'
                ? 'Booked'
                : 'Up to date'
        const meta =
          v.status === 'overdue'
            ? `Was due ${when}`
            : v.status === 'due'
              ? `Due ${when}`
              : v.status === 'scheduled'
                ? `Visit ${v.scheduledFor ?? `on ${when}`}`
                : `Next due ${when}`
        const Icon = v.status === 'overdue' ? CircleAlert : v.status === 'due' ? Clock : v.status === 'scheduled' ? CalendarCheck : Check
        const needs = v.status === 'overdue' || v.status === 'due'
        return (
          <li key={v.id} className={`vax-tl__item vax-tl--${v.status}`}>
            <span className="vax-tl__node" aria-hidden>
              <Icon size={15} strokeWidth={2} />
            </span>
            <div className="vax-tl__body">
              <div className="vax-tl__head">
                <span className="row__title">{v.name}</span>
                <span className="vax-tl__status">{status}</span>
              </div>
              <span className="row__sub">
                {v.shieldsAgainst} · {meta} · {v.source}
              </span>
              {needs && (
                <div className="vax-tl__actions">
                  <Link
                    to="/clinics"
                    search={{ service: 'vaccination' }}
                    className="btn btn--primary btn--sm"
                    aria-label={`Book ${v.name} for ${petName}`}
                  >
                    Book
                  </Link>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => markVaccineGiven(v.id)}
                    aria-label={`Mark ${v.name} as given for ${petName}`}
                  >
                    Mark as given
                  </button>
                </div>
              )}
              {v.status === 'scheduled' && (
                <Link to="/bookings" className="vax-tl__link">
                  See booking
                </Link>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/* ---------------------------------------------------------- running low */

/** categories that get used up — toys and gear don't need reordering */
const CONSUMABLE = new Set(['food', 'treats', 'health', 'grooming'])

export interface ReorderPick {
  productId: string
  variantId?: string
  qty: number
  daysAgo: number
}

/**
 * Consumables from delivered orders at least ten days old, newest purchase of
 * each option only, the longest-ago first — the ones most likely to be running out.
 */
export function runningLow(orders: Order[], limit = 4): ReorderPick[] {
  const seen = new Map<string, ReorderPick>()
  for (const o of [...orders].sort((a, b) => a.placedAtDaysAgo - b.placedAtDaysAgo)) {
    if (o.status !== 'delivered' || o.placedAtDaysAgo < 10) continue
    for (const it of o.items) {
      const p = getProduct(it.productId)
      if (!p || !CONSUMABLE.has(p.category)) continue
      const key = `${it.productId}::${it.variantId ?? ''}`
      if (!seen.has(key)) seen.set(key, { productId: it.productId, variantId: it.variantId, qty: it.qty, daysAgo: o.placedAtDaysAgo })
    }
  }
  return [...seen.values()].sort((a, b) => b.daysAgo - a.daysAgo).slice(0, limit)
}

export function ReorderCard({ pick }: { pick: ReorderPick }) {
  const [added, markAdded] = useCopiedLabel(1600)
  const product = getProduct(pick.productId)
  if (!product) return null
  const variant = variantsOf(product).find((v) => v.id === pick.variantId) ?? defaultVariant(product)
  const label = variantLabel(product, variant)
  const soldOut = variant.stock === 0
  const image = product.images?.[0]
  return (
    <article className="card reorder">
      <Link to="/shop/$id" params={{ id: product.id }} search={variant.id !== defaultVariant(product).id ? { v: variant.id } : {}} className={`tile reorder__tile ${tileClass(product.category)}`} tabIndex={-1} aria-hidden>
        {image ? <img src={image} alt="" width={96} height={96} loading="lazy" decoding="async" /> : <CategoryIcon category={product.category} size={22} />}
      </Link>
      <div className="reorder__body">
        <Link to="/shop/$id" params={{ id: product.id }} search={variant.id !== defaultVariant(product).id ? { v: variant.id } : {}} className="row__title reorder__name">
          {product.name}
        </Link>
        <span className="row__sub">
          {label ? `${label} · ` : ''}
          {pick.qty > 1 ? `×${pick.qty} · ` : ''}ordered {pick.daysAgo} days ago
        </span>
        <button
          type="button"
          className="btn btn--ghost btn--sm reorder__btn"
          disabled={soldOut}
          onClick={() => {
            addToCart(product.id, pick.qty, variant.id)
            markAdded()
          }}
          aria-label={soldOut ? `${product.name} is sold out` : `Add ${pick.qty} ${product.name}${label ? ` (${label})` : ''} to cart`}
        >
          {soldOut ? (
            'Sold out'
          ) : added ? (
            <>
              <Check size={14} strokeWidth={2.25} /> Added
            </>
          ) : (
            <>Reorder · <span className="num">{money(variant.price * pick.qty)}</span></>
          )}
        </button>
      </div>
    </article>
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
