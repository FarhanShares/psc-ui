import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, Plus, RefreshCw } from 'lucide-react'

import { AddPetSheet } from '../components/add-pet'
import { AddRecordSheet } from '../components/pet-sheets'
import { VaccineRow } from '../components/cards'
import { PetGlyph } from '../components/ui'
import { pushToast, syncClinicRecords, useAppState } from '../lib/store'
import { seo } from '../lib/seo'

export const Route = createFileRoute('/health')({
  head: () => seo({ title: 'Health', path: '/health', noindex: true }),
  component: HealthPage,
})

function HealthPage() {
  const { pets, vaccines, lastSyncLabel } = useAppState()
  const [petId, setPetId] = useState(pets[0]?.id ?? '')
  const [syncing, setSyncing] = useState(false)
  const [addPetOpen, setAddPetOpen] = useState(false)
  const [recordOpen, setRecordOpen] = useState(false)

  const pet = pets.find((p) => p.id === petId) ?? pets[0]
  const petVaccines = vaccines
    .filter((v) => v.petId === pet?.id)
    .sort((a, b) => a.dueInDays - b.dueInDays)
  // records only count when their pet still exists
  const liveVaccines = vaccines.filter((v) => pets.some((p) => p.id === v.petId))
  const needsCount = liveVaccines.filter((v) => v.status === 'overdue' || v.status === 'due').length

  function handleSync() {
    if (syncing) return
    setSyncing(true)
    window.setTimeout(() => {
      syncClinicRecords()
      setSyncing(false)
      pushToast('Clinic records up to date')
    }, 1200)
  }

  if (!pet) {
    return (
      <div className="page">
        <h1 className="page-title">Health</h1>
        <p className="muted">Add a pet to start tracking vaccinations and clinic visits.</p>
        <div style={{ display: 'flex', gap: 'var(--space-2xs)', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn--primary" onClick={() => setAddPetOpen(true)}>
            Add a pet
          </button>
          <Link to="/shop" className="btn btn--ghost">Browse shop</Link>
        </div>
        <AddPetSheet open={addPetOpen} onClose={() => setAddPetOpen(false)} />
      </div>
    )
  }

  return (
    <div className="page">
      <header className="rise" style={{ '--i': 0 } as React.CSSProperties}>
        <h1 className="page-title">Health</h1>
        <p className="muted" style={{ fontSize: 'var(--text-sm)', marginTop: 2 }}>
          {needsCount > 0
            ? `${needsCount} vaccination${needsCount === 1 ? '' : 's'} need attention.`
            : 'Every vaccination is up to date.'}
        </p>
      </header>

      <div className="chips rise" style={{ '--i': 1 } as React.CSSProperties} role="tablist" aria-label="Choose pet">
        {pets.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pet.id === p.id}
            aria-pressed={pet.id === p.id}
            className="chip"
            onClick={() => setPetId(p.id)}
          >
            <PetGlyph species={p.species} size={14} />
            {p.name}
          </button>
        ))}
      </div>

      <div className="detail-grid rise" style={{ '--i': 2, alignItems: 'start' } as React.CSSProperties}>
        <section className="card card--pad">
          <div className="section-head" style={{ marginBottom: 'var(--space-3xs)' }}>
            <Link to="/pets/$id" params={{ id: pet.id }} className="section-head__title pet-link">
              {pet.name} <ChevronRight size={15} strokeWidth={2} aria-hidden />
            </Link>
            <button type="button" className="link-btn" onClick={() => setRecordOpen(true)}>
              <Plus size={14} strokeWidth={2} /> Add record
            </button>
          </div>
          <p className="row__sub" style={{ marginBottom: 'var(--space-2xs)' }}>
            {pet.breed} · {pet.ageYears} yr · {pet.weightKg.toFixed(1)} kg
          </p>
          {petVaccines.length === 0 && (
            <p className="row__sub" style={{ paddingBlock: 'var(--space-sm)' }}>
              No records for {pet.name} yet — add one from a certificate or the pet passport.
            </p>
          )}
          {petVaccines.map((v) => (
            <div key={v.id}>
              <VaccineRow vax={v} showPet={false} />
              {(v.status === 'overdue' || v.status === 'due') && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBlock: 'var(--space-2xs)' }}>
                  <Link
                    to="/clinics"
                    search={{ service: 'vaccination' }}
                    className="btn btn--primary btn--sm"
                  >
                    Book {v.name.toLowerCase()}
                  </Link>
                </div>
              )}
            </div>
          ))}
        </section>

        <div className="stack side-col">
          <section className="card card--pad">
            <div className="split">
              <span className="thead">
                <span className="sync-dot" data-busy={syncing || undefined} aria-hidden />
                <span className="tag">Clinic sync</span>
              </span>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={handleSync}
                disabled={syncing}
              >
                <RefreshCw size={14} strokeWidth={1.75} />
                {syncing ? 'Syncing…' : 'Sync now'}
              </button>
            </div>
            <p className="row__title" style={{ marginTop: 'var(--space-2xs)' }}>
              Green Valley Veterinary
            </p>
            <p className="row__sub">
              Last synced {lastSyncLabel} · {liveVaccines.length} records linked to your pets
            </p>
          </section>

          <section className="card card--pad">
            <span className="tag">How sync works</span>
            <p className="row__sub" style={{ marginTop: 'var(--space-2xs)' }}>
              Vaccination records flow from your linked clinic into this page. A visit booked
              through PetSafeCare updates the matching vaccine to “Booked” automatically.
            </p>
          </section>
        </div>
      </div>
      <AddRecordSheet pets={pets} petId={pet.id} open={recordOpen} onClose={() => setRecordOpen(false)} />
    </div>
  )
}
