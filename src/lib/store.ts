import { useSyncExternalStore } from 'react'

import {
  CLINICS,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  PRODUCTS,
  SEED_BOOKINGS,
  SEED_ORDERS,
  SEED_PROFILE,
  PETS,
  VACCINES,
} from './data'
import { findVariant, variantLabel } from './catalog'
import { speciesInfo } from './species'
import type {
  Address,
  Booking,
  CartItem,
  Notice,
  Order,
  PaymentCard,
  Pet,
  Profile,
  Species,
  UserReview,
  VaccineRecord,
} from './types'

export interface Toast {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
}

export interface RegisteredUser {
  name: string
  email: string
  password: string // demo only — plain text in localStorage, no real security
}

export interface AppState {
  cart: CartItem[]
  orders: Order[]
  bookings: Booking[]
  profile: Profile
  pets: typeof PETS
  vaccines: VaccineRecord[]
  lastSyncLabel: string
  /** a clinic shares records with this account (new accounts start unlinked) */
  clinicLinked: boolean
  savedProducts: string[]
  savedClinics: string[]
  readNotices: string[]
  cards: PaymentCard[]
  recentSearches: string[]
  /** device-level, not per account — product ids, newest first */
  recentlyViewed: string[]
  /** reviews written on this device (demo — no server to send them to) */
  userReviews: UserReview[]
  helpfulVotes: string[]
  signedIn: boolean
  /** which account the top-level data belongs to (email, or `social:<provider>`) */
  sessionKey: string | null
  users: RegisteredUser[]
  /** data of every account that is not currently signed in */
  accounts: Record<string, AccountData>
}

/**
 * Per-account slice. The signed-in account's data lives at the top level of
 * AppState (so every page reads `state.orders` etc. unchanged); on sign-out it
 * is parked in `accounts` and the top level becomes an empty guest session.
 */
const ACCOUNT_KEYS = [
  'cart',
  'orders',
  'bookings',
  'profile',
  'pets',
  'vaccines',
  'lastSyncLabel',
  'clinicLinked',
  'savedProducts',
  'savedClinics',
  'readNotices',
  'cards',
] as const

export type AccountData = Pick<AppState, (typeof ACCOUNT_KEYS)[number]>

function pickAccount(s: AppState): AccountData {
  const out = {} as Record<string, unknown>
  for (const k of ACCOUNT_KEYS) out[k] = s[k]
  return out as AccountData
}

function emptyAccount(name = '', email = ''): AccountData {
  return {
    cart: [],
    orders: [],
    bookings: [],
    profile: {
      name,
      phone: '',
      email,
      addresses: [],
      notifyVaccines: true,
      notifyOrders: true,
      notifyOffers: false,
    },
    pets: [],
    vaccines: [],
    lastSyncLabel: 'never',
    clinicLinked: false,
    savedProducts: [],
    savedClinics: [],
    readNotices: [],
    cards: [],
  }
}

const DEMO_EMAIL = 'farhan@example.com'

function demoAccount(): AccountData {
  return {
    cart: [],
    orders: SEED_ORDERS,
    bookings: SEED_BOOKINGS,
    profile: SEED_PROFILE,
    pets: PETS,
    vaccines: VACCINES,
    lastSyncLabel: '2 days ago',
    clinicLinked: true,
    savedProducts: ['p12', 'p09'],
    savedClinics: ['c04'],
    readNotices: [],
    cards: [{ id: 'pm1', brand: 'Visa', last4: '4242', exp: '09 / 29', name: 'Farhan', isDefault: true }],
  }
}

/**
 * The server renders a signed-out guest: public pages (home landing, shop,
 * clinics) are what crawlers and first-time visitors see. The demo account is
 * one sign-in away (credentials hinted on /login, one tap on the landing).
 */
function seedState(): AppState {
  return {
    ...emptyAccount(),
    recentSearches: [],
    recentlyViewed: [],
    userReviews: [],
    helpfulVotes: [],
    signedIn: false,
    sessionKey: null,
    users: [{ name: 'Farhan', email: DEMO_EMAIL, password: 'demo1234' }],
    accounts: { [DEMO_EMAIL]: demoAccount() },
  }
}

const STORAGE_KEY = 'petsafecare.state.v1'

let state: AppState = seedState()
/**
 * What the server rendered. Route components hydrate lazily — after the app
 * shell has already pulled localStorage into `state` — so hydration must keep
 * reading this snapshot or late-hydrating routes mismatch the SSR HTML.
 * Never mutated: every write goes through setState, which replaces `state`.
 */
const serverState: AppState = state
let hydrated = false
const listeners = new Set<() => void>()
let toastSeq = 1
let toasts: Toast[] = []
const toastListeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function persist() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...pickAccount(state),
        recentSearches: state.recentSearches,
        recentlyViewed: state.recentlyViewed,
        userReviews: state.userReviews,
        helpfulVotes: state.helpfulVotes,
        signedIn: state.signedIn,
        sessionKey: state.sessionKey,
        users: state.users,
        accounts: state.accounts,
      }),
    )
  } catch {
    // storage full or unavailable — the app still works in-memory
  }
}

/** mirrors the session onto <html> so pre-hydration CSS can hide guest-only views */
function syncSessionAttr() {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.session = state.signedIn ? 'in' : 'out'
}

function setState(patch: Partial<AppState>) {
  state = { ...state, ...patch }
  persist()
  syncSessionAttr()
  emit()
}

/**
 * Storage written before per-account data existed has one account's data at
 * the top level and no `accounts` map. Adopt it as that account's data; if the
 * session was signed out, park it and start a clean guest session.
 */
function migrate(saved: Partial<AppState>): Partial<AppState> {
  if (saved.accounts) return saved
  const merged = { ...state, ...saved } as AppState
  const key = normEmail(merged.profile?.email || DEMO_EMAIL)
  const legacy = { clinicLinked: saved.clinicLinked ?? true, cards: saved.cards ?? demoAccount().cards }
  const data = pickAccount({ ...merged, ...legacy })
  if (saved.signedIn) {
    return { ...saved, ...legacy, sessionKey: key, accounts: {} }
  }
  return { ...emptyAccount(), recentSearches: merged.recentSearches, signedIn: false, sessionKey: null, users: merged.users, accounts: { [key]: data } }
}

export function hydrateFromStorage() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Partial<AppState>
    state = { ...state, ...migrate(parsed) }
    if (!parsed.accounts) persist() // write the migrated shape once
    syncSessionAttr()
    emit()
  } catch {
    // corrupt storage — keep seed
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, () => state, () => serverState)
}

/* --------------------------------------------------------------- toasts */

function subscribeToasts(cb: () => void) {
  toastListeners.add(cb)
  return () => toastListeners.delete(cb)
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    subscribeToasts,
    () => toasts,
    () => toasts,
  )
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id)
  for (const l of toastListeners) l()
}

export function pushToast(message: string, opts?: { actionLabel?: string; onAction?: () => void }) {
  const id = toastSeq++
  toasts = [...toasts.slice(-2), { id, message, ...opts }]
  for (const l of toastListeners) l()
  if (typeof window !== 'undefined') {
    window.setTimeout(() => dismissToast(id), 6000)
  }
}

/* ----------------------------------------------------------------- cart */

/**
 * Cart lines are keyed by product + variant: 2 kg and 12 kg of the same food
 * are separate lines. Single-SKU products store no variantId. Lines saved
 * before variants existed resolve to the product's default variant.
 */
function normalizeVariant(productId: string, variantId?: string): string | undefined {
  const found = findVariant(productId, variantId)
  if (!found || !found.product.variants?.length) return undefined
  return found.variant.id
}

const sameLine = (i: CartItem, productId: string, variantId?: string) =>
  i.productId === productId && normalizeVariant(i.productId, i.variantId) === variantId

export function addToCart(productId: string, qty = 1, variantId?: string) {
  const vid = normalizeVariant(productId, variantId)
  const existing = state.cart.find((i) => sameLine(i, productId, vid))
  const cart = existing
    ? state.cart.map((i) => (i === existing ? { ...i, variantId: vid, qty: Math.min(i.qty + qty, 99) } : i))
    : [...state.cart, { productId, variantId: vid, qty }]
  setState({ cart })
}

export function setCartQty(productId: string, qty: number, variantId?: string) {
  const vid = normalizeVariant(productId, variantId)
  if (qty <= 0) {
    removeFromCart(productId, vid)
    return
  }
  setState({
    cart: state.cart.map((i) => (sameLine(i, productId, vid) ? { ...i, qty: Math.min(qty, 99) } : i)),
  })
}

/** swap a cart line to another variant (e.g. 2 kg → 6 kg), merging if that line exists */
export function changeCartVariant(productId: string, fromVariantId: string | undefined, toVariantId: string) {
  const from = normalizeVariant(productId, fromVariantId)
  const to = normalizeVariant(productId, toVariantId)
  if (from === to) return
  const line = state.cart.find((i) => sameLine(i, productId, from))
  if (!line) return
  const rest = state.cart.filter((i) => i !== line)
  const target = rest.find((i) => sameLine(i, productId, to))
  setState({
    cart: target
      ? rest.map((i) => (i === target ? { ...i, qty: Math.min(i.qty + line.qty, 99) } : i))
      : state.cart.map((i) => (i === line ? { ...i, variantId: to } : i)),
  })
}

export function removeFromCart(productId: string, variantId?: string) {
  const vid = normalizeVariant(productId, variantId)
  const found = findVariant(productId, vid)
  const label = found ? variantLabel(found.product, found.variant) : ''
  const name = found ? `${found.product.name}${label ? ` (${label})` : ''}` : 'Item'
  const prev = state.cart
  setState({ cart: state.cart.filter((i) => !sameLine(i, productId, vid)) })
  pushToast(`${name} removed`, {
    actionLabel: 'Undo',
    onAction: () => {
      setState({ cart: prev })
      pushToast(`${name} restored`)
    },
  })
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((n, i) => n + i.qty, 0)
}

/** the price a cart line is charged at — the chosen variant's */
export function linePrice(item: CartItem): number {
  return findVariant(item.productId, item.variantId)?.variant.price ?? 0
}

export function cartTotals(cart: CartItem[]) {
  const subtotal = cart.reduce((sum, i) => sum + linePrice(i) * i.qty, 0)
  const delivery =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  return { subtotal, delivery, total: subtotal + delivery }
}

/* --------------------------------------------------------------- orders */

export function placeOrder(addressLine: string, paidWith?: string): Order {
  const { subtotal, delivery, total } = cartTotals(state.cart)
  const order: Order = {
    id: `PS-${1043 + state.orders.length}`,
    placedAtDaysAgo: 0,
    items: state.cart.map((i) => {
      const found = findVariant(i.productId, i.variantId)
      const label = found ? variantLabel(found.product, found.variant) : ''
      return {
        productId: i.productId,
        variantId: found?.product.variants?.length ? found.variant.id : undefined,
        variantLabel: label || undefined,
        qty: i.qty,
        priceAtPurchase: found?.variant.price ?? 0,
      }
    }),
    subtotal,
    delivery,
    total,
    status: 'placed',
    addressLine,
    paidWith,
  }
  setState({ orders: [order, ...state.orders], cart: [] })
  return order
}

/** put a past order's in-stock items back in the cart; returns how many lines were added */
export function reorder(orderId: string): number {
  const order = state.orders.find((o) => o.id === orderId)
  if (!order) return 0
  let added = 0
  for (const item of order.items) {
    const found = findVariant(item.productId, item.variantId)
    if (!found || found.variant.stock === 0) continue
    addToCart(item.productId, item.qty, found.variant.id)
    added++
  }
  return added
}

/* ------------------------------------------------------------- bookings */

export function bookService(input: {
  clinicId: string
  serviceId: string
  petId: string
  dayOffset: number
  time: string
}): Booking {
  const booking: Booking = {
    id: `BK-${2202 + state.bookings.length}`,
    dayOffset: input.dayOffset,
    status: 'upcoming',
    clinicId: input.clinicId,
    serviceId: input.serviceId,
    petId: input.petId,
    time: input.time,
  }
  setState({ bookings: [booking, ...state.bookings], clinicLinked: true })

  // if this books an overdue/due vaccine for that pet, mark it scheduled
  const clinic = CLINICS.find((c) => c.id === input.clinicId)
  const isVaccination = clinic?.services.some(
    (s) => s.id === input.serviceId && s.type === 'vaccination',
  )
  if (isVaccination) {
    setState({
      vaccines: state.vaccines.map((v) =>
        v.petId === input.petId && (v.status === 'due' || v.status === 'overdue')
          ? { ...v, status: 'scheduled', scheduledFor: shortOffset(input.dayOffset) }
          : v,
      ),
    })
  }
  return booking
}

function shortOffset(days: number): string {
  if (days === 0) return 'today'
  return days === 1 ? 'tomorrow' : `in ${days} days`
}

export function rescheduleBooking(id: string, dayOffset: number, time: string) {
  setState({
    bookings: state.bookings.map((b) => (b.id === id ? { ...b, dayOffset, time } : b)),
  })
}

export function cancelBooking(id: string) {
  const prev = state.bookings
  setState({
    bookings: state.bookings.map((b) =>
      b.id === id ? { ...b, status: 'cancelled' } : b,
    ),
  })
  pushToast('Booking cancelled', {
    actionLabel: 'Undo',
    onAction: () => {
      setState({ bookings: prev })
      pushToast('Booking restored')
    },
  })
}

/* --------------------------------------------------------------- health */

export function syncClinicRecords() {
  setState({ lastSyncLabel: 'just now' })
}

/* -------------------------------------------------------------- profile */

export function updateProfile(patch: Partial<Profile>) {
  setState({ profile: { ...state.profile, ...patch } })
}

export function saveAddress(addr: Address) {
  const exists = state.profile.addresses.some((a) => a.id === addr.id)
  const addresses = exists
    ? state.profile.addresses.map((a) => (a.id === addr.id ? addr : a))
    : [...state.profile.addresses, addr]
  updateProfile({ addresses })
}

export function removeAddress(id: string) {
  updateProfile({ addresses: state.profile.addresses.filter((a) => a.id !== id) })
}

export function updatePet(petId: string, patch: Partial<(typeof PETS)[number]>) {
  setState({
    pets: state.pets.map((p) => (p.id === petId ? { ...p, ...patch } : p)),
  })
}

export function addPet(pet: {
  name: string
  species: Species
  breed: string
  ageYears?: number
  weightKg?: number
  sex?: Pet['sex']
}) {
  const id = `pet${state.pets.length + 1}-${Date.now().toString(36)}`
  const weightKg = pet.weightKg ?? speciesInfo(pet.species).defaultWeightKg
  setState({
    pets: [
      ...state.pets,
      {
        id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        ageYears: pet.ageYears ?? 1,
        weightKg,
        sex: pet.sex,
        weightLog: [{ daysAgo: 0, kg: weightKg }],
      },
    ],
  })
  return id
}

export function removePet(petId: string) {
  const prev = { pets: state.pets, vaccines: state.vaccines }
  const name = state.pets.find((p) => p.id === petId)?.name ?? 'Pet'
  setState({
    pets: state.pets.filter((p) => p.id !== petId),
    vaccines: state.vaccines.filter((v) => v.petId !== petId),
  })
  pushToast(`${name} removed`, {
    actionLabel: 'Undo',
    onAction: () => {
      setState(prev)
      pushToast(`${name} restored`)
    },
  })
}

export function logWeight(petId: string, kg: number) {
  setState({
    pets: state.pets.map((p) =>
      p.id === petId
        ? {
            ...p,
            weightKg: kg,
            weightLog: [...(p.weightLog ?? []).filter((w) => w.daysAgo !== 0), { daysAgo: 0, kg }],
          }
        : p,
    ),
  })
}

/* ------------------------------------------------------ vaccine records */

export function addVaccineRecord(input: {
  petId: string
  name: string
  shieldsAgainst: string
  dueInDays: number
  source: string
}) {
  const record: VaccineRecord = {
    id: `v-${Date.now().toString(36)}`,
    petId: input.petId,
    name: input.name,
    shieldsAgainst: input.shieldsAgainst,
    dueInDays: input.dueInDays,
    status: input.dueInDays < 0 ? 'overdue' : input.dueInDays <= 30 ? 'due' : 'ok',
    source: input.source,
  }
  setState({ vaccines: [...state.vaccines, record] })
  return record
}

/** the owner says the jab already happened (e.g. at a vet we don't sync with) */
export function markVaccineGiven(id: string) {
  const prev = state.vaccines
  const rec = prev.find((v) => v.id === id)
  if (!rec) return
  setState({
    vaccines: prev.map((v) =>
      v.id === id ? { ...v, dueInDays: 365, status: 'ok' as const, scheduledFor: undefined } : v,
    ),
  })
  pushToast(`${rec.name} marked as given — next due in a year`, {
    actionLabel: 'Undo',
    onAction: () => setState({ vaccines: prev }),
  })
}

export function removeVaccineRecord(id: string) {
  const prev = state.vaccines
  setState({ vaccines: state.vaccines.filter((v) => v.id !== id) })
  pushToast('Record removed', {
    actionLabel: 'Undo',
    onAction: () => setState({ vaccines: prev }),
  })
}

/* ---------------------------------------------------------------- saved */

export function toggleSavedProduct(id: string) {
  const on = state.savedProducts.includes(id)
  setState({
    savedProducts: on ? state.savedProducts.filter((x) => x !== id) : [id, ...state.savedProducts],
  })
  return !on
}

export function toggleSavedClinic(id: string) {
  const on = state.savedClinics.includes(id)
  setState({
    savedClinics: on ? state.savedClinics.filter((x) => x !== id) : [id, ...state.savedClinics],
  })
  return !on
}

/* -------------------------------------------------------------- search */

export function rememberSearch(term: string) {
  const t = term.trim()
  if (t.length < 2) return
  setState({
    recentSearches: [t, ...state.recentSearches.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6),
  })
}

export function clearRecentSearches() {
  setState({ recentSearches: [] })
}

/* ------------------------------------------------------------- session */

function normEmail(email: string) {
  return email.trim().toLowerCase()
}

/** park the active account's data so the top level can be reused */
function parkedAccounts(): Record<string, AccountData> {
  if (!state.signedIn || !state.sessionKey) return state.accounts
  return { ...state.accounts, [state.sessionKey]: pickAccount(state) }
}

/**
 * Switch the top level to `key`'s data. What a guest put in the cart or saved
 * before signing in comes along — nobody should lose a basket to a login wall.
 */
function openSession(key: string, fallback: AccountData, profilePatch?: Partial<Profile>) {
  const guest = state.signedIn ? emptyAccount() : pickAccount(state)
  const accounts = parkedAccounts()
  const acct = accounts[key] ?? fallback
  const rest = { ...accounts }
  delete rest[key]

  const cart = [...acct.cart]
  for (const line of guest.cart) {
    const hit = cart.find((c) => c.productId === line.productId && c.variantId === line.variantId)
    if (hit) hit.qty = Math.min(99, hit.qty + line.qty)
    else cart.push(line)
  }
  setState({
    ...acct,
    cart: cart.map((c) => ({ ...c })),
    savedProducts: [...new Set([...guest.savedProducts, ...acct.savedProducts])],
    savedClinics: [...new Set([...guest.savedClinics, ...acct.savedClinics])],
    profile: { ...acct.profile, ...profilePatch },
    signedIn: true,
    sessionKey: key,
    accounts: rest,
  })
}

/** credential sign-in — returns an error string, or null on success */
export function signIn(email: string, password: string): string | null {
  const account = state.users.find((u) => u.email === normEmail(email))
  if (!account || account.password !== password) {
    return 'That email and password don’t match an account. Try again, or reset your password.'
  }
  openSession(account.email, account.email === DEMO_EMAIL ? demoAccount() : emptyAccount(account.name, account.email), {
    name: account.name,
    email: account.email,
  })
  return null
}

/** one tap into the seeded demo account (used by the landing page) */
export function signInDemo() {
  const demo = state.users.find((u) => u.email === DEMO_EMAIL)
  if (demo) signIn(demo.email, demo.password)
  else openSession(DEMO_EMAIL, demoAccount())
}

/**
 * Social / one-tap path — a session without a stored password (demo). Each
 * provider maps to one account, so signing in again restores it.
 * Returns true when the account is brand new (send it to onboarding).
 */
export function signInSocial(provider: string): boolean {
  const key = `social:${provider.toLowerCase()}`
  const isNew = !state.accounts[key]
  openSession(key, emptyAccount(`${provider} user`, ''))
  return isNew
}

/** kept for callers that predate provider-specific sessions */
export function signInGuest() {
  return signInSocial('Guest')
}

/** register a real account — returns an error string, or null on success */
export function signUpAccount(name: string, email: string, password: string): string | null {
  const em = normEmail(email)
  if (state.users.some((u) => u.email === em)) {
    return 'An account with that email already exists. Sign in instead, or use a different email.'
  }
  const accounts = { ...state.accounts }
  delete accounts[em] // leftovers from a deleted account never leak into a new one
  setState({ users: [...state.users, { name: name.trim(), email: em, password }], accounts })
  openSession(em, emptyAccount(name.trim(), em))
  return null
}

/** complete the forgot-password loop — returns an error string, or null */
export function resetPassword(email: string, newPassword: string): string | null {
  const em = normEmail(email)
  if (!state.users.some((u) => u.email === em)) {
    return 'We couldn’t find an account for that email. Check the address, or create a new account.'
  }
  setState({
    users: state.users.map((u) => (u.email === em ? { ...u, password: newPassword } : u)),
  })
  return null
}

/** true when the session has a password (email accounts), false for social */
export function hasPassword(s: AppState): boolean {
  return !!s.sessionKey && s.users.some((u) => u.email === s.sessionKey)
}

export function changePassword(current: string, next: string): string | null {
  const user = state.users.find((u) => u.email === state.sessionKey)
  if (!user) return 'This account signs in with Apple or Google, so it has no password to change.'
  if (user.password !== current) return 'Your current password isn’t right. Try again, or sign out and reset it.'
  if (next.length < 8) return 'Use at least 8 characters for the new password.'
  if (next === current) return 'Pick a password you haven’t used for this account.'
  setState({ users: state.users.map((u) => (u === user ? { ...u, password: next } : u)) })
  return null
}

export function signOut() {
  setState({ ...emptyAccount(), accounts: parkedAccounts(), signedIn: false, sessionKey: null })
}

/** remove the signed-in account, its password and all of its data */
export function deleteAccount() {
  const key = state.sessionKey
  const accounts = { ...state.accounts }
  if (key) delete accounts[key]
  setState({
    ...emptyAccount(),
    users: state.users.filter((u) => u.email !== key),
    accounts,
    signedIn: false,
    sessionKey: null,
  })
}

/** everything this account holds, as a downloadable JSON string */
export function exportAccountData(): string {
  const data = pickAccount(state)
  return JSON.stringify({ exportedAt: new Date().toISOString(), account: state.sessionKey, ...data }, null, 2)
}

/* ------------------------------------------------------ payment methods */

export function cardBrand(digits: string): PaymentCard['brand'] {
  if (/^4/.test(digits)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard'
  if (/^3[47]/.test(digits)) return 'Amex'
  return 'Card'
}

export function cardLabel(c: PaymentCard): string {
  return `${c.brand} ending ${c.last4}`
}

export function addCard(input: { digits: string; exp: string; name: string; makeDefault?: boolean }): PaymentCard {
  const card: PaymentCard = {
    id: `pm-${Date.now().toString(36)}`,
    brand: cardBrand(input.digits),
    last4: input.digits.slice(-4),
    exp: input.exp,
    name: input.name.trim() || state.profile.name,
    isDefault: input.makeDefault || state.cards.length === 0,
  }
  const others = card.isDefault ? state.cards.map((c) => ({ ...c, isDefault: false })) : state.cards
  setState({ cards: [...others, card] })
  return card
}

export function setDefaultCard(id: string) {
  setState({ cards: state.cards.map((c) => ({ ...c, isDefault: c.id === id })) })
}

export function removeCard(id: string) {
  const prev = state.cards
  const gone = prev.find((c) => c.id === id)
  let cards = prev.filter((c) => c.id !== id)
  if (gone?.isDefault && cards.length) cards = cards.map((c, i) => ({ ...c, isDefault: i === 0 }))
  setState({ cards })
  if (gone) {
    pushToast(`${cardLabel(gone)} removed`, { actionLabel: 'Undo', onAction: () => setState({ cards: prev }) })
  }
}

/* ------------------------------------------------------ recently viewed */

export function noteViewed(productId: string) {
  if (state.recentlyViewed[0] === productId) return
  setState({ recentlyViewed: [productId, ...state.recentlyViewed.filter((x) => x !== productId)].slice(0, 12) })
}

export function clearRecentlyViewed() {
  setState({ recentlyViewed: [] })
}

/* -------------------------------------------------------- notifications */

/**
 * Notices are derived from live state — an overdue vaccine, a parcel in
 * transit, tomorrow's appointment — so they can never drift out of date.
 * Only the read/unread set is stored.
 */
export function deriveNotices(s: AppState): Notice[] {
  if (!s.signedIn) return []
  const out: Notice[] = []
  const petName = (id: string) => s.pets.find((p) => p.id === id)?.name

  if (s.profile.notifyVaccines) {
    for (const v of s.vaccines) {
      const name = petName(v.petId)
      if (!name) continue
      if (v.status === 'overdue') {
        out.push({
          id: `vax-${v.id}-overdue`,
          kind: 'vaccine',
          title: `${name}’s ${v.name} is overdue`,
          body: `It was due ${Math.abs(v.dueInDays)} days ago. Book a vaccination visit to get back on schedule.`,
          minutesAgo: 60 * 3,
          to: '/clinics',
          search: { service: 'vaccination' },
          urgent: true,
        })
      } else if (v.status === 'due' && v.dueInDays <= 14) {
        out.push({
          id: `vax-${v.id}-due`,
          kind: 'vaccine',
          title: `${v.name} due for ${name}`,
          body: `Due in ${v.dueInDays} day${v.dueInDays === 1 ? '' : 's'}. Clinics near you have slots this week.`,
          minutesAgo: 60 * 20,
          to: '/pets/$id',
          params: { id: v.petId },
        })
      }
    }
  }

  for (const b of s.bookings) {
    if (b.status !== 'upcoming' || b.dayOffset > 7) continue
    const clinic = CLINICS.find((c) => c.id === b.clinicId)
    const service = clinic?.services.find((x) => x.id === b.serviceId)
    out.push({
      id: `bk-${b.id}`,
      kind: 'booking',
      title: b.dayOffset <= 1 ? `${service?.name ?? 'Visit'} ${b.dayOffset === 0 ? 'today' : 'tomorrow'}` : `${service?.name ?? 'Visit'} in ${b.dayOffset} days`,
      body: `${clinic?.name ?? 'Clinic'} at ${b.time} with ${petName(b.petId) ?? 'your pet'}. Arrive ten minutes early.`,
      minutesAgo: 60 * 5,
      to: '/bookings/$id',
      params: { id: b.id },
    })
  }

  if (s.profile.notifyOrders) {
    for (const o of s.orders) {
      if (o.status === 'delivered' && o.placedAtDaysAgo > 20) continue
      out.push({
        id: `order-${o.id}-${o.status}`,
        kind: 'order',
        title:
          o.status === 'transit'
            ? `Order #${o.id} is on its way`
            : o.status === 'placed'
              ? `Order #${o.id} confirmed`
              : `Order #${o.id} delivered`,
        body:
          o.status === 'transit'
            ? 'The courier expects to deliver tomorrow before 8 pm.'
            : o.status === 'placed'
              ? 'We’re packing it now and will let you know when it ships.'
              : `Left at ${o.addressLine}. Enjoy!`,
        minutesAgo: o.status === 'placed' ? 2 : Math.max(1, o.placedAtDaysAgo - 1) * 60 * 24,
        to: '/orders/$id',
        params: { id: o.id },
      })
    }
  }

  if (s.clinicLinked) out.push({
    id: `sync-${s.lastSyncLabel}`,
    kind: 'sync',
    title: 'Clinic records synced',
    body: `Green Valley Veterinary shared ${s.vaccines.length} vaccination records.`,
    minutesAgo: s.lastSyncLabel === 'just now' ? 1 : 60 * 24 * 2,
    to: '/health',
  })

  if (s.profile.notifyOffers) {
    out.push({
      id: 'offer-flea-season',
      kind: 'offer',
      title: 'Flea & tick season',
      body: 'Spot-ons and chews for dogs and cats — free delivery over $49.',
      minutesAgo: 60 * 24 * 3,
      to: '/shop',
      search: { cat: 'health' },
    })
  }

  return out.sort((a, b) => a.minutesAgo - b.minutesAgo)
}

export function markNoticesRead(ids: string[]) {
  const set = new Set([...state.readNotices, ...ids])
  setState({ readNotices: [...set].slice(-200) })
}

export function markNoticeRead(id: string) {
  if (state.readNotices.includes(id)) return
  setState({ readNotices: [...state.readNotices, id].slice(-200) })
}

export function useUnreadCount(): number {
  const s = useAppState()
  return deriveNotices(s).filter((n) => !s.readNotices.includes(n.id)).length
}

export const CATALOG_SIZE = PRODUCTS.length

/* -------------------------------------------------------------- reviews */

export function addUserReview(input: { kind: UserReview['kind']; targetId: string; rating: number; text: string; topic?: string }) {
  const review: UserReview = {
    ...input,
    id: `u-${Date.now().toString(36)}`,
    author: state.profile.name ? `${state.profile.name.split(' ')[0]} (you)` : 'You',
    daysAgo: 0,
    verified: input.kind === 'product'
      ? state.orders.some((o) => o.items.some((it) => it.productId === input.targetId))
      : state.bookings.some((b) => b.clinicId === input.targetId && b.status === 'completed'),
    helpful: 0,
  }
  setState({ userReviews: [review, ...state.userReviews] })
  return review
}

export function toggleHelpful(reviewId: string) {
  const on = state.helpfulVotes.includes(reviewId)
  setState({ helpfulVotes: on ? state.helpfulVotes.filter((x) => x !== reviewId) : [...state.helpfulVotes, reviewId] })
}
