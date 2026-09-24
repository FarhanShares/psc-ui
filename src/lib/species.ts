import type { Species } from './types'

/**
 * Every species the app knows, in display order. New code should read labels
 * and defaults from here instead of `species === 'cat' ? … : …` ternaries.
 */
export const SPECIES: {
  id: Species
  one: string // "Cat"
  many: string // "Cats"
  defaultBreed: string
  defaultWeightKg: number
  namePlaceholder: string
}[] = [
  { id: 'cat', one: 'Cat', many: 'Cats', defaultBreed: 'Domestic cat', defaultWeightKg: 4, namePlaceholder: 'Mochi' },
  { id: 'dog', one: 'Dog', many: 'Dogs', defaultBreed: 'Mixed breed', defaultWeightKg: 12, namePlaceholder: 'Biscuit' },
  { id: 'bird', one: 'Bird', many: 'Birds', defaultBreed: 'Budgerigar', defaultWeightKg: 0.04, namePlaceholder: 'Kiwi' },
]

/** add-pet forms start on a cat */
export const DEFAULT_SPECIES: Species = 'cat'

export function speciesInfo(id: Species) {
  return SPECIES.find((s) => s.id === id) ?? SPECIES[0]
}

export function isSpecies(v: unknown): v is Species {
  return SPECIES.some((s) => s.id === v)
}

/** weights under 1 kg read better in grams (budgies weigh ~40 g) */
export function formatWeight(kg: number): string {
  return kg < 1 ? `${Math.round(kg * 1000)} g` : `${kg.toFixed(1)} kg`
}
