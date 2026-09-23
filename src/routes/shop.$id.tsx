import { useEffect, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Bell, Check, ChevronRight, MessageCircleQuestion, PackageCheck, Truck } from 'lucide-react'

import { Crumbs, RatingSummary, ReviewList, SaveButton } from '../components/blocks'
import { ProductCard } from '../components/cards'
import { CategoryIcon, PetGlyph, Pill, Price, Stars, Stepper, tileClass, useCopiedLabel } from '../components/ui'
import { CATEGORIES, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, PRODUCTS, getProduct, productReviews, ratingBreakdown } from '../lib/data'
import { hasOptions, optionSummary, priceRange, resolveVariant, variantLabel, variantsOf } from '../lib/catalog'
import type { AxisId, Product, ProductVariant } from '../lib/types'
import { money } from '../lib/format'
import { absoluteUrl, breadcrumbLd, seo } from '../lib/seo'
import { addToCart, cartCount, noteViewed, pushToast, useAppState } from '../lib/store'
import { VariantPicker, VariantPrice } from '../components/variant-picker'

const CATEGORY_NOTES: Record<string, string> = {
  food: 'Switch to a new food gradually over about a week, mixing growing amounts into the current diet.',
  treats: 'Treats work best as rewards — keep them under a tenth of the day’s calories.',
  grooming: 'For external use only. Avoid the eyes and ears, and rinse thoroughly.',
  toys: 'Pick a size your pet can’t swallow, supervise the first plays, and retire toys that start to fray.',
  health: 'Follow the schedule on the pack, and check with your vet before combining treatments.',
}

function offerLd(p: Product, v: ProductVariant) {
  return {
    '@type': 'Offer',
    url: absoluteUrl(hasOptions(p) ? `/shop/${p.id}?v=${v.id}` : `/shop/${p.id}`),
    priceCurrency: 'USD',
    price: v.price.toFixed(2),
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
  validateSearch: (s: Record<string, unknown>): { v?: string } => ({
    v: typeof s.v === 'string' ? s.v : undefined,
  }),
  head: ({ params, match }) => {
    const p = getProduct(params.id)
    if (!p) return seo({ title: 'Product not found', noindex: true })
    const cat = CATEGORIES.find((c) => c.id === p.category)?.label ?? p.category
    const chosen = resolveVariant(p, (match.search as { v?: string }).v)
    const label = variantLabel(p, chosen)
    const { min, max } = priceRange(p)
    const priceText = min === max ? money(min) : `${money(min)}–${money(max)}`
    const common = {
      brand: { '@type': 'Brand', name: p.brand },
      category: cat,
      description: p.blurb,
      image: absoluteUrl('/og-image.png'),
      aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
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
      title: label ? `${p.name} — ${label}` : `${p.name} — ${p.unit}`,
      description: `${p.blurb} ${priceText} from ${p.brand}${hasOptions(p) ? ` in ${optionSummary(p)}` : ''}. Free delivery over ${money(FREE_DELIVERY_THRESHOLD)}.`,
      // every ?v= option consolidates onto the product URL
      path: `/shop/${p.id}`,
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
  const inCategory = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id)
  const fillers = PRODUCTS.filter(
    (p) => p.category !== product.category && p.id !== product.id,
  ).sort((a, b) => b.rating - a.rating)
  const related = [...inCategory, ...fillers].slice(0, 4)
  const reviews = productReviews(product.id)
  const catLabel = CATEGORIES.find((c) => c.id === product.category)?.label ?? product.category
  const productLines = cart.filter((i) => i.productId === product.id)
  const inCart = cartCount(productLines)
  const inCartThis = cartCount(
    productLines.filter((i) => resolveVariant(product, i.variantId).id === variant.id),
  )

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
          <span className={`tile pdp__tile ${tileClass(product.category)}`}>
            <CategoryIcon category={product.category} size={88} />
            {variant.stock === 0 && <span className="product-card__flag">Out of stock</span>}
            {label && <span className="pdp__variant-tag">{label}</span>}
          </span>
          <SaveButton kind="product" id={product.id} name={product.name} variant="overlay" />
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
                    <PetGlyph species={sp} size={13} /> {sp === 'dog' ? 'Dogs' : 'Cats'}
                  </Link>
                ))}
              </span>
            </div>
          </div>

          <div className="pdp__price">
            <VariantPrice variant={variant} large />
            <Pill tone={stockTone}>{stockLabel}</Pill>
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
            <li>
              <Truck size={15} strokeWidth={1.75} aria-hidden />
              Free delivery over {money(FREE_DELIVERY_THRESHOLD)} — arrives in 2–4 days
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
                <dd>{product.suits.map((sp) => (sp === 'dog' ? 'Dogs' : 'Cats')).join(' & ')}</dd>
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
        </section>
      </div>

      {related.length > 0 && (
        <section className="rise" style={{ '--i': 3 } as React.CSSProperties}>
          <div className="section-head">
            <h2 className="section-head__title">
              {inCategory.length > 1 ? `More ${catLabel.toLowerCase()}` : 'You might also need'}
            </h2>
            <Link to="/shop" className="section-head__link">
              All supplies <ChevronRight size={13} strokeWidth={2} />
            </Link>
          </div>
          <div className="grid-products">
            {related.map((p, i) => (
              <ProductCard key={p.id} id={p.id} i={i} />
            ))}
          </div>
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
