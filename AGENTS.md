# PetSafeCare — Agent Guide

Pet parent app: shop pet supplies, book clinic services, track vaccinations.
TanStack Start + React 19, file-based routing (`src/routes/`), hand-written CSS
with OKLCH tokens (no Tailwind, no UI kit), lucide-react as the only icon set.

## Commands

- `npm run dev` — dev server. `vite.config.ts` sets `server.host: true` +
  `allowedHosts: true`, so it is reachable on the LAN at
  `http://Farhans-MacBook-Pro.local:3000` (stable) or the Mac's current LAN IP.
- `npx tsc --noEmit -p tsconfig.json` — must report **zero errors** before any
  commit. Route `head()` titles go in `meta: [{ title }]`, not a top-level key.
- `npm run build` / `npm run preview` — production build.

## Design system — `design.md` is the source of truth

Read `design.md` before touching any style. Core rules:

- Tokens live in `tokens.css` (`--color-*`, `--font-*`, `--space-*`, `--text-*`).
  Never inline a raw colour or `font-family` in a component — add/reuse a token.
- Type: **Bricolage Grotesque** display (700/800, big jumps — page titles
  32–42px, home greeting up to 56px) + **Figtree** body + JetBrains Mono for
  readouts ONLY (ids, times, counts, slots). Small labels use `.tag`, never
  decorative mono. Headings are roman, sentence case.
- One cobalt accent `oklch(56% 0.2 256)`, < 5% of any viewport. Status colours
  always pair with an icon or text, never colour alone.
- Category-tinted product tiles encode data; they are not decoration.
- Cards: brighter surface + 1px hairline, radius 8/12/20. No shadows except the
  defined whisper/sheet tokens.

## Responsive contract

- **Mobile (< 64rem)**: app-style. Top bar + bottom tab bar, bottom sheets
  (expandable handle), full-screen search sheet, one-row toolbars
  `[search grows][sort icon][filter icon]`.
- **Desktop (≥ 64rem)**: ecommerce shell. Sticky site header (brand, global
  search → `/shop?q=`, nav, cart drawer), exposed filter sidebars on shop AND
  clinics, hero band, footer.
- **The site footer (and site header) are NEVER shown on mobile.** Footer is
  `display: none` below 64rem. This is an explicit user rule — do not "fix" it.
- Chip rows wrap; they never scroll. Only `.rail` product rails may scroll, and
  only with honest affordances (snap + peek on phones, arrows ≥ 64rem).
- Scroll containers must sit inside a `minmax(0, 1fr)` track (`.page` already
  does this) — otherwise the root `overflow-x: clip` silently clips them.
- Verify at 320 / 375 / 414 / 480 / 768 / 834 / 1024 / 1280 / 1440 before
  committing anything visual. Zero horizontal scroll, no wrapped buttons.

## Patterns

- State: vanilla store in `src/lib/store.ts` (`useSyncExternalStore` +
  `localStorage: petsafecare.state.v1`). `getServerSnapshot` returns the frozen
  seed (`serverState`) — routes hydrate lazily after localStorage loads, so
  reading live state during hydration causes mismatches. Seeds use relative day-offsets so
  dates stay current. Adding state? Extend the seed AND the `persist()` list —
  missing keys fall back to seed values on hydrate.
- Sheets: `Sheet` component (native `<dialog>`, bottom sheet on mobile, centred
  dialog on desktop; the cart drawer is a panel anchored under the cart button). Never set `display` on a closed `<dialog>` — author
  display overrides the UA's `display: none` (caused an always-open drawer).
- Empty states are designed moments (zero pets → onboarding card with the
  shared `AddPetSheet`). Derived counts only count records whose pet exists.
- Cart: `/cart` page is canonical (mobile); desktop additionally has the header
  cart drawer with complete inline checkout.
- Shop search, category, pet and brand live in the URL
  (`/shop?q=…&cat=…&for=dog|cat&brand=…`); landing copy comes from
  `src/lib/shop-landing.ts`.
- Variants: see design.md "Product variants". Use `src/lib/catalog.ts`
  (`resolveVariant`, `variantLabel`, `priceRange`…) — cart/order lines are
  keyed by productId + variantId; the product page's option is `?v=`.

## Auth (demo)

- Screens: `/login`, `/signup`; forgot-password is a sheet on `/login`
  (email → six-digit code → new password → sign in). Social buttons create a
  guest session.
- Store model: `users: RegisteredUser[]` (name/email/password — **plain text,
  demo only, no real security**) + `signedIn` boolean. `signIn(email, pw)`
  returns an error string or null; `signUpAccount` checks duplicates;
  `resetPassword(email, newPw)` completes the forgot loop. Demo account seeded:
  `farhan@example.com` / `demo1234` (hint is displayed on the login screen).
- Browsing is allowed signed-out; `/profile` renders a signed-out state with
  sign-in entry points. Auth routes render bare (no shop chrome) via
  `BARE_ROUTES` in `nav.tsx`.
- SEO: use `seo({ title, description, path })` from `src/lib/seo.ts` for route
  heads (adds canonical/OG/JSON-LD).

## Workflow

- Commit after each verified change, imperative subject line, body explaining
  what + why + what was verified.
- Verify flows in a real browser, not just curl: click the thing, read the
  resulting state. Headless/background tabs clamp timers and stall
  actionability waits — drive with element clicks and long polls if needed.
- Check `git log` before starting: this codebase has had multiple contributors
  (commits from other sessions). Read what exists before replacing it.
