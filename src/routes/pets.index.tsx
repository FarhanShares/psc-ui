import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, PawPrint, Plus } from 'lucide-react'

import { AddPetSheet } from '../components/add-pet'
import { Crumbs } from '../components/blocks'
import { EmptyState, PetGlyph, Pill } from '../components/ui'
import { plural } from '../lib/format'
import { seo } from '../lib/seo'
import { useAppState } from '../lib/store'

export const Route = createFileRoute('/pets/')({
  head: () => seo({ title: 'Your pets', path: '/pets', noindex: true }),
  component: PetsPage,
})

function PetsPage() {
  const { pets, vaccines } = useAppState()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="page">
      <Crumbs items={[{ label: 'Account', to: '/profile' }, { label: 'Pets' }]} />
      <header className="rise split" style={{ '--i': 0, alignItems: 'flex-end' } as React.CSSProperties}>
        <div>
          <h1 className="page-title">Your pets</h1>
          <p className="muted" style={{ fontSize: 'var(--text-sm)', marginTop: 2 }}>
            {pets.length > 0 ? `${plural(pets.length, 'pet')} on this account.` : 'Nobody here yet.'}
          </p>
        </div>
        {pets.length > 0 && (
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setAddOpen(true)}>
            <Plus size={15} strokeWidth={2} /> Add pet
          </button>
        )}
      </header>

      {pets.length === 0 ? (
        <EmptyState
          title="Add your first pet"
          text="Vaccination reminders, clinic bookings and the right food — it starts here."
          actionLabel="Add a pet"
          onClick={() => setAddOpen(true)}
          icon={<PawPrint size={20} strokeWidth={1.75} />}
        />
      ) : (
        <div className="history-grid rise" style={{ '--i': 1 } as React.CSSProperties}>
          {pets.map((pet) => {
            const recs = vaccines.filter((v) => v.petId === pet.id)
            const needs = recs.filter((v) => v.status === 'overdue' || v.status === 'due').length
            const overdue = recs.some((v) => v.status === 'overdue')
            return (
              <Link key={pet.id} to="/pets/$id" params={{ id: pet.id }} className="card card--press row">
                <span className={`pet-card__ava pet-card__ava--${pet.species}`} style={{ width: '3rem', height: '3rem' }}>
                  <PetGlyph species={pet.species} size={20} />
                </span>
                <span className="row__grow">
                  <span className="row__title" style={{ fontSize: 'var(--text-md)' }}>{pet.name}</span>
                  <span className="row__sub">
                    {pet.breed} · {plural(pet.ageYears, 'yr')} · {pet.weightKg.toFixed(1)} kg
                  </span>
                </span>
                {needs > 0 ? (
                  <Pill tone={overdue ? 'bad' : 'warn'}>{needs} due</Pill>
                ) : recs.length > 0 ? (
                  <Pill tone="ok">Up to date</Pill>
                ) : null}
                <ChevronRight size={16} strokeWidth={1.75} className="muted" aria-hidden />
              </Link>
            )
          })}
        </div>
      )}

      <AddPetSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
