import { createFileRoute, Link } from '@tanstack/react-router'
import { BadgeCheck, HeartPulse, Truck } from 'lucide-react'

import { Crumbs } from '../components/blocks'
import { CLINICS, FREE_DELIVERY_THRESHOLD, PRODUCTS } from '../lib/data'
import { wholeMoney } from '../lib/format'
import { breadcrumbLd, seo } from '../lib/seo'

export const Route = createFileRoute('/about')({
  head: () =>
    seo({
      title: 'About us',
      description:
        'PetSafeCare brings pet supplies, verified vet clinics and vaccination reminders into one calm app for pet parents.',
      path: '/about',
      type: 'article',
      jsonLd: breadcrumbLd([['Home', '/'], ['About', '/about']]),
    }),
  component: AboutPage,
})

const PILLARS = [
  {
    icon: Truck,
    title: 'Supplies without the guesswork',
    text: `A short, curated catalogue of ${PRODUCTS.length} everyday essentials — no fillers, no mystery brands, free delivery over ${wholeMoney(FREE_DELIVERY_THRESHOLD)}.`,
  },
  {
    icon: BadgeCheck,
    title: 'Clinics we’ve actually checked',
    text: `${CLINICS.filter((c) => c.verified).length} of ${CLINICS.length} listed clinics carry our Verified badge: licence, address and hours confirmed.`,
  },
  {
    icon: HeartPulse,
    title: 'Records that keep themselves',
    text: 'Linked clinics sync vaccination records, and booking a jab marks it as scheduled — no spreadsheet required.',
  },
]

function AboutPage() {
  return (
    <div className="page">
      <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
      <header className="rise prose-head" style={{ '--i': 0 } as React.CSSProperties}>
        <p className="tag">About PetSafeCare</p>
        <h1 className="home-title">For the ones who wait up for you.</h1>
        <p className="lede">
          Pet care is a string of small jobs — reorder the food, book the booster, remember which clinic had the
          nice vet. We put them in one place so you can spend the time on the walk instead.
        </p>
      </header>

      <div className="pillar-grid rise" style={{ '--i': 1 } as React.CSSProperties}>
        {PILLARS.map((p) => (
          <section key={p.title} className="card card--pad">
            <span className="menu-row__icon" aria-hidden><p.icon size={18} strokeWidth={1.75} /></span>
            <h2 className="section-head__title" style={{ marginTop: 'var(--space-sm)' }}>{p.title}</h2>
            <p className="row__sub" style={{ marginTop: 'var(--space-2xs)', fontSize: 'var(--text-body)' }}>{p.text}</p>
          </section>
        ))}
      </div>

      <section className="band split rise" style={{ '--i': 2, flexWrap: 'wrap' } as React.CSSProperties}>
        <div>
          <h2 className="band__title">Ready when you are</h2>
          <p className="band__meta">Add your pets, then let reminders do the remembering.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2xs)', flexWrap: 'wrap' }}>
          <Link to="/signup" className="btn btn--primary">Create an account</Link>
          <Link to="/shop" className="btn btn--ghost-dark">Browse the shop</Link>
        </div>
      </section>
    </div>
  )
}
