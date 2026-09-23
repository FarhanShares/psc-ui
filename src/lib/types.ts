export type Species = 'dog' | 'cat'

export type ProductCategory = 'food' | 'treats' | 'grooming' | 'toys' | 'health'

export interface Product {
  id: string
  name: string
  brand: string
  category: ProductCategory
  price: number
  unit: string
  rating: number
  reviews: number
  stock: number
  blurb: string
  /** which species the product suits — drives per-pet recommendations */
  suits: Species[]
}

export type ServiceType =
  | 'consultation'
  | 'vaccination'
  | 'grooming'
  | 'dental'
  | 'surgery'
  | 'checkup'

export interface ClinicService {
  id: string
  name: string
  type: ServiceType
  durationMin: number
  price: number
  note?: string
}

export interface Clinic {
  id: string
  name: string
  area: string
  about?: string
  distanceKm: number
  rating: number
  reviews: number
  verified: boolean
  openNow: boolean
  hours: string
  phone: string
  priceBand: 1 | 2 | 3
  services: ClinicService[]
}

export interface Pet {
  id: string
  name: string
  species: Species
  breed: string
  ageYears: number
  weightKg: number
  sex?: 'male' | 'female'
  neutered?: boolean
  microchip?: string
  allergies?: string
  /** weight history, oldest first — `daysAgo` relative to today */
  weightLog?: { daysAgo: number; kg: number }[]
}

export type VaxStatus = 'ok' | 'due' | 'overdue' | 'scheduled'

export interface VaccineRecord {
  id: string
  petId: string
  name: string
  shieldsAgainst: string
  dueInDays: number // relative to seed time
  status: VaxStatus
  scheduledFor?: string // ISO date booked at a clinic
  source: string // clinic the record syncs from
}

export interface CartItem {
  productId: string
  qty: number
}

export type OrderStatus = 'placed' | 'transit' | 'delivered'

export interface OrderItem {
  productId: string
  qty: number
  priceAtPurchase: number
}

export interface Order {
  id: string
  placedAtDaysAgo: number
  items: OrderItem[]
  subtotal: number
  delivery: number
  total: number
  status: OrderStatus
  addressLine: string
}

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled'

export interface Booking {
  id: string
  clinicId: string
  serviceId: string
  petId: string
  dayOffset: number // days from today; negative = past
  time: string
  status: BookingStatus
}

export interface Address {
  id: string
  label: string
  line: string
  isDefault: boolean
}

export interface Profile {
  name: string
  phone: string
  email: string
  addresses: Address[]
  notifyVaccines: boolean
  notifyOrders: boolean
  notifyOffers: boolean
}

export interface ClinicLink {
  clinicId: string
  syncedAgoLabel: string
  records: number
}

export interface Review {
  id: string
  author: string
  rating: number
  daysAgo: number
  text: string
  pet?: string
}

export type NoticeKind = 'vaccine' | 'order' | 'booking' | 'offer' | 'sync'

export interface Notice {
  id: string
  kind: NoticeKind
  title: string
  body: string
  /** smaller = more recent; used for sorting and the relative time label */
  minutesAgo: number
  to: string
  params?: Record<string, string>
  search?: Record<string, string>
  urgent?: boolean
}

export interface Faq {
  q: string
  a: string
  topic: 'orders' | 'bookings' | 'health' | 'account'
}
