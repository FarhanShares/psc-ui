import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Plus, Stethoscope, Store, X } from 'lucide-react'

import { AuthShell } from '../components/auth'
import { SuccessMark } from '../components/blocks'
import { PetGlyph } from '../components/ui'
import { plural } from '../lib/format'
import { seo } from '../lib/seo'
import { addPet, removePet, updateProfile, useAppState } from '../lib/store'
import type { Pet } from '../lib/types'

export const Route = createFileRoute('/welcome')({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof s.redirect === 'string' && s.redirect.startsWith('/') ? s.redirect : undefined,
  }),
  head: () => seo({ title: 'Welcome', path: '/welcome', noindex: true }),
  component: WelcomePage,
})

type Step = 0 | 1 | 2

const TITLES: Record<Step, { title: string; sub: string }> = {
  0: { title: 'Who are we caring for?', sub: 'Add each pet — you can fill in the details later.' },
  1: { title: 'Stay on schedule', sub: 'Choose what we remind you about. Change it any time in your profile.' },
  2: { title: 'You’re all set', sub: 'Here’s a good place to start.' },
}

const BLANK = { name: '', species: 'dog' as Pet['species'], breed: '', age: '', sex: undefined as Pet['sex'] }

function WelcomePage() {
  const { redirect } = Route.useSearch()
  const navigate = useNavigate()
  const { signedIn, profile, pets } = useAppState()
  const [step, setStep] = useState<Step>(0)
  const [draft, setDraft] = useState(BLANK)
  const [nameError, setNameError] = useState('')

  if (!signedIn) {
    return (
      <AuthShell
        title="Create your account first"
        sub="Onboarding sets up your pets and reminders once you have an account."
        foot={
          <>
            Already have one? <Link to="/login">Sign in</Link>
          </>
        }
      >
        <Link to="/signup" className="btn btn--primary btn--block">
          Create free account
        </Link>
      </AuthShell>
    )
  }

  function addDraft() {
    const name = draft.name.trim()
    if (!name) {
      setNameError('Give your pet a name — even a nickname works.')
      return
    }
    addPet({
      name,
      species: draft.species,
      breed: draft.breed.trim() || (draft.species === 'cat' ? 'Domestic cat' : 'Mixed breed'),
      ageYears: draft.age ? Math.max(0, Number(draft.age)) : undefined,
      sex: draft.sex,
    })
    setDraft({ ...BLANK, species: draft.species })
    setNameError('')
  }

  const first = profile.name.split(' ')[0]
  const t = TITLES[step]

  return (
    <AuthShell
      title={step === 0 && first && !first.includes('user') ? `Hi ${first} — ${t.title.charAt(0).toLowerCase()}${t.title.slice(1)}` : t.title}
      sub={t.sub}
      foot={
        step < 2 ? (
          <button type="button" className="link-btn" onClick={() => navigate({ to: redirect ?? '/' })}>
            Skip setup
          </button>
        ) : null
      }
    >
      <ol className="progress-dots" aria-label={`Step ${step + 1} of 3`}>
        {[0, 1, 2].map((i) => (
          <li key={i} className={i <= step ? 'is-on' : undefined} aria-current={i === step ? 'step' : undefined} />
        ))}
      </ol>

      {step === 0 && (
        <div className="stack">
          {pets.length > 0 && (
            <ul className="onb-pets" aria-label="Pets added">
              {pets.map((p) => (
                <li key={p.id} className="card row">
                  <span className={`pet-card__ava pet-card__ava--${p.species}`}>
                    <PetGlyph species={p.species} size={16} />
                  </span>
                  <span className="row__grow">
                    <span className="row__title">{p.name}</span>
                    <span className="row__sub">{p.breed}</span>
                  </span>
                  <button type="button" className="icon-btn icon-btn--bare" aria-label={`Remove ${p.name}`} onClick={() => removePet(p.id)}>
                    <X size={15} strokeWidth={1.75} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form
            className="card card--pad stack"
            onSubmit={(e) => {
              e.preventDefault()
              addDraft()
            }}
            noValidate
          >
            <div className="segmented" role="group" aria-label="Species">
              {(['dog', 'cat'] as const).map((sp) => (
                <button key={sp} type="button" aria-pressed={draft.species === sp} onClick={() => setDraft((d) => ({ ...d, species: sp }))}>
                  <PetGlyph species={sp} size={15} /> {sp === 'dog' ? 'Dog' : 'Cat'}
                </button>
              ))}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ob-name">Name</label>
              <input
                id="ob-name"
                className="input"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder={draft.species === 'cat' ? 'Mochi' : 'Biscuit'}
                aria-invalid={!!nameError || undefined}
                aria-describedby="ob-name-help"
                autoFocus
              />
              <p id="ob-name-help" className={`field__help${nameError ? ' field__help--error' : ''}`} role={nameError ? 'alert' : undefined}>
                {nameError}
              </p>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ob-breed">Breed <span className="muted">(optional)</span></label>
              <input id="ob-breed" className="input" value={draft.breed} onChange={(e) => setDraft((d) => ({ ...d, breed: e.target.value }))} />
            </div>
            <div className="two-col">
              <div className="field">
                <label className="field__label" htmlFor="ob-age">Age (years)</label>
                <input
                  id="ob-age"
                  className="input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={30}
                  value={draft.age}
                  onChange={(e) => setDraft((d) => ({ ...d, age: e.target.value }))}
                />
              </div>
              <fieldset className="plain-fieldset">
                <legend className="field__label">Sex</legend>
                <div className="segmented">
                  {(['female', 'male'] as const).map((sx) => (
                    <button key={sx} type="button" aria-pressed={draft.sex === sx} onClick={() => setDraft((d) => ({ ...d, sex: sx }))}>
                      {sx === 'female' ? 'Female' : 'Male'}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
            <button type="submit" className="btn btn--ghost btn--block">
              <Plus size={15} strokeWidth={2} /> {pets.length ? 'Add another pet' : 'Add pet'}
            </button>
          </form>

          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => {
              // a filled-in form counts — don't make people press "Add" first
              if (draft.name.trim()) addDraft()
              setStep(1)
            }}
          >
            {pets.length || draft.name.trim() ? 'Continue' : 'I’ll add pets later'}
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="stack">
          <div className="card card--pad">
            {(
              [
                ['notifyVaccines', 'Vaccine reminders', 'Two weeks before a due date, and on the day if nothing is booked'],
                ['notifyOrders', 'Order updates', 'When it ships and when it arrives'],
                ['notifyOffers', 'Shop offers', 'Occasional discounts on things your pets use'],
              ] as const
            ).map(([key, title, sub]) => (
              <div key={key} className="switch-row">
                <span className="switch-row__text">
                  <span className="row__title" style={{ fontSize: 'var(--text-body)' }}>{title}</span>
                  <span className="row__sub">{sub}</span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  className="switch"
                  checked={profile[key]}
                  onChange={(e) => updateProfile({ [key]: e.target.checked })}
                  aria-label={title}
                />
              </div>
            ))}
          </div>
          <div className="onb-nav">
            <button type="button" className="btn btn--ghost" onClick={() => setStep(0)}>
              <ArrowLeft size={15} strokeWidth={2} /> Back
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setStep(2)}>
              Finish setup
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="stack" style={{ textAlign: 'center' }}>
          <SuccessMark />
          <p className="row__sub" style={{ fontSize: 'var(--text-body)' }}>
            {pets.length ? `${plural(pets.length, 'pet')} added` : 'No pets yet — add them from your profile any time'}
            {profile.notifyVaccines ? ' · vaccine reminders on' : ''}
          </p>
          {redirect ? (
            <button type="button" className="btn btn--primary btn--block" onClick={() => navigate({ to: redirect })}>
              Continue where you left off
            </button>
          ) : (
            <Link to="/" className="btn btn--primary btn--block">
              Go to my home
            </Link>
          )}
          <div className="btn-pair">
            <Link
              to="/shop"
              search={pets.length && pets.every((p) => p.species === pets[0].species) ? { for: pets[0].species } : {}}
              className="btn btn--ghost"
            >
              <Store size={15} strokeWidth={1.75} /> {pets.length ? `Shop for ${pets.length === 1 ? pets[0].name : 'them'}` : 'Browse the shop'}
            </Link>
            <Link to="/clinics" search={{ service: 'checkup' }} className="btn btn--ghost">
              <Stethoscope size={15} strokeWidth={1.75} /> Book a check-up
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  )
}
