import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AlertTriangle, ArrowLeft, CalendarCheck, Clock, Navigation, Phone, RotateCcw, Siren } from 'lucide-react'

import { PetGlyph } from './ui'
import { CLINICS } from '../lib/data'
import type { Species } from '../lib/types'

type Outcome = 'emergency' | 'urgent' | 'routine'

interface Question {
  id: string
  text: string
  hint?: string
  /** answer that triggers the outcome — the wizard stops at the first hit */
  flagOn: 'yes' | 'no'
  outcome: Outcome
  /** why, shown on the result */
  reason: string
  only?: Species
}

/**
 * Ordered most-to-least severe. The first red flag ends the check, so a
 * worried owner answers as few questions as possible before being told to go.
 */
const QUESTIONS: Question[] = [
  {
    id: 'breathing',
    text: 'Is your pet breathing normally?',
    hint: 'No gasping, choking, open-mouth breathing (in cats) or blue-grey gums.',
    flagOn: 'no',
    outcome: 'emergency',
    reason: 'Breathing trouble can become life-threatening within minutes.',
  },
  {
    id: 'collapse',
    text: 'Has your pet collapsed, had a seizure, or can’t stand up?',
    flagOn: 'yes',
    outcome: 'emergency',
    reason: 'Collapse and seizures need a vet straight away.',
  },
  {
    id: 'trauma',
    text: 'Is there heavy bleeding, a possible broken bone, or were they hit by a vehicle?',
    hint: 'Even if they seem fine now — internal injuries aren’t always visible.',
    flagOn: 'yes',
    outcome: 'emergency',
    reason: 'Serious injuries and road accidents always need checking immediately.',
  },
  {
    id: 'toxin',
    text: 'Could they have eaten something toxic?',
    hint: 'Chocolate, grapes or raisins, xylitol, lilies, human medicines, antifreeze, rodent bait.',
    flagOn: 'yes',
    outcome: 'emergency',
    reason: 'Poisoning is treated best before symptoms start. Bring the packaging.',
  },
  {
    id: 'bloat',
    text: 'Is their belly swollen or hard, and are they trying to vomit with nothing coming up?',
    flagOn: 'yes',
    outcome: 'emergency',
    reason: 'These are signs of bloat (GDV), which is fatal without fast surgery.',
    only: 'dog',
  },
  {
    id: 'urine',
    text: 'Is your cat straining in the litter tray with little or no urine?',
    hint: 'Especially important in male cats.',
    flagOn: 'yes',
    outcome: 'emergency',
    reason: 'A blocked bladder can become fatal within a day.',
    only: 'cat',
  },
  {
    id: 'gi',
    text: 'Vomiting or diarrhoea more than twice today, or any blood in it?',
    flagOn: 'yes',
    outcome: 'urgent',
    reason: 'Repeated vomiting or diarrhoea can dehydrate a pet quickly.',
  },
  {
    id: 'eating',
    text: 'Have they stopped eating for more than a day, or are they unusually flat and lethargic?',
    flagOn: 'yes',
    outcome: 'urgent',
    reason: 'Not eating and low energy are worth a same-day check — cats especially shouldn’t go without food.',
  },
  {
    id: 'pain',
    text: 'Are they limping badly, crying out when touched, or pawing at an eye?',
    flagOn: 'yes',
    outcome: 'urgent',
    reason: 'Pain and eye problems are best seen today.',
  },
]

const OUTCOMES: Record<Outcome, { title: string; text: string; icon: typeof Siren }> = {
  emergency: {
    title: 'Go to a vet now',
    text: 'Call on the way so the team can get ready. Keep your pet warm and still.',
    icon: Siren,
  },
  urgent: {
    title: 'See a vet today',
    text: 'It’s probably not a race, but don’t wait for tomorrow. Book a same-day consultation or call a clinic that’s open now.',
    icon: Clock,
  },
  routine: {
    title: 'Book a routine visit',
    text: 'Nothing you’ve described needs emergency care. Keep an eye on them and book a check-up — and start this again if anything changes.',
    icon: CalendarCheck,
  },
}

export function TriageWizard() {
  const [species, setSpecies] = useState<Species | null>(null)
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<{ outcome: Outcome; reason?: string } | null>(null)

  const questions = QUESTIONS.filter((q) => !q.only || q.only === species)
  const q = questions[step]
  const er = CLINICS.find((c) => c.hours.includes('24'))
  const openNow = CLINICS.filter((c) => c.openNow).sort((a, b) => a.distanceKm - b.distanceKm)[0]

  function answer(a: 'yes' | 'no') {
    if (a === q.flagOn) {
      setResult({ outcome: q.outcome, reason: q.reason })
      return
    }
    if (step + 1 >= questions.length) setResult({ outcome: 'routine' })
    else setStep(step + 1)
  }

  function restart() {
    setSpecies(null)
    setStep(0)
    setResult(null)
  }

  return (
    <section id="check" className={`triage card${result ? ` triage--${result.outcome}` : ''}`} aria-labelledby="triage-h" aria-live="polite">
      <div className="triage__head">
        <h2 id="triage-h" className="section-head__title">Not sure? Quick check</h2>
        {species && !result && (
          <span className="mono-label">
            {step + 1} / {questions.length}
          </span>
        )}
      </div>

      {species && !result && (
        <div className="triage__progress" aria-hidden>
          <span style={{ width: `${(step / questions.length) * 100}%` }} />
        </div>
      )}

      {!species && (
        <div className="stack">
          <p className="row__sub" style={{ fontSize: 'var(--text-body)' }}>
            A few yes/no questions, most urgent first. It stops as soon as something needs a vet.
          </p>
          <div className="btn-pair">
            {(['dog', 'cat'] as const).map((sp) => (
              <button key={sp} type="button" className="btn btn--ghost triage__pick" onClick={() => setSpecies(sp)}>
                <PetGlyph species={sp} size={18} /> {sp === 'dog' ? 'My dog' : 'My cat'}
              </button>
            ))}
          </div>
        </div>
      )}

      {species && !result && q && (
        <div className="stack" key={q.id}>
          <p className="triage__q">{q.text}</p>
          {q.hint && <p className="row__sub">{q.hint}</p>}
          <div className="btn-pair">
            <button type="button" className="btn btn--ghost triage__answer" onClick={() => answer('yes')}>
              Yes
            </button>
            <button type="button" className="btn btn--ghost triage__answer" onClick={() => answer('no')}>
              No
            </button>
          </div>
          <div className="split">
            <button
              type="button"
              className="link-btn"
              onClick={() => (step === 0 ? setSpecies(null) : setStep(step - 1))}
            >
              <ArrowLeft size={13} strokeWidth={2} /> Back
            </button>
            <button type="button" className="link-btn" onClick={() => setResult({ outcome: q.outcome, reason: 'You weren’t sure — when in doubt, a vet would rather see your pet.' })}>
              Not sure? Play it safe
            </button>
          </div>
        </div>
      )}

      {result && (
        <Result outcome={result.outcome} reason={result.reason} erPhone={er?.phone} erName={er?.name} erQuery={er ? `${er.name} ${er.area}` : ''} openNow={openNow} restart={restart} />
      )}

      <p className="triage__note">
        <AlertTriangle size={13} strokeWidth={1.75} aria-hidden /> A guide, not a diagnosis. If your instinct says go, go.
      </p>
    </section>
  )
}

function Result({
  outcome,
  reason,
  erPhone,
  erName,
  erQuery,
  openNow,
  restart,
}: {
  outcome: Outcome
  reason?: string
  erPhone?: string
  erName?: string
  erQuery: string
  openNow?: (typeof CLINICS)[number]
  restart: () => void
}) {
  const o = OUTCOMES[outcome]
  return (
    <div className="stack triage__result">
      <div className="triage__verdict">
        <span className="triage__icon" aria-hidden>
          <o.icon size={22} strokeWidth={1.75} />
        </span>
        <div>
          <p className="triage__title">{o.title}</p>
          {reason && <p className="row__sub" style={{ fontSize: 'var(--text-body)' }}>{reason}</p>}
        </div>
      </div>
      <p className="row__sub" style={{ fontSize: 'var(--text-body)' }}>
        {o.text}
        {outcome === 'emergency' && erName ? ` Nearest 24-hour hospital: ${erName}.` : ''}
      </p>

      {outcome === 'emergency' && erPhone && (
        <div className="btn-pair">
          <a href={`tel:${erPhone.replace(/\D/g, '')}`} className="btn btn--sos">
            <Phone size={16} strokeWidth={2} /> Call {erPhone}
          </a>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(erQuery)}`} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
            <Navigation size={16} strokeWidth={1.75} /> Directions
          </a>
        </div>
      )}
      {outcome === 'urgent' && (
        <div className="btn-pair">
          <Link to="/clinics" search={{ service: 'consultation' }} className="btn btn--primary">
            Book a same-day visit
          </Link>
          {openNow && (
            <a href={`tel:${openNow.phone.replace(/\D/g, '')}`} className="btn btn--ghost">
              <Phone size={15} strokeWidth={1.75} /> Call a clinic
            </a>
          )}
        </div>
      )}
      {outcome === 'routine' && (
        <div className="btn-pair">
          <Link to="/clinics" search={{ service: 'checkup' }} className="btn btn--primary">
            Book a check-up
          </Link>
          <Link to="/guides" className="btn btn--ghost">
            Care guides
          </Link>
        </div>
      )}

      <button type="button" className="link-btn" style={{ justifySelf: 'start' }} onClick={restart}>
        <RotateCcw size={13} strokeWidth={2} /> Start again
      </button>
    </div>
  )
}
