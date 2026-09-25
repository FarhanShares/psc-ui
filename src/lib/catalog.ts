/**
 * Variant helpers. Every product is treated as having at least one variant —
 * single-SKU products get a synthetic one built from their own fields — so
 * callers never branch on "has variants".
 */
import { getProduct } from './data'
import { speciesInfo } from './species'
import type { AxisId, Product, ProductVariant, Species } from './types'

export function hasOptions(p: Product): boolean {
  return (p.variants?.length ?? 0) > 1
}

export function variantsOf(p: Product): ProductVariant[] {
  if (p.variants?.length) return p.variants
  return [{ id: p.id, options: {}, price: p.price, stock: p.stock, unit: p.unit }]
}

/** first in-stock variant, else the first one */
export function defaultVariant(p: Product): ProductVariant {
  const all = variantsOf(p)
  return all.find((v) => v.stock > 0) ?? all[0]
}

/** the variant for an id, or the default when missing/unknown (old carts, bad URLs) */
export function resolveVariant(p: Product, variantId?: string): ProductVariant {
  return variantsOf(p).find((v) => v.id === variantId) ?? defaultVariant(p)
}

export function findVariant(productId: string, variantId?: string) {
  const product = getProduct(productId)
  if (!product) return null
  return { product, variant: resolveVariant(product, variantId) }
}

/** "Chicken & rice · 6 kg" — empty for single-SKU products */
export function variantLabel(p: Product, v: ProductVariant): string {
  if (!p.axes) return ''
  const parts = p.axes.map((a) => a.options.find((o) => o.id === v.options[a.id])?.label).filter(Boolean) as string[]
  // a lone "XL" or "M" means little out of context — say what it is
  if (p.axes.length === 1 && parts[0] && parts[0].length <= 3) return `${p.axes[0].label} ${parts[0]}`
  return parts.join(' · ')
}

export function priceRange(p: Product): { min: number; max: number } {
  const prices = variantsOf(p).map((v) => v.price)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

/** "3 sizes · 2 flavours" for cards */
export function optionSummary(p: Product): string {
  if (!p.axes) return ''
  const noun: Record<AxisId, [string, string]> = {
    size: ['size', 'sizes'],
    flavour: ['flavour', 'flavours'],
    lifeStage: ['life stage', 'life stages'],
    petWeight: ['weight band', 'weight bands'],
  }
  return p.axes
    .map((a) => `${a.options.length} ${noun[a.id][a.options.length === 1 ? 0 : 1]}`)
    .join(' · ')
}

/** all option labels — lets search match "kitten", "chicken", "XL" */
export function optionKeywords(p: Product): string {
  return (p.axes ?? []).flatMap((a) => a.options.map((o) => o.label)).join(' ')
}

/**
 * Everything a shopper might type to find a product: name, brand, shelf, the
 * one-line pitch, its options and the animals it suits. The shop grid and
 * global search both read this, so "Filter in shop" never shows fewer hits.
 */
export function productSearchText(p: Product): string {
  const animals = p.suits.flatMap((sp) => [speciesInfo(sp).one, speciesInfo(sp).many])
  return `${p.name} ${p.brand} ${p.category} ${p.blurb} ${optionKeywords(p)} ${animals.join(' ')}`.toLowerCase()
}

/** every word of the query appears somewhere: "cat food" finds cat kibble shelved under food */
export function matchesQuery(text: string, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const hay = text.toLowerCase()
  return terms.every((t) => hay.includes(t))
}

/** "$4.50 / kg" for weighed goods */
export function unitPriceLabel(v: ProductVariant, money: (n: number) => string): string | null {
  if (!v.netQty) return null
  return `${money(v.price / v.netQty.amount)} / ${v.netQty.per}`
}

/**
 * The option on this axis with the lowest price per kg/L, given the other
 * current choices — only when it is meaningfully cheaper (5%+) than the
 * dearest, so near-identical packs don't get a meaningless badge.
 */
export function bestValueOption(p: Product, current: ProductVariant, axis: AxisId): string | null {
  const opts = (p.axes ?? []).find((a) => a.id === axis)?.options ?? []
  const priced = opts.flatMap((o) => {
    const want = { ...current.options, [axis]: o.id }
    const v = variantsOf(p).find((x) => (p.axes ?? []).every((a) => x.options[a.id] === want[a.id]))
    return v?.netQty && v.stock > 0 ? [{ id: o.id, per: v.netQty.per, amount: v.netQty.amount, unit: v.price / v.netQty.amount }] : []
  })
  // only a pack-size choice is a value choice — flavours of the same pack just differ in price
  if (priced.length < 2 || new Set(priced.map((x) => x.per)).size > 1 || new Set(priced.map((x) => x.amount)).size < 2) return null
  const sorted = [...priced].sort((a, b) => a.unit - b.unit)
  return sorted[0].unit <= sorted[sorted.length - 1].unit * 0.95 ? sorted[0].id : null
}

/**
 * Pick the variant after the shopper changes one axis: keep their other
 * choices when that combination exists (preferring in-stock), otherwise take
 * the closest in-stock match for the new option.
 */
export function selectOption(p: Product, current: ProductVariant, axis: AxisId, optionId: string): ProductVariant {
  const all = variantsOf(p)
  const want = { ...current.options, [axis]: optionId }
  const exact = all.find((v) => (p.axes ?? []).every((a) => v.options[a.id] === want[a.id]))
  if (exact) return exact
  const withOption = all.filter((v) => v.options[axis] === optionId)
  const score = (v: ProductVariant) =>
    (p.axes ?? []).filter((a) => v.options[a.id] === want[a.id]).length + (v.stock > 0 ? 0.5 : 0)
  return [...withOption].sort((a, b) => score(b) - score(a))[0] ?? current
}

/** state of one option button given the other current choices */
export function optionState(
  p: Product,
  current: ProductVariant,
  axis: AxisId,
  optionId: string,
): 'available' | 'soldout' | 'unavailable' {
  const want = { ...current.options, [axis]: optionId }
  const match = variantsOf(p).find((v) => (p.axes ?? []).every((a) => v.options[a.id] === want[a.id]))
  if (!match) return 'unavailable'
  return match.stock > 0 ? 'available' : 'soldout'
}

export function lineKey(productId: string, variantId?: string): string {
  return `${productId}::${variantId ?? ''}`
}

/**
 * The variant a search term points at — "kitten" on Ocean Feast lands on the
 * kitten option rather than the default adult one. Null when the term only
 * matched the product itself.
 */
export function variantForQuery(p: Product, query: string): ProductVariant | null {
  const q = query.trim().toLowerCase()
  if (!q || !p.axes) return null
  const hits = p.axes.flatMap((a) =>
    a.options
      .filter((o) => o.label.toLowerCase().includes(q) || q.includes(o.label.toLowerCase()))
      .map((o) => [a.id, o.id] as const),
  )
  if (hits.length === 0) return null
  const all = variantsOf(p)
  const score = (v: ProductVariant) => hits.filter(([axis, opt]) => v.options[axis] === opt).length * 2 + (v.stock > 0 ? 1 : 0)
  return [...all].sort((a, b) => score(b) - score(a))[0]
}

/**
 * The option that fits a particular pet: life stage from age, weight band
 * from body weight. Returns undefined when the product has no such axis.
 */
export function variantForPet(p: Product, pet: { species: Species; ageYears: number; weightKg: number }): string | undefined {
  if (!p.axes) return undefined
  const all = variantsOf(p)
  const want: Partial<Record<AxisId, string>> = {}
  if (p.axes.some((a) => a.id === 'lifeStage')) {
    want.lifeStage = pet.ageYears < 1 ? 'kitten' : pet.ageYears >= 7 ? 'senior' : 'adult'
  }
  if (p.axes.some((a) => a.id === 'petWeight') && pet.species === 'dog') {
    want.petWeight = pet.weightKg < 20 ? '10-20' : pet.weightKg < 40 ? '20-40' : '40plus'
  }
  if (Object.keys(want).length === 0) return undefined
  const fits = all.filter((v) => Object.entries(want).every(([k, o]) => v.options[k as AxisId] === o))
  return (fits.find((v) => v.stock > 0) ?? fits[0])?.id
}
