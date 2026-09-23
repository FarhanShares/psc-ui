import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertTriangle, Clock, MapPin, Navigation, Phone } from 'lucide-react'

import { Crumbs } from '../components/blocks'
import { CLINICS, EMERGENCY_SIGNS } from '../lib/data'
import { breadcrumbLd, seo } from '../lib/seo'

export const Route = createFileRoute('/emergency')({
  head: () =>
    seo({
      title: 'Pet emergency — what to do now',
      description:
        'Signs your dog or cat needs emergency care, what to do on the way, and the nearest 24-hour veterinary hospital.',
      path: '/emergency',
      jsonLd: breadcrumbLd([['Home', '/'], ['Emergency', '/emergency']]),
    }),
  component: EmergencyPage,
})

const STEPS = [
  'Call ahead so the team can prepare — it saves minutes on arrival.',
  'Keep your pet warm and as still as possible; use a towel or board as a stretcher.',
  'Bring any packaging if they swallowed something.',
  'Don’t give human medicines or induce vomiting unless a vet tells you to.',
]

function EmergencyPage() {
  const open24 = CLINICS.filter((c) => c.hours.includes('24'))
  const openNow = CLINICS.filter((c) => c.openNow && !c.hours.includes('24'))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 3)
  const primary = open24[0]

  return (
    <div className="page">
      <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Emergency' }]} />
      <header className="rise" style={{ '--i': 0 } as React.CSSProperties}>
        <p className="tag" style={{ color: 'var(--color-bad)' }}>Emergency</p>
        <h1 className="page-title">If you’re worried, call now.</h1>
        <p className="muted" style={{ marginTop: 2 }}>
          It is always OK to ring a vet and ask. They would rather see a false alarm than a late arrival.
        </p>
      </header>

      {primary && (
        <section className="sos-card rise" style={{ '--i': 1 } as React.CSSProperties} aria-label="Nearest 24-hour clinic">
          <div>
            <span className="tag">Nearest 24-hour hospital</span>
            <h2 className="band__title">{primary.name}</h2>
            <p className="band__meta">
              <MapPin size={13} strokeWidth={1.75} aria-hidden style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
              {primary.area} · {primary.distanceKm.toFixed(1)} km · {primary.hours}
            </p>
          </div>
          <div className="btn-pair">
            <a href={`tel:${primary.phone.replace(/\D/g, '')}`} className="btn btn--sos">
              <Phone size={16} strokeWidth={2} /> Call {primary.phone}
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${primary.name} ${primary.area}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost-dark"
            >
              <Navigation size={16} strokeWidth={1.75} /> Directions
            </a>
          </div>
        </section>
      )}

      <div className="detail-grid rise" style={{ '--i': 2 } as React.CSSProperties}>
        <section className="card card--pad">
          <h2 className="section-head__title" style={{ marginBottom: 'var(--space-xs)' }}>
            Go straight to a vet if you see
          </h2>
          <ul className="warn-list">
            {EMERGENCY_SIGNS.map((s) => (
              <li key={s}>
                <AlertTriangle size={15} strokeWidth={1.75} aria-hidden />
                {s}
              </li>
            ))}
          </ul>
        </section>

        <div className="stack side-col">
          <section className="card card--pad">
            <h2 className="section-head__title" style={{ marginBottom: 'var(--space-xs)' }}>On the way</h2>
            <ol className="num-list">
              {STEPS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </section>

          {openNow.length > 0 && (
            <section>
              <h2 className="section-head__title section-head">Open now nearby</h2>
              <div className="grid-list">
                {openNow.map((c) => (
                  <div key={c.id} className="card row">
                    <span className="row__grow">
                      <Link to="/clinics/$id" params={{ id: c.id }} className="row__title">{c.name}</Link>
                      <span className="row__sub">
                        <Clock size={12} strokeWidth={1.75} aria-hidden style={{ display: 'inline', verticalAlign: '-1px' }} />{' '}
                        {c.hours} · {c.distanceKm.toFixed(1)} km
                      </span>
                    </span>
                    <a href={`tel:${c.phone.replace(/\D/g, '')}`} className="icon-btn" aria-label={`Call ${c.name}`}>
                      <Phone size={16} strokeWidth={1.75} />
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <p className="row__sub rise" style={{ '--i': 3 } as React.CSSProperties}>
        This page is general guidance, not a diagnosis. Poison helplines and your own vet remain the best source
        of advice for your pet.
      </p>
    </div>
  )
}
