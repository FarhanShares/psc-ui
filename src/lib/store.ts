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
  getProduct,
} from './data'
import type {
  Address,
  Booking,
  CartItem,
  Notice,
  Order,
  Pet,
  Profile,
  VaccineRecord,
} from './types'

export interface Toast {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
}

export interface AppState {
  cart: CartItem[]
  orders: Order[]
  bookings: Booking[]
  profile: Profile
  pets: typeof PETS
  vaccines: VaccineRecord[]
  lastSyncLabel: string
  savedProducts: string[]
  savedClinics: string[]
  readNotices: string[]
  recentSearches: string[]
  signedIn: boolean
}

function seedState(): AppState {
  return {
    cart: [],
    orders: SEED_ORDERS,
    bookings: SEED_BOOKINGS,
    profile: SEED_PROFILE,
    pets: PETS,
    vaccines: VACCINES,
    lastSyncLabel: '2 days ago',
    savedProducts: ['p12', 'p09'],
    savedClinics: ['c04'],
    readNotices: [],
    recentSearches: [],
    signedIn: true,
  }
}

const STORAGE_KEY = 'petsafecare.state.v1'

let state: AppState = seedState()
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
        cart: state.cart,
        orders: state.orders,
        bookings: state.bookings,
        profile: state.profile,
        pets: state.pets,
        vaccines: state.vaccines,
        lastSyncLabel: state.lastSyncLabel,
        savedProducts: state.savedProducts,
        savedClinics: state.savedClinics,
        readNotices: state.readNotices,
        recentSearches: state.recentSearches,
        signedIn: state.signedIn,
      }),
    )
  } catch {
    // storage full or unavailable — the app still works in-memory
  }
}

function setState(patch: Partial<AppState>) {
  state = { ...state, ...patch }
  persist()
  emit()
}

export function hydrateFromStorage() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw) as Partial<AppState>
    state = { ...state, ...saved }
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
  return useSyncExternalStore(subscribe, () => state, () => state)
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

export function addToCart(productId: string, qty = 1) {
  const existing = state.cart.find((i) => i.productId === productId)
  const cart = existing
    ? state.cart.map((i) =>
        i.productId === productId ? { ...i, qty: Math.min(i.qty + qty, 99) } : i,
      )
    : [...state.cart, { productId, qty }]
  setState({ cart })
}

export function setCartQty(productId: string, qty: number) {
  if (qty <= 0) {
    removeFromCart(productId)
    return
  }
  setState({
    cart: state.cart.map((i) => (i.productId === productId ? { ...i, qty } : i)),
  })
}

export function removeFromCart(productId: string) {
  const item = state.cart.find((i) => i.productId === productId)
  const name = item ? getProduct(productId)?.name ?? 'Item' : 'Item'
  const prev = state.cart
  setState({ cart: state.cart.filter((i) => i.productId !== productId) })
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

export function cartTotals(cart: CartItem[]) {
  const subtotal = cart.reduce((sum, i) => {
    const p = getProduct(i.productId)
    return sum + (p ? p.price * i.qty : 0)
  }, 0)
  const delivery =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  return { subtotal, delivery, total: subtotal + delivery }
}

/* --------------------------------------------------------------- orders */

export function placeOrder(addressLine: string): Order {
  const { subtotal, delivery, total } = cartTotals(state.cart)
  const order: Order = {
    id: `PS-${1043 + state.orders.length}`,
    placedAtDaysAgo: 0,
    items: state.cart.map((i) => ({
      productId: i.productId,
      qty: i.qty,
      priceAtPurchase: getProduct(i.productId)?.price ?? 0,
    })),
    subtotal,
    delivery,
    total,
    status: 'placed',
    addressLine,
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
    const p = getProduct(item.productId)
    if (!p || p.stock === 0) continue
    addToCart(item.productId, item.qty)
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
  setState({ bookings: [booking, ...state.bookings] })

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
  species: 'dog' | 'cat'
  breed: string
  ageYears?: number
  weightKg?: number
  sex?: Pet['sex']
}) {
  const id = `pet${state.pets.length + 1}-${Date.now().toString(36)}`
  const weightKg = pet.weightKg ?? (pet.species === 'cat' ? 4 : 12)
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

export function signIn(patch?: Partial<Profile>) {
  setState({ signedIn: true, profile: patch ? { ...state.profile, ...patch } : state.profile })
}

export function signOut() {
  setState({ signedIn: false, cart: [] })
}

/* -------------------------------------------------------- notifications */

/**
 * Notices are derived from live state — an overdue vaccine, a parcel in
 * transit, tomorrow's appointment — so they can never drift out of date.
 * Only the read/unread set is stored.
 */
export function deriveNotices(s: AppState): Notice[] {
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

  out.push({
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
