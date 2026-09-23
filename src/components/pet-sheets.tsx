import { useEffect, useState } from 'react'

import { Sheet } from './ui'
import { addVaccineRecord, logWeight, pushToast, updatePet } from '../lib/store'
import type { Pet } from '../lib/types'

/* ------------------------------------------------------------- edit pet */

export function EditPetSheet({ pet, open, onClose }: { pet: Pet; open: boolean; onClose: () => void }) {
  const [draft, setDraft] = useState(pet)

  useEffect(() => {
    if (open) setDraft(pet)
  }, [open, pet])

  const set = <K extends keyof Pet>(k: K, v: Pet[K]) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Edit ${pet.name}`}
      footer={
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!draft.name.trim()}
          onClick={() => {
            updatePet(pet.id, {
              name: draft.name.trim(),
              breed: draft.breed.trim() || pet.breed,
              ageYears: Math.max(0, draft.ageYears || 0),
              sex: draft.sex,
              neutered: draft.neutered,
              microchip: draft.microchip?.trim() || undefined,
              allergies: draft.allergies?.trim() || undefined,
            })
            onClose()
            pushToast('Pet details saved')
          }}
        >
          Save changes
        </button>
      }
    >
      <div className="stack">
        <div className="field">
          <label className="field__label" htmlFor="ep-name">Name</label>
          <input id="ep-name" className="input" value={draft.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="ep-breed">Breed</label>
          <input id="ep-breed" className="input" value={draft.breed} onChange={(e) => set('breed', e.target.value)} />
        </div>
        <div className="two-col">
          <div className="field">
            <label className="field__label" htmlFor="ep-age">Age (years)</label>
            <input
              id="ep-age"
              className="input"
              type="number"
              inputMode="numeric"
              min={0}
              max={30}
              value={draft.ageYears}
              onChange={(e) => set('ageYears', Number(e.target.value))}
            />
          </div>
          <fieldset className="plain-fieldset">
            <legend className="field__label">Sex</legend>
            <div className="segmented">
              {(['female', 'male'] as const).map((s) => (
                <button key={s} type="button" aria-pressed={draft.sex === s} onClick={() => set('sex', s)}>
                  {s === 'female' ? 'Female' : 'Male'}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="switch-row">
          <span className="switch-row__text">
            <span className="row__title" style={{ fontSize: 'var(--text-body)' }}>Neutered / spayed</span>
          </span>
          <input
            type="checkbox"
            role="switch"
            className="switch"
            checked={!!draft.neutered}
            onChange={(e) => set('neutered', e.target.checked)}
            aria-label="Neutered or spayed"
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="ep-chip">Microchip number</label>
          <input
            id="ep-chip"
            className="input num"
            inputMode="numeric"
            value={draft.microchip ?? ''}
            onChange={(e) => set('microchip', e.target.value)}
            placeholder="15 digits, on the vet card"
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="ep-allergy">Allergies or conditions</label>
          <input
            id="ep-allergy"
            className="input"
            value={draft.allergies ?? ''}
            onChange={(e) => set('allergies', e.target.value)}
            placeholder="Shared with clinics when you book"
          />
        </div>
      </div>
    </Sheet>
  )
}

/* ----------------------------------------------------------- log weight */

export function LogWeightSheet({ pet, open, onClose }: { pet: Pet; open: boolean; onClose: () => void }) {
  const [kg, setKg] = useState(String(pet.weightKg))

  useEffect(() => {
    if (open) setKg(String(pet.weightKg))
  }, [open, pet.weightKg])

  const value = Number(kg)
  const valid = Number.isFinite(value) && value > 0 && value < 120

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Log ${pet.name}’s weight`}
      footer={
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!valid}
          onClick={() => {
            logWeight(pet.id, Math.round(value * 10) / 10)
            onClose()
            pushToast(`${pet.name}: ${value.toFixed(1)} kg logged`)
          }}
        >
          Save weight
        </button>
      }
    >
      <div className="field">
        <label className="field__label" htmlFor="lw-kg">Weight today (kg)</label>
        <input
          id="lw-kg"
          className="input input--big num"
          type="number"
          inputMode="decimal"
          step="0.1"
          min={0}
          value={kg}
          onChange={(e) => setKg(e.target.value)}
          autoFocus
        />
        <p className="field__help">Weigh at the same time of day for a fair trend — before breakfast works well.</p>
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------ vaccine records */

const DUE_OPTIONS = [
  { id: '365', label: 'In a year', days: 365 },
  { id: '180', label: 'In 6 months', days: 180 },
  { id: '30', label: 'Within a month', days: 21 },
  { id: 'past', label: 'Already overdue', days: -3 },
]

export function AddRecordSheet({
  pets,
  petId,
  open,
  onClose,
}: {
  pets: Pet[]
  petId: string
  open: boolean
  onClose: () => void
}) {
  const [draft, setDraft] = useState({ petId, name: '', shieldsAgainst: '', due: '365', source: '' })

  useEffect(() => {
    if (open) setDraft({ petId, name: '', shieldsAgainst: '', due: '365', source: '' })
  }, [open, petId])

  const pet = pets.find((p) => p.id === draft.petId)
  const suggestions =
    pet?.species === 'cat'
      ? ['Rabies', 'FVRCP booster', 'FeLV']
      : ['Rabies', 'DHPP booster', 'Leptospirosis', 'Bordetella']

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add a vaccination record"
      footer={
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!draft.name.trim() || !pet}
          onClick={() => {
            addVaccineRecord({
              petId: draft.petId,
              name: draft.name.trim(),
              shieldsAgainst: draft.shieldsAgainst.trim() || 'Recorded by you',
              dueInDays: DUE_OPTIONS.find((d) => d.id === draft.due)?.days ?? 365,
              source: draft.source.trim() || 'Added manually',
            })
            onClose()
            pushToast(`${draft.name.trim()} added for ${pet?.name}`)
          }}
        >
          Save record
        </button>
      }
    >
      <div className="stack">
        {pets.length > 1 && (
          <fieldset className="plain-fieldset">
            <legend className="tag">Pet</legend>
            <div className="chips">
              {pets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="chip"
                  aria-pressed={draft.petId === p.id}
                  onClick={() => setDraft((d) => ({ ...d, petId: p.id }))}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <div className="field">
          <label className="field__label" htmlFor="ar-name">Vaccine</label>
          <input
            id="ar-name"
            className="input"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="As written on the certificate"
            list="ar-suggest"
          />
          <datalist id="ar-suggest">
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="ar-against">Protects against <span className="muted">(optional)</span></label>
          <input
            id="ar-against"
            className="input"
            value={draft.shieldsAgainst}
            onChange={(e) => setDraft((d) => ({ ...d, shieldsAgainst: e.target.value }))}
          />
        </div>
        <fieldset className="plain-fieldset">
          <legend className="tag">Next due</legend>
          <div className="chips">
            {DUE_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                className="chip"
                aria-pressed={draft.due === o.id}
                onClick={() => setDraft((d) => ({ ...d, due: o.id }))}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="field">
          <label className="field__label" htmlFor="ar-src">Given at <span className="muted">(optional)</span></label>
          <input
            id="ar-src"
            className="input"
            value={draft.source}
            onChange={(e) => setDraft((d) => ({ ...d, source: e.target.value }))}
            placeholder="Clinic name"
          />
        </div>
      </div>
    </Sheet>
  )
}

/* -------------------------------------------------------- weight trend */

/** single-series sparkline — one hue, 2px line, 8px markers with native tooltips */
export function WeightTrend({ log, unit = 'kg' }: { log: { daysAgo: number; kg: number }[]; unit?: string }) {
  if (log.length < 2) {
    return <p className="row__sub">Log a second weight to see the trend.</p>
  }
  const pts = [...log].sort((a, b) => b.daysAgo - a.daysAgo)
  const W = 320
  const H = 88
  const pad = 10
  const minX = pts[pts.length - 1].daysAgo
  const maxX = pts[0].daysAgo
  const kgs = pts.map((p) => p.kg)
  const lo = Math.min(...kgs)
  const hi = Math.max(...kgs)
  const span = hi - lo || 1
  const x = (d: number) => pad + ((maxX - d) / (maxX - minX || 1)) * (W - pad * 2)
  const y = (kg: number) => H - pad - ((kg - lo) / span) * (H - pad * 2)
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.daysAgo).toFixed(1)},${y(p.kg).toFixed(1)}`).join(' ')

  return (
    <figure className="trend">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Weight from ${pts[0].kg} to ${pts[pts.length - 1].kg} ${unit}`}>
        <line x1={pad} x2={W - pad} y1={H - pad} y2={H - pad} className="trend__base" />
        <path d={path} className="trend__line" />
        {pts.map((p) => (
          <g key={p.daysAgo} className="trend__pt">
            <circle cx={x(p.daysAgo)} cy={y(p.kg)} r={12} className="trend__hit" />
            <circle cx={x(p.daysAgo)} cy={y(p.kg)} r={4} className="trend__dot" />
            <title>{`${p.kg.toFixed(1)} ${unit} · ${p.daysAgo === 0 ? 'today' : `${p.daysAgo} days ago`}`}</title>
          </g>
        ))}
      </svg>
      <figcaption className="split mono-label">
        <span>
          {pts[0].kg.toFixed(1)} {unit} · {pts[0].daysAgo === 0 ? 'today' : `${Math.round(pts[0].daysAgo / 30)} mo ago`}
        </span>
        <span>
          {pts[pts.length - 1].kg.toFixed(1)} {unit} · {pts[pts.length - 1].daysAgo === 0 ? 'today' : `${pts[pts.length - 1].daysAgo} d ago`}
        </span>
      </figcaption>
    </figure>
  )
}
