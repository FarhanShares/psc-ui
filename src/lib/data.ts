import { speciesInfo } from './species'
import type {
  AxisId,
  ProductVariant,
  VariantAxis,
  Booking,
  Faq,
  Review,
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

const BASE_PRODUCTS: Product[] = [
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
    suits: ['dog'],
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
    suits: ['cat'],
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
    suits: ['dog'],
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
    suits: ['dog', 'cat'],
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
    suits: ['dog'],
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
    suits: ['dog', 'cat'],
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
    suits: ['dog', 'cat'],
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
    suits: ['dog'],
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
    suits: ['cat'],
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
    suits: ['dog'],
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
    suits: ['dog'],
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
    suits: ['dog'],
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
    suits: ['dog', 'cat'],
  },
  {
    id: 'p14',
    name: 'Purrfect Pâté Wet Cat Food',
    brand: 'Tideline',
    category: 'food',
    price: 7.2,
    unit: '6 × 85 g',
    rating: 4.7,
    reviews: 188,
    stock: 60,
    blurb:
      'Smooth pâté with real fish or poultry first and added water for hydration. Grain-free, no carrageenan, easy-peel trays.',
    suits: ['cat'],
  },
  {
    id: 'p15',
    name: 'Chicken Crunch Dental Sticks',
    brand: 'Barkery',
    category: 'treats',
    price: 6.5,
    unit: '7 sticks',
    rating: 4.6,
    reviews: 142,
    stock: 40,
    blurb:
      'Ridged daily dental chews that scrub as they bend. Pick the size by your dog’s weight so the stick is chewed, not gulped.',
    suits: ['dog'],
  },
  {
    id: 'p16',
    name: 'Catnip Kicker Fish',
    brand: 'Tideline',
    category: 'toys',
    price: 6.95,
    unit: '28 cm',
    rating: 4.5,
    reviews: 96,
    stock: 34,
    blurb:
      'A long canvas fish stuffed with organic catnip, sized for hugging and bunny-kicking. Zip pocket lets you refresh the nip.',
    suits: ['cat'],
  },
  {
    id: 'p17',
    name: 'Garden Seed & Millet Blend',
    brand: 'Featherfield',
    category: 'food',
    price: 6.5,
    unit: '500 g bag',
    rating: 4.7,
    reviews: 121,
    stock: 45,
    blurb:
      'Canary seed, white and red millet with dried vegetables and a little oat groat. Dust-cleaned and sized for budgies and cockatiels.',
    suits: ['bird'],
  },
  {
    id: 'p18',
    name: 'Golden Millet Sprays',
    brand: 'Featherfield',
    category: 'treats',
    price: 4.25,
    unit: '6 sprays',
    rating: 4.9,
    reviews: 204,
    stock: 38,
    blurb:
      'Whole sun-dried millet on the stalk — the treat small birds forage for. Clip one to the cage bars as a weekly reward.',
    suits: ['bird'],
  },
  {
    id: 'p19',
    name: 'Cuttlebone & Mineral Block',
    brand: 'Vetline',
    category: 'health',
    price: 5.4,
    unit: '2 cuttlebones + 1 block',
    rating: 4.6,
    reviews: 77,
    stock: 30,
    blurb:
      'Natural cuttlebone and a calcium-iodine mineral block for strong beaks and eggshells. Includes stainless clips.',
    suits: ['bird'],
  },
  {
    id: 'p20',
    name: 'Cotton Rope Perch Swing',
    brand: 'Featherfield',
    category: 'toys',
    price: 8.9,
    unit: 'Medium · 30 cm',
    rating: 4.4,
    reviews: 58,
    stock: 22,
    blurb:
      'A bendable cotton rope perch with a wooden bell ring. Varied grip diameters keep feet healthy between hops.',
    suits: ['bird'],
  },
]

/* ------------------------------------------------------------ variants */

type Row = [options: Partial<Record<AxisId, string>>, price: number, stock: number, unit: string, extra?: Partial<ProductVariant>]

const kg = (amount: number) => ({ netQty: { amount, per: 'kg' as const } })
const L = (amount: number) => ({ netQty: { amount, per: 'L' as const } })

function variantSet(pid: string, axes: VariantAxis[], rows: Row[]) {
  return {
    axes,
    variants: rows.map(([options, price, stock, unit, extra]) => ({
      id: `${pid}-${axes.map((a) => options[a.id]).join('-')}`,
      options,
      price,
      stock,
      unit,
      ...extra,
    })),
  }
}

const SIZE = (...o: [string, string][]): VariantAxis => ({ id: 'size', label: 'Size', options: o.map(([id, label]) => ({ id, label })) })
const FLAVOUR = (...o: [string, string][]): VariantAxis => ({ id: 'flavour', label: 'Flavour', options: o.map(([id, label]) => ({ id, label })) })

/**
 * Option matrices per product. Every other product is a single SKU. Rows list
 * the combinations that exist — a missing combination is simply unavailable.
 */
const VARIANTS: Record<string, ReturnType<typeof variantSet>> = {
  p01: variantSet(
    'p01',
    [FLAVOUR(['chicken', 'Chicken & rice'], ['lamb', 'Lamb & rice']), SIZE(['2kg', '2 kg'], ['6kg', '6 kg'], ['12kg', '12 kg'])],
    [
      [{ flavour: 'chicken', size: '2kg' }, 14.5, 30, '2 kg bag', kg(2)],
      [{ flavour: 'chicken', size: '6kg' }, 32.0, 22, '6 kg bag', kg(6)],
      [{ flavour: 'chicken', size: '12kg' }, 54.0, 18, '12 kg bag', { ...kg(12), compareAt: 59.0 }],
      [{ flavour: 'lamb', size: '2kg' }, 16.0, 12, '2 kg bag', kg(2)],
      [{ flavour: 'lamb', size: '6kg' }, 35.5, 4, '6 kg bag', kg(6)],
      [{ flavour: 'lamb', size: '12kg' }, 59.5, 0, '12 kg bag', kg(12)],
    ],
  ),
  p02: variantSet(
    'p02',
    [
      { id: 'lifeStage', label: 'Life stage', options: [{ id: 'kitten', label: 'Kitten' }, { id: 'adult', label: 'Adult' }, { id: 'senior', label: 'Senior 7+' }] },
      SIZE(['1kg', '1 kg'], ['3kg', '3 kg']),
    ],
    [
      [{ lifeStage: 'kitten', size: '1kg' }, 10.5, 26, '1 kg bag', kg(1)],
      [{ lifeStage: 'kitten', size: '3kg' }, 25.9, 14, '3 kg bag', kg(3)],
      [{ lifeStage: 'adult', size: '1kg' }, 9.25, 40, '1 kg bag', kg(1)],
      [{ lifeStage: 'adult', size: '3kg' }, 23.5, 32, '3 kg bag', kg(3)],
      [{ lifeStage: 'senior', size: '1kg' }, 10.25, 3, '1 kg bag', kg(1)],
      [{ lifeStage: 'senior', size: '3kg' }, 24.9, 0, '3 kg bag', kg(3)],
    ],
  ),
  p03: variantSet(
    'p03',
    [SIZE(['2kg', '2 kg'], ['5kg', '5 kg'])],
    [
      [{ size: '2kg' }, 18.75, 25, '2 kg bag', kg(2)],
      [{ size: '5kg' }, 39.0, 11, '5 kg bag', kg(5)],
    ],
  ),
  p04: variantSet(
    'p04',
    [FLAVOUR(['salmon', 'Salmon'], ['chicken', 'Chicken'], ['duck', 'Duck']), SIZE(['120g', '120 g'], ['300g', '300 g'])],
    [
      [{ flavour: 'salmon', size: '120g' }, 8.25, 54, '120 g pouch'],
      [{ flavour: 'salmon', size: '300g' }, 17.5, 20, '300 g pouch'],
      [{ flavour: 'chicken', size: '120g' }, 7.75, 36, '120 g pouch'],
      [{ flavour: 'chicken', size: '300g' }, 16.5, 18, '300 g pouch'],
      [{ flavour: 'duck', size: '120g' }, 8.75, 0, '120 g pouch'],
    ],
  ),
  p06: variantSet(
    'p06',
    [SIZE(['250ml', '250 ml'], ['500ml', '500 ml'], ['1l', '1 L'])],
    [
      [{ size: '250ml' }, 7.4, 30, '250 ml', L(0.25)],
      [{ size: '500ml' }, 12.4, 22, '500 ml', L(0.5)],
      [{ size: '1l' }, 21.0, 9, '1 L', L(1)],
    ],
  ),
  p07: variantSet(
    'p07',
    [SIZE(['s', 'S'], ['m', 'M'], ['l', 'L'], ['xl', 'XL'])],
    [
      [{ size: 's' }, 9.8, 12, 'Small · palm under 8 cm'],
      [{ size: 'm' }, 9.8, 15, 'Medium · palm 8–9 cm'],
      [{ size: 'l' }, 9.8, 10, 'Large · palm 9–10 cm'],
      [{ size: 'xl' }, 10.8, 2, 'Extra large · palm over 10 cm'],
    ],
  ),
  p10: variantSet(
    'p10',
    [SIZE(['m', 'M'], ['l', 'L'], ['xl', 'XL'])],
    [
      [{ size: 'm' }, 6.4, 0, '14 cm'],
      [{ size: 'l' }, 7.9, 0, '18 cm'],
      [{ size: 'xl' }, 9.4, 0, '23 cm'],
    ],
  ),
  p11: variantSet(
    'p11',
    [
      { id: 'petWeight', label: 'Dog weight', options: [{ id: '10-20', label: '10–20 kg' }, { id: '20-40', label: '20–40 kg' }, { id: '40plus', label: '40+ kg' }] },
      SIZE(['1m', '1 month'], ['3m', '3 months']),
    ],
    [
      [{ petWeight: '10-20', size: '1m' }, 8.5, 20, '1 pipette'],
      [{ petWeight: '10-20', size: '3m' }, 21.0, 16, '3 pipettes', { compareAt: 25.5 }],
      [{ petWeight: '20-40', size: '1m' }, 9.5, 18, '1 pipette'],
      [{ petWeight: '20-40', size: '3m' }, 24.0, 12, '3 pipettes', { compareAt: 28.5 }],
      [{ petWeight: '40plus', size: '1m' }, 10.5, 6, '1 pipette'],
      [{ petWeight: '40plus', size: '3m' }, 27.0, 0, '3 pipettes'],
    ],
  ),
  p14: variantSet(
    'p14',
    [FLAVOUR(['tuna', 'Tuna & pumpkin'], ['chicken', 'Chicken'], ['turkey', 'Turkey & rabbit']), SIZE(['6', '6 × 85 g'], ['12', '12 × 85 g'], ['24', '24 × 85 g'])],
    [
      [{ flavour: 'tuna', size: '6' }, 7.2, 30, '6 × 85 g trays', kg(0.51)],
      [{ flavour: 'tuna', size: '12' }, 13.5, 22, '12 × 85 g trays', kg(1.02)],
      [{ flavour: 'tuna', size: '24' }, 25.0, 10, '24 × 85 g trays', { ...kg(2.04), compareAt: 28.8 }],
      [{ flavour: 'chicken', size: '6' }, 6.9, 28, '6 × 85 g trays', kg(0.51)],
      [{ flavour: 'chicken', size: '12' }, 12.9, 18, '12 × 85 g trays', kg(1.02)],
      [{ flavour: 'chicken', size: '24' }, 23.9, 0, '24 × 85 g trays', kg(2.04)],
      [{ flavour: 'turkey', size: '6' }, 7.6, 12, '6 × 85 g trays', kg(0.51)],
      [{ flavour: 'turkey', size: '12' }, 14.2, 6, '12 × 85 g trays', kg(1.02)],
    ],
  ),
  p15: variantSet(
    'p15',
    [SIZE(['xs', 'XS'], ['s', 'S'], ['m', 'M'], ['l', 'L'], ['xl', 'XL'])],
    [
      [{ size: 'xs' }, 5.5, 14, '7 sticks · dogs 2–5 kg'],
      [{ size: 's' }, 6.5, 20, '7 sticks · dogs 5–10 kg'],
      [{ size: 'm' }, 7.5, 25, '7 sticks · dogs 10–25 kg'],
      [{ size: 'l' }, 8.5, 12, '7 sticks · dogs 25–40 kg'],
      [{ size: 'xl' }, 9.5, 4, '7 sticks · dogs over 40 kg'],
    ],
  ),
  p17: variantSet(
    'p17',
    [SIZE(['500g', '500 g'], ['1kg', '1 kg'], ['2kg', '2 kg'])],
    [
      [{ size: '500g' }, 6.5, 30, '500 g bag', kg(0.5)],
      [{ size: '1kg' }, 11.5, 24, '1 kg bag', kg(1)],
      [{ size: '2kg' }, 20.0, 10, '2 kg bag', { ...kg(2), compareAt: 23.0 }],
    ],
  ),
  p20: variantSet(
    'p20',
    [SIZE(['s', 'S'], ['m', 'M'], ['l', 'L'])],
    [
      [{ size: 's' }, 7.5, 8, 'Small · 20 cm · budgies'],
      [{ size: 'm' }, 8.9, 14, 'Medium · 30 cm · cockatiels'],
      [{ size: 'l' }, 11.5, 0, 'Large · 45 cm · parrots'],
    ],
  ),
  p12: variantSet(
    'p12',
    [SIZE(['90', '90 chews'], ['180', '180 chews'])],
    [
      [{ size: '90' }, 17.6, 20, '90 chews'],
      [{ size: '180' }, 31.5, 8, '180 chews', { compareAt: 35.2 }],
    ],
  ),
}

/* --------------------------------------------------------- descriptions */

/** long-form copy for product pages — merged onto the catalogue below */
const COPY: Record<string, { description: string[]; highlights: string[] }> = {
  p01: {
    description: [
      'Harvest Bowl is slow-cooked in small batches so the kibble keeps more of its natural flavour. Real chicken or lamb leads the ingredient list, with brown rice and oats for steady energy through the day.',
      'Omega-3 and omega-6 from salmon oil and flaxseed support a glossy coat and healthy skin, while added glucosamine helps joints in active and larger breeds.',
    ],
    highlights: ['Named meat as the first ingredient', 'No artificial colours, flavours or preservatives', 'Omega-3 & 6 for skin and coat', 'Resealable bag in every size'],
  },
  p02: {
    description: [
      'Ocean Feast is built around wild-caught salmon, with a crunchy kibble shape designed to encourage chewing and slow down fast eaters. Each life-stage recipe is balanced for what cats need at that age.',
      'Kitten adds DHA for brain and eye development; Adult keeps calories in check for indoor cats; Senior 7+ adds antioxidants and gentler fibre for older digestion.',
    ],
    highlights: ['Grain-free, salmon first', 'Taurine for heart and eye health', 'Recipes for kitten, adult and senior', 'Small kibble for small mouths'],
  },
  p03: {
    description: [
      'A starter kibble for small and medium-breed puppies up to twelve months. The pieces are small and slightly porous so they soften quickly when you add a splash of warm water for very young pups.',
      'DHA from fish oil supports learning and eyesight, and a controlled calcium level helps joints grow at a healthy pace.',
    ],
    highlights: ['DHA for brain development', 'Controlled calcium for growing joints', 'Easy to soften for weaning', 'Made without artificial preservatives'],
  },
  p04: {
    description: [
      'Soft Bites are single-protein treats — salmon, chicken or duck — gently air-dried so they stay soft enough to break into training-size pieces without crumbling in your pocket.',
      'Because each flavour uses one protein, they are a good choice for pets on a limited-ingredient diet. Suitable for dogs and cats.',
    ],
    highlights: ['One protein per flavour', 'Soft texture, easy to split', 'No added sugar or fillers', 'Resealable pouch'],
  },
  p05: {
    description: [
      'Crunchy oven-baked biscuits made with whole-wheat flour and unsweetened peanut butter. The texture helps scrape plaque while your dog chews.',
      'Free from xylitol — the sweetener that is toxic to dogs — and baked without artificial colours.',
    ],
    highlights: ['Xylitol-free peanut butter', 'Crunchy texture for teeth', 'Baked in small batches', 'About 12 kcal per biscuit'],
  },
  p06: {
    description: [
      'A soap-free shampoo with colloidal oatmeal and aloe vera to calm itchy, dry or sensitive skin. It lathers easily and rinses clean without leaving residue.',
      'pH-balanced for both dogs and cats and gentle enough for weekly use. The light scent fades within a day.',
    ],
    highlights: ['Colloidal oatmeal + aloe', 'pH-balanced for dogs and cats', 'Soap- and paraben-free', 'Rinses clean'],
  },
  p07: {
    description: [
      'Five-finger glove with soft silicone tips that lift loose undercoat while you stroke. Most pets treat it as extra petting, not grooming.',
      'Use it dry for daily de-shedding or wet at bath time to work shampoo into the coat. Fur peels off in one sheet and the glove rinses clean.',
    ],
    highlights: ['Works wet or dry', 'Adjustable wrist strap', 'Four hand sizes, S to XL', 'Machine-washable'],
  },
  p08: {
    description: [
      'Two braided cotton ropes — a short one for tug and a long one for throwing. The natural fibres act like floss as your dog chews.',
      'Replace a rope once it starts to fray to avoid swallowed strands.',
    ],
    highlights: ['100% natural cotton', 'Two lengths for tug and fetch', 'Flossing action', 'Machine-washable'],
  },
  p09: {
    description: [
      'A flexible fibreglass wand with natural feathers and a small bell. The long reach lets you keep the lure moving like real prey, so indoor cats get a proper workout.',
      'Two replacement feather bunches are included. Put the wand away after play so it is not chewed unsupervised.',
    ],
    highlights: ['65 cm flexible wand', 'Natural feathers + bell', 'Two refills included', 'Great for indoor cats'],
  },
  p10: {
    description: [
      'A natural-rubber bone with a low-toned squeaker and deep grooves you can smear with a little spread. Tough enough for heavy chewers.',
      'Dishwasher-safe and it floats, so it doubles as a pool and beach toy.',
    ],
    highlights: ['Natural rubber', 'Floats in water', 'Dishwasher-safe', 'Sizes M to XL'],
  },
  p11: {
    description: [
      'A veterinary-strength spot-on that kills fleas and ticks on contact and keeps working for four weeks. Each pipette is dosed for a body-weight band, so choose the band that matches your dog today.',
      'Apply to dry skin between the shoulder blades and avoid bathing for 48 hours. Not for use on cats.',
    ],
    highlights: ['Kills fleas and ticks for 4 weeks', 'Dosed by dog weight', 'Waterproof after 48 hours', 'Not for cats'],
  },
  p12: {
    description: [
      'Soft duck-flavoured chews with glucosamine, chondroitin and green-lipped mussel to support hips and joints. Most dogs take them as a treat.',
      'Give one to four chews a day depending on weight. Benefits build over four to six weeks of daily use.',
    ],
    highlights: ['Glucosamine + chondroitin', 'Green-lipped mussel', 'Tasty duck flavour', 'For senior and active dogs'],
  },
  p13: {
    description: [
      'A seaweed-based powder sprinkled on your pet’s usual food once a day. Over a few weeks it helps reduce plaque and tartar build-up and freshens breath.',
      'Odourless and tasteless, so fussy eaters rarely notice it. One jar lasts a medium dog about three months.',
    ],
    highlights: ['Natural seaweed', 'Tasteless — mix into food', 'Dogs and cats', 'Lasts up to 3 months'],
  },
  p14: {
    description: [
      'Purrfect Pâté is a smooth, hydrating wet food with real fish or poultry first. Each 85 g tray is one meal for most adult cats, with no leftover tins in the fridge.',
      'Wet food adds moisture to the diet, which helps cats who drink little. Mix flavours for variety — they are nutritionally complete on their own.',
    ],
    highlights: ['Complete wet food', 'Grain- and carrageenan-free', 'Easy-peel single-serve trays', 'Save more with the 24-pack'],
  },
  p15: {
    description: [
      'Ridged dental sticks that flex as your dog chews, scrubbing along the gum line where plaque starts. One stick a day as part of a dental routine.',
      'Choose by weight: a stick that is too small can be swallowed whole, one too big will not get chewed properly.',
    ],
    highlights: ['Daily dental chew', 'Sized XS to XL by weight', 'Real chicken flavour', 'No added sugar'],
  },
  p16: {
    description: [
      'A long canvas fish stuffed with organic catnip and crinkle paper — the right size for your cat to hug and bunny-kick.',
      'The zipped pocket lets you refresh the catnip when the scent fades. Around one in three cats does not react to catnip, but most still enjoy the kicker shape.',
    ],
    highlights: ['Organic catnip, refillable', 'Durable canvas', 'Crinkle inside', '28 cm long'],
  },
  p17: {
    description: [
      'A clean, dust-extracted seed mix for budgies, cockatiels and other small parrots, with canary seed, white and red millet, oat groats and dried vegetables.',
      'Seed alone is not a complete diet — offer fresh greens and a pellet alongside it, and blow the empty husks off the dish each day.',
    ],
    highlights: ['Dust-cleaned seed', 'Added dried vegetables', 'For budgies & cockatiels', '500 g to 2 kg'],
  },
  p18: {
    description: [
      'Whole sprays of sun-dried millet, still on the stalk. Foraging for the seeds keeps small birds busy and is a great reward during hand-taming.',
      'Offer one small piece a few times a week — millet is a treat, not a main food.',
    ],
    highlights: ['Natural foraging treat', 'Ideal for training', 'Six sprays per pack', 'No added sugar'],
  },
  p19: {
    description: [
      'Two natural cuttlebones and one mineral block supply calcium for strong beaks and eggshells, and iodine for a healthy thyroid.',
      'Clip them to the cage with the soft side facing your bird. Replace when worn down or soiled.',
    ],
    highlights: ['Calcium + iodine', 'Helps keep beaks trimmed', 'Stainless steel clips', 'For small and medium birds'],
  },
  p20: {
    description: [
      'A bendable cotton rope perch you can shape into a swing, spiral or bridge. The varied diameter works feet muscles and helps prevent sore spots.',
      'Pick by bird size — small for budgies, medium for cockatiels, large for African greys and similar.',
    ],
    highlights: ['Bendable into any shape', 'Varied grip diameter', 'Wooden bell ring', 'Sizes S to L'],
  },
}

/* ---------------------------------------------------------------- images */

/**
 * Product photography lives in /public/products. Products not listed here
 * have no photos yet and keep their category icon tile.
 */
const IMAGES: Record<string, string[]> = {
  p01: ['/products/p01-1.svg', '/products/p01-2.svg', '/products/p01-3.svg'],
  p02: ['/products/p02-1.svg', '/products/p02-2.svg', '/products/p02-3.svg'],
  p04: ['/products/p04-1.svg', '/products/p04-2.svg'],
  p06: ['/products/p06-1.svg'],
  p14: ['/products/p14-1.svg', '/products/p14-2.svg', '/products/p14-3.svg'],
  p17: ['/products/p17-1.svg', '/products/p17-2.svg'],
}

/**
 * Products with variants carry summary fields so lists, filters and sorting
 * keep working: `price` = lowest price, `stock` = total, `unit` = default's.
 */
export const PRODUCTS: Product[] = BASE_PRODUCTS.map((base) => {
  const p: Product = { ...base, ...COPY[base.id], images: IMAGES[base.id] }
  const v = VARIANTS[p.id]
  if (!v) return p
  const inStock = v.variants.filter((x) => x.stock > 0)
  const def = inStock[0] ?? v.variants[0]
  return {
    ...p,
    axes: v.axes,
    variants: v.variants,
    price: Math.min(...v.variants.map((x) => x.price)),
    stock: v.variants.reduce((n, x) => n + x.stock, 0),
    unit: def.unit,
  }
})

export const CLINICS: Clinic[] = [
  {
    id: 'c01',
    about: 'A neighbourhood clinic built around preventive care — vaccinations, dental hygiene and annual exams, with same-day consults most weekdays.',
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
    about: 'General practice and soft-tissue surgery near the old port. Two consulting rooms, an on-site lab, and a calm separate cat waiting area.',
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
    about: 'An affordable, walk-in-first clinic open into the evening — popular for quick consults and second opinions.',
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
    about: 'A small studio practice focused on senior pets and unhurried appointments. One vet, long consults, spa-grade grooming.',
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
    about: 'A 24-hour emergency hospital with intensive care and surgery on site. Call ahead when you can — walk-ins are triaged by severity.',
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
    about: 'A mobile vet that brings consults and vaccinations to your door within 15 km. Calm pets, no carrier, no waiting room.',
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
  {
    id: 'pet1',
    name: 'Miso',
    species: 'cat',
    breed: 'British Shorthair',
    ageYears: 3,
    weightKg: 4.2,
    sex: 'female',
    neutered: true,
    microchip: '985 112 004 318 207',
    weightLog: [
      { daysAgo: 300, kg: 3.8 },
      { daysAgo: 200, kg: 4.0 },
      { daysAgo: 110, kg: 4.1 },
      { daysAgo: 21, kg: 4.2 },
    ],
  },
  {
    id: 'pet2',
    name: 'Bolt',
    species: 'dog',
    breed: 'Border Collie',
    ageYears: 5,
    weightKg: 18.4,
    sex: 'male',
    neutered: true,
    microchip: '985 112 007 991 540',
    allergies: 'Chicken — mild skin reaction',
    weightLog: [
      { daysAgo: 360, kg: 19.1 },
      { daysAgo: 240, kg: 18.9 },
      { daysAgo: 120, kg: 18.6 },
      { daysAgo: 35, kg: 18.4 },
    ],
  },
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
      { productId: 'p04', variantId: 'p04-salmon-120g', variantLabel: 'Salmon · 120 g', qty: 2, priceAtPurchase: 8.25 },
      { productId: 'p11', variantId: 'p11-10-20-3m', variantLabel: '10–20 kg · 3 months', qty: 1, priceAtPurchase: 21.0 },
      { productId: 'p06', variantId: 'p06-500ml', variantLabel: '500 ml', qty: 1, priceAtPurchase: 12.4 },
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
      { productId: 'p01', variantId: 'p01-chicken-12kg', variantLabel: 'Chicken & rice · 12 kg', qty: 1, priceAtPurchase: 54.0 },
      { productId: 'p09', qty: 1, priceAtPurchase: 5.95 },
    ],
    subtotal: 59.95,
    delivery: 0,
    total: 59.95,
    status: 'delivered',
    addressLine: '14 Alder Lane, Apt 3',
  },
  {
    id: 'PS-0951',
    placedAtDaysAgo: 34,
    items: [
      { productId: 'p02', variantId: 'p02-adult-3kg', variantLabel: 'Adult · 3 kg', qty: 1, priceAtPurchase: 23.5 },
      { productId: 'p14', variantId: 'p14-tuna-12', variantLabel: 'Tuna & pumpkin · 12 × 85 g', qty: 1, priceAtPurchase: 13.5 },
      { productId: 'p15', variantId: 'p15-m', variantLabel: 'M', qty: 2, priceAtPurchase: 7.5 },
    ],
    subtotal: 52.0,
    delivery: 0,
    total: 52.0,
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

/* ------------------------------------------------------------ reviews */

const REVIEW_AUTHORS = [
  'Priya S.', 'Marcus L.', 'Hana K.', 'Diego R.', 'Aisha M.', 'Tom W.',
  'Lena F.', 'Omar B.', 'Grace C.', 'Yuki T.', 'Sam O.', 'Nadia P.',
]

const PRODUCT_REVIEW_POOL: Record<string, string[]> = {
  food: [
    'Switched over a week like the bag says — no tummy trouble and the coat is noticeably shinier.',
    'Picky eater finishes the bowl every time now. Resealable bag actually reseals.',
    'Good ingredient list for the price. Delivery came a day early.',
    'Kibble size is right for a medium mouth. Would buy again.',
  ],
  treats: [
    'Small enough to break up for training. Gets instant attention.',
    'No weird smell and no crumbs everywhere. The pouch lasts a while.',
    'My vet approved the ingredient list. Both of mine go wild for these.',
    'Soft enough for an older dog with a couple of missing teeth.',
  ],
  grooming: [
    'Gentle on sensitive skin — the itching settled after two baths.',
    'Rinses out easily, no lingering perfume smell.',
    'Pulled out a surprising amount of undercoat in five minutes.',
    'Works well between professional grooms.',
  ],
  toys: [
    'Survived a month with a heavy chewer, which is a record in this house.',
    'Endless entertainment in the evenings. Replacement parts are a nice touch.',
    'Good size, washes well. Squeaker is quieter than most — thank you.',
    'Keeps them busy while I work from home.',
  ],
  health: [
    'Easy to apply and no reaction. Clear instructions on the pack.',
    'Noticeably easier on the stairs after a few weeks.',
    'Palatable — no need to hide it in food.',
    'Vet recommended this brand and the price here is fair.',
  ],
}

const CLINIC_REVIEW_POOL = [
  'Took the time to explain everything and never rushed us. Reception texted a reminder the day before.',
  'Clean, calm waiting room and they were on time to the minute.',
  'Handled a very anxious cat with real patience. Fair pricing, itemised bill.',
  'Booked through the app the same morning and were seen by lunch.',
  'Follow-up call two days later to check on recovery — rare these days.',
  'Straightforward advice without upselling. Will be back for the booster.',
]


/** bird products get their own lines — dog/cat pools mention chewing and litter */
const BIRD_REVIEW_POOL = [
  'Our budgies went straight for it. Very little dust in the bag.',
  'Cockatiel approved — she chirps when she sees it coming.',
  'Good quality, clean and fresh smelling. Will reorder.',
  'Clips on the cage bars easily and survived a week of beak work.',
  'Nice variety, less waste on the cage floor than our old brand.',
  'Arrived quickly and well sealed.',
  'Fine, but our parrot preferred the larger size.',
  'Ours ignored it for a few days before trying it.',
]

const EXTRA_PRODUCT_LINES = [
  'Arrived well packed and on time. Exactly as described.',
  'Second time ordering — consistent quality both times.',
  'Does the job. Not the cheapest, but I trust what’s in it.',
  'Took a few days to win my pet over, now it’s a favourite.',
  'Fine, though I wish it came in a bigger size.',
  'Would recommend to anyone with a fussy one at home.',
  'Honest product, sensible price, fast delivery.',
  'Not for us — ours lost interest after a week. Returns were easy though.',
]

const EXTRA_CLINIC_LINES = [
  'Friendly front desk and the vet remembered us from last time.',
  'Parking is tight but the care is worth it.',
  'Clear estimate before any treatment — no surprises on the bill.',
  'Waited about twenty minutes past our slot, otherwise great.',
  'Our dog is terrified of vets and they made it genuinely calm.',
  'Good advice on diet, sent a written summary by email afterwards.',
  'Reasonable prices for the area. Booking online was painless.',
  'Felt a bit rushed this time, though the treatment worked.',
]

/**
 * Deterministic review set for a product or clinic — stable across SSR and
 * client. Ratings follow `ratingBreakdown`, so the list agrees with the bars.
 * The detail pages show the first three; /…/reviews shows them all.
 */
export function allReviews(kind: 'product' | 'clinic', id: string): Review[] {
  const item = kind === 'product' ? getProduct(id) : getClinic(id)
  if (!item) return []
  const seed = hashSeed(`${kind}:${id}`)
  const pool =
    kind === 'product'
      ? (item as Product).suits.every((sp) => sp === 'bird')
        ? BIRD_REVIEW_POOL
        : [...PRODUCT_REVIEW_POOL[(item as Product).category], ...EXTRA_PRODUCT_LINES]
      : [...CLINIC_REVIEW_POOL, ...EXTRA_CLINIC_LINES]
  const n = Math.min(24, Math.max(8, Math.round(item.reviews / 12)))
  // spread the star counts in the same proportions as the breakdown bars
  const bars = ratingBreakdown(item.rating, item.reviews)
  const stars: number[] = []
  bars.forEach((count, i) => {
    const k = Math.round((count / item.reviews) * n)
    for (let j = 0; j < k; j++) stars.push(5 - i)
  })
  while (stars.length < n) stars.push(5)
  const services = kind === 'clinic' ? (item as Clinic).services.map((sv) => sv.name) : []
  const suits = kind === 'product' ? (item as Product).suits : []

  return Array.from({ length: n }, (_, i) => {
    const r = hashSeed(`${seed}-${i}`)
    const rating = stars[(r >>> 3) % stars.length]
    // low ratings get the lukewarm lines (last in each pool)
    const text = rating <= 3 ? pool[pool.length - 1 - (r % 2)] : pool[(seed + i * 7) % (pool.length - 2)]
    return {
      id: `${id}-r${i}`,
      author: REVIEW_AUTHORS[(seed + i * 5) % REVIEW_AUTHORS.length],
      rating,
      daysAgo: 2 + ((r >>> 5) % 360),
      text,
      pet: kind === 'product' ? `${speciesInfo(suits[i % suits.length]).one} parent` : undefined,
      verified: r % 5 !== 0,
      helpful: (r >>> 7) % 23,
      topic: kind === 'clinic' ? services[(r >>> 4) % services.length] : undefined,
    }
  }).sort((a, b) => a.daysAgo - b.daysAgo)
}

/** the three shown on a detail page — highest rated recent ones first */
export function productReviews(id: string): Review[] {
  return [...allReviews('product', id)].sort((a, b) => b.rating - a.rating || a.daysAgo - b.daysAgo).slice(0, 3)
}

export function clinicReviews(id: string): Review[] {
  return [...allReviews('clinic', id)].sort((a, b) => b.rating - a.rating || a.daysAgo - b.daysAgo).slice(0, 3)
}

/** 5→1 star distribution that sums to `total` and averages near `rating` */
export function ratingBreakdown(rating: number, total: number): number[] {
  const five = Math.round(total * Math.min(0.92, Math.max(0.3, (rating - 3.4) / 1.7)))
  const four = Math.round((total - five) * 0.62)
  const three = Math.round((total - five - four) * 0.55)
  const two = Math.round((total - five - four - three) * 0.5)
  const one = Math.max(0, total - five - four - three - two)
  return [five, four, three, two, one]
}

/* ---------------------------------------------------------------- help */

export const FAQS: Faq[] = [
  {
    topic: 'orders',
    q: 'How long does delivery take?',
    a: `Most orders arrive in 2–4 days. Delivery is free on orders over $${FREE_DELIVERY_THRESHOLD}; below that it is a flat $${DELIVERY_FEE.toFixed(2)}.`,
  },
  {
    topic: 'orders',
    q: 'Can I return something my pet will not eat?',
    a: 'Yes. Unopened items can be returned within 30 days, and opened food within 14 days if your pet refuses it. Start a return from the order page.',
  },
  {
    topic: 'orders',
    q: 'Can I change my delivery address after ordering?',
    a: 'While an order is still “Placed” you can contact support to change the address. Once it is in transit the courier holds the original address.',
  },
  {
    topic: 'bookings',
    q: 'How do I reschedule or cancel a clinic visit?',
    a: 'Open the booking from Bookings and choose Reschedule or Cancel. Cancelling more than 24 hours ahead is always free.',
  },
  {
    topic: 'bookings',
    q: 'What does “Verified” mean on a clinic?',
    a: 'We have checked the clinic’s veterinary licence and registration, and confirmed its address and opening hours in person or by video call.',
  },
  {
    topic: 'bookings',
    q: 'Do I pay for a visit in the app?',
    a: 'No — you pay the clinic directly after your visit. Prices shown are the clinic’s list prices and may change if extra treatment is needed.',
  },
  {
    topic: 'health',
    q: 'Where do vaccination records come from?',
    a: 'Linked clinics sync records into your Health tab. You can also add a record yourself from a certificate or your pet’s passport.',
  },
  {
    topic: 'health',
    q: 'When will I be reminded about a vaccine?',
    a: 'With vaccine reminders on, we notify you two weeks before a due date and again on the day if nothing is booked.',
  },
  {
    topic: 'account',
    q: 'Can more than one person manage the same pets?',
    a: 'Household sharing is coming soon. For now, one account holds each pet’s records.',
  },
  {
    topic: 'account',
    q: 'How do I delete my account?',
    a: 'Email support from the Help page and we will remove your account and records within 30 days.',
  },
]

export const SUPPORT = {
  email: 'help@petsafecare.app',
  phone: '(555) 010-7387',
  hours: 'Daily · 8:00–20:00',
}

export const EMERGENCY_SIGNS = [
  'Trouble breathing, choking, or blue-tinged gums',
  'Collapse, seizures, or unable to stand',
  'Heavy bleeding that does not stop within five minutes',
  'Swallowed something toxic — chocolate, grapes, lilies, medicines, antifreeze',
  'Swollen, hard belly with retching but nothing coming up',
  'Straining to urinate with little or no urine (especially male cats)',
  'Suspected broken bone or a road accident, even if they seem fine',
]
