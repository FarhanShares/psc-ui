import { useState } from 'react'

import { PetGlyph, Sheet } from './ui'
import { addPet, pushToast } from '../lib/store'

/** shared add-pet flow — used from Home, Health, and Profile */
export function AddPetSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const EMPTY = { name: '', species: 'dog' as 'dog' | 'cat', breed: '', age: '', sex: undefined as 'male' | 'female' | undefined }
  const [draft, setDraft] = useState(EMPTY)

  function submit() {
    const name = draft.name.trim()
    if (!name) return
    addPet({
      name,
      species: draft.species,
      breed: draft.breed.trim() || (draft.species === 'cat' ? 'Domestic cat' : 'Mixed breed'),
      ageYears: draft.age ? Math.max(0, Number(draft.age)) : undefined,
      sex: draft.sex,
    })
    setDraft(EMPTY)
    onClose()
    pushToast(`${name} joined the family`)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add a pet"
      footer={
        <button type="button" className="btn btn--primary btn--block" disabled={!draft.name.trim()} onClick={submit}>
          Add pet
        </button>
      }
    >
      <div className="stack">
        <div className="field">
          <label className="field__label" htmlFor="np-name">Name</label>
          <input
            id="np-name"
            className="input"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Mochi"
            autoFocus
          />
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Species</legend>
          <div className="chips">
            {(['dog', 'cat'] as const).map((s) => (
              <button
                key={s}
                type="button"
                className="chip"
                aria-pressed={draft.species === s}
                onClick={() => setDraft((d) => ({ ...d, species: s }))}
              >
                <PetGlyph species={s} size={14} />
                {s === 'dog' ? 'Dog' : 'Cat'}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="field">
          <label className="field__label" htmlFor="np-breed">Breed</label>
          <input
            id="np-breed"
            className="input"
            value={draft.breed}
            onChange={(e) => setDraft((d) => ({ ...d, breed: e.target.value }))}
            placeholder="Leave blank if unsure"
          />
        </div>
        <div className="two-col">
          <div className="field">
            <label className="field__label" htmlFor="np-age">Age (years)</label>
            <input
              id="np-age"
              className="input"
              type="number"
              inputMode="numeric"
              min={0}
              max={30}
              value={draft.age}
              onChange={(e) => setDraft((d) => ({ ...d, age: e.target.value }))}
              placeholder="1"
            />
          </div>
          <fieldset className="plain-fieldset">
            <legend className="field__label">Sex</legend>
            <div className="segmented">
              {(['female', 'male'] as const).map((sx) => (
                <button
                  key={sx}
                  type="button"
                  aria-pressed={draft.sex === sx}
                  onClick={() => setDraft((d) => ({ ...d, sex: sx }))}
                >
                  {sx === 'female' ? 'Female' : 'Male'}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </Sheet>
  )
}
