import type {
  Booking,
  Clinic,
  Order,
  Pet,
  Product,
  Profile,
  VaccineRecord,
} from './types'

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'food', label: 'Food' },
  { id: 'treats', label: 'Treats' },
  { id: 'grooming', label: 'Grooming' },
  { id: 'toys', label: 'Toys' },
  { id: 'health', label: 'Health' },
] as const

export const SERVICE_TYPES = [
  { id: 'consultation', label: 'Consultation' },
  { id: 'vaccination', label: 'Vaccination' },
  { id: 'grooming', label: 'Grooming' },
  { id: 'dental', label: 'Dental' },
  { id: 'surgery', label: 'Surgery' },
  { id: 'checkup', label: 'Checkup' },
] as const

export const PRODUCTS: Product[] = [
  {
    id: 'p01',
    name: 'Harvest Bowl Adult Dog Food',
    brand: 'Field & Kernel',
    category: 'food',
    price: 54.0,
    unit: '12 kg bag',
    rating: 4.8,
    reviews: 214,
    stock: 18,
    blurb:
      'Slow-cooked chicken and brown rice recipe with omega-3s for coat health. Complete nutrition for adult dogs of all breeds.',
  },
  {
    id: 'p02',
    name: 'Ocean Feast Cat Kibble',
    brand: 'Tideline',
    category: 'food',
    price: 23.5,
    unit: '3 kg bag',
    rating: 4.6,
    reviews: 167,
    stock: 32,
    blurb:
      'Wild-caught salmon first ingredient, grain-free, with taurine for heart health and a hydration-friendly kibble shape.',
  },
  {
    id: 'p03',
    name: 'Puppy Starter Blend',
    brand: 'Field & Kernel',
    category: 'food',
    price: 18.75,
    unit: '2 kg bag',
    rating: 4.7,
    reviews: 98,
    stock: 25,
    blurb:
      'Small-breed kibble with DHA for brain development and added calcium for growing joints. For pups up to 12 months.',
  },
  {
    id: 'p04',
    name: 'Salmon Soft Bites',
    brand: 'Tideline',
    category: 'treats',
    price: 8.25,
    unit: '120 g pouch',
    rating: 4.9,
    reviews: 341,
    stock: 54,
    blurb:
      'Single-ingredient salmon treats, air-dried and soft enough for training rewards. No fillers, no added sugar.',
  },
  {
    id: 'p05',
    name: 'Peanut Butter Biscuits',
    brand: 'Barkery',
    category: 'treats',
    price: 6.9,
    unit: '200 g box',
    rating: 4.5,
    reviews: 122,
    stock: 41,
    blurb:
      'Oven-baked whole-wheat biscuits with unsweetened peanut butter. Crunchy texture helps scrape plaque while they chew.',
  },
  {
    id: 'p06',
    name: 'Oatmeal Soothing Shampoo',
    brand: 'Coatwise',
    category: 'grooming',
    price: 12.4,
    unit: '500 ml',
    rating: 4.6,
    reviews: 186,
    stock: 22,
    blurb:
      'Colloidal oatmeal and aloe formula for sensitive skin. pH-balanced for dogs and cats, gentle enough for weekly baths.',
  },
  {
    id: 'p07',
    name: 'Deshedding Glove',
    brand: 'Coatwise',
    category: 'grooming',
    price: 9.8,
    unit: 'one size',
    rating: 4.4,
    reviews: 75,
    stock: 37,
    blurb:
      'Silicone-tipped glove that lifts loose fur while petting. Works wet or dry, and rinses clean under a tap.',
  },
  {
    id: 'p08',
    name: 'Cotton Rope Tug Duo',
    brand: 'Barkery',
    category: 'toys',
    price: 7.5,
    unit: '2 pieces',
    rating: 4.3,
    reviews: 64,
    stock: 29,
    blurb:
      'Braided cotton ropes in two lengths for tug and fetch. Flossy fibres help clean teeth during play.',
  },
  {
    id: 'p09',
    name: 'Feather Wand Teaser',
    brand: 'Tideline',
    category: 'toys',
    price: 5.95,
    unit: '65 cm wand',
    rating: 4.7,
    reviews: 210,
    stock: 48,
    blurb:
      'Natural feathers on a flexible wand with a bell. Replacement feathers included — indoor cats burn real energy chasing it.',
  },
  {
    id: 'p10',
    name: 'Squeaky Rubber Bone',
    brand: 'Barkery',
    category: 'toys',
    price: 6.4,
    unit: '18 cm',
    rating: 4.2,
    reviews: 51,
    stock: 0,
    blurb:
      'Natural rubber bone with a low-toned squeaker that survives heavy chewers. Dishwasher-safe, floats in water.',
  },
  {
    id: 'p11',
    name: 'Flea & Tick Spot-On',
    brand: 'Vetline',
    category: 'health',
    price: 21.0,
    unit: '3-month pack',
    rating: 4.8,
    reviews: 289,
    stock: 16,
    blurb:
      'Veterinary-strength fipronil spot-on for dogs over 10 kg. One application protects for four weeks.',
  },
  {
    id: 'p12',
    name: 'Joint Care Chews',
    brand: 'Vetline',
    category: 'health',
    price: 17.6,
    unit: '90 chews',
    rating: 4.5,
    reviews: 133,
    stock: 20,
    blurb:
      'Glucosamine and green-lipped mussel chews for hips and joints. Duck-flavoured, for senior and active dogs alike.',
  },
  {
    id: 'p13',
    name: 'Dental Clean Powder',
    brand: 'Coatwise',
    category: 'health',
    price: 11.25,
    unit: '80 g jar',
    rating: 4.1,
    reviews: 47,
    stock: 26,
    blurb:
      'Seaweed-derived powder sprinkled on food to reduce plaque over time. Odourless, tasteless, vet-formulated.',
  },
]

export const CLINICS: Clinic[] = [
  {
    id: 'c01',
    name: 'Green Valley Veterinary',
    area: 'Maple District',
    distanceKm: 2.1,
    rating: 4.8,
    reviews: 412,
    verified: true,
    openNow: true,
    hours: 'Mon–Sat · 9:00–19:00',
    phone: '(555) 014-2210',
    priceBand: 2,
    services: [
      { id: 'c01s1', name: 'General consultation', type: 'consultation', durationMin: 30, price: 35 },
      { id: 'c01s2', name: 'Core vaccination', type: 'vaccination', durationMin: 20, price: 28, note: 'Rabies · DHPP · FVRCP' },
      { id: 'c01s3', name: 'Full-body grooming', type: 'grooming', durationMin: 60, price: 45 },
      { id: 'c01s4', name: 'Dental check & scale', type: 'dental', durationMin: 40, price: 50 },
      { id: 'c01s5', name: 'Annual wellness exam', type: 'checkup', durationMin: 45, price: 40 },
    ],
  },
  {
    id: 'c02',
    name: 'Harborline Animal Clinic',
    area: 'Old Port',
    distanceKm: 3.4,
    rating: 4.6,
    reviews: 305,
    verified: true,
    openNow: true,
    hours: 'Mon–Fri · 8:30–18:00',
    phone: '(555) 014-8842',
    priceBand: 2,
    services: [
      { id: 'c02s1', name: 'General consultation', type: 'consultation', durationMin: 30, price: 32 },
      { id: 'c02s2', name: 'Core vaccination', type: 'vaccination', durationMin: 20, price: 26 },
      { id: 'c02s3', name: 'Soft-tissue surgery', type: 'surgery', durationMin: 90, price: 180, note: 'Includes pre-op bloodwork' },
      { id: 'c02s4', name: 'Annual wellness exam', type: 'checkup', durationMin: 40, price: 38 },
    ],
  },
  {
    id: 'c03',
    name: 'Northgate Pet Hospital',
    area: 'Northgate',
    distanceKm: 5.0,
    rating: 4.4,
    reviews: 198,
    verified: true,
    openNow: false,
    hours: 'Mon–Sat · 10:00–20:00',
    phone: '(555) 015-1020',
    priceBand: 1,
    services: [
      { id: 'c03s1', name: 'General consultation', type: 'consultation', durationMin: 30, price: 25 },
      { id: 'c03s2', name: 'Core vaccination', type: 'vaccination', durationMin: 20, price: 22 },
      { id: 'c03s3', name: 'Full-body grooming', type: 'grooming', durationMin: 75, price: 38 },
      { id: 'c03s4', name: 'Dental check & scale', type: 'dental', durationMin: 45, price: 44 },
    ],
  },
  {
    id: 'c04',
    name: 'Willow Creek Vet Studio',
    area: 'Willow Creek',
    distanceKm: 6.2,
    rating: 4.9,
    reviews: 156,
    verified: true,
    openNow: true,
    hours: 'Tue–Sun · 9:00–17:00',
    phone: '(555) 016-3377',
    priceBand: 3,
    services: [
      { id: 'c04s1', name: 'Extended consultation', type: 'consultation', durationMin: 45, price: 48, note: 'Senior-pet focused' },
      { id: 'c04s2', name: 'Core vaccination', type: 'vaccination', durationMin: 20, price: 30 },
      { id: 'c04s3', name: 'Spa grooming package', type: 'grooming', durationMin: 90, price: 68, note: 'Bath, trim, nails, ears' },
      { id: 'c04s4', name: 'Dental check & scale', type: 'dental', durationMin: 40, price: 58 },
    ],
  },
  {
    id: 'c05',
    name: 'CityPaws 24h Emergency',
    area: 'Downtown',
    distanceKm: 7.8,
    rating: 4.5,
    reviews: 521,
    verified: true,
    openNow: true,
    hours: 'Open 24 hours',
    phone: '(555) 017-0000',
    priceBand: 3,
    services: [
      { id: 'c05s1', name: 'Urgent consultation', type: 'consultation', durationMin: 30, price: 55 },
      { id: 'c05s2', name: 'Emergency surgery', type: 'surgery', durationMin: 120, price: 320 },
      { id: 'c05s3', name: 'Critical care exam', type: 'checkup', durationMin: 40, price: 65 },
    ],
  },
  {
    id: 'c06',
    name: 'Breezefield Mobile Vet',
    area: 'Comes to you',
    distanceKm: 1.2,
    rating: 4.7,
    reviews: 88,
    verified: false,
    openNow: true,
    hours: 'Daily · 8:00–16:00',
    phone: '(555) 018-2244',
    priceBand: 2,
    services: [
      { id: 'c06s1', name: 'Home consultation', type: 'consultation', durationMin: 40, price: 42, note: 'Van visit within 15 km' },
      { id: 'c06s2', name: 'Home vaccination', type: 'vaccination', durationMin: 20, price: 34 },
      { id: 'c06s3', name: 'Nail trim & gland care', type: 'grooming', durationMin: 30, price: 28 },
    ],
  },
]

export const PETS: Pet[] = [
  { id: 'pet1', name: 'Miso', species: 'cat', breed: 'British Shorthair', ageYears: 3, weightKg: 4.2 },
  { id: 'pet2', name: 'Bolt', species: 'dog', breed: 'Border Collie', ageYears: 5, weightKg: 18.4 },
]

export const VACCINES: VaccineRecord[] = [
  {
    id: 'v01',
    petId: 'pet1',
    name: 'Rabies',
    shieldsAgainst: 'Rabies virus',
    dueInDays: -6,
    status: 'overdue',
    source: 'Green Valley Veterinary',
  },
  {
    id: 'v02',
    petId: 'pet1',
    name: 'FVRCP booster',
    shieldsAgainst: 'Feline distemper complex',
    dueInDays: 12,
    status: 'due',
    source: 'Green Valley Veterinary',
  },
  {
    id: 'v03',
    petId: 'pet1',
    name: 'FeLV',
    shieldsAgainst: 'Feline leukemia',
    dueInDays: 180,
    status: 'ok',
    source: 'Harborline Animal Clinic',
  },
  {
    id: 'v04',
    petId: 'pet2',
    name: 'DHPP booster',
    shieldsAgainst: 'Canine distemper complex',
    dueInDays: 4,
    status: 'due',
    source: 'Green Valley Veterinary',
  },
  {
    id: 'v05',
    petId: 'pet2',
    name: 'Leptospirosis',
    shieldsAgainst: 'Lepto bacteria',
    dueInDays: 30,
    status: 'due',
    source: 'Green Valley Veterinary',
  },
  {
    id: 'v06',
    petId: 'pet2',
    name: 'Bordetella',
    shieldsAgainst: 'Kennel cough',
    dueInDays: 9,
    status: 'scheduled',
    scheduledFor: 'in 9 days',
    source: 'Green Valley Veterinary',
  },
  {
    id: 'v07',
    petId: 'pet2',
    name: 'Rabies',
    shieldsAgainst: 'Rabies virus',
    dueInDays: 95,
    status: 'ok',
    source: 'Harborline Animal Clinic',
  },
]

export const SEED_ORDERS: Order[] = [
  {
    id: 'PS-1042',
    placedAtDaysAgo: 2,
    items: [
      { productId: 'p04', qty: 2, priceAtPurchase: 8.25 },
      { productId: 'p11', qty: 1, priceAtPurchase: 21.0 },
      { productId: 'p06', qty: 1, priceAtPurchase: 12.4 },
    ],
    subtotal: 49.9,
    delivery: 0,
    total: 49.9,
    status: 'transit',
    addressLine: '14 Alder Lane, Apt 3',
  },
  {
    id: 'PS-0997',
    placedAtDaysAgo: 16,
    items: [
      { productId: 'p01', qty: 1, priceAtPurchase: 54.0 },
      { productId: 'p09', qty: 1, priceAtPurchase: 5.95 },
    ],
    subtotal: 59.95,
    delivery: 0,
    total: 59.95,
    status: 'delivered',
    addressLine: '14 Alder Lane, Apt 3',
  },
]

export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'BK-2201',
    clinicId: 'c01',
    serviceId: 'c01s3',
    petId: 'pet2',
    dayOffset: 5,
    time: '10:30',
    status: 'upcoming',
  },
  {
    id: 'BK-2154',
    clinicId: 'c01',
    serviceId: 'c01s5',
    petId: 'pet1',
    dayOffset: -21,
    time: '16:00',
    status: 'completed',
  },
  {
    id: 'BK-2102',
    clinicId: 'c02',
    serviceId: 'c02s1',
    petId: 'pet2',
    dayOffset: -35,
    time: '11:15',
    status: 'completed',
  },
]

export const SEED_PROFILE: Profile = {
  name: 'Farhan',
  phone: '+1 (555) 019-4482',
  email: 'farhan@example.com',
  addresses: [
    { id: 'ad1', label: 'Home', line: '14 Alder Lane, Apt 3', isDefault: true },
    { id: 'ad2', label: 'Work', line: '88 Harbor Way, Floor 6', isDefault: false },
  ],
  notifyVaccines: true,
  notifyOrders: true,
  notifyOffers: false,
}

export const FREE_DELIVERY_THRESHOLD = 49
export const DELIVERY_FEE = 4.5

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export function getClinic(id: string): Clinic | undefined {
  return CLINICS.find((c) => c.id === id)
}

export function getService(clinicId: string, serviceId: string) {
  return getClinic(clinicId)?.services.find((s) => s.id === serviceId)
}

/** deterministic pseudo-random from a string — same on server and client */
export function hashSeed(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h
}

/** stable slot availability for a clinic+day, so SSR and client agree */
export function slotAvailable(clinicId: string, dayIso: string, slot: string): boolean {
  return hashSeed(`${clinicId}|${dayIso}|${slot}`) % 5 !== 0
}

export const BOOKING_SLOTS = [
  '09:00', '09:45', '10:30', '11:15', '12:00',
  '13:30', '14:15', '15:00', '15:45', '16:30', '17:15',
]
