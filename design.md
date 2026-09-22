# Design — PetSafeCare

A locked design system for the app. Every page reads this file before emitting
code. Do not regenerate per page — extend or amend this file when the system
needs to grow.

## Genre
modern-minimal (warmed). Minimal bones, maximal typographic contrast.

## Macrostructure family
- App pages: responsive app shell — bottom tab bar under 64rem, fixed side rail
  nav at ≥64rem. Home is an asymmetric bento (12-column at desktop). Shop and
  Clinics are catalogue grids (2-up mobile → 4-up / 2-up desktop). Detail and
  form pages go two-column at ≥64rem.

## Theme — "Cobalt, warmed"
- `--color-paper`     oklch(97.5% 0.008 85)   warm light ground
- `--color-card`      oklch(99% 0.004 85)    brighter card surface (no shadows)
- `--color-ink`       oklch(25% 0.014 70)
- `--color-ink-2`     oklch(35% 0.012 68)
- `--color-rule`      oklch(90% 0.008 80)
- `--color-accent`    oklch(56% 0.2 256)     the one cobalt signal
- `--color-accent-deep` oklch(48% 0.19 258)
- Category tile tints: food oklch(93% 0.045 75) · treats oklch(93% 0.05 48) ·
  grooming oklch(92% 0.045 200) · toys oklch(93% 0.045 265) · health oklch(92% 0.05 150)

## Typography
- Display: Bricolage Grotesque, 600–800, roman only, tracking −0.03em
- Body: Figtree, 400–600
- Readout: JetBrains Mono, 400–600 — IDs, times, counts, slots ONLY.
  No decorative uppercase mono labels on cards; use `.tag` (Figtree 600 caps) for
  small headings instead.
- Scale: 11 / 13 / 15 / 16 / 18 / 22 / 28 / clamp(32–42) / clamp(40–56)
- Page titles: `--text-2xl`; Home greeting: `--text-display`. Commit to the jumps.

## Spacing
4-point named scale, tokens in `tokens.css`. Named tokens only.

## Motion
Six primitives, all transform/opacity only, all reduced-motion safe:
- enter-stagger on view entry (cap delays — grid items cap at 8 × 35ms)
- press states (translateY 1px, border shift)
- bottom-sheet slide (desktop: side panel slide)
- product-card hover lift (−2px + accent border, hover-capable pointers only)
- cart badge pop on count change (320ms scale)
- route cross-fade via View Transitions (opacity only, 140/200ms)

Easings and durations unchanged from tokens. Reduced-motion: opacity-only ≤150ms.

## Shop allowances
- A policy trust strip under the shop header (delivery threshold, returns, curation) —
  inline list with icons, never a 3-tile card row. Claims must match app data/policy.
- Toolbar is ONE row: `[search grows][sort icon][filter icon]`. Sort/filter are
  icon-only pickers: Popover dropdown on wide screens, bottom sheet on phones.
  Search is an inline input on wide screens; a large trigger opening a
  full-screen search sheet on phones.
- Category (shop) / Service (clinics) live INSIDE the filters sheet/sidebar —
  no separate chip rows, no second toolbar row.
- Desktop product grids use `auto-fill, minmax(10.75rem, 1fr)` — density follows
  available space, not fixed viewport breakpoints.
- Profile shows a read-only summary card; "Edit profile" opens a bottom sheet.

## Microinteractions stance
Silent success; undo toasts for removals/cancels; instant focus rings;
hover only under `@media (hover: hover)`.

## CTA voice
Primary: solid cobalt fill, 8px radius, Bricolage 600, verb-first labels.
Secondary: hairline ghost. Tertiary: quiet text link.

## Responsive contract (non-negotiable)
- < 40rem: phone — top bar + bottom tab bar, 750px column, 2-up product grid.
- 40–48rem: large phone — 3-up products.
- 48–64rem: tablet — content grows to 1024px, 4-up products, 2-up
  clinics/history, two-column detail/form pages, 6-column home bento.
- ≥ 64rem: DESKTOP = ECOMMERCE SHELL — sticky site header (brand, global
  search, nav links, cart button opening a right drawer + badge), exposed
  filter/category sidebar on shop, hero band, footer with link columns.
  No side rail. Mobile chrome (top bar + tab bar) hidden.
- Shop search + category live in the URL (`q`, `cat`) so the global header
  search and footer category links drive the page directly.
- Desktop product grids use `auto-fill, minmax(10.75rem, 1fr)`.
- Cart: dedicated /cart page everywhere; desktop additionally gets the
  header cart drawer (items, steppers, subtotal, Checkout → /cart).
- Verified at 320 / 375 / 414 / 480 / 768 / 834 / 1024 / 1280 / 1440.

## What pages MUST share
Wordmark, accent, type pairing, CTA voice, card/hairline language, pill system.

## What pages MAY differ on
Layout grids within the shell family (bento vs catalogue vs two-column).

## Per-page allowances
App pages: no enrichment — function carries the page. Tinted category tiles are
the only ornament, and they encode data (category), never decorate.
