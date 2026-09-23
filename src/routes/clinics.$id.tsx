import { useState } from 'react'
import { createFileRoute, notFound, Link, useNavigate } from '@tanstack/react-router'
import { BadgeCheck, Clock, MapPin, Navigation, Phone, Share2 } from 'lucide-react'

import { Crumbs, RatingSummary, ReviewList, SaveButton, SuccessMark } from '../components/blocks'
import { AddPetSheet } from '../components/add-pet'
import { ClinicCard } from '../components/cards'
import { SlotPicker } from '../components/slot-picker'
import { PetGlyph, ServiceIcon, Sheet, Stars } from '../components/ui'
import { CLINICS, SERVICE_TYPES, clinicReviews, getClinic, ratingBreakdown } from '../lib/data'
import { dateFromOffset, initials, longDate, money, shortDate } from '../lib/format'
import { absoluteUrl, breadcrumbLd, seo } from '../lib/seo'
import { bookService, pushToast, useAppState } from '../lib/store'
import type { ClinicService } from '../lib/types'

export const Route = createFileRoute('/clinics/$id')({
  // unknown ids are real 404s (status + noindex), not soft "not found" pages
  beforeLoad: ({ params }) => {
    if (!getClinic(params.id)) throw notFound()
  },
  head: ({ params }) => {
    const c = getClinic(params.id)
    if (!c) return seo({ title: 'Clinic not found', noindex: true })
    const services = [...new Set(c.services.map((s) => SERVICE_TYPES.find((t) => t.id === s.type)?.label ?? s.type))]
    const from = Math.min(...c.services.map((s) => s.price))
    return seo({
      title: `${c.name} — vet in ${c.area}`,
      description: `${services.join(', ')} at ${c.name}, ${c.area}. Rated ${c.rating.toFixed(1)} from ${c.reviews} reviews · ${c.hours} · from ${money(from)}. Book online in under a minute.`,
      path: `/clinics/${c.id}`,
      jsonLd: [
        {
          '@type': 'VeterinaryCare',
          name: c.name,
          description: c.about,
          url: absoluteUrl(`/clinics/${c.id}`),
          telephone: c.phone,
          priceRange: '$'.repeat(c.priceBand),
          address: { '@type': 'PostalAddress', addressLocality: c.area },
          openingHours: c.hours,
          aggregateRating: { '@type': 'AggregateRating', ratingValue: c.rating, reviewCount: c.reviews },
          makesOffer: c.services.map((s) => ({
            '@type': 'Offer',
            price: s.price.toFixed(2),
            priceCurrency: 'USD',
            itemOffered: { '@type': 'Service', name: s.name },
          })),
        },
        breadcrumbLd([
          ['Clinics', '/clinics'],
          [c.name, `/clinics/${c.id}`],
        ]),
      ],
    })
  },
  component: ClinicPage,
})

function ClinicPage() {
  const { id } = Route.useParams()
  const clinic = getClinic(id)
  const { pets, signedIn } = useAppState()
  const [addPetOpen, setAddPetOpen] = useState(false)
  const navigate = useNavigate()

  const [bookingService, setBookingService] = useState<ClinicService | null>(null)
  const [petId, setPetId] = useState(pets[0]?.id ?? '')
  const [day, setDay] = useState(0)
  const [slot, setSlot] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [doneId, setDoneId] = useState<string | null>(null)

  if (!clinic) {
    return (
      <div className="page">
        <Crumbs items={[{ label: 'Clinics', to: '/clinics' }, { label: 'Not found' }]} />
        <p className="muted">This clinic is no longer listed.</p>
        <Link to="/clinics" className="btn btn--ghost btn--sm" style={{ width: 'fit-content' }}>
          Back to clinics
        </Link>
      </div>
    )
  }

  // a pet added from inside the sheet becomes the choice straight away
  const pet = pets.find((p) => p.id === petId) ?? pets[0]
  const nearby = CLINICS.filter((c) => c.id !== clinic.id)
    .sort((a, b) => Math.abs(a.distanceKm - clinic.distanceKm) - Math.abs(b.distanceKm - clinic.distanceKm))
    .slice(0, 2)
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name} ${clinic.area}`)}`

  function openBooking(service: ClinicService) {
    setBookingService(service)
    setPetId(pets[0]?.id ?? '')
    // the last slot is 17:15 — after about 16:45 today is gone, start on tomorrow
    const now = new Date()
    setDay(now.getHours() * 60 + now.getMinutes() > 16 * 60 + 45 ? 1 : 0)
    setSlot(null)
    setNote('')
    setDoneId(null)
  }

  function confirmBooking() {
    if (!bookingService || !slot || !pet) return
    setConfirming(true)
    window.setTimeout(() => {
      const booking = bookService({
        clinicId: clinic!.id,
        serviceId: bookingService.id,
        petId: pet.id,
        dayOffset: day,
        time: slot,
      })
      setConfirming(false)
      setDoneId(booking.id)
    }, 800)
  }

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: clinic!.name, url })
      else {
        await navigator.clipboard.writeText(url)
        pushToast('Link copied')
      }
    } catch {
      /* share sheet dismissed */
    }
  }

  return (
    <div className="page">
      <Crumbs items={[{ label: 'Clinics', to: '/clinics' }, { label: clinic.name }]} />

      <div className="detail-grid rise" style={{ '--i': 1 } as React.CSSProperties}>
        <div className="stack">
          <section className="card card--pad">
            <div className="clinic-hero">
              <span className="clinic-card__mono" style={{ width: '3.5rem', height: '3.5rem', fontSize: 'var(--text-md)' }} aria-hidden>
                {initials(clinic.name)}
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <h1 className="page-title" style={{ fontSize: 'var(--text-xl)' }}>{clinic.name}</h1>
                <span className="clinic-card__meta">
                  <MapPin size={13} strokeWidth={1.75} />
                  {clinic.area} · {clinic.distanceKm.toFixed(1)} km
                </span>
                <span className="clinic-card__meta" style={{ marginTop: 2 }}>
                  <Stars rating={clinic.rating} />
                  <a href="#reviews" className="num">{clinic.reviews} reviews</a>
                  <span>· {'$'.repeat(clinic.priceBand)}</span>
                </span>
              </span>
            </div>
            <hr className="hr" style={{ marginBlock: 'var(--space-sm)' }} />
            <div className="grid-list" style={{ gap: 'var(--space-2xs)' }}>
              <span className="row__sub icon-line">
                <Clock size={14} strokeWidth={1.75} />
                <span>
                  {clinic.hours} ·{' '}
                  <span style={{ color: clinic.openNow ? 'var(--color-ok)' : 'var(--color-bad)', fontWeight: 600 }}>
                    {clinic.openNow ? 'Open now' : 'Closed now'}
                  </span>
                  {clinic.verified && (
                    <>
                      {' '}·{' '}
                      <span className="verified">
                        <BadgeCheck size={13} strokeWidth={1.75} /> Verified
                      </span>
                    </>
                  )}
                </span>
              </span>
            </div>
            <p style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--text-body)', color: 'var(--color-ink-2)' }}>
              {clinic.about}
            </p>
          </section>

          <div className="action-grid action-grid--4">
            <a href={`tel:${clinic.phone.replace(/\D/g, '')}`} className="action-tile">
              <Phone size={18} strokeWidth={1.75} aria-hidden /> Call
            </a>
            <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="action-tile">
              <Navigation size={18} strokeWidth={1.75} aria-hidden /> Directions
            </a>
            <button type="button" className="action-tile" onClick={share}>
              <Share2 size={18} strokeWidth={1.75} aria-hidden /> Share
            </button>
            <SaveButton kind="clinic" id={clinic.id} name={clinic.name} variant="tile" />
          </div>

          <section aria-labelledby="services-h">
            <div className="section-head">
              <h2 id="services-h" className="section-head__title">Services</h2>
              <span className="mono-label">{clinic.services.length} available</span>
            </div>
            <div className="grid-list">
              {clinic.services.map((service) => (
                <div key={service.id} className="card row">
                  <span className="tile" style={{ width: '2.5rem', height: '2.5rem' }}>
                    <ServiceIcon type={service.type} size={16} />
                  </span>
                  <span className="row__grow">
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
            <p className="row__sub" style={{ marginTop: 'var(--space-xs)' }}>
              Pay the clinic after your visit. Free to cancel up to 24 hours before.
            </p>
          </section>

        </div>

        <div className="stack">
          <section id="reviews" className="card card--pad" style={{ scrollMarginTop: '5rem' }}>
            <h2 className="section-head__title section-head">What pet parents say</h2>
            <RatingSummary rating={clinic.rating} total={clinic.reviews} breakdown={ratingBreakdown(clinic.rating, clinic.reviews)} />
            <div style={{ marginTop: 'var(--space-md)' }}>
              <ReviewList reviews={clinicReviews(clinic.id)} />
            </div>
          </section>
        </div>
      </div>

      {nearby.length > 0 && (
        <section className="rise" style={{ '--i': 3 } as React.CSSProperties}>
          <div className="section-head">
            <h2 className="section-head__title">Other clinics nearby</h2>
            <Link to="/clinics" className="section-head__link">All clinics</Link>
          </div>
          <div className="clinic-grid">
            {nearby.map((c) => (
              <ClinicCard key={c.id} id={c.id} />
            ))}
          </div>
        </section>
      )}

      <Sheet
        open={bookingService !== null}
        onClose={() => setBookingService(null)}
        title={doneId ? 'Booked' : `Book — ${bookingService?.name ?? ''}`}
        footer={
          doneId ? (
            <div className="btn-pair">
              <button type="button" className="btn btn--ghost" onClick={() => setBookingService(null)}>
                Done
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  setBookingService(null)
                  navigate({ to: '/bookings/$id', params: { id: doneId } })
                }}
              >
                View booking
              </button>
            </div>
          ) : !signedIn ? (
            <Link to="/login" search={{ redirect: `/clinics/${clinic.id}` }} className="btn btn--primary btn--block">
              Sign in to book
            </Link>
          ) : pets.length === 0 ? (
            <button type="button" className="btn btn--primary btn--block" onClick={() => setAddPetOpen(true)}>
              Add your pet to book
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={!slot || confirming}
              data-loading={confirming || undefined}
              onClick={confirmBooking}
            >
              {slot
                ? `Confirm — ${shortDate(dateFromOffset(day))}, ${slot} · ${money(bookingService?.price ?? 0)}`
                : 'Pick a time slot'}
            </button>
          )
        }
      >
        {doneId ? (
          <div style={{ textAlign: 'center', paddingBlock: 'var(--space-lg)' }}>
            <SuccessMark />
            <p className="row__title" style={{ fontSize: 'var(--text-md)' }}>
              {bookingService?.name} booked
            </p>
            <p className="row__sub">
              {longDate(dateFromOffset(day))} at {slot} — bring {pet?.name} ten minutes early. We’ll remind you the day before.
            </p>
          </div>
        ) : (
          bookingService && (
            <div className="stack">
              {!signedIn ? (
                <p className="row__sub" style={{ fontSize: 'var(--text-body)' }}>
                  Check the times below, then sign in to confirm — it takes a few seconds and you’ll
                  come straight back here.
                </p>
              ) : pets.length === 0 ? (
                <p className="row__sub" style={{ fontSize: 'var(--text-body)' }}>
                  Add your pet so the clinic knows who’s coming — it takes ten seconds.
                </p>
              ) : (
                <fieldset className="plain-fieldset">
                  <legend className="tag">Pet</legend>
                  <div className="chips">
                    {pets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="chip"
                        aria-pressed={pet?.id === p.id}
                        onClick={() => setPetId(p.id)}
                      >
                        <PetGlyph species={p.species} size={14} />
                        {p.name}
                      </button>
                    ))}
                  </div>
                  {pet?.allergies && <p className="row__sub">Shared with the clinic: {pet.allergies}</p>}
                </fieldset>
              )}

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

              <div className="field">
                <label className="field__label" htmlFor="bk-note">
                  Note for the clinic <span className="muted">(optional)</span>
                </label>
                <textarea
                  id="bk-note"
                  className="input textarea"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Symptoms, nervous around other dogs…"
                />
              </div>
            </div>
          )
        )}
      </Sheet>
      <AddPetSheet open={addPetOpen} onClose={() => setAddPetOpen(false)} />
    </div>
  )
}
