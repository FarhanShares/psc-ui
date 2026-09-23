import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Bell, CreditCard, Download, KeyRound, Plus, ShieldCheck, Trash2 } from 'lucide-react'

import { PasswordInput } from '../components/auth'
import { Crumbs, MenuRow, SuccessMark } from '../components/blocks'
import { RequireAccount } from '../components/gate'
import { Sheet } from '../components/ui'
import { cardProblem, formatCardNumber, formatExpiry } from '../lib/format'
import { seo } from '../lib/seo'
import {
  addCard,
  cardLabel,
  changePassword,
  deleteAccount,
  exportAccountData,
  hasPassword,
  pushToast,
  removeCard,
  setDefaultCard,
  useAppState,
} from '../lib/store'

export const Route = createFileRoute('/settings')({
  head: () => seo({ title: 'Account settings', path: '/settings', noindex: true }),
  component: () => (
    <RequireAccount kind="settings">
      <SettingsPage />
    </RequireAccount>
  ),
})

function SettingsPage() {
  const state = useAppState()
  const { profile, cards, sessionKey } = state
  const navigate = useNavigate()
  const withPassword = hasPassword(state)
  const provider = sessionKey?.startsWith('social:') ? sessionKey.slice(7) : null

  // password
  const [pwOpen, setPwOpen] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwDone, setPwDone] = useState(false)

  // cards
  const [cardOpen, setCardOpen] = useState(false)
  const [card, setCard] = useState({ number: '', exp: '', cvc: '', name: '', makeDefault: false })
  const [cardError, setCardError] = useState('')

  // delete
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  function submitPassword() {
    if (pw.next !== pw.confirm) {
      setPwError('The two new passwords don’t match.')
      return
    }
    const err = changePassword(pw.current, pw.next)
    if (err) {
      setPwError(err)
      return
    }
    setPwError('')
    setPwDone(true)
  }

  function submitCard() {
    const problem = cardProblem(card.number, card.exp, card.cvc)
    if (problem) {
      setCardError(problem)
      return
    }
    const saved = addCard({ digits: card.number.replace(/\D/g, ''), exp: card.exp, name: card.name, makeDefault: card.makeDefault })
    setCardOpen(false)
    pushToast(`${cardLabel(saved)} saved`)
  }

  function downloadData() {
    const blob = new Blob([exportAccountData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `petsafecare-${(profile.email || 'account').replace(/[^a-z0-9]+/gi, '-')}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    pushToast('Your data is downloading')
  }

  return (
    <div className="page">
      <Crumbs items={[{ label: 'Profile', to: '/profile' }, { label: 'Settings' }]} />
      <header className="rise" style={{ '--i': 0 } as React.CSSProperties}>
        <h1 className="page-title">Settings</h1>
        <p className="muted" style={{ fontSize: 'var(--text-sm)', marginTop: 2 }}>
          Sign-in, payment and your data.
        </p>
      </header>

      <div className="form-grid rise" style={{ '--i': 1 } as React.CSSProperties}>
        <div className="stack" style={{ gap: 'var(--space-lg)' }}>
          <section>
            <h2 className="section-head__title section-head">Sign-in</h2>
            <div className="card card--pad stack" style={{ gap: 'var(--space-sm)' }}>
              <div className="icon-line">
                <ShieldCheck size={16} strokeWidth={1.75} aria-hidden />
                <span className="row__grow">
                  <span className="tag">Signed in with</span>
                  <span className="row__title">{provider ? provider : 'Email and password'}</span>
                  <span className="row__sub">{profile.email || 'No email on this account'}</span>
                </span>
              </div>
              {withPassword ? (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setPw({ current: '', next: '', confirm: '' })
                    setPwError('')
                    setPwDone(false)
                    setPwOpen(true)
                  }}
                >
                  <KeyRound size={15} strokeWidth={1.75} /> Change password
                </button>
              ) : (
                <p className="row__sub">
                  {provider} manages your sign-in, so there’s no password to change here.
                </p>
              )}
            </div>
          </section>

          <section>
            <div className="section-head">
              <h2 className="section-head__title">Payment methods</h2>
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setCard({ number: '', exp: '', cvc: '', name: profile.name, makeDefault: cards.length === 0 })
                  setCardError('')
                  setCardOpen(true)
                }}
              >
                <Plus size={14} strokeWidth={2} /> Add card
              </button>
            </div>
            {cards.length === 0 ? (
              <p className="row__sub card card--pad">
                No saved cards. Save one at checkout or add it here — you’ll skip typing it next time.
              </p>
            ) : (
              <ul className="grid-list pay-list">
                {cards.map((c) => (
                  <li key={c.id} className="card row">
                    <span className="menu-row__icon" aria-hidden>
                      <CreditCard size={16} strokeWidth={1.75} />
                    </span>
                    <span className="row__grow">
                      <span className="row__title">
                        {cardLabel(c)}
                        {c.isDefault && <span className="addr-option__default">Default</span>}
                      </span>
                      <span className="row__sub num">
                        Expires {c.exp} · {c.name}
                      </span>
                    </span>
                    {!c.isDefault && (
                      <button type="button" className="link-btn" onClick={() => setDefaultCard(c.id)}>
                        Make default
                      </button>
                    )}
                    <button type="button" className="icon-btn icon-btn--bare" aria-label={`Remove ${cardLabel(c)}`} onClick={() => removeCard(c.id)}>
                      <Trash2 size={15} strokeWidth={1.75} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="field__help">Demo — cards are stored on this device only and never charged.</p>
          </section>
        </div>

        <div className="stack" style={{ gap: 'var(--space-lg)' }}>
          <section>
            <h2 className="section-head__title section-head">Preferences</h2>
            <div className="menu">
              <MenuRow
                to="/profile"
                icon={<Bell size={16} strokeWidth={1.75} />}
                title="Reminders & alerts"
                sub={[profile.notifyVaccines && 'Vaccines', profile.notifyOrders && 'Orders', profile.notifyOffers && 'Offers'].filter(Boolean).join(' · ') || 'All off'}
              />
            </div>
          </section>

          <section>
            <h2 className="section-head__title section-head">Your data</h2>
            <div className="card card--pad stack" style={{ gap: 'var(--space-sm)' }}>
              <p className="row__sub" style={{ fontSize: 'var(--text-body)' }}>
                Download everything this account holds — pets, records, orders, bookings and addresses — as a JSON file.
              </p>
              <button type="button" className="btn btn--ghost" onClick={downloadData}>
                <Download size={15} strokeWidth={1.75} /> Download my data
              </button>
            </div>
          </section>

          <section>
            <h2 className="section-head__title section-head">Delete account</h2>
            <div className="card card--pad stack danger-zone" style={{ gap: 'var(--space-sm)' }}>
              <p className="row__sub" style={{ fontSize: 'var(--text-body)' }}>
                Removes your pets, records, orders, bookings, saved cards and sign-in. This can’t be undone.
              </p>
              <button
                type="button"
                className="btn btn--ghost btn--danger"
                onClick={() => {
                  setConfirmText('')
                  setDeleteOpen(true)
                }}
              >
                <Trash2 size={15} strokeWidth={1.75} /> Delete my account
              </button>
            </div>
          </section>

          <p className="row__sub">
            <Link to="/privacy">Privacy policy</Link> · <Link to="/terms">Terms of service</Link>
          </p>
        </div>
      </div>

      {/* change password */}
      <Sheet
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        title={pwDone ? 'Password changed' : 'Change password'}
        footer={
          pwDone ? (
            <button type="button" className="btn btn--primary btn--block" onClick={() => setPwOpen(false)}>
              Done
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={!pw.current || pw.next.length < 8 || !pw.confirm}
              onClick={submitPassword}
            >
              Update password
            </button>
          )
        }
      >
        {pwDone ? (
          <div style={{ textAlign: 'center', paddingBlock: 'var(--space-md)' }}>
            <SuccessMark />
            <p className="row__sub">Use your new password next time you sign in.</p>
          </div>
        ) : (
          <div className="stack">
            <div className="field">
              <label className="field__label" htmlFor="pw-cur">Current password</label>
              <PasswordInput id="pw-cur" value={pw.current} onChange={(v) => setPw((p) => ({ ...p, current: v }))} autoComplete="current-password" />
              <p id="pw-cur-help" className="field__help" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="pw-new">New password</label>
              <PasswordInput id="pw-new" value={pw.next} onChange={(v) => setPw((p) => ({ ...p, next: v }))} autoComplete="new-password" />
              <p id="pw-new-help" className="field__help">At least 8 characters.</p>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="pw-confirm">Confirm new password</label>
              <PasswordInput id="pw-confirm" value={pw.confirm} onChange={(v) => setPw((p) => ({ ...p, confirm: v }))} autoComplete="new-password" invalid={!!pwError} />
              <p id="pw-confirm-help" className={`field__help${pwError ? ' field__help--error' : ''}`} role={pwError ? 'alert' : undefined}>
                {pwError}
              </p>
            </div>
          </div>
        )}
      </Sheet>

      {/* add card */}
      <Sheet
        open={cardOpen}
        onClose={() => setCardOpen(false)}
        title="Add a card"
        footer={
          <button type="button" className="btn btn--primary btn--block" onClick={submitCard}>
            Save card
          </button>
        }
      >
        <div className="stack">
          <div className="field">
            <label className="field__label" htmlFor="ac-num">Card number</label>
            <input
              id="ac-num"
              className="input num"
              value={card.number}
              onChange={(e) => setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))}
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
            />
          </div>
          <div className="two-col">
            <div className="field">
              <label className="field__label" htmlFor="ac-exp">Expiry</label>
              <input
                id="ac-exp"
                className="input num"
                value={card.exp}
                onChange={(e) => setCard((c) => ({ ...c, exp: formatExpiry(e.target.value) }))}
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="09 / 29"
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ac-cvc">CVC</label>
              <input
                id="ac-cvc"
                className="input num"
                value={card.cvc}
                onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
              />
            </div>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="ac-name">Name on card</label>
            <input id="ac-name" className="input" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} autoComplete="cc-name" />
          </div>
          <label className="check-row">
            <input type="checkbox" className="check" checked={card.makeDefault} onChange={(e) => setCard((c) => ({ ...c, makeDefault: e.target.checked }))} />
            <span>Use as my default card</span>
          </label>
          {cardError && (
            <p className="field__help field__help--error" role="alert">
              {cardError}
            </p>
          )}
        </div>
      </Sheet>

      {/* delete account */}
      <Sheet
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
        footer={
          <div className="btn-pair">
            <button type="button" className="btn btn--ghost" onClick={() => setDeleteOpen(false)}>
              Keep my account
            </button>
            <button
              type="button"
              className="btn btn--danger-fill"
              disabled={confirmText.trim().toUpperCase() !== 'DELETE'}
              onClick={() => {
                setDeleteOpen(false)
                deleteAccount()
                navigate({ to: '/' })
                pushToast('Your account and its data have been deleted')
              }}
            >
              Delete forever
            </button>
          </div>
        }
      >
        <div className="stack">
          <p className="row__sub" style={{ fontSize: 'var(--text-body)' }}>
            Everything on this account goes: {state.pets.length} pet{state.pets.length === 1 ? '' : 's'},{' '}
            {state.orders.length} order{state.orders.length === 1 ? '' : 's'}, {state.bookings.length} booking
            {state.bookings.length === 1 ? '' : 's'} and your saved cards. Consider downloading your data first.
          </p>
          <div className="field">
            <label className="field__label" htmlFor="del-confirm">Type DELETE to confirm</label>
            <input
              id="del-confirm"
              className="input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
            />
          </div>
        </div>
      </Sheet>
    </div>
  )
}
