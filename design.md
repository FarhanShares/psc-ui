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
- `--color-accent`    oklch(52% 0.2 260)     the one cobalt signal (#105fd9; white text 5.4:1, inside sRGB)
- `--color-accent-deep` oklch(45% 0.19 262)
- `--color-rule-field` oklch(66% 0.012 72)  form-field edges, 3:1 against card
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
- Section heads (`.section-head__title`): 22px for page sections, 18px inside a
  card, sheet or band — the container carries the grouping, not a bigger heading.
- Headings `text-wrap: balance`; paragraphs and list items `text-wrap: pretty`.

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

## Empty states (doctrine)
- One component (`EmptyState`): tinted medallion icon (never a warning icon),
  22px display title as a real heading (`level` 2/3), one sentence on what will
  live here, a primary action and optional secondary, and optional extras
  (suggestion chips) under a rule. `compact` inside sections that already have
  a heading.
- Zero pets is a designed onboarding moment, never a hole: Home shows an
  "Add your first pet" card (primary CTA opens the shared AddPetSheet in
  place; secondary escapes to the shop); Health offers the same sheet.
- Derived counts (vaccine records, "needs attention") only count records
  whose pet still exists.
- List rows cap at 2 + a composed action tile ("Manage pets" / "+N more").

## Rails (doctrine)
- Product rails ARE allowed to scroll — but only with honest affordances:
  snap-scroll + peeking card on phones, arrow buttons ≥64rem, hidden
  scrollbars, `overscroll-behavior-x: contain`. Chip rows still wrap —
  never scroll. Any scroll container must sit inside a `minmax(0, 1fr)`
  track (`.page` grid) or it gets clipped by the root overflow-x, not
  scrolled.

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
Primary: solid cobalt fill, 8px radius, Bricolage 600, verb-first labels — one
per view where possible. Soft (`.btn--soft`, accent tint): the action repeated
on every row of a list (Book on clinic cards and service rows, Book in the
vaccine timeline). Secondary: hairline ghost. Tertiary: quiet text link.
Sizes: 44px default; `.btn--sm` 36px, 40px on coarse pointers.

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

## Screen inventory (2026-09-23)
Public, indexable: `/`, `/shop` (+ `?cat=`), `/shop/$id`, `/clinics` (+ `?service=`),
`/clinics/$id`, `/guides` (+ `?topic=`, `?for=`), `/guides/$slug`, `/emergency`, `/help`,
`/about`, `/privacy`, `/terms`, `/login`, `/signup`. Unknown product/clinic/guide ids
throw `notFound()` in `beforeLoad` → real 404 status, never a soft 200.
Account, `noindex`: `/cart`, `/orders`, `/orders/$id`, `/bookings`, `/bookings/$id`,
`/pets`, `/pets/$id`, `/health`, `/profile`, `/settings`, `/saved`, `/notifications`,
`/search`, `/welcome`.
Auth screens and `/welcome` onboarding render without shop chrome (`BARE_ROUTES` in `nav.tsx`).

## Signed-out doctrine
- Guests see the product, never someone's data: `/` is a public landing
  (value, categories, popular products, clinics, how it works, one-tap demo);
  account pages show a sign-in gate that says what signing in unlocks
  (three concrete points, Sign in + Create free account, redirect back).
- Guests can browse, save and build a cart. The login wall appears only at the
  moment of commitment (checkout, confirming a booking) and always returns
  the person to where they were with their cart merged.
- New accounts are empty and go through `/welcome`; every empty state after
  that is a designed moment (no clinic linked, no address, no saved card).

## SEO contract
- Every route builds its head through `seo()` in `src/lib/seo.ts` — title,
  description, canonical, Open Graph/Twitter, optional JSON-LD. Never hand-roll meta.
- JSON-LD by page: Organization + WebSite/SearchAction (root), Product + Offer +
  BreadcrumbList (product), VeterinaryCare (clinic), ItemList (listings), FAQPage (help),
  Article + BreadcrumbList (guides), CollectionPage (guide index).
- Care guides (`src/lib/guides.ts`) are the content hub: general guidance only,
  every guide carries the not-veterinary-advice note and a next step (book a
  service, emergency link). Topic bands reuse the category tints and encode the
  topic. Guides link out to products and clinics, and are linked from the
  landing, pet profiles, help, search and the footer.
- Filtered/search result pages (`/shop?q=`, `/search`) are `noindex, follow`.
- Titles ≤ 60 characters: `pageTitle()` drops the " · PetSafeCare" suffix when it
  would push a title over. Product titles are the product (plus "by Brand" when
  short); only `?v=` pages name the option.
- Descriptions are written to fit (70–160 characters, whole sentences — pick the
  longest complete version that fits); `clampText()` is only the safety net.
- Indexable pages send `max-image-preview:large`. Share images are 1200×630
  JPEGs: `/og-image.jpg` for the site, `/og/<productId>.jpg` per product —
  regenerate with `npm run og` after changing products, prices or pack shots
  (social networks don't accept SVG).
- Product JSON-LD carries reviews and `priceValidUntil`; clinic `openingHours`
  uses the schema.org form (`Mo-Sa 09:00-19:00`). The sitemap lists product
  images.
- `sitemap.xml` is generated from data; `public/robots.txt` disallows account pages.
- Set `VITE_SITE_URL` in production so canonicals point at the real domain.

## Detail-page doctrine
- Breadcrumbs (`<Crumbs>`): full trail ≥48rem, a single "‹ Parent" back link on phones.
- Primary action first on phones: clinic services before reviews; product gets a
  sticky buy bar above the tab bar (<48rem only).
- Destructive actions (cancel booking, remove pet, sign out) confirm in a sheet;
  removals still get an undo toast.
- Day pickers are a 7-column grid, never a scrolling strip.
- Notifications are derived from live state (`deriveNotices`) — only read-state is stored.

## Overlays & alignment (desktop ≥64rem)
- One box for every edge: header, page content, footer and toasts all use
  `--shell-wide` (content cap + side padding) so brand, content and cart align.
- Cart drawer is an anchored panel dropped from the cart button, right-aligned to
  the content column — never glued to the viewport corner of a wide monitor.
- Sheets become centred dialogs (max 32rem). Page-child sizing rules must skip
  `dialog` (`.page > :not(dialog)`), or dialogs inherit the 75rem content cap.
- Sticky columns offset by `--header-h` so they clear the sticky header.
- Catalogue pages: a results bar (count left, labelled Sort right) replaces the
  icon toolbar; phones keep the one-row icon toolbar.
- Product page: media left, title/price/buy right, above the fold. The phone buy
  bar appears only after the inline buy row scrolls away.

## Product variants
- Model: `Product.axes` (size / flavour / lifeStage / petWeight) + `Product.variants`
  (one row per combination that exists, each with price, stock, unit, optional
  `compareAt` and `netQty`). Summary fields on the product (`price` = lowest,
  `stock` = total) keep lists, filters and sorting working. Helpers live in
  `src/lib/catalog.ts` — never branch on "has variants" in UI code.
- Cart and order lines carry `variantId`; orders freeze `variantLabel` and the
  variant price at purchase. Old lines without an id resolve to the default.
- Product page: the chosen variant is in the URL (`?v=`) — server-rendered,
  shareable, back-button safe. Canonical stays `/shop/$id`.
- Picker: one wrapping row of option buttons per axis; size-like axes show each
  option's price; sold-out options are dashed + struck but selectable (with
  "Notify me"); options missing from the current combination are muted but still
  jump to the nearest real combination — never a dead end.
- Show per-kg / per-L price and was-price (with "Save $x") where data allows.
- Cards: "from $x" + option summary; the button reads "Choose" and opens a quick
  add dialog. Search matches option labels (kitten, chicken, XL) and deep-links
  to the matching variant. Pet pages pick the option that fits the pet.
- JSON-LD: ProductGroup + hasVariant (each with Offer, shipping, returns).

## Shop landings (SEO)
- `cat`, `for` (dog|cat) and `brand` are URL params; `src/lib/shop-landing.ts`
  builds h1, title, description, intro and canonical from them ("Cat food",
  "Tideline cat supplies"). Single-brand landings are indexable; multi-brand
  mixes and free-text `q` are noindex. The sitemap lists category × pet only
  where products exist (no thin pages).

## Species
- `Species` = cat | dog | bird. Labels, defaults and order come from
  `src/lib/species.ts` (`SPECIES`, `speciesInfo`, `formatWeight`) — no
  dog-or-cat ternaries. Add-pet forms default to Cat; order is Cat · Dog · Bird.
- Shop pet filter: toggle chips (Cats · Dogs · Birds, URL `for=`); tap the
  active chip again for all pets — no "All" option. Chips are derived from the
  catalogue, so a species appears only once it has products (adding fish is a
  data change, not a UI one). Birds get a green avatar tint.
- Sidebar facet lists (shop categories) mark the selection with a filled
  accent-tint row, never a trailing tick, so the count column stays aligned.
- Weights under 1 kg display in grams (budgies ~40 g).

## Product media
- `Product.images` (first = hero). No images → the category icon tile, as before.
- `ProductThumb` is the one small product picture for lists (cart, drawer,
  orders, search, quick add, reviews, reorder) — pack shot or icon tile.
- Card flags (Offer, Out of stock) sit top-left, opposite the save heart; image
  dots stay bottom-centre.
- Cards (`CardMedia`): several images crossfade slowly while the card is on
  screen; paused on hover/focus, never for reduced motion; dots show position.
- Detail (`ProductGallery`): swipeable snap track that also auto-advances,
  pauses on hover/touch/focus, arrows on hover, thumbnails below; overlays
  (save, option tag) sit inside the image stage.
- Product page has a Description section (paragraphs + Highlights) before
  How to use; JSON-LD uses the full description and all images.

## Featured slider (shop)
- One graphite card, swipeable, auto-advancing every 6s with dots (and arrows on
  pointer devices); paused on hover/focus/touch/off-screen/reduced motion.
- Dropdown pickers align to the trigger's right edge when it sits on the right.

## Nudges and next steps

- **Home urgent card**: the single most urgent vaccination (overdue first),
  status as icon + words in a pill, two exits: *Already done*
  (`markVaccineGiven`, undo toast, next due in a year) and *Book vaccination*.
- **Running low?** (home): consumables (food, treats, health, grooming) from
  delivered orders ≥ 10 days old, newest purchase per option, oldest first,
  max four. One-tap *Reorder* adds the same option and quantity. Helper:
  `runningLow()` in `components/cards.tsx`.
- **Vaccine timeline** (`VaccineTimeline`): pet page and Health page. Node icon
  + status words per state; due/overdue items carry *Book* and *Mark as given*.
- **Best value**: `bestValueOption()` marks the cheapest-per-kg/L pack size on
  a size axis when it is ≥ 5% cheaper than the dearest. Never on flavours.
- **Free-delivery nudge** (product page): counts the cart *plus* the current
  pick — "Add $X more…" with a meter, or "Free delivery with this in your basket".
- **Widen search** (shop): under four results, a dashed card lists one-step
  widenings (drop category, pet, brand, local filters or the query), each with
  the count it would show; only moves that add results appear. Zero results
  uses the same card plus *Clear everything*.
