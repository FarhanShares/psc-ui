import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Check, CreditCard, MapPin, Plus } from 'lucide-react'

import { AddressPicker } from './address-picker'
import { cardProblem, formatCardNumber, formatExpiry } from '../lib/format'
import { addCard, cardLabel, saveAddress, updateProfile, useAppState } from '../lib/store'

/* ------------------------------------------------------------ the hook */

/**
 * One checkout brain for the /cart page and the desktop drawer: address
 * (saved or new), contact, payment (saved card or new, optionally saved).
 * `start()` seeds from the live profile when checkout opens — never at mount,
 * where the pre-hydration guest snapshot would leave every field blank.
 */
export function useCheckout() {
  const { profile, cards } = useAppState()
  const [addressId, setAddressId] = useState('')
  const [newAddr, setNewAddr] = useState({ label: 'Home', line: '' })
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cardId, setCardId] = useState('')
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [saveCard, setSaveCard] = useState(true)
  const [error, setError] = useState('')

  function start() {
    setAddressId(profile.addresses.find((a) => a.isDefault)?.id ?? profile.addresses[0]?.id ?? 'new')
    setNewAddr({ label: profile.addresses.length ? 'Other' : 'Home', line: '' })
    setName(profile.name)
    setPhone(profile.phone)
    setCardId(cards.find((c) => c.isDefault)?.id ?? cards[0]?.id ?? 'new')
    setCard('')
    setExpiry('')
    setCvc('')
    setSaveCard(true)
    setError('')
  }

  /** validate, remember new details, and return what the order needs */
  function submit(): { addressLine: string; paidWith: string } | null {
    const fail = (msg: string) => {
      setError(msg)
      return null
    }
    let addressLine = ''
    if (addressId === 'new') {
      if (newAddr.line.trim().length < 6) return fail('Add a street address so the courier can find you.')
      addressLine = newAddr.line.trim()
    } else {
      const a = profile.addresses.find((x) => x.id === addressId)
      if (!a) return fail('Choose a delivery address before placing the order.')
      addressLine = a.line
    }
    if (!name.trim()) return fail('Add the name the parcel should be addressed to.')
    if (phone.replace(/\D/g, '').length < 7) return fail('Add a phone number — the courier calls it on arrival.')

    let paidWith = ''
    if (cardId === 'new') {
      const problem = cardProblem(card, expiry, cvc)
      if (problem) return fail(problem)
      const digits = card.replace(/\D/g, '')
      if (saveCard) paidWith = cardLabel(addCard({ digits, exp: expiry, name }))
      else paidWith = `Card ending ${digits.slice(-4)}`
    } else {
      const c = cards.find((x) => x.id === cardId)
      if (!c) return fail('Choose how you’d like to pay.')
      paidWith = cardLabel(c)
    }

    // first-time details become the account's defaults
    if (addressId === 'new') {
      saveAddress({
        id: `ad-${Date.now().toString(36)}`,
        label: newAddr.label.trim() || 'Home',
        line: addressLine,
        isDefault: profile.addresses.length === 0,
      })
    }
    if (!profile.phone) updateProfile({ phone: phone.trim() })
    if (!profile.name) updateProfile({ name: name.trim() })
    setError('')
    return { addressLine, paidWith }
  }

  const addressLabel =
    addressId === 'new' ? newAddr.label || 'new address' : profile.addresses.find((a) => a.id === addressId)?.label

  return {
    profile,
    cards,
    addressId,
    setAddressId,
    newAddr,
    setNewAddr,
    name,
    setName,
    phone,
    setPhone,
    cardId,
    setCardId,
    card,
    setCard,
    expiry,
    setExpiry,
    cvc,
    setCvc,
    saveCard,
    setSaveCard,
    error,
    setError,
    start,
    submit,
    addressLabel,
  }
}

export type Checkout = ReturnType<typeof useCheckout>

/* -------------------------------------------------------- the fields */

export function CheckoutFields({ co, prefix, compact = false }: { co: Checkout; prefix: string; compact?: boolean }) {
  // a plain render helper (not a component) so inputs never remount
  const heading = (title: string, aside?: React.ReactNode) =>
    compact ? (
      <p className="tag checkout__h">{title}</p>
    ) : (
      <div className="section-head">
        <h2 className="section-head__title">{title}</h2>
        {aside}
      </div>
    )

  return (
    <div className="stack checkout">
      <section>
        {heading(
          'Delivery address',
          co.profile.addresses.length > 0 && (
            <Link to="/profile" className="section-head__link">
              Manage
            </Link>
          ),
        )}
        {co.profile.addresses.length > 0 && (
          <AddressPicker addresses={co.profile.addresses} value={co.addressId} onChange={co.setAddressId} />
        )}
        {co.addressId === 'new' ? (
          <div className="card card--pad stack new-entry">
            <div className="two-col two-col--label">
              <div className="field">
                <label className="field__label" htmlFor={`${prefix}-al`}>Label</label>
                <input
                  id={`${prefix}-al`}
                  className="input"
                  value={co.newAddr.label}
                  onChange={(e) => co.setNewAddr({ ...co.newAddr, label: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor={`${prefix}-line`}>Street address</label>
                <input
                  id={`${prefix}-line`}
                  className="input"
                  value={co.newAddr.line}
                  onChange={(e) => co.setNewAddr({ ...co.newAddr, line: e.target.value })}
                  placeholder="14 Alder Lane, Apt 3"
                  autoComplete="street-address"
                />
              </div>
            </div>
            <p className="field__help">
              {co.profile.addresses.length ? 'Saved to your addresses for next time.' : 'Saved as your default address.'}
            </p>
            {co.profile.addresses.length > 0 && (
              <button
                type="button"
                className="link-btn"
                style={{ justifySelf: 'start' }}
                onClick={() => co.setAddressId(co.profile.addresses.find((a) => a.isDefault)?.id ?? co.profile.addresses[0].id)}
              >
                Use a saved address
              </button>
            )}
          </div>
        ) : (
          <button type="button" className="add-row" onClick={() => co.setAddressId('new')}>
            <MapPin size={15} strokeWidth={1.75} aria-hidden /> <Plus size={13} strokeWidth={2} aria-hidden /> Deliver somewhere else
          </button>
        )}
      </section>

      <section className="stack">
        {heading('Contact')}
        <div className="field">
          <label className="field__label" htmlFor={`${prefix}-name`}>Full name</label>
          <input id={`${prefix}-name`} className="input" value={co.name} onChange={(e) => co.setName(e.target.value)} autoComplete="name" />
        </div>
        <div className="field">
          <label className="field__label" htmlFor={`${prefix}-phone`}>Phone number</label>
          <input
            id={`${prefix}-phone`}
            className="input"
            value={co.phone}
            onChange={(e) => co.setPhone(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
          />
          <p className="field__help">The courier calls this number on arrival.</p>
        </div>
      </section>

      <section className="stack">
        {heading('Payment', <span className="tag">Demo — no charge</span>)}
        {co.cards.length > 0 && (
          <div className="addr-list" role="radiogroup" aria-label="Payment method">
            {[...co.cards.map((c) => ({ id: c.id, title: cardLabel(c), sub: `Expires ${c.exp}`, isDefault: c.isDefault })), { id: 'new', title: 'New card', sub: 'Pay with a different card', isDefault: false }].map(
              (o) => {
                const on = co.cardId === o.id
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className="addr-option"
                    onClick={() => co.setCardId(o.id)}
                  >
                    {o.id === 'new' ? <Plus size={16} strokeWidth={1.75} aria-hidden /> : <CreditCard size={16} strokeWidth={1.75} aria-hidden />}
                    <span className="row__grow">
                      <span className="row__title">
                        {o.title}
                        {o.isDefault && <span className="addr-option__default">Default</span>}
                      </span>
                      <span className="row__sub num">{o.sub}</span>
                    </span>
                    <span className="addr-option__radio" aria-hidden>
                      {on && <Check size={12} strokeWidth={3} />}
                    </span>
                  </button>
                )
              },
            )}
          </div>
        )}
        {co.cardId === 'new' && <CardFields co={co} prefix={prefix} />}
      </section>
    </div>
  )
}

function CardFields({ co, prefix }: { co: Checkout; prefix: string }) {
  return (
    <div className="stack">
      <div className="field">
        <label className="field__label" htmlFor={`${prefix}-card`}>Card number</label>
        <input
          id={`${prefix}-card`}
          className="input num"
          value={co.card}
          onChange={(e) => co.setCard(formatCardNumber(e.target.value))}
          inputMode="numeric"
          placeholder="4242 4242 4242 4242"
          autoComplete="cc-number"
        />
      </div>
      <div className="two-col">
        <div className="field">
          <label className="field__label" htmlFor={`${prefix}-exp`}>Expiry</label>
          <input
            id={`${prefix}-exp`}
            className="input num"
            value={co.expiry}
            onChange={(e) => co.setExpiry(formatExpiry(e.target.value))}
            inputMode="numeric"
            placeholder="09 / 29"
            autoComplete="cc-exp"
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor={`${prefix}-cvc`}>CVC</label>
          <input
            id={`${prefix}-cvc`}
            className="input num"
            value={co.cvc}
            onChange={(e) => co.setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            placeholder="123"
            autoComplete="cc-csc"
          />
        </div>
      </div>
      <label className="check-row">
        <input type="checkbox" className="check" checked={co.saveCard} onChange={(e) => co.setSaveCard(e.target.checked)} />
        <span>Save this card for next time</span>
      </label>
    </div>
  )
}
