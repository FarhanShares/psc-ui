import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { AuthShell, PasswordInput, SocialButtons } from '../components/auth'
import { seo } from '../lib/seo'
import { signInSocial, signUpAccount } from '../lib/store'

export const Route = createFileRoute('/signup')({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof s.redirect === 'string' && s.redirect.startsWith('/') ? s.redirect : undefined,
  }),
  head: () =>
    seo({
      title: 'Create an account',
      description: 'Join PetSafeCare — free vaccination reminders, one-minute vet bookings and pet supplies delivered.',
      path: '/signup',
    }),
  component: SignupPage,
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function strength(pw: string): { score: 0 | 1 | 2 | 3; label: string } {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d|[^A-Za-z]/.test(pw)) s++
  return { score: s as 0 | 1 | 2 | 3, label: ['Too short', 'Weak', 'Good', 'Strong'][s] }
}

function SignupPage() {
  const { redirect } = Route.useSearch()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const st = strength(password)

  function socialSignIn(provider: string) {
    setBusy(true)
    window.setTimeout(() => {
      const isNew = signInSocial(provider)
      if (isNew) navigate({ to: '/welcome', search: redirect ? { redirect } : {} })
      else navigate({ to: redirect ?? '/' })
    }, 800)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'What should we call you?'
    if (!EMAIL_RE.test(email.trim())) next.email = 'That email doesn’t look complete.'
    if (password.length < 8) next.password = 'Use at least 8 characters.'
    if (!agree) next.agree = 'Please accept the terms to continue.'
    setErrors(next)
    if (Object.keys(next).length !== 0) return

    setBusy(true)
    window.setTimeout(() => {
      const err = signUpAccount(name, email, password)
      if (err) {
        setBusy(false)
        setErrors({ form: err })
        return
      }
      navigate({ to: '/welcome', search: redirect ? { redirect } : {} })
    }, 800)
  }

  const help = (id: string, text = '') => (
    <p id={`${id}-help`} className={`field__help${errors[id] ? ' field__help--error' : ''}`} role={errors[id] ? 'alert' : undefined}>
      {errors[id] ?? text}
    </p>
  )

  return (
    <AuthShell
      title="Create your account"
      sub="Free forever. Reminders, bookings and orders in one place."
      foot={
        <>
          Already have an account? <Link to="/login" search={redirect ? { redirect } : {}}>Sign in</Link>
        </>
      }
    >
      <SocialButtons onPick={socialSignIn} />
      <form className="stack" onSubmit={submit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="name">Your name</label>
          <input id="name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name || undefined} aria-describedby="name-help" />
          {help('name')}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="email">Email</label>
          <input id="email" className="input" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email || undefined} aria-describedby="email-help" />
          {help('email')}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="password">Password</label>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" invalid={!!errors.password} />
          {password && !errors.password && (
            <div className={`meter meter--${st.score}`} aria-hidden>
              <span /><span /><span />
            </div>
          )}
          {help('password', password ? `Strength: ${st.label}` : 'At least 8 characters.')}
        </div>
        <label className="check-row">
          <input type="checkbox" className="check" checked={agree} onChange={(e) => setAgree(e.target.checked)} aria-describedby="agree-help" />
          <span>
            I agree to the <Link to="/terms" target="_blank">terms</Link> and{' '}
            <Link to="/privacy" target="_blank">privacy policy</Link>.
          </span>
        </label>
        {help('agree')}
        {errors.form && (
          <p className="field__help field__help--error" role="alert">
            {errors.form}
          </p>
        )}
        <button type="submit" className="btn btn--primary btn--block" data-loading={busy || undefined} disabled={busy}>
          Create account
        </button>
      </form>
    </AuthShell>
  )
}
