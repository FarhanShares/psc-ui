import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Eye, EyeOff, PawPrint } from 'lucide-react'

/** split auth screen: brand panel on wide screens, focused single column on phones */
export function AuthShell({
  title,
  sub,
  children,
  foot,
}: {
  title: string
  sub: string
  children: React.ReactNode
  foot: React.ReactNode
}) {
  return (
    <div className="auth">
      <aside className="auth__panel" aria-hidden>
        <span className="brand__mark" style={{ width: '2.5rem', height: '2.5rem' }}>
          <PawPrint size={20} strokeWidth={2} />
        </span>
        <p className="auth__quote">
          Food reordered, boosters booked, records in one place.
        </p>
        <ul className="auth__points">
          <li>Vaccination reminders two weeks ahead</li>
          <li>Book verified clinics in under a minute</li>
          <li>Free delivery on orders over $49</li>
        </ul>
      </aside>
      <div className="auth__main">
        <Link to="/" className="brand auth__brand" aria-label="PetSafeCare home">
          <span className="brand__mark" aria-hidden>
            <PawPrint size={16} strokeWidth={2} />
          </span>
          <span className="brand__name">
            Pet<span>Safe</span>Care
          </span>
        </Link>
        <h1 className="page-title">{title}</h1>
        <p className="muted" style={{ marginTop: 'var(--space-2xs)' }}>{sub}</p>
        <div className="auth__form">{children}</div>
        <p className="auth__foot">{foot}</p>
      </div>
    </div>
  )
}

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  invalid,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  autoComplete: 'current-password' | 'new-password'
  invalid?: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="input-wrap">
      <input
        id={id}
        className="input"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={`${id}-help`}
      />
      <button
        type="button"
        className="input-wrap__btn"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
      >
        {show ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
      </button>
    </div>
  )
}

export function SocialButtons({ onPick }: { onPick: (provider: string) => void }) {
  return (
    <>
      <div className="btn-pair">
        <button type="button" className="btn btn--ghost" onClick={() => onPick('Apple')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.8-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.1 2.5 1.3-.1 1.7-.8 3.3-.8 1.5 0 1.9.8 3.3.8 1.4 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.6-4.3ZM14 5.4c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z" />
          </svg>
          Apple
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => onPick('Google')}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8.1Z" />
            <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9l3.7-2.8Z" />
            <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4Z" />
          </svg>
          Google
        </button>
      </div>
      <p className="divider-label"><span>or with email</span></p>
    </>
  )
}
