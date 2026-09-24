# PetSafeCare — API plan

The UI is complete against a local store (`src/lib/store.ts` + seed data in
`src/lib/data.ts`). This document lists the server API that replaces it: every
endpoint maps to a screen and to the store function it would back, so the
swap can happen one function at a time.

## Conventions

- JSON over HTTPS, REST-style resources under `/api/v1`.
- **Auth:** httpOnly, SameSite=Lax session cookie set by the auth endpoints (works
  with SSR; no tokens in `localStorage`). Account routes return `401` for guests.
- **Money** in integer cents plus currency (`{ amount: 2350, currency: "USD" }`).
  The UI formats it.
- **Dates** as ISO 8601. The demo stores relative offsets (`dayOffset`,
  `daysAgo`, `dueInDays`, `placedAtDaysAgo`); the API returns real dates, and the
  UI derives "in 6 days" from them.
- **Writes that charge or reserve** (place order, book a slot) take an
  `Idempotency-Key` header, so a double tap never creates two.
- Lists: `?cursor=&limit=` → `{ items, nextCursor }`.
- Errors: `{ error: { code, message, field? } }`. `field` lets forms show the
  message inline, as they already do.
- Public catalogue reads are cacheable (`Cache-Control` + ETag), because the
  server renders them for SEO.

## 1. Catalogue (public — needed first, for SSR/SEO)

| Endpoint | Used by | Replaces |
|---|---|---|
| `GET /products?cat=&for=&brand=&q=&sort=&price=&rating=&inStock=` | Shop grid, landings, search | `PRODUCTS` + `matchesFilters` |
| `GET /products/:id` → product, axes, variants (price, stock, unit, netQty, compareAt), images, description, highlights | Product page, quick add | `getProduct`, `VARIANTS`, `COPY`, `IMAGES` |
| `GET /products/:id/related?limit=8` | "More for cats" rail | ranking in `shop.$id.tsx` |
| `GET /products/:id/reviews?stars=&cursor=` + rating breakdown | Reviews sections and pages | `allReviews`, `ratingBreakdown` |
| `GET /facets?cat=&for=&brand=` → counts per category, pet, brand, price band | Filter sidebar counts, "widen search" card | computed counts |
| `GET /clinics?service=&openNow=&verified=&maxKm=&minRating=&sort=&lat=&lng=` | Clinics list | `CLINICS` + filters |
| `GET /clinics/:id` (services, hours, about, rating) | Clinic page | `getClinic` |
| `GET /clinics/:id/reviews` | Clinic reviews | `allReviews('clinic')` |
| `GET /clinics/:id/availability?serviceId=&from=&days=7` → slots per day | Slot picker, reschedule | `BOOKING_SLOTS`, `slotAvailable` |
| `GET /search?q=` → products, clinics, services, guides, help | Global search | `search.tsx` matching |
| `GET /guides`, `GET /guides/:slug` | Care guides | `GUIDES` (or a headless CMS) |
| `GET /faqs`, `GET /support` (hours, email, phone) | Help centre | `FAQS`, `SUPPORT` |

## 2. Auth and account

| Endpoint | Used by | Replaces |
|---|---|---|
| `POST /auth/signup` `{ name, email, password }` | `/signup` | `signUpAccount` |
| `POST /auth/login` `{ email, password }` | `/login` | `signIn` |
| `POST /auth/logout` | Profile → Sign out | `signOut` |
| `GET /auth/oauth/:provider` + callback | Google / Apple buttons | `signInSocial` |
| `POST /auth/password/forgot` `{ email }` → emails a 6-digit code | Forgot-password sheet | (demo code) |
| `POST /auth/password/reset` `{ email, code, password }` | Forgot-password sheet | `resetPassword` |
| `POST /auth/password/change` `{ current, next }` | Settings | `changePassword` |
| `GET /me` → profile, counts, `hasPassword` | App shell, gates, profile | `useAppState().profile` |
| `PATCH /me` | Edit profile sheet | `updateProfile` |
| `GET/POST/PATCH/DELETE /me/addresses[/:id]` | Checkout address picker, profile | `saveAddress`, `removeAddress` |
| `POST /me/export` → emailed or downloaded archive | Settings → export | `exportAccountData` |
| `DELETE /me` (with password or recent re-auth) | Settings → delete account | `deleteAccount` |

The demo's **guest cart and saved items merge on sign-in** (`signIn` merges the
guest's lines). The server keeps an anonymous cart id in a cookie and merges it
in `/auth/login` and `/auth/signup`.

## 3. Cart, checkout, orders

| Endpoint | Used by | Replaces |
|---|---|---|
| `GET /cart` → lines, subtotal, delivery, total, free-delivery gap | Cart page, drawer, delivery nudge | `cart`, `cartTotals` |
| `POST /cart/lines` `{ productId, variantId, qty }` | Add to cart, reorder, quick add | `addToCart` |
| `PATCH /cart/lines/:lineId` `{ qty? , variantId? }` | Stepper, change option | `setCartQty`, `changeCartVariant` |
| `DELETE /cart/lines/:lineId` | Remove (undo re-adds) | `removeFromCart` |
| `POST /checkout` `{ addressId, paymentMethodId }` + Idempotency-Key → order | Checkout (page + drawer) | `placeOrder` |
| `GET /orders`, `GET /orders/:id` (items with frozen variant label and price, status, tracking) | Orders, order detail | `orders` |
| `POST /orders/:id/reorder` → lines added, lines unavailable | Buy these again, "Running low?" | `reorder` |
| `POST /orders/:id/returns` `{ lines, reason }` | Start a return sheet | local state in `orders.$id.tsx` |
| `GET /me/running-low` → lines due for reorder | Home "Running low?" | `runningLow()` |
| `POST /products/:id/notify` `{ variantId }` | "Notify me" when sold out | toast only today |

Stock checks happen in `POST /checkout`. A line that went out of stock returns a
`409` naming it, so the cart can show "Only 2 left".

## 4. Payments

| Endpoint | Used by | Replaces |
|---|---|---|
| `GET /me/payment-methods` | Checkout, settings | `cards` |
| `POST /me/payment-methods/setup` → provider client secret | Add card | `addCard` |
| `POST /me/payment-methods/:id/default`, `DELETE …/:id` | Settings | `setDefaultCard`, `removeCard` |

Card numbers must **never** reach our server. Use a provider (e.g. Stripe
Elements / SetupIntents); the "add card" form becomes the provider's fields. The
demo's `digits`/`exp` handling is replaced entirely.

## 5. Pets and health

| Endpoint | Used by | Replaces |
|---|---|---|
| `GET/POST /pets`, `GET/PATCH/DELETE /pets/:id` | Pets, pet page, onboarding, add-pet sheet | `addPet`, `updatePet`, `removePet` |
| `POST /pets/:id/weights` `{ kg, date }` | Log weight | `logWeight` |
| `GET /pets/:id/vaccines`, `GET /vaccines?petId=` | Health, pet timeline, home urgent card | `vaccines` |
| `POST /vaccines` `{ petId, name, shieldsAgainst, givenOn, dueOn, source }` | Add record sheet | `addVaccineRecord` |
| `POST /vaccines/:id/given` `{ givenOn }` → next due date | "Already done" / "Mark as given" | `markVaccineGiven` |
| `DELETE /vaccines/:id` | Remove record (undo) | `removeVaccineRecord` |
| `GET /me/clinic-link`, `POST /me/clinic-link/sync` | Health sync card | `clinicLinked`, `syncClinicRecords` |

Vaccine status (`ok / due / overdue / scheduled`) should be **computed by the
server** from `dueOn` and bookings, so every client agrees.

## 6. Bookings

| Endpoint | Used by | Replaces |
|---|---|---|
| `POST /bookings` `{ clinicId, serviceId, petId, slotStart }` + Idempotency-Key | Book sheet on clinic page | `bookService` |
| `GET /bookings?status=`, `GET /bookings/:id` | Bookings, booking detail, home | `bookings` |
| `PATCH /bookings/:id` `{ slotStart }` | Reschedule | `rescheduleBooking` |
| `POST /bookings/:id/cancel` | Cancel (confirm sheet) | `cancelBooking` |
| `GET /bookings/:id/calendar.ics` | Add to calendar | client-built `.ics` today |
| `POST /bookings/:id/review` | Rate your visit | `addUserReview` |

Booking a vaccination marks the matching due vaccine as `scheduled` (the demo
does this in `bookService`). Keep that rule on the server.

## 7. Saved items, reviews, notifications, support

| Endpoint | Used by | Replaces |
|---|---|---|
| `PUT/DELETE /me/saved/products/:id`, `…/clinics/:id`, `GET /me/saved` | Hearts, Saved page | `toggleSavedProduct`, `toggleSavedClinic` |
| `POST /reviews` `{ kind, targetId, rating, text, topic? }` | Write a review | `addUserReview` |
| `PUT/DELETE /reviews/:id/helpful` | "Helpful" | `toggleHelpful` |
| `GET /notifications`, `POST /notifications/read` `{ ids }` | Bell, notifications page | `deriveNotices`, `markNoticesRead` |
| `GET/PATCH /me/notification-settings` | Settings | (settings toggles) |
| `POST /support/messages` `{ topic, body }` | Help → Message support | toast only today |

Device-only state stays in the browser: recently viewed, recent searches, a
remembered tab. It needs no API.

## Third-party services

- **Payments:** Stripe, or an equivalent that provides saved cards via SetupIntents.
- **Email:** order and booking confirmations, password-reset codes, data
  export. SMS or push optionally for vaccine reminders (the app promises two weeks' notice).
- **Scheduler:** a daily job that turns due dates into reminders and notifications.
- **Maps/geo:** distance sorting ("2.1 km"), Directions links, and optionally
  address autocomplete at checkout.
- **Clinic systems:** a sync or import from clinic practice-management
  software for records ("Records last synced 2 days ago") and live slots.
- **Shipping:** carrier tracking for the order timeline and "Arriving tomorrow".
- **Media/CDN:** product photos, resized per use (card, gallery, thumb,
  1200×630 share card). Today's `npm run og` step moves to upload time.
- **Search:** the catalogue is small enough for Postgres full-text at first;
  a hosted search service later if the catalogue grows.
- **Admin (not in this UI):** catalogue, stock, clinic onboarding and
  verification, review moderation.

## Suggested order

1. **Catalogue, clinics, guides (read-only):** the public, server-rendered
   pages come from real data. There are no accounts yet, so risk is lowest.
2. **Auth and profile**, including guest-cart merge.
3. **Cart, checkout, payments and orders.**
4. **Pets, vaccines and bookings with real availability.**
5. **Notifications and reminders, reviews, support, returns.**

Each step replaces store functions behind the same names, so screens change
little: swap the body of `addToCart` for a request plus optimistic update, and
keep the undo toasts.
