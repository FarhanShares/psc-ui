import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CalendarPlus, CalendarX, Clock, MapPin, Navigation, Phone, Star, Wallet } from 'lucide-react'

import { Crumbs, SuccessMark } from '../components/blocks'
import { SlotPicker } from '../components/slot-picker'
import { EmptyState, PetGlyph, Pill, ServiceIcon, Sheet } from '../components/ui'
import { getClinic, getService } from '../lib/data'
import { dateFromOffset, isoDay, longDate, money, relativeDay } from '../lib/format'
import { seo } from '../lib/seo'
import { cancelBooking, pushToast, rescheduleBooking, useAppState } from '../lib/store'
import type { ServiceType } from '../lib/types'
import { RequireAccount } from '../components/gate'

export const Route = createFileRoute('/bookings/$id')({
  head: ({ params }) => seo({ title: `Booking #${params.id}`, path: `/bookings/${params.id}`, noindex: true }),
  component: () => (
    <RequireAccount kind="bookings">
      <BookingPage />
    </RequireAccount>
  ),
})

const PREP: Record<ServiceType, string[]> = {
  consultation: ['Note any symptoms and when they started', 'Bring current medication or photos of labels', 'Arrive ten minutes early'],
  vaccination: ['Bring the vaccination card or passport', 'A light meal beforehand is fine', 'Expect 15 minutes of observation afterwards'],
  grooming: ['A short walk beforehand helps them settle', 'Mention any sore spots or matted areas', 'Allow the full session time'],
  dental: ['No food from 10 pm the night before', 'Water is fine until the morning', 'Plan a quiet evening afterwards'],
  surgery: ['No food from 10 pm the night before', 'Bring a clean blanket for the ride home', 'Collection time is confirmed by phone'],
  checkup: ['Bring a fresh stool sample if you can', 'Note changes in appetite, thirst or weight', 'Arrive ten minutes early'],
}

function icsHref(opts: { title: string; location: string; dayOffset: number; time: string; minutes: number }) {
  const d = dateFromOffset(opts.dayOffset)
  const [h, m] = opts.time.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  const end = new Date(d.getTime() + opts.minutes * 60_000)
  const fmt = (x: Date) =>
    `${isoDay(x).replace(/-/g, '')}T${String(x.getHours()).padStart(2, '0')}${String(x.getMinutes()).padStart(2, '0')}00`
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PetSafeCare//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(d)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${opts.title}`,
    `LOCATION:${opts.location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`
}

function BookingPage() {
  const { id } = Route.useParams()
  const { bookings, pets } = useAppState()
  const booking = bookings.find((b) => b.id === id)

  const [reschedOpen, setReschedOpen] = useState(false)
  const [day, setDay] = useState(1)
  const [slot, setSlot] = useState<string | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [stars, setStars] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewed, setReviewed] = useState(false)

  const clinic = booking && getClinic(booking.clinicId)
  const service = booking && getService(booking.clinicId, booking.serviceId)

  if (!booking || !clinic || !service) {
    return (
      <div className="page">
        <Crumbs items={[{ label: 'Bookings', to: '/bookings' }, { label: 'Not found' }]} />
        <EmptyState
          title="We can’t find that booking"
          text="It may have been removed, or the link is incomplete."
          actionLabel="See all bookings"
          actionTo="/bookings"
          icon={<CalendarX size={20} strokeWidth={1.75} />}
        />
      </div>
    )
  }

  const pet = pets.find((p) => p.id === booking.petId)
  const when = dateFromOffset(booking.dayOffset)
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name} ${clinic.area}`)}`

  return (
    <div className="page">
      <Crumbs items={[{ label: 'Account', to: '/profile' }, { label: 'Bookings', to: '/bookings' }, { label: `#${booking.id}` }]} />

      <header className="rise split" style={{ '--i': 0, alignItems: 'flex-end', flexWrap: 'wrap' } as React.CSSProperties}>
        <div style={{ minWidth: 0 }}>
          <p className="mono-label">#{booking.id}</p>
          <h1 className="page-title">{service.name}</h1>
        </div>
        {booking.status === 'upcoming' && <Pill tone="info">→ Upcoming</Pill>}
        {booking.status === 'completed' && <Pill tone="ok">Completed</Pill>}
        {booking.status === 'cancelled' && <Pill tone="bad">Cancelled</Pill>}
      </header>

      <div className="detail-grid rise" style={{ '--i': 1 } as React.CSSProperties}>
        <div className="stack">
          <section className={`when-card${booking.status === 'cancelled' ? ' when-card--muted' : ''}`}>
            <span className="when-card__date">
              <span className="when-card__dow">{when.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className="when-card__num num">{when.getDate()}</span>
              <span className="when-card__mon">{when.toLocaleDateString('en-US', { month: 'short' })}</span>
            </span>
            <span style={{ minWidth: 0 }}>
              <span className="when-card__time num">{booking.time}</span>
              <span className="when-card__rel">
                {relativeDay(booking.dayOffset)} · {service.durationMin} min
              </span>
            </span>
          </section>

          <section className="card card--pad stack" style={{ gap: 'var(--space-sm)' }}>
            <Link to="/clinics/$id" params={{ id: clinic.id }} className="icon-line icon-line--link">
              <ServiceIcon type={service.type} size={15} />
              <span className="row__grow">
                <span className="tag">Clinic</span>
                <span className="row__title">{clinic.name}</span>
                <span className="row__sub">{clinic.area} · {clinic.distanceKm.toFixed(1)} km</span>
              </span>
            </Link>
            {pet && (
              <Link to="/pets/$id" params={{ id: pet.id }} className="icon-line icon-line--link">
                <PetGlyph species={pet.species} size={15} />
                <span className="row__grow">
                  <span className="tag">Pet</span>
                  <span className="row__title">{pet.name}</span>
                  <span className="row__sub">{pet.breed}</span>
                </span>
              </Link>
            )}
            <div className="icon-line">
              <Wallet size={15} strokeWidth={1.75} aria-hidden />
              <span className="row__grow">
                <span className="tag">Price</span>
                <span className="row__title">{money(service.price)}</span>
                <span className="row__sub">Pay the clinic after your visit</span>
              </span>
            </div>
          </section>

          {booking.status === 'upcoming' && (
            <section className="card card--pad">
              <h2 className="section-head__title" style={{ marginBottom: 'var(--space-2xs)' }}>Before you go</h2>
              <ul className="check-list">
                {PREP[service.type].map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="stack side-col">
          {booking.status === 'upcoming' && (
            <>
              <div className="action-grid">
                <a href={`tel:${clinic.phone.replace(/\D/g, '')}`} className="action-tile">
                  <Phone size={18} strokeWidth={1.75} aria-hidden />
                  Call
                </a>
                <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="action-tile">
                  <Navigation size={18} strokeWidth={1.75} aria-hidden />
                  Directions
                </a>
                <a
                  href={icsHref({
                    title: `${service.name} — ${pet?.name ?? 'pet'}`,
                    location: `${clinic.name}, ${clinic.area}`,
                    dayOffset: booking.dayOffset,
                    time: booking.time,
                    minutes: service.durationMin,
                  })}
                  download={`${booking.id}.ics`}
                  className="action-tile"
                >
                  <CalendarPlus size={18} strokeWidth={1.75} aria-hidden />
                  Calendar
                </a>
              </div>
              <button
                type="button"
                className="btn btn--primary btn--block"
                onClick={() => {
                  setDay(booking.dayOffset > 0 ? booking.dayOffset : 1)
                  setSlot(null)
                  setReschedOpen(true)
                }}
              >
                <Clock size={15} strokeWidth={2} /> Reschedule
              </button>
              <button type="button" className="btn btn--ghost btn--block btn--danger" onClick={() => setCancelOpen(true)}>
                Cancel booking
              </button>
              <p className="row__sub" style={{ textAlign: 'center' }}>
                Free to cancel or move up to 24 hours before.
              </p>
            </>
          )}

          {booking.status === 'completed' && (
            <>
              <Link to="/clinics/$id" params={{ id: clinic.id }} className="btn btn--primary btn--block">
                Book again
              </Link>
              <button
                type="button"
                className="btn btn--ghost btn--block"
                disabled={reviewed}
                onClick={() => {
                  setStars(0)
                  setReviewText('')
                  setReviewOpen(true)
                }}
              >
                <Star size={15} strokeWidth={1.75} /> {reviewed ? 'Review sent — thank you' : 'Rate this visit'}
              </button>
            </>
          )}

          {booking.status === 'cancelled' && (
            <Link to="/clinics/$id" params={{ id: clinic.id }} className="btn btn--primary btn--block">
              Book a new time
            </Link>
          )}

          <section className="card card--pad">
            <div className="icon-line">
              <MapPin size={15} strokeWidth={1.75} aria-hidden />
              <span className="row__grow">
                <span className="row__title">{clinic.area}</span>
                <span className="row__sub">{clinic.hours}</span>
                <a href={`tel:${clinic.phone.replace(/\D/g, '')}`} className="row__sub num" style={{ display: 'block' }}>
                  {clinic.phone}
                </a>
              </span>
            </div>
          </section>
        </div>
      </div>

      {/* reschedule */}
      <Sheet
        open={reschedOpen}
        onClose={() => setReschedOpen(false)}
        title="Pick a new time"
        footer={
          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={!slot}
            onClick={() => {
              if (!slot) return
              rescheduleBooking(booking.id, day, slot)
              setReschedOpen(false)
              pushToast(`Moved to ${relativeDay(day).toLowerCase()} at ${slot}`)
            }}
          >
            {slot ? `Move to ${longDate(dateFromOffset(day))}, ${slot}` : 'Pick a time slot'}
          </button>
        }
      >
        {reschedOpen && (
          <SlotPicker
            clinicId={clinic.id}
            dayOffset={day}
            onDay={(d) => {
              setDay(d)
              setSlot(null)
            }}
            slot={slot}
            onSlot={setSlot}
          />
        )}
      </Sheet>

      {/* cancel confirm */}
      <Sheet
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this booking?"
        footer={
          <div className="btn-pair">
            <button type="button" className="btn btn--ghost" onClick={() => setCancelOpen(false)}>
              Keep it
            </button>
            <button
              type="button"
              className="btn btn--danger-fill"
              onClick={() => {
                cancelBooking(booking.id)
                setCancelOpen(false)
              }}
            >
              Cancel booking
            </button>
          </div>
        }
      >
        <p className="row__sub" style={{ fontSize: 'var(--text-body)' }}>
          {service.name} at {clinic.name}, {longDate(when)} at {booking.time}. The slot is released
          to other pet parents straight away.
        </p>
      </Sheet>

      {/* review */}
      <Sheet
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title={`Rate ${clinic.name}`}
        footer={
          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={stars === 0}
            onClick={() => {
              setReviewed(true)
              setReviewOpen(false)
              pushToast('Thanks — your review helps other pet parents')
            }}
          >
            Send review
          </button>
        }
      >
        {reviewed ? (
          <SuccessMark />
        ) : (
          <div className="stack">
            <div className="star-input" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={stars === n}
                  aria-label={`${n} star${n === 1 ? '' : 's'}`}
                  className={n <= stars ? 'is-on' : undefined}
                  onClick={() => setStars(n)}
                >
                  <Star size={28} strokeWidth={1.5} fill={n <= stars ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="rv-text">What stood out? <span className="muted">(optional)</span></label>
              <textarea
                id="rv-text"
                className="input textarea"
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Friendly staff, on time, clear advice…"
              />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
