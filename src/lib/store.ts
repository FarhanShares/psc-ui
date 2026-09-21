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
  Order,
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

export function addPet(pet: { name: string; species: 'dog' | 'cat'; breed: string }) {
  const id = `pet${state.pets.length + 1}-${Date.now().toString(36)}`
  setState({
    pets: [
      ...state.pets,
      { id, name: pet.name, species: pet.species, breed: pet.breed, ageYears: 1, weightKg: 4 },
    ],
  })
  return id
}

export const CATALOG_SIZE = PRODUCTS.length
