import { Link, useNavigate } from '@tanstack/react-router'
import {
  BadgeCheck,
  BellRing,
  ChevronRight,
  HeartPulse,
  PawPrint,
  Siren,
  Stethoscope,
  Store,
  Truck,
} from 'lucide-react'

import { ClinicCard } from './cards'
import { GuideCard } from './guide-card'
import { ProductRail } from './product-rail'
import { CategoryIcon, PetGlyph, ServiceIcon, tileClass } from './ui'
import { CATEGORIES, CLINICS, FREE_DELIVERY_THRESHOLD, PRODUCTS, SERVICE_TYPES } from '../lib/data'
import { money } from '../lib/format'
import { GUIDES } from '../lib/guides'
import { signInDemo } from '../lib/store'
import type { ProductCategory, ServiceType } from '../lib/types'

const QUICK = [
  { to: '/clinics', label: 'Book a vet', icon: Stethoscope },
  { to: '/shop', label: 'Shop', icon: Store },
  { to: '/health', label: 'Vaccines', icon: HeartPulse },
  { to: '/emergency', label: 'Emergency', icon: Siren },
] as const

const STEPS = [
  {
    icon: PawPrint,
    title: 'Add your pets',
    text: 'Species, breed, age and weight — thirty seconds each. Allergies are shared with clinics when you book.',
  },
  {
    icon: BellRing,
    title: 'Get reminded, not nagged',
    text: 'Vaccination records sync from your clinic, and we nudge you two weeks before anything is due.',
  },
  {
    icon: Stethoscope,
    title: 'Book and restock in a tap',
    text: 'Verified clinics with live slots, and the everyday supplies your pets actually go through.',
  },
]

/**
 * What signed-out visitors (and crawlers — the server renders a guest) see on
 * `/`: what the app does, the catalogue and clinics, and one tap into it.
 */
export function Landing({ recentlyViewed }: { recentlyViewed: string[] }) {
  const navigate = useNavigate()
  const popular = [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 10).map((p) => p.id)
  const clinics = [...CLINICS]
    .sort((a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating)
    .slice(0, 3)
  const counts = new Map<string, number>()
  for (const p of PRODUCTS) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)

  return (
    <div className="page landing" data-guest-view>
      <header className="landing-hero rise">
        <p className="tag" style={{ color: 'var(--color-accent-deep)' }}>For dog and cat parents</p>
        <h1 className="home-title">Supplies, vet visits and vaccine reminders — in one app.</h1>
        <p className="lede">
          Reorder the food, book the booster, and stop keeping vaccination dates in your head. Free to use.
        </p>
        <div className="landing-hero__cta">
          <Link to="/signup" className="btn btn--primary">Create free account</Link>
          <Link to="/shop" className="btn btn--ghost">Browse the shop</Link>
        </div>
        <button
          type="button"
          className="link-btn"
          onClick={() => {
            signInDemo()
            navigate({ to: '/' })
          }}
        >
          Or look around the demo account <ChevronRight size={13} strokeWidth={2} aria-hidden />
        </button>
        <ul className="value-strip" aria-label="Why PetSafeCare">
          <li>
            <Truck size={15} strokeWidth={1.75} aria-hidden />
            Free delivery over {money(FREE_DELIVERY_THRESHOLD)}
          </li>
          <li>
            <BadgeCheck size={15} strokeWidth={1.75} aria-hidden />
            {CLINICS.filter((c) => c.verified).length} verified clinics
          </li>
          <li>
            <BellRing size={15} strokeWidth={1.75} aria-hidden />
            Reminders two weeks ahead
          </li>
        </ul>
      </header>

      <nav className="quick-grid rise" style={{ '--i': 1 } as React.CSSProperties} aria-label="Quick actions">
        {QUICK.map((q) => (
          <Link key={q.to} to={q.to} className={`quick${q.to === '/emergency' ? ' quick--sos' : ''}`}>
            <span className="quick__icon" aria-hidden>
              <q.icon size={20} strokeWidth={1.75} />
            </span>
            {q.label}
          </Link>
        ))}
      </nav>

      {recentlyViewed.length > 0 && (
        <section className="rise" style={{ '--i': 2 } as React.CSSProperties}>
          <div className="section-head">
            <h2 className="section-head__title">Recently viewed</h2>
          </div>
          <ProductRail ids={recentlyViewed} label="Recently viewed" />
        </section>
      )}

      <section className="rise" style={{ '--i': 2 } as React.CSSProperties} aria-labelledby="l-cats">
        <h2 id="l-cats" className="section-head__title section-head">Shop by category</h2>
        <div className="chips" style={{ marginBottom: 'var(--space-sm)' }}>
          <Link to="/shop" search={{ for: 'dog' }} className="chip">
            <PetGlyph species="dog" size={14} /> Everything for dogs
          </Link>
          <Link to="/shop" search={{ for: 'cat' }} className="chip">
            <PetGlyph species="cat" size={14} /> Everything for cats
          </Link>
          <Link to="/shop" search={{ for: 'bird' }} className="chip">
            <PetGlyph species="bird" size={14} /> Everything for birds
          </Link>
        </div>
        <div className="cat-grid">
          {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
            <Link key={c.id} to="/shop" search={{ cat: c.id }} className={`cat-tile ${tileClass(c.id as ProductCategory)}`}>
              <CategoryIcon category={c.id as ProductCategory} size={22} />
              <span>
                {c.label}
                <span className="cat-tile__count num">{counts.get(c.id) ?? 0} items</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rise" style={{ '--i': 3 } as React.CSSProperties}>
        <div className="section-head">
          <h2 className="section-head__title">Popular right now</h2>
          <Link to="/shop" className="section-head__link">
            All supplies <ChevronRight size={13} strokeWidth={2} />
          </Link>
        </div>
        <ProductRail ids={popular} label="Popular products" />
      </section>

      <section className="rise" style={{ '--i': 4 } as React.CSSProperties}>
        <div className="section-head">
          <h2 className="section-head__title">Vet clinics near you</h2>
          <Link to="/clinics" className="section-head__link">
            All {CLINICS.length} clinics <ChevronRight size={13} strokeWidth={2} />
          </Link>
        </div>
        <div className="chips" style={{ marginBottom: 'var(--space-sm)' }}>
          {SERVICE_TYPES.map((s) => (
            <Link key={s.id} to="/clinics" search={{ service: s.id }} className="chip">
              <ServiceIcon type={s.id as ServiceType} size={14} /> {s.label}
            </Link>
          ))}
        </div>
        <div className="clinic-grid">
          {clinics.map((c) => (
            <ClinicCard key={c.id} id={c.id} />
          ))}
        </div>
      </section>

      <section className="rise" style={{ '--i': 5 } as React.CSSProperties} aria-labelledby="l-how">
        <h2 id="l-how" className="section-head__title section-head">How it works</h2>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card card--pad step">
              <span className="step__num num" aria-hidden>{i + 1}</span>
              <s.icon size={20} strokeWidth={1.75} className="step__icon" aria-hidden />
              <h3 className="row__title" style={{ fontSize: 'var(--text-md)' }}>{s.title}</h3>
              <p className="row__sub" style={{ fontSize: 'var(--text-body)' }}>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rise" style={{ '--i': 6 } as React.CSSProperties}>
        <div className="section-head">
          <h2 className="section-head__title">Care guides</h2>
          <Link to="/guides" className="section-head__link">
            All {GUIDES.length} guides <ChevronRight size={13} strokeWidth={2} />
          </Link>
        </div>
        <div className="guide-grid">
          {GUIDES.slice(0, 3).map((g, i) => (
            <GuideCard key={g.slug} guide={g} i={i} />
          ))}
        </div>
      </section>

      <Link to="/emergency" className="emergency-strip rise" style={{ '--i': 6 } as React.CSSProperties}>
        <Siren size={18} strokeWidth={1.75} aria-hidden />
        <span className="row__grow">
          <span className="row__title">Pet emergency?</span>
          <span className="row__sub">Signs to watch for and the nearest 24-hour clinic — no account needed</span>
        </span>
        <ChevronRight size={16} strokeWidth={1.75} aria-hidden />
      </Link>

      <section className="band split rise" style={{ '--i': 7, flexWrap: 'wrap' } as React.CSSProperties}>
        <div style={{ minWidth: 0 }}>
          <h2 className="band__title">Set up in a minute</h2>
          <p className="band__meta">Add your pets and let the reminders do the remembering.</p>
        </div>
        <Link to="/signup" className="btn btn--primary">Create free account</Link>
      </section>
    </div>
  )
}
