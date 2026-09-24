import { useEffect, useRef, useState } from 'react'
import { createFileRoute, notFound, Link } from '@tanstack/react-router'
import { Bell, Check, ChevronRight, MessageCircleQuestion, PackageCheck, Truck } from 'lucide-react'

import { Crumbs, RatingSummary, ReviewList, SaveButton } from '../components/blocks'
import { ProductRail } from '../components/product-rail'
import { PetGlyph, Pill, Price, Stars, Stepper, useCopiedLabel } from '../components/ui'
import { CATEGORIES, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, PRODUCTS, getProduct, productReviews, ratingBreakdown } from '../lib/data'
import { hasOptions, optionSummary, priceRange, resolveVariant, variantLabel, variantsOf } from '../lib/catalog'
import type { AxisId, Product, ProductVariant } from '../lib/types'
import { money } from '../lib/format'
import { SITE, absoluteUrl, breadcrumbLd, seo } from '../lib/seo'
import { addToCart, cartCount, cartTotals, noteViewed, pushToast, useAppState } from '../lib/store'
import { VariantPicker, VariantPrice } from '../components/variant-picker'
import { ProductGallery } from '../components/product-media'
import { speciesInfo } from '../lib/species'

const CATEGORY_NOTES: Record<string, string> = {
  food: 'Switch to a new food gradually over about a week, mixing growing amounts into the current diet.',
  treats: 'Treats work best as rewards — keep them under a tenth of the day’s calories.',
  grooming: 'For external use only. Avoid the eyes and ears, and rinse thoroughly.',
  toys: 'Pick a size your pet can’t swallow, supervise the first plays, and retire toys that start to fray.',
  health: 'Follow the schedule on the pack, and check with your vet before combining treatments.',
}

/** prices are reviewed yearly: valid to the end of next year */
function priceValidUntil(): string {
  return `${new Date().getFullYear() + 1}-12-31`
}

function offerLd(p: Product, v: ProductVariant) {
  return {
    '@type': 'Offer',
    url: absoluteUrl(hasOptions(p) ? `/shop/${p.id}?v=${v.id}` : `/shop/${p.id}`),
    priceCurrency: 'USD',
    price: v.price.toFixed(2),
    priceValidUntil: priceValidUntil(),
    seller: { '@type': 'Organization', name: SITE.name },
    availability: v.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: { '@type': 'MonetaryAmount', value: v.price >= FREE_DELIVERY_THRESHOLD ? '0' : DELIVERY_FEE.toFixed(2), currency: 'USD' },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' },
      },
    },
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 30,
    },
  }
}

const VARIES_BY: Record<AxisId, string> = {
  size: 'https://schema.org/size',
  flavour: 'https://schema.org/pattern',
  lifeStage: 'https://schema.org/suggestedAge',
  petWeight: 'https://schema.org/weight',
}

export const Route = createFileRoute('/shop/$id')({
  // unknown ids are real 404s (status + noindex), not soft "not found" pages
  beforeLoad: ({ params }) => {
    if (!getProduct(params.id)) throw notFound()
  },
  validateSearch: (s: Record<string, unknown>): { v?: string } => ({
    v: typeof s.v === 'string' ? s.v : undefined,
  }),
  head: ({ params, match }) => {
    const p = getProduct(params.id)
    if (!p) return seo({ title: 'Product not found', noindex: true })
    const cat = CATEGORIES.find((c) => c.id === p.category)?.label ?? p.category
    const v = (match.search as { v?: string }).v
    const chosen = resolveVariant(p, v)
    // the bare URL is the product, not its first option; ?v= pages name the option
    const label = v ? variantLabel(p, chosen) : ''
    const { min, max } = priceRange(p)
    const priceText = min === max ? money(min) : `from ${money(min)}`
    const pets = p.suits.map((sp) => speciesInfo(sp).many.toLowerCase()).join(' & ')
    const common = {
      brand: { '@type': 'Brand', name: p.brand },
      category: cat,
      description: p.description?.join(' ') ?? p.blurb,
      image: p.images?.length ? p.images.map((src) => absoluteUrl(src)) : absoluteUrl(`/og/${p.id}.jpg`),
      aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews, bestRating: 5 },
      review: productReviews(p.id).map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.author },
        datePublished: new Date(Date.now() - r.daysAgo * 86_400_000).toISOString().slice(0, 10),
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
        reviewBody: r.text,
      })),
    }
    // variant products are a ProductGroup whose hasVariant entries each carry an offer
    const productLd = hasOptions(p)
      ? {
          '@type': 'ProductGroup',
          name: p.name,
          productGroupID: `PSC-${p.id.toUpperCase()}`,
          variesBy: (p.axes ?? []).map((a) => VARIES_BY[a.id]),
          ...common,
          hasVariant: variantsOf(p).map((v) => ({
            '@type': 'Product',
            name: `${p.name} — ${variantLabel(p, v)}`,
            sku: `PSC-${v.id.toUpperCase()}`,
            ...(v.options.size ? { size: (p.axes ?? []).find((a) => a.id === 'size')?.options.find((o) => o.id === v.options.size)?.label } : {}),
            offers: offerLd(p, v),
          })),
        }
      : { '@type': 'Product', name: p.name, sku: `PSC-${p.id.toUpperCase()}`, ...common, offers: offerLd(p, chosen) }
    return seo({
      title: label ? `${p.name} — ${label}` : p.name.length <= 34 ? `${p.name} by ${p.brand}` : p.name,
      // the name is already in the title: say what it is, then what it costs — the
      // longest complete version that fits a results snippet
      description: [
        `${p.blurb} For ${pets}, ${priceText}${hasOptions(p) ? ` in ${optionSummary(p)}` : ''}.`,
        `${p.blurb} ${priceText[0].toUpperCase()}${priceText.slice(1)}.`,
        p.blurb,
      ].find((d) => d.length <= 158) ?? p.blurb,
      // every ?v= option consolidates onto the product URL
      path: `/shop/${p.id}`,
      image: `/og/${p.id}.jpg`,
      imageAlt: `${p.name} by ${p.brand}`,
      type: 'product',
      jsonLd: [
        productLd,
        breadcrumbLd([
          ['Shop', '/shop'],
          [cat, `/shop?cat=${p.category}`],
          [p.name, `/shop/${p.id}`],
        ]),
      ],
    })
  },
  component: ProductPage,
})

function ProductPage() {
  const { id } = Route.useParams()
  const { v } = Route.useSearch()
  const navigate = Route.useNavigate()
  const product = getProduct(id)
  const [qty, setQty] = useState(1)
  const [added, markAdded] = useCopiedLabel(1600)
  const { cart } = useAppState()
  const buyRef = useRef<HTMLDivElement>(null)
  const [buyInView, setBuyInView] = useState(true)
  const [notified, setNotified] = useState(false)

  // related-product links reuse this component — start each product fresh
  useEffect(() => {
    setQty(1)
    setNotified(false)
  }, [id, v])

  useEffect(() => {
    if (getProduct(id)) noteViewed(id)
  }, [id])

  // the sticky phone bar appears only after the inline buy row leaves the screen
  useEffect(() => {
    const el = buyRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setBuyInView(entry.isIntersecting), {
      rootMargin: '0px 0px -72px 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [id])

  if (!product) {
    return (
      <div className="page">
        <p className="muted">This product is no longer listed.</p>
        <Link to="/shop" className="btn btn--ghost btn--sm" style={{ width: 'fit-content' }}>
          Back to shop
        </Link>
      </div>
    )
  }

  // the chosen option lives in the URL: shareable, back-button friendly, rendered on the server
  const variant = resolveVariant(product, v)
  const label = variantLabel(product, variant)
  const options = hasOptions(product)
  const chooseVariant = (next: ProductVariant) => {
    setQty((q) => Math.max(1, Math.min(q, next.stock || 1)))
    navigate({ search: { v: next.id }, replace: true, resetScroll: false })
  }

  const stockTone = variant.stock === 0 ? 'bad' : variant.stock <= 5 ? 'warn' : 'ok'
  const stockLabel =
    variant.stock === 0 ? 'Out of stock' : variant.stock <= 5 ? `Only ${variant.stock} left` : 'In stock'
  // related: the same animal first (a cat page never leads with bird seed), then
  // the same category, then rating — enough to fill a rail
  const sharesPet = (p: Product) => p.suits.some((sp) => product.suits.includes(sp))
  const onlyPet = product.suits.length === 1 ? product.suits[0] : undefined
  const ranked = PRODUCTS.filter((p) => p.id !== product.id)
    .map((p) => ({ p, score: (sharesPet(p) ? 4 : 0) + (p.category === product.category ? 2 : 0) + p.rating / 10 }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p)
  // a "More for cats" rail holds only cat things (when there are enough of them)
  const samePet = ranked.filter(sharesPet)
  const railPet = onlyPet && samePet.length >= 4 ? onlyPet : undefined
  const related = (railPet ? samePet : ranked).slice(0, 8)
  const reviews = productReviews(product.id)
  const catLabel = CATEGORIES.find((c) => c.id === product.category)?.label ?? product.category
  const productLines = cart.filter((i) => i.productId === product.id)
  const inCart = cartCount(productLines)
  const inCartThis = cartCount(
    productLines.filter((i) => resolveVariant(product, i.variantId).id === variant.id),
  )

  // what the basket would be with this pick in it — the free-delivery nudge is about the next tap
  const basket = cartTotals(cart).subtotal + (variant.stock > 0 ? variant.price * qty : 0)
  const toFree = FREE_DELIVERY_THRESHOLD - basket

  function add() {
    addToCart(product!.id, qty, variant.id)
    markAdded()
  }

  return (
    <div className="page">
      <Crumbs
        items={[
          { label: 'Shop', to: '/shop' },
          { label: catLabel, to: '/shop', search: { cat: product.category } },
          { label: product.name },
        ]}
      />

      <div className="pdp rise" style={{ '--i': 1 } as React.CSSProperties}>
        <div className="pdp__media">
          <ProductGallery
            product={product}
            overlay={
              <>
                {variant.stock === 0 && <span className="product-card__flag">Out of stock</span>}
                {label && <span className="pdp__variant-tag">{label}</span>}
                <SaveButton kind="product" id={product.id} name={product.name} variant="overlay" />
              </>
            }
          />
        </div>

        <div className="pdp__info">
          <div>
            <Link to="/shop" search={{ brand: product.brand }} className="tag pdp__brand">
              {product.brand}
            </Link>
            <h1 className="pdp__title">{product.name}</h1>
            <div className="pdp__meta">
              <Stars rating={product.rating} />
              <a href="#reviews" className="row__sub num">{product.reviews} reviews</a>
              <span className="pdp__suits">
                {product.suits.map((sp) => (
                  <Link
                    key={sp}
                    to="/shop"
                    search={{ cat: product.category, for: sp }}
                    className="chip"
                    aria-label={`More ${catLabel.toLowerCase()} for ${sp}s`}
                  >
                    <PetGlyph species={sp} size={13} /> {speciesInfo(sp).many}
                  </Link>
                ))}
              </span>
            </div>
          </div>

          <div className="pdp__price">
            <VariantPrice variant={variant} large status={<Pill tone={stockTone}>{stockLabel}</Pill>} />
          </div>

          <p className="pdp__blurb">{product.blurb}</p>

          {options && <VariantPicker product={product} value={variant} onChange={chooseVariant} />}

          <div className="pdp__buy" ref={buyRef}>
            <Stepper
              value={qty}
              onChange={setQty}
              max={Math.max(1, Math.min(99, variant.stock))}
              label={`Quantity of ${product.name}`}
            />
            {variant.stock === 0 ? (
              <button
                type="button"
                className="btn btn--ghost pdp__add"
                disabled={notified}
                onClick={() => {
                  setNotified(true)
                  pushToast(`We’ll email you when ${label || product.name} is back`)
                }}
              >
                <Bell size={15} strokeWidth={1.75} /> {notified ? 'We’ll let you know' : 'Notify me'}
              </button>
            ) : (
              <button type="button" className="btn btn--primary pdp__add" onClick={add}>
                {added ? (
                  <>
                    <Check size={15} strokeWidth={2.25} /> Added to cart
                  </>
                ) : qty > 1 ? (
                  `Add ${qty} · ${money(variant.price * qty)}`
                ) : (
                  'Add to cart'
                )}
              </button>
            )}
            <SaveButton kind="product" id={product.id} name={product.name} variant="icon" />
          </div>
          {inCart > 0 && (
            <p className="row__sub">
              {options && inCartThis !== inCart
                ? `${inCart} in your cart (${inCartThis} of this option)`
                : `${inCart} in your cart`}{' '}
              · <Link to="/cart">Review cart</Link>
            </p>
          )}

          <ul className="pdp__trust">
            <li className="pdp__ship">
              <Truck size={15} strokeWidth={1.75} aria-hidden />
              <span className="row__grow">
                {toFree <= 0 ? (
                  <span>
                    <strong className="pdp__ship-ok">Free delivery</strong> with this in your basket — arrives in 2–4 days
                  </span>
                ) : (
                  <span>
                    Add <strong className="num">{money(toFree)}</strong> more for free delivery — arrives in 2–4 days
                  </span>
                )}
                {toFree > 0 && (
                  <span className="free-meter__track" aria-hidden>
                    <span style={{ width: `${Math.min(100, (basket / FREE_DELIVERY_THRESHOLD) * 100)}%` }} />
                  </span>
                )}
              </span>
            </li>
            <li>
              <PackageCheck size={15} strokeWidth={1.75} aria-hidden />
              30-day returns, no questions asked
            </li>
            <li>
              <MessageCircleQuestion size={15} strokeWidth={1.75} aria-hidden />
              Not sure it fits? Ask at your next clinic visit
            </li>
          </ul>
        </div>
      </div>

      <section className="card card--pad pdp__desc rise" style={{ '--i': 2 } as React.CSSProperties} aria-labelledby="desc-h">
        <div className="pdp__desc-text">
          <h2 id="desc-h" className="section-head__title">Description</h2>
          {(product.description ?? [product.blurb]).map((para) => (
            <p key={para.slice(0, 24)} className="pdp__blurb">{para}</p>
          ))}
        </div>
        {product.highlights && product.highlights.length > 0 && (
          <div className="pdp__highlights">
            <h3 className="tag">Highlights</h3>
            <ul className="check-list">
              {product.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="pdp__details rise" style={{ '--i': 2 } as React.CSSProperties}>
        <div className="stack">
          <section className="card card--pad">
            <h2 className="section-head__title">How to use</h2>
            <p className="pdp__blurb" style={{ marginTop: 'var(--space-2xs)' }}>
              {CATEGORY_NOTES[product.category]}
            </p>
          </section>
          <section className="card card--pad">
            <h2 className="section-head__title">At a glance</h2>
            <dl className="spec-list">
              <div className="spec-list__row">
                <dt>Brand</dt>
                <dd>
                  <Link to="/shop" search={{ brand: product.brand }}>{product.brand}</Link>
                </dd>
              </div>
              <div className="spec-list__row">
                <dt>Category</dt>
                <dd>{catLabel}</dd>
              </div>
              <div className="spec-list__row">
                <dt>Suits</dt>
                <dd>{product.suits.map((sp) => speciesInfo(sp).many).join(' & ')}</dd>
              </div>
              <div className="spec-list__row">
                <dt>Size</dt>
                <dd className="num">{options ? variantsOf(product).map((x) => x.unit).filter((u, i, a) => a.indexOf(u) === i).join(', ') : product.unit}</dd>
              </div>
              <div className="spec-list__row">
                <dt>SKU</dt>
                <dd className="num">PSC-{product.id.toUpperCase()}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section id="reviews" className="card card--pad" style={{ scrollMarginTop: '5rem' }}>
          <h2 className="section-head__title section-head">Reviews</h2>
          <RatingSummary rating={product.rating} total={product.reviews} breakdown={ratingBreakdown(product.rating, product.reviews)} />
          <div style={{ marginTop: 'var(--space-md)' }}>
            <ReviewList reviews={reviews} />
          </div>
          <Link to="/shop/$id/reviews" params={{ id: product.id }} className="btn btn--ghost btn--block" style={{ marginTop: 'var(--space-sm)' }}>
            See all {product.reviews} reviews
          </Link>
        </section>
      </div>

      {related.length > 0 && (
        <section className="rise" style={{ '--i': 3 } as React.CSSProperties}>
          <div className="section-head">
            <h2 className="section-head__title">
              {railPet ? `More for ${speciesInfo(railPet).many.toLowerCase()}` : 'You might also like'}
            </h2>
            <Link to="/shop" search={railPet ? { for: railPet } : {}} className="section-head__link">
              {railPet ? `All ${speciesInfo(railPet).one.toLowerCase()} supplies` : 'All supplies'} <ChevronRight size={13} strokeWidth={2} />
            </Link>
          </div>
          <ProductRail ids={related.map((p) => p.id)} label={railPet ? `More for ${speciesInfo(railPet).many.toLowerCase()}` : 'You might also like'} />
        </section>
      )}

      {variant.stock > 0 && (
        <div className="buy-bar" aria-label="Quick add" data-hidden={buyInView} aria-hidden={buyInView || undefined}>
          <span style={{ minWidth: 0 }}>
            <Price value={variant.price * qty} className="price--lg" />
            <span className="row__sub buy-bar__meta">
              {qty > 1 ? `${qty} × ${money(variant.price)}` : label || variant.unit}
            </span>
          </span>
          <button type="button" className="btn btn--primary" onClick={add}>
            {added ? (
              <>
                <Check size={15} strokeWidth={2.25} /> Added
              </>
            ) : (
              'Add to cart'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
