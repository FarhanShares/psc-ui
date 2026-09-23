const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function money(n: number): string {
  return currency.format(n)
}

export function dateFromOffset(days: number, from: Date = new Date()): Date {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return d
}

export function shortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function longDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function isoDay(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function relativeDue(days: number): string {
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`
  if (days === 0) return 'due today'
  if (days < 45) return `due in ${days} days`
  const months = Math.round(days / 30)
  return `next in ${months} month${months === 1 ? '' : 's'}`
}

export function greeting(d: Date = new Date()): string {
  const h = d.getHours()
  if (h < 5) return 'Up late'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function timeAgo(minutes: number): string {
  if (minutes < 2) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return days === 1 ? 'yesterday' : `${days} days ago`
  const weeks = Math.round(days / 7)
  if (weeks < 5) return `${weeks} wk ago`
  const months = Math.round(days / 30)
  return `${months} mo ago`
}

export function daysAgoLabel(days: number): string {
  return timeAgo(days * 60 * 24)
}

export function relativeDay(offset: number): string {
  if (offset === 0) return 'Today'
  if (offset === 1) return 'Tomorrow'
  if (offset === -1) return 'Yesterday'
  return longDate(dateFromOffset(offset))
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
}

/** "4242424242424242" → "4242 4242 4242 4242" */
export function formatCardNumber(raw: string): string {
  return raw
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
}

/** "0929" → "09 / 29"; clamps the month to 01–12 */
export function formatExpiry(raw: string): string {
  let d = raw.replace(/\D/g, '').slice(0, 4)
  // a leading 2–9 can only be a single-digit month
  if (d.length > 0 && Number(d[0]) > 1) d = `0${d}`.slice(0, 4)
  if (d.length >= 2) {
    const mm = Math.min(12, Math.max(1, Number(d.slice(0, 2))))
    d = String(mm).padStart(2, '0') + d.slice(2)
  }
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d
}

/* --------------------------------------------------------- card checks */

function luhnOk(digits: string): boolean {
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

/** returns a specific, fixable message — or null when the card looks usable */
export function cardProblem(card: string, expiry: string, cvc: string): string | null {
  const digits = card.replace(/\D/g, '')
  if (digits.length < 13) return 'That card number looks too short. Enter all the digits on the front.'
  if (!luhnOk(digits)) return 'That card number doesn’t look right — check for a mistyped digit.'
  const m = /^(\d{2}) \/ (\d{2})$/.exec(expiry)
  if (!m) return 'Add the card’s expiry date as MM / YY.'
  const now = new Date()
  const exp = new Date(2000 + Number(m[2]), Number(m[1]), 0) // last day of that month
  if (exp < new Date(now.getFullYear(), now.getMonth(), 1)) return 'That card has expired. Try another card.'
  if (cvc.length < 3) return 'Add the 3- or 4-digit security code from the back of the card.'
  return null
}
