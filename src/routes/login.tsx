import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { AuthShell, PasswordInput, SocialButtons } from '../components/auth'
import { SuccessMark } from '../components/blocks'
import { Sheet } from '../components/ui'
import { seo } from '../lib/seo'
import { pushToast, resetPassword, signIn, signInSocial } from '../lib/store'

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
const DEMO_CODE = '123456'

type ResetStep = 'email' | 'code' | 'done'

function LoginPage() {
  const { redirect } = Route.useSearch()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)

  const [resetOpen, setResetOpen] = useState(false)
  const [resetStep, setResetStep] = useState<ResetStep>('email')
  const [resetEmail, setResetEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [resetError, setResetError] = useState('')

  function finish() {
    setBusy(true)
    window.setTimeout(() => {
      const err = signIn(email, password)
      if (err) {
        setBusy(false)
        setErrors({ form: err })
        return
      }
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

  function openReset() {
    setResetEmail(email)
    setResetStep('email')
    setResetCode('')
    setNewPass('')
    setConfirmPass('')
    setResetError('')
    setResetOpen(true)
  }

  function sendResetCode() {
    // demo honesty: the code only issues for a registered account
    setResetStep('code')
    setResetError('')
  }

  function completeReset() {
    if (resetCode.trim() !== DEMO_CODE) {
      setResetError('That code doesn’t match. Check the six digits and try again.')
      return
    }
    if (newPass.length < 8) {
      setResetError('Use at least 8 characters for the new password.')
      return
    }
    if (newPass !== confirmPass) {
      setResetError('The two passwords don’t match.')
      return
    }
    const err = resetPassword(resetEmail, newPass)
    if (err) {
      setResetError(err)
      return
    }
    setResetStep('done')
  }

  const resetFooter =
    resetStep === 'done' ? (
      <button
        type="button"
        className="btn btn--primary btn--block"
        onClick={() => {
          setResetOpen(false)
          setPassword('')
          pushToast('Password updated — sign in with your new password')
        }}
      >
        Back to sign in
      </button>
    ) : resetStep === 'code' ? (
      <button type="button" className="btn btn--primary btn--block" onClick={completeReset}>
        Set new password
      </button>
    ) : (
      <button
        type="button"
        className="btn btn--primary btn--block"
        disabled={!EMAIL_RE.test(resetEmail.trim())}
        onClick={sendResetCode}
      >
        Send code
      </button>
    )

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
      <SocialButtons
        onPick={(provider) => {
          setBusy(true)
          window.setTimeout(() => {
            const isNew = signInSocial(provider)
            // a first social sign-in is a brand-new, empty account — onboard it
            if (isNew) navigate({ to: '/welcome', search: redirect ? { redirect } : {} })
            else navigate({ to: redirect ?? '/' })
          }, 700)
        }}
      />
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
            <button type="button" className="link-btn" onClick={openReset}>
              Forgot?
            </button>
          </div>
          <PasswordInput id="li-pass" value={password} onChange={setPassword} autoComplete="current-password" invalid={!!errors.password} />
          <p id="li-pass-help" className={`field__help${errors.password ? ' field__help--error' : ''}`} role={errors.password ? 'alert' : undefined}>
            {errors.password ?? ''}
          </p>
        </div>
        {errors.form && (
          <p className="field__help field__help--error" role="alert">
            {errors.form}
          </p>
        )}
        <button type="submit" className="btn btn--primary btn--block" data-loading={busy || undefined} disabled={busy}>
          Sign in
        </button>
      </form>
      <p className="auth__hint">Demo account — farhan@example.com · demo1234</p>

      <Sheet
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={resetStep === 'done' ? 'Password updated' : resetStep === 'code' ? 'Choose a new password' : 'Reset your password'}
        footer={resetFooter}
      >
        {resetStep === 'done' ? (
          <div style={{ textAlign: 'center', paddingBlock: 'var(--space-md)' }}>
            <SuccessMark />
            <p className="row__sub">
              The password for {resetEmail.trim()} is updated. Use it to sign in — your old
              password no longer works.
            </p>
          </div>
        ) : resetStep === 'code' ? (
          <div className="stack">
            <p className="row__sub">
              We sent a six-digit code to <strong>{resetEmail.trim()}</strong>. It expires in an
              hour.
            </p>
            <p className="auth__hint">Demo — the code is 123456</p>
            <div className="field">
              <label className="field__label" htmlFor="rs-code">Code</label>
              <input
                id="rs-code"
                className="input"
                inputMode="numeric"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                autoComplete="one-time-code"
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="rs-new">New password</label>
              <PasswordInput id="rs-new" value={newPass} onChange={setNewPass} autoComplete="new-password" invalid={!!resetError && newPass.length < 8} />
              <p className="field__help">At least 8 characters.</p>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="rs-confirm">Repeat new password</label>
              <PasswordInput id="rs-confirm" value={confirmPass} onChange={setConfirmPass} autoComplete="new-password" />
            </div>
            {resetError && (
              <p className="field__help field__help--error" role="alert">
                {resetError}
              </p>
            )}
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
            <p className="field__help">We’ll email a six-digit code to choose a new password.</p>
          </div>
        )}
      </Sheet>
    </AuthShell>
  )
}
