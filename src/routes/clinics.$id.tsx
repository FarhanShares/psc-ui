import { useMemo, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { BadgeCheck, Check, ChevronLeft, Clock, MapPin, Phone } from 'lucide-react'

import { PetGlyph, ServiceIcon, Sheet, Stars } from '../components/ui'
import { BOOKING_SLOTS, getClinic, slotAvailable } from '../lib/data'
import { dateFromOffset, isoDay, longDate, money, shortDate } from '../lib/format'
import { bookService, pushToast, useAppState } from '../lib/store'
import type { ClinicService } from '../lib/types'

export const Route = createFileRoute('/clinics/$id')({
  head: ({ params }) => ({ title: `${getClinic(params.id)?.name ?? 'Clinic'} · PetSafeCare` }),
  component: ClinicPage,
})

function ClinicPage() {
  const { id } = Route.useParams()
  const clinic = getClinic(id)
  const { pets } = useAppState()
  const navigate = useNavigate()

  const [bookingService, setBookingService] = useState<ClinicService | null>(null)
  const [petId, setPetId] = useState(pets[0]?.id ?? '')
  const [dayIdx, setDayIdx] = useState(0)
  const [slot, setSlot] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => dateFromOffset(i)),
    [],
  )

  if (!clinic) {
    return (
      <div className="page">
        <p className="muted">This clinic is no longer listed.</p>
        <Link to="/clinics" className="btn btn--ghost btn--sm" style={{ width: 'fit-content' }}>
          Back to clinics
        </Link>
      </div>
    )
  }

  const initials = clinic.name
    .split(' ')
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
  const selectedDayIso = isoDay(days[dayIdx])

  function openBooking(service: ClinicService) {
    setBookingService(service)
    setPetId(pets[0]?.id ?? '')
    setDayIdx(0)
    setSlot(null)
    setDone(false)
  }

  function confirmBooking() {
    if (!bookingService || !slot) return
    setConfirming(true)
    window.setTimeout(() => {
      const booking = bookService({
        clinicId: clinic!.id,
        serviceId: bookingService.id,
        petId,
        dayOffset: dayIdx,
        time: slot,
      })
      setConfirming(false)
      setDone(true)
      pushToast(`Booked — ${booking.id}`)
      window.setTimeout(() => {
        setBookingService(null)
        navigate({ to: '/bookings' })
      }, 1100)
    }, 800)
  }

  return (
    <div className="page">
      <Link to="/clinics" className="thead rise" style={{ '--i': 0 } as React.CSSProperties}>
        <ChevronLeft size={15} strokeWidth={2} />
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Clinics</span>
      </Link>

      <section className="card card--pad rise" style={{ '--i': 1 } as React.CSSProperties}>
        <div className="split">
          <span className="clinic-card__mono" style={{ width: '3rem', height: '3rem' }} aria-hidden>
            {initials}
          </span>
          <span style={{ marginInline: 'var(--space-xs) 0', minWidth: 0 }}>
            <h1 className="page-title" style={{ fontSize: 'var(--text-lg)' }}>
              {clinic.name}
            </h1>
            <span className="clinic-card__meta">
              <MapPin size={13} strokeWidth={1.75} />
              {clinic.area} · {clinic.distanceKm.toFixed(1)} km
            </span>
          </span>
          <Stars rating={clinic.rating} />
        </div>
        <hr className="hr" style={{ marginBlock: 'var(--space-sm)' }} />
        <div className="grid-list" style={{ gap: 'var(--space-2xs)' }}>
          <span className="row__sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} strokeWidth={1.75} />
            {clinic.hours}
            {clinic.verified && (
              <>
                ·{' '}
                <span className="verified">
                  <BadgeCheck size={13} strokeWidth={1.75} /> Verified
                </span>
              </>
            )}
          </span>
          <a href={`tel:${clinic.phone.replace(/\D/g, '')}`} className="row__sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Phone size={14} strokeWidth={1.75} />
            {clinic.phone}
          </a>
        </div>
      </section>

      <section className="rise" style={{ '--i': 2 } as React.CSSProperties}>
        <div className="section-head">
          <h2 className="section-head__title">Services</h2>
          <span className="mono-label">{clinic.services.length} available</span>
        </div>
        <div className="grid-list">
          {clinic.services.map((service) => (
            <div key={service.id} className="card row">
              <span className="tile" style={{ width: '2.5rem', height: '2.5rem' }}>
                <ServiceIcon type={service.type} size={16} />
              </span>
              <span className="row__grow" style={{ minWidth: 0 }}>
                <span className="row__title">{service.name}</span>
                <span className="row__sub">
                  {service.durationMin} min
                  {service.note ? ` · ${service.note}` : ''}
                </span>
              </span>
              <span style={{ display: 'grid', justifyItems: 'end', gap: 'var(--space-3xs)' }}>
                <span className="price price--lg">{money(service.price)}</span>
                <button type="button" className="btn btn--primary btn--sm" onClick={() => openBooking(service)}>
                  Book
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>

      <Sheet
        open={bookingService !== null}
        onClose={() => setBookingService(null)}
        title={done ? 'Booked' : `Book — ${bookingService?.name ?? ''}`}
        footer={
          done ? (
            <Link to="/bookings" className="btn btn--primary btn--block">
              View bookings
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={!slot || confirming}
              data-loading={confirming || undefined}
              onClick={confirmBooking}
            >
              {slot
                ? `Confirm — ${shortDate(days[dayIdx])}, ${slot} · ${money(bookingService?.price ?? 0)}`
                : 'Pick a time slot'}
            </button>
          )
        }
      >
        {done ? (
          <div style={{ textAlign: 'center', paddingBlock: 'var(--space-lg)' }}>
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
            <p className="row__title" style={{ fontSize: 'var(--text-md)' }}>
              {bookingService?.name} booked
            </p>
            <p className="row__sub">
              {longDate(days[dayIdx])} at {slot} — take {pets.find((p) => p.id === petId)?.name} 10 minutes early.
            </p>
          </div>
        ) : (
          bookingService && (
            <div className="stack">
              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Pet</legend>
                <div className="chips">
                  {pets.map((pet) => (
                    <button
                      key={pet.id}
                      type="button"
                      className="chip"
                      aria-pressed={petId === pet.id}
                      onClick={() => setPetId(pet.id)}
                    >
                      <PetGlyph species={pet.species} size={14} />
                      {pet.name}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Day</legend>
                <div className="chips">
                  {days.map((d, i) => (
                    <button
                      key={isoDay(d)}
                      type="button"
                      className="chip"
                      aria-pressed={dayIdx === i}
                      onClick={() => {
                        setDayIdx(i)
                        setSlot(null)
                      }}
                    >
                      {i === 0 ? 'Today' : shortDate(d)}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>
                  Time — {longDate(days[dayIdx])}
                </legend>
                <div className="slots" role="group" aria-label="Time slots">
                  {BOOKING_SLOTS.map((s) => {
                    const available = slotAvailable(clinic.id, selectedDayIso, s)
                    return (
                      <button
                        key={s}
                        type="button"
                        className="slot"
                        aria-pressed={slot === s}
                        disabled={!available}
                        onClick={() => setSlot(s)}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            </div>
          )
        )}
      </Sheet>
    </div>
  )
}
