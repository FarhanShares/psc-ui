import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { AuthShell, PasswordInput, SocialButtons } from '../components/auth'
import { SuccessMark } from '../components/blocks'
import { Sheet } from '../components/ui'
import { seo } from '../lib/seo'
import { signIn } from '../lib/store'

export const Route = createFileRoute('/login')({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof s.redirect === 'string' && s.redirect.startsWith('/') ? s.redirect : undefined,
  }),
  head: () =>
    seo({
      title: 'Sign in',
      description: 'Sign in to PetSafeCare to see your orders, bookings and your pets’ vaccination records.',
      path: '/login',
    }),
  component: LoginPage,
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginPage() {
  const { redirect } = Route.useSearch()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [busy, setBusy] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)

  function finish() {
    setBusy(true)
    window.setTimeout(() => {
      signIn()
      navigate({ to: redirect ?? '/' })
    }, 700)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!EMAIL_RE.test(email.trim())) next.email = 'Enter the email you signed up with.'
    if (password.length < 6) next.password = 'Passwords are at least 6 characters.'
    setErrors(next)
    if (Object.keys(next).length === 0) finish()
  }

  return (
    <AuthShell
      title="Welcome back"
      sub="Sign in to pick up where you left off."
      foot={
        <>
          New here? <Link to="/signup" search={redirect ? { redirect } : {}}>Create an account</Link>
        </>
      }
    >
      <SocialButtons onPick={finish} />
      <form className="stack" onSubmit={submit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="li-email">Email</label>
          <input
            id="li-email"
            className="input"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={!!errors.email || undefined}
            aria-describedby="li-email-help"
          />
          <p id="li-email-help" className={`field__help${errors.email ? ' field__help--error' : ''}`} role={errors.email ? 'alert' : undefined}>
            {errors.email ?? ''}
          </p>
        </div>
        <div className="field">
          <div className="split">
            <label className="field__label" htmlFor="li-pass">Password</label>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setResetEmail(email)
                setResetSent(false)
                setResetOpen(true)
              }}
            >
              Forgot?
            </button>
          </div>
          <PasswordInput id="li-pass" value={password} onChange={setPassword} autoComplete="current-password" invalid={!!errors.password} />
          <p id="li-pass-help" className={`field__help${errors.password ? ' field__help--error' : ''}`} role={errors.password ? 'alert' : undefined}>
            {errors.password ?? ''}
          </p>
        </div>
        <button type="submit" className="btn btn--primary btn--block" data-loading={busy || undefined} disabled={busy}>
          Sign in
        </button>
      </form>

      <Sheet
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={resetSent ? 'Check your inbox' : 'Reset your password'}
        footer={
          resetSent ? (
            <button type="button" className="btn btn--primary btn--block" onClick={() => setResetOpen(false)}>
              Back to sign in
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={!EMAIL_RE.test(resetEmail.trim())}
              onClick={() => setResetSent(true)}
            >
              Send reset link
            </button>
          )
        }
      >
        {resetSent ? (
          <div style={{ textAlign: 'center', paddingBlock: 'var(--space-md)' }}>
            <SuccessMark />
            <p className="row__sub">
              If {resetEmail.trim()} has an account, a reset link is on its way. It expires in an hour.
            </p>
          </div>
        ) : (
          <div className="field">
            <label className="field__label" htmlFor="rs-email">Email</label>
            <input
              id="rs-email"
              className="input"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <p className="field__help">We’ll email a link to choose a new password.</p>
          </div>
        )}
      </Sheet>
    </AuthShell>
  )
}
