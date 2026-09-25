/**
 * Shop landing copy. Category, pet and brand live in the URL, so every
 * combination is a real, linkable page — this builds its heading, meta title,
 * description, intro paragraph and canonical from one place so the visible
 * page and the <head> can never disagree.
 */
import { CATEGORIES, FREE_DELIVERY_THRESHOLD, PRODUCTS } from './data'
import { wholeMoney } from './format'
import type { ProductCategory, Species } from './types'

export interface ShopScope {
  cat?: string
  pet?: Species
  brands?: string[]
}

const CATEGORY_INTRO: Record<ProductCategory, string> = {
  food: 'Complete dry food from brands that name their proteins first. Most bags come in more than one size — the per-kg price is shown so you can compare.',
  treats: 'Single-ingredient and baked treats for training and everyday rewards. Keep treats under a tenth of daily calories.',
  grooming: 'Gentle shampoos and de-shedding tools for coats of every length, pH-balanced and safe for regular use.',
  toys: 'Tug, fetch and chase toys built for real play — sized for small mouths through heavy chewers.',
  health: 'Flea and tick protection, joint support and dental care. Weight-banded treatments list the band on every option.',
}

const PET_WORD: Record<Species, { one: string }> = {
  dog: { one: 'dog' },
  cat: { one: 'cat' },
  bird: { one: 'bird' },
}

export const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort()

export function parseBrands(raw: unknown): string[] | undefined {
  if (typeof raw !== 'string' || !raw) return undefined
  const list = raw.split(',').map((b) => b.trim()).filter((b) => BRANDS.includes(b))
  return list.length ? list : undefined
}

export function shopLanding({ cat, pet, brands }: ShopScope) {
  const category = CATEGORIES.find((c) => c.id === cat && c.id !== 'all')
  const brand = brands?.length === 1 ? brands[0] : undefined
  const petWord = pet ? PET_WORD[pet] : undefined

  // "Cat food", "Dog treats", "Food", "Tideline cat food", "Supplies for dogs"
  const noun = category ? category.label.toLowerCase() : 'supplies'
  let h1 = category ? category.label : 'Pet supplies'
  if (petWord && category) h1 = `${cap(petWord.one)} ${noun}`
  else if (petWord) h1 = `${cap(petWord.one)} supplies`
  if (brand) h1 = `${brand} ${pet || category ? h1.charAt(0).toLowerCase() + h1.slice(1) : 'pet supplies'}`

  const count = PRODUCTS.filter(
    (p) =>
      (!category || p.category === category.id) &&
      (!pet || p.suits.includes(pet)) &&
      (!brands?.length || brands.includes(p.brand)),
  ).length

  const title = brand || petWord || category ? `${h1} — shop online` : 'Pet supplies — food, treats, grooming & health'
  const description = `${h1}: ${count} curated product${count === 1 ? '' : 's'} with honest reviews and per-option pricing. Free delivery over ${wholeMoney(FREE_DELIVERY_THRESHOLD)}, 30-day returns.`
  const intro = category
    ? CATEGORY_INTRO[category.id as ProductCategory]
    : petWord
      ? `Everything we stock that suits ${petWord.one}s — food, treats, grooming, toys and health care.`
      : 'Food, treats and daily care — delivered.'

  const params = new URLSearchParams()
  if (category) params.set('cat', category.id)
  if (pet) params.set('for', pet)
  if (brand) params.set('brand', brand)
  const qs = params.toString()

  return {
    h1,
    title,
    description,
    intro,
    count,
    // multi-brand selections are filters, not landings — they canonicalise without brand
    canonical: `/shop${qs ? `?${qs}` : ''}`,
    indexable: !brands || brands.length <= 1,
  }
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
