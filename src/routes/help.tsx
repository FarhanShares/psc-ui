import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CalendarDays, ChevronDown, HeartPulse, Mail, MessageCircle, Package, Phone, Siren, UserRound } from 'lucide-react'

import { Crumbs, SuccessMark } from '../components/blocks'
import { Sheet } from '../components/ui'
import { FAQS, SUPPORT } from '../lib/data'
import { breadcrumbLd, seo } from '../lib/seo'
import type { Faq } from '../lib/types'

const TOPICS: { id: Faq['topic']; label: string; icon: typeof Package }[] = [
  { id: 'orders', label: 'Orders & delivery', icon: Package },
  { id: 'bookings', label: 'Clinic bookings', icon: CalendarDays },
  { id: 'health', label: 'Health records', icon: HeartPulse },
  { id: 'account', label: 'Account', icon: UserRound },
]

export const Route = createFileRoute('/help')({
  validateSearch: (s: Record<string, unknown>): { topic?: Faq['topic'] } => ({
    topic: TOPICS.some((t) => t.id === s.topic) ? (s.topic as Faq['topic']) : undefined,
  }),
  head: () =>
    seo({
      title: 'Help centre',
      description: 'Answers about PetSafeCare deliveries, returns, clinic bookings and vaccination records — or contact our support team.',
      path: '/help',
      jsonLd: [
        {
          '@type': 'FAQPage',
          mainEntity: FAQS.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        },
        breadcrumbLd([['Home', '/'], ['Help', '/help']]),
      ],
    }),
  component: HelpPage,
})

function HelpPage() {
  const { topic } = Route.useSearch()
  const navigate = Route.useNavigate()
  const [contactOpen, setContactOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [msg, setMsg] = useState({ subject: topic ?? 'orders', body: '' })

  const list = topic ? FAQS.filter((f) => f.topic === topic) : FAQS

  return (
    <div className="page">
      <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Help' }]} />
      <header className="rise" style={{ '--i': 0 } as React.CSSProperties}>
        <h1 className="page-title">How can we help?</h1>
        <p className="muted" style={{ marginTop: 2 }}>
          Quick answers first — a real person is a message away.
        </p>
      </header>

      <Link to="/emergency" className="emergency-strip rise" style={{ '--i': 1 } as React.CSSProperties}>
        <Siren size={18} strokeWidth={1.75} aria-hidden />
        <span className="row__grow">
          <span className="row__title">Pet emergency?</span>
          <span className="row__sub">Signs to watch for and the nearest 24-hour clinic</span>
        </span>
      </Link>

      <div className="topic-grid rise" style={{ '--i': 2 } as React.CSSProperties} role="tablist" aria-label="Help topics">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={topic === t.id}
            className="topic-tile"
            onClick={() => navigate({ search: { topic: topic === t.id ? undefined : t.id }, replace: true })}
          >
            <t.icon size={20} strokeWidth={1.75} aria-hidden />
            {t.label}
          </button>
        ))}
      </div>

      <div className="detail-grid rise" style={{ '--i': 3 } as React.CSSProperties}>
        <section>
          <div className="section-head">
            <h2 className="section-head__title">
              {topic ? TOPICS.find((t) => t.id === topic)?.label : 'Common questions'}
            </h2>
            {topic && (
              <button type="button" className="link-btn" onClick={() => navigate({ search: {}, replace: true })}>
                Show all
              </button>
            )}
          </div>
          <div className="faq">
            {list.map((f) => (
              <details key={f.q} className="faq__item">
                <summary>
                  <span>{f.q}</span>
                  <ChevronDown size={16} strokeWidth={1.75} className="order-chev" aria-hidden />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <aside className="stack side-col" aria-label="Contact support">
          <section className="card card--pad stack" style={{ gap: 'var(--space-sm)' }}>
            <div>
              <h2 className="section-head__title">Still stuck?</h2>
              <p className="row__sub">{SUPPORT.hours} · replies within a few hours</p>
            </div>
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={() => {
                setSent(false)
                setMsg({ subject: topic ?? 'orders', body: '' })
                setContactOpen(true)
              }}
            >
              <MessageCircle size={15} strokeWidth={2} /> Message support
            </button>
            <a href={`mailto:${SUPPORT.email}`} className="icon-line icon-line--link">
              <Mail size={15} strokeWidth={1.75} aria-hidden />
              <span className="row__grow">
                <span className="row__title">{SUPPORT.email}</span>
              </span>
            </a>
            <a href={`tel:${SUPPORT.phone.replace(/\D/g, '')}`} className="icon-line icon-line--link">
              <Phone size={15} strokeWidth={1.75} aria-hidden />
              <span className="row__grow">
                <span className="row__title num">{SUPPORT.phone}</span>
              </span>
            </a>
          </section>
          <p className="row__sub">
            Read our <Link to="/terms">terms</Link> and <Link to="/privacy">privacy policy</Link>, or learn{' '}
            <Link to="/about">about PetSafeCare</Link>.
          </p>
        </aside>
      </div>

      <Sheet
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={sent ? 'Message sent' : 'Message support'}
        footer={
          sent ? (
            <button type="button" className="btn btn--primary btn--block" onClick={() => setContactOpen(false)}>
              Done
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={msg.body.trim().length < 10}
              onClick={() => setSent(true)}
            >
              Send message
            </button>
          )
        }
      >
        {sent ? (
          <div style={{ textAlign: 'center', paddingBlock: 'var(--space-md)' }}>
            <SuccessMark />
            <p className="row__title" style={{ fontSize: 'var(--text-md)' }}>We’ll reply by email</p>
            <p className="row__sub">Usually within a few hours during {SUPPORT.hours.toLowerCase()}.</p>
          </div>
        ) : (
          <div className="stack">
            <div className="field">
              <label className="field__label" htmlFor="hs-topic">Topic</label>
              <select
                id="hs-topic"
                className="select"
                value={msg.subject}
                onChange={(e) => setMsg((m) => ({ ...m, subject: e.target.value as Faq['topic'] }))}
              >
                {TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="hs-body">How can we help?</label>
              <textarea
                id="hs-body"
                className="input textarea"
                rows={5}
                value={msg.body}
                onChange={(e) => setMsg((m) => ({ ...m, body: e.target.value }))}
                placeholder="Include an order or booking number if you have one"
              />
              <p className="field__help">{msg.body.trim().length < 10 ? 'A sentence or two is plenty.' : ' '}</p>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
