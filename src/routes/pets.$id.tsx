import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { CalendarDays, PawPrint, Pencil, Plus, Scale, Syringe, Trash2 } from 'lucide-react'

import { Crumbs, Stat } from '../components/blocks'
import { BookingCard, VaccineTimeline } from '../components/cards'
import { AddRecordSheet, EditPetSheet, LogWeightSheet, WeightTrend } from '../components/pet-sheets'
import { ProductRail } from '../components/product-rail'
import { EmptyState, PetGlyph, Sheet } from '../components/ui'
import { PRODUCTS, getProduct } from '../lib/data'
import { variantForPet } from '../lib/catalog'
import { plural } from '../lib/format'
import { seo } from '../lib/seo'
import { removePet, useAppState } from '../lib/store'
import { RequireAccount } from '../components/gate'
import { GuideCard } from '../components/guide-card'
import { guidesFor } from '../lib/guides'
import { formatWeight, speciesInfo } from '../lib/species'

export const Route = createFileRoute('/pets/$id')({
  head: () => seo({ title: 'Pet profile', noindex: true }),
  component: () => (
    <RequireAccount kind="pets">
      <PetPage />
    </RequireAccount>
  ),
})

function PetPage() {
  const { id } = Route.useParams()
  const { pets, vaccines, bookings } = useAppState()
  const navigate = useNavigate()
  const pet = pets.find((p) => p.id === id)

  const [editOpen, setEditOpen] = useState(false)
  const [weightOpen, setWeightOpen] = useState(false)
  const [recordOpen, setRecordOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)

  if (!pet) {
    return (
      <div className="page">
        <Crumbs items={[{ label: 'Pets', to: '/pets' }, { label: 'Not found' }]} />
        <EmptyState
          title="This pet isn’t on your account"
          text="It may have been removed. Your other pets are one tap away."
          actionLabel="See your pets"
          actionTo="/pets"
          icon={<PawPrint size={20} strokeWidth={1.75} />}
        />
      </div>
    )
  }

  const records = vaccines.filter((v) => v.petId === pet.id).sort((a, b) => a.dueInDays - b.dueInDays)
  const attention = records.filter((v) => v.status === 'overdue' || v.status === 'due')
  const upToDate = records.filter((v) => v.status === 'ok' || v.status === 'scheduled').length
  const visits = bookings
    .filter((b) => b.petId === pet.id && b.status !== 'cancelled')
    .sort((a, b) => b.dayOffset - a.dayOffset)
  const next = visits.filter((b) => b.status === 'upcoming').sort((a, b) => a.dayOffset - b.dayOffset)[0]
  const picks = PRODUCTS.filter((p) => p.suits.includes(pet.species) && p.stock > 0)
    .sort((a, b) => b.rating - a.rating)
    .map((p) => p.id)
  const log = pet.weightLog ?? [{ daysAgo: 0, kg: pet.weightKg }]
  const first = [...log].sort((a, b) => b.daysAgo - a.daysAgo)[0]
  const delta = pet.weightKg - first.kg

  return (
    <div className="page">
      <Crumbs items={[{ label: 'Account', to: '/profile' }, { label: 'Pets', to: '/pets' }, { label: pet.name }]} />

      <header className="pet-hero rise" style={{ '--i': 0 } as React.CSSProperties}>
        <span className={`pet-hero__ava pet-card__ava--${pet.species}`} aria-hidden>
          <PetGlyph species={pet.species} size={34} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 className="page-title">{pet.name}</h1>
          <p className="muted">
            {pet.breed} · {speciesInfo(pet.species).one}
            {pet.sex ? ` · ${pet.sex === 'female' ? 'Female' : 'Male'}` : ''}
            {pet.neutered ? ` · ${pet.sex === 'female' ? 'Spayed' : 'Neutered'}` : ''}
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={() => setEditOpen(true)} aria-label={`Edit ${pet.name}`}>
          <Pencil size={16} strokeWidth={1.75} />
        </button>
      </header>

      <div className="stat-row rise" style={{ '--i': 1 } as React.CSSProperties}>
        <Stat label="Age" value={plural(pet.ageYears, 'yr', 'yrs')} />
        <Stat
          label="Weight"
          value={formatWeight(pet.weightKg)}
          hint={Math.abs(delta) >= (pet.weightKg < 1 ? 0.002 : 0.1) ? `${delta > 0 ? '+' : '−'}${formatWeight(Math.abs(delta))} this year` : 'Steady'}
        />
        <Stat label="Vaccines" value={`${upToDate}/${records.length}`} hint={attention.length ? `${attention.length} need attention` : 'All current'} />
      </div>

      {attention.length > 0 && (
        <section className="band rise" style={{ '--i': 2 } as React.CSSProperties} aria-label="Needs attention">
          <div className="band__row">
            <span className="band__icon">
              <Syringe size={18} strokeWidth={1.75} />
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 className="band__title">
                {attention.length === 1 ? `${attention[0].name} needs booking` : `${attention.length} vaccinations need booking`}
              </h2>
              <p className="band__meta">{attention.map((v) => v.name).join(' · ')}</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-sm)' }}>
            <Link to="/clinics" search={{ service: 'vaccination' }} className="btn btn--primary btn--sm">
              Book vaccination
            </Link>
          </div>
        </section>
      )}

      <div className="detail-grid rise" style={{ '--i': 3 } as React.CSSProperties}>
        <div className="stack">
          <section className="card card--pad">
            <div className="section-head" style={{ marginBottom: 'var(--space-2xs)' }}>
              <h2 className="section-head__title">Vaccinations</h2>
              <button type="button" className="link-btn" onClick={() => setRecordOpen(true)}>
                <Plus size={14} strokeWidth={2} /> Add record
              </button>
            </div>
            {records.length > 0 ? (
              <VaccineTimeline records={records} petName={pet.name} />
            ) : (
              <p className="row__sub" style={{ paddingBlock: 'var(--space-sm)' }}>
                No records yet. Add one from a certificate, or link a clinic to sync them.
              </p>
            )}
          </section>

          <section>
            <div className="section-head">
              <h2 className="section-head__title">Visits</h2>
              <Link to="/clinics" className="section-head__link">
                Book a visit
              </Link>
            </div>
            {visits.length > 0 ? (
              <div className="grid-list">
                {visits.slice(0, 4).map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No visits yet"
                text={`Book ${pet.name}’s first check-up in under a minute.`}
                actionLabel="Find a clinic"
                actionTo="/clinics"
                icon={<CalendarDays size={20} strokeWidth={1.75} />}
                level={3}
                compact
              />
            )}
          </section>
        </div>

        <div className="stack side-col">
          <section className="card card--pad">
            <div className="section-head" style={{ marginBottom: 'var(--space-2xs)' }}>
              <h2 className="section-head__title">Weight</h2>
              <button type="button" className="link-btn" onClick={() => setWeightOpen(true)}>
                <Scale size={14} strokeWidth={2} /> Log weight
              </button>
            </div>
            <WeightTrend log={log} />
          </section>

          <section className="card card--pad">
            <h2 className="section-head__title">Details</h2>
            <dl className="spec-list">
              <div className="spec-list__row">
                <dt>Microchip</dt>
                <dd className="num">{pet.microchip ?? 'Not added'}</dd>
              </div>
              <div className="spec-list__row">
                <dt>Allergies</dt>
                <dd>{pet.allergies ?? 'None noted'}</dd>
              </div>
              <div className="spec-list__row">
                <dt>Next visit</dt>
                <dd>{next ? `in ${plural(next.dayOffset, 'day')}` : 'Nothing booked'}</dd>
              </div>
            </dl>
          </section>

          <button type="button" className="btn btn--quiet btn--danger" style={{ justifySelf: 'start' }} onClick={() => setRemoveOpen(true)}>
            <Trash2 size={14} strokeWidth={1.75} /> Remove {pet.name}
          </button>
        </div>
      </div>

      {picks.length > 0 && (
        <section className="rise" style={{ '--i': 4 } as React.CSSProperties}>
          <div className="section-head">
            <h2 className="section-head__title">Picked for {pet.name}</h2>
            <Link to="/shop" className="section-head__link">
              All supplies
            </Link>
          </div>
          <ProductRail
            ids={picks.slice(0, 8)}
            label={`Picked for ${pet.name}`}
            variantFor={(pid) => {
              const prod = getProduct(pid)
              return prod ? variantForPet(prod, pet) : undefined
            }}
          />
        </section>
      )}

      {guidesFor(pet.species).length > 0 && (
        <section className="rise" style={{ '--i': 5 } as React.CSSProperties}>
          <div className="section-head">
            <h2 className="section-head__title">Guides for {speciesInfo(pet.species).one.toLowerCase()} parents</h2>
            <Link to="/guides" search={{ for: pet.species }} className="section-head__link">
              All guides
            </Link>
          </div>
          <div className="guide-grid">
            {guidesFor(pet.species)
              .slice(0, 3)
              .map((g, i) => (
                <GuideCard key={g.slug} guide={g} i={i} />
              ))}
          </div>
        </section>
      )}

      <EditPetSheet pet={pet} open={editOpen} onClose={() => setEditOpen(false)} />
      <LogWeightSheet pet={pet} open={weightOpen} onClose={() => setWeightOpen(false)} />
      <AddRecordSheet pets={pets} petId={pet.id} open={recordOpen} onClose={() => setRecordOpen(false)} />
      <Sheet
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        title={`Remove ${pet.name}?`}
        footer={
          <div className="btn-pair">
            <button type="button" className="btn btn--ghost" onClick={() => setRemoveOpen(false)}>
              Keep
            </button>
            <button
              type="button"
              className="btn btn--danger-fill"
              onClick={() => {
                setRemoveOpen(false)
                removePet(pet.id)
                navigate({ to: '/pets' })
              }}
            >
              Remove
            </button>
          </div>
        }
      >
        <p className="row__sub" style={{ fontSize: 'var(--text-body)' }}>
          {pet.name}’s profile and {plural(records.length, 'vaccination record')} will be removed from
          this account. Past bookings stay in your history.
        </p>
      </Sheet>
    </div>
  )
}
