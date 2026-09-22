import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Check, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'

import { PetGlyph, Sheet } from '../components/ui'
import {
  addPet,
  pushToast,
  removeAddress,
  saveAddress,
  updatePet,
  updateProfile,
  useAppState,
} from '../lib/store'
import type { Pet } from '../lib/types'

export const Route = createFileRoute('/profile')({
  head: () => ({ title: 'Profile · PetSafeCare' }),
  component: ProfilePage,
})

function ProfilePage() {
  const { profile, pets, orders, bookings } = useAppState()

  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone)
  const [email, setEmail] = useState(profile.email)
  const [saved, setSaved] = useState(false)

  const [editPet, setEditPet] = useState<Pet | null>(null)
  const [petDraft, setPetDraft] = useState({ name: '', breed: '', weightKg: 0, ageYears: 0 })
  const [addPetOpen, setAddPetOpen] = useState(false)
  const [newPet, setNewPet] = useState({ name: '', species: 'dog' as 'dog' | 'cat', breed: '' })

  const [addrOpen, setAddrOpen] = useState(false)
  const [addrDraft, setAddrDraft] = useState({ label: '', line: '' })

  const [editOpen, setEditOpen] = useState(false)

  function saveDetails() {
    updateProfile({ name: name.trim() || profile.name, phone, email })
    setSaved(true)
    window.setTimeout(() => {
      setSaved(false)
      setEditOpen(false)
    }, 700)
  }

  function openEditPet(pet: Pet) {
    setEditPet(pet)
    setPetDraft({ name: pet.name, breed: pet.breed, weightKg: pet.weightKg, ageYears: pet.ageYears })
  }

  return (
    <div className="page">
      <header className="rise" style={{ '--i': 0 } as React.CSSProperties}>
        <p className="tag">Profile</p>
        <h1 className="page-title">{profile.name}</h1>
      </header>

      <section className="card card--pad rise split" style={{ '--i': 1, flexWrap: 'wrap' } as React.CSSProperties}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', minWidth: 0 }}>
          <span className="pet-card__ava" style={{ width: '3.25rem', height: '3.25rem' }} aria-hidden>
            <span className="page-title" style={{ fontSize: 'var(--text-lg)' }}>
              {profile.name.charAt(0).toUpperCase()}
            </span>
          </span>
          <div style={{ minWidth: 0 }}>
            <p className="row__title" style={{ fontSize: 'var(--text-md)' }}>{profile.name}</p>
            <p className="row__sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile.email}
            </p>
            <p className="row__sub num">{profile.phone}</p>
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={() => setEditOpen(true)} aria-label="Edit profile">
          <Pencil size={16} strokeWidth={1.75} />
        </button>
      </section>

      <div className="form-grid rise" style={{ '--i': 2 } as React.CSSProperties}>
        <div className="stack">

          <section>
            <div className="section-head">
              <h2 className="section-head__title">Pets</h2>
              <button type="button" className="section-head__link" style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--color-accent-deep)', fontWeight: 600 }} onClick={() => { setNewPet({ name: '', species: 'dog', breed: '' }); setAddPetOpen(true) }}>
                <Plus size={14} strokeWidth={2} /> Add pet
              </button>
            </div>
            <div className="grid-list">
              {pets.map((pet) => (
                <button key={pet.id} type="button" className="card card--press row" style={{ textAlign: 'left', width: '100%', cursor: 'pointer' }} onClick={() => openEditPet(pet)}>
                  <span className={`pet-card__ava pet-card__ava--${pet.species}`}>
                    <PetGlyph species={pet.species} size={17} />
                  </span>
                  <span className="row__grow" style={{ minWidth: 0 }}>
                    <span className="row__title">{pet.name}</span>
                    <span className="row__sub">
                      {pet.breed} · {pet.ageYears} yr · {pet.weightKg.toFixed(1)} kg
                    </span>
                  </span>
                  <ChevronRight size={16} strokeWidth={1.75} className="muted" />
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="stack">
          <section>
            <div className="section-head">
              <h2 className="section-head__title">Addresses</h2>
              <button type="button" className="section-head__link" style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--color-accent-deep)', fontWeight: 600 }} onClick={() => { setAddrDraft({ label: '', line: '' }); setAddrOpen(true) }}>
                <Plus size={14} strokeWidth={2} /> Add
              </button>
            </div>
            <div className="grid-list">
              {profile.addresses.map((a) => (
                <div key={a.id} className="card row">
                  <span className="row__grow" style={{ minWidth: 0 }}>
                    <span className="row__title">{a.label}</span>
                    <span className="row__sub">{a.line}</span>
                  </span>
                  {a.isDefault && <span className="pill pill--info">Default</span>}
                  {!a.isDefault && (
                    <button type="button" className="btn btn--quiet btn--sm" aria-label={`Remove ${a.label} address`} onClick={() => removeAddress(a.id)}>
                      <Trash2 size={14} strokeWidth={1.75} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="card card--pad">
            <h2 className="section-head__title" style={{ marginBottom: 'var(--space-2xs)' }}>Notifications</h2>
            <div className="switch-row">
              <span className="switch-row__text">
                <span className="row__title" style={{ fontSize: 'var(--text-body)' }}>Vaccine reminders</span>
                <span className="row__sub">A nudge two weeks before a due date</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                className="switch"
                checked={profile.notifyVaccines}
                onChange={(e) => updateProfile({ notifyVaccines: e.target.checked })}
                aria-label="Vaccine reminders"
              />
            </div>
            <div className="switch-row">
              <span className="switch-row__text">
                <span className="row__title" style={{ fontSize: 'var(--text-body)' }}>Order updates</span>
                <span className="row__sub">Dispatch and delivery pings</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                className="switch"
                checked={profile.notifyOrders}
                onChange={(e) => updateProfile({ notifyOrders: e.target.checked })}
                aria-label="Order updates"
              />
            </div>
            <div className="switch-row">
              <span className="switch-row__text">
                <span className="row__title" style={{ fontSize: 'var(--text-body)' }}>Shop offers</span>
                <span className="row__sub">Occasional discounts, nothing more</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                className="switch"
                checked={profile.notifyOffers}
                onChange={(e) => updateProfile({ notifyOffers: e.target.checked })}
                aria-label="Shop offers"
              />
            </div>
          </section>

          <section className="grid-list">
            <Link to="/orders" className="card card--press row">
              <span className="row__grow">
                <span className="row__title">Order history</span>
                <span className="row__sub">{orders.length} orders</span>
              </span>
              <ChevronRight size={16} strokeWidth={1.75} className="muted" />
            </Link>
            <Link to="/bookings" className="card card--press row">
              <span className="row__grow">
                <span className="row__title">Service bookings</span>
                <span className="row__sub">{bookings.filter((b) => b.status !== 'cancelled').length} visits</span>
              </span>
              <ChevronRight size={16} strokeWidth={1.75} className="muted" />
            </Link>
            <button
              type="button"
              className="btn btn--quiet"
              style={{ justifySelf: 'start' }}
              onClick={() => pushToast('This demo stays signed in')}
            >
              Sign out
            </button>
          </section>
        </div>
      </div>

      {/* edit profile */}
      <Sheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        footer={
          <button type="button" className="btn btn--primary btn--block" onClick={saveDetails}>
            {saved ? (
              <>
                <Check size={15} strokeWidth={2.25} /> Saved
              </>
            ) : (
              'Save changes'
            )}
          </button>
        }
      >
        <div className="stack">
          <div className="field">
            <label className="field__label" htmlFor="pf-name">Full name</label>
            <input id="pf-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="pf-phone">Phone number</label>
            <input id="pf-phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="pf-email">Email address</label>
            <input id="pf-email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" autoComplete="email" />
          </div>
        </div>
      </Sheet>

      {/* edit pet */}
      <Sheet
        open={editPet !== null}
        onClose={() => setEditPet(null)}
        title={editPet ? `Edit ${editPet.name}` : ''}
        footer={
          editPet && (
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={() => {
                updatePet(editPet.id, {
                  name: petDraft.name.trim() || editPet.name,
                  breed: petDraft.breed.trim() || editPet.breed,
                  weightKg: petDraft.weightKg || editPet.weightKg,
                  ageYears: petDraft.ageYears || editPet.ageYears,
                })
                setEditPet(null)
              }}
            >
              Save pet
            </button>
          )
        }
      >
        {editPet && (
          <div className="stack">
            <div className="field">
              <label className="field__label" htmlFor="pet-name">Name</label>
              <input id="pet-name" className="input" value={petDraft.name} onChange={(e) => setPetDraft((d) => ({ ...d, name: e.target.value }))} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="pet-breed">Breed</label>
              <input id="pet-breed" className="input" value={petDraft.breed} onChange={(e) => setPetDraft((d) => ({ ...d, breed: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
              <div className="field">
                <label className="field__label" htmlFor="pet-age">Age (years)</label>
                <input id="pet-age" className="input" type="number" min={0} max={30} value={petDraft.ageYears} onChange={(e) => setPetDraft((d) => ({ ...d, ageYears: Number(e.target.value) }))} />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="pet-weight">Weight (kg)</label>
                <input id="pet-weight" className="input" type="number" min={0} step="0.1" value={petDraft.weightKg} onChange={(e) => setPetDraft((d) => ({ ...d, weightKg: Number(e.target.value) }))} />
              </div>
            </div>
          </div>
        )}
      </Sheet>

      {/* add pet */}
      <Sheet
        open={addPetOpen}
        onClose={() => setAddPetOpen(false)}
        title="Add a pet"
        footer={
          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={!newPet.name.trim()}
            onClick={() => {
              addPet({ name: newPet.name.trim(), species: newPet.species, breed: newPet.breed.trim() || (newPet.species === 'cat' ? 'Domestic cat' : 'Mixed breed') })
              setAddPetOpen(false)
              pushToast(`${newPet.name.trim()} joined the family`)
            }}
          >
            Add pet
          </button>
        }
      >
        <div className="stack">
          <div className="field">
            <label className="field__label" htmlFor="np-name">Name</label>
            <input id="np-name" className="input" value={newPet.name} onChange={(e) => setNewPet((p) => ({ ...p, name: e.target.value }))} placeholder="Mochi" />
          </div>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="tag" style={{ marginBottom: 'var(--space-2xs)' }}>Species</legend>
            <div className="chips">
              {(['dog', 'cat'] as const).map((s) => (
                <button key={s} type="button" className="chip" aria-pressed={newPet.species === s} onClick={() => setNewPet((p) => ({ ...p, species: s }))}>
                  <PetGlyph species={s} size={14} />
                  {s === 'dog' ? 'Dog' : 'Cat'}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label className="field__label" htmlFor="np-breed">Breed</label>
            <input id="np-breed" className="input" value={newPet.breed} onChange={(e) => setNewPet((p) => ({ ...p, breed: e.target.value }))} placeholder="Leave blank if unsure" />
          </div>
        </div>
      </Sheet>

      {/* add address */}
      <Sheet
        open={addrOpen}
        onClose={() => setAddrOpen(false)}
        title="Add an address"
        footer={
          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={!addrDraft.label.trim() || !addrDraft.line.trim()}
            onClick={() => {
              saveAddress({
                id: `ad-${Date.now().toString(36)}`,
                label: addrDraft.label.trim(),
                line: addrDraft.line.trim(),
                isDefault: false,
              })
              setAddrOpen(false)
            }}
          >
            Save address
          </button>
        }
      >
        <div className="stack">
          <div className="field">
            <label className="field__label" htmlFor="ad-label">Label</label>
            <input id="ad-label" className="input" value={addrDraft.label} onChange={(e) => setAddrDraft((d) => ({ ...d, label: e.target.value }))} placeholder="Home, work, mum's place" />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="ad-line">Street address</label>
            <input id="ad-line" className="input" value={addrDraft.line} onChange={(e) => setAddrDraft((d) => ({ ...d, line: e.target.value }))} placeholder="14 Alder Lane, Apt 3" autoComplete="street-address" />
          </div>
        </div>
      </Sheet>
    </div>
  )
}
