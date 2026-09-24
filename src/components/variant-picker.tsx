import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'

import { Price, Sheet, Stepper } from './ui'
import { ProductThumb } from './product-media'
import {
  bestValueOption,
  defaultVariant,
  optionState,
  resolveVariant,
  selectOption,
  unitPriceLabel,
  variantLabel,
} from '../lib/catalog'
import { money } from '../lib/format'
import { addToCart, changeCartVariant, pushToast } from '../lib/store'
import type { Product, ProductVariant } from '../lib/types'

/**
 * One row of option buttons per axis. The legend names the current choice
 * ("Size · 6 kg"); each button shows what that option would cost given the
 * other choices. Sold-out combinations stay selectable (so the shopper can
 * see they exist) but are struck through. Options that don't exist with the
 * current choices are muted but still work — they jump to the nearest real
 * combination instead of dead-ending.
 */
export function VariantPicker({
  product,
  value,
  onChange,
}: {
  product: Product
  value: ProductVariant
  onChange: (v: ProductVariant) => void
}) {
  if (!product.axes) return null

  return (
    <div className="vpick">
      {product.axes.map((axis) => {
        const current = axis.options.find((o) => o.id === value.options[axis.id])
        const best = bestValueOption(product, value, axis.id)
        return (
          <fieldset key={axis.id} className="plain-fieldset">
            <legend className="vpick__legend">
              <span className="tag">{axis.label}</span>
              <span className="vpick__current">{current?.label}</span>
            </legend>
            <div className="vpick__opts" role="radiogroup" aria-label={axis.label}>
              {axis.options.map((o) => {
                const state = optionState(product, value, axis.id, o.id)
                const target = selectOption(product, value, axis.id, o.id)
                const on = value.options[axis.id] === o.id
                // size-like axes change the price, so each button shows its own;
                // flavour/life-stage buttons only speak up when sold out
                const priced = axis.id === 'size' || axis.id === 'petWeight'
                const hint = state === 'soldout' ? 'Sold out' : priced || state === 'unavailable' ? money(target.price) : null
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={`vopt${state === 'soldout' ? ' vopt--soldout' : ''}${state === 'unavailable' ? ' vopt--other' : ''}`}
                    aria-label={`${o.label}${best === o.id ? ', best value' : ''}${state === 'soldout' ? ', sold out' : ''}${state === 'unavailable' ? `, not in this combination — switches to ${variantLabel(product, target)}` : ''}`}
                    title={state === 'unavailable' ? `Switches to ${variantLabel(product, target)}` : undefined}
                    onClick={() => onChange(target)}
                  >
                    <span className="vopt__label">{o.label}</span>
                    {hint && <span className="vopt__price num">{hint}</span>}
                    {best === o.id && <span className="vopt__best">Best value</span>}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}

/** price block for a chosen variant: price, was-price, per-kg, stock */
export function VariantPrice({
  variant,
  large = false,
  status,
}: {
  variant: ProductVariant
  large?: boolean
  /** e.g. the stock pill — sits on the price line, centred on the figure */
  status?: React.ReactNode
}) {
  const unit = unitPriceLabel(variant, money)
  const saving = variant.compareAt && variant.compareAt > variant.price ? variant.compareAt - variant.price : 0
  return (
    <div className="vprice">
      <Price value={variant.price} className={large ? 'pdp__amount' : 'price--lg'} />
      {saving > 0 && (
        <>
          <s className="vprice__was num">{money(variant.compareAt!)}</s>
          <span className="pill pill--ok">Save {money(saving)}</span>
        </>
      )}
      {status}
      <span className="row__sub num vprice__unit">
        {variant.unit}
        {unit ? ` · ${unit}` : ''}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------ quick add */

/** product-card "Choose" flow: pick options + qty without leaving the grid */
export function QuickAddSheet({
  product,
  open,
  onClose,
}: {
  product: Product
  open: boolean
  onClose: () => void
}) {
  const [variant, setVariant] = useState(() => defaultVariant(product))
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (!open) return
    setVariant(defaultVariant(product))
    setQty(1)
  }, [open, product])

  const soldOut = variant.stock === 0
  const label = variantLabel(product, variant)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Choose options"
      footer={
        <div className="quick-add__foot">
          <Stepper value={qty} onChange={setQty} max={Math.max(1, Math.min(99, variant.stock))} label={`Quantity of ${product.name}`} />
          <button
            type="button"
            className="btn btn--primary"
            disabled={soldOut}
            onClick={() => {
              addToCart(product.id, qty, variant.id)
              onClose()
              pushToast(`${product.name}${label ? ` (${label})` : ''} added`)
            }}
          >
            {soldOut ? 'Sold out' : `Add · ${money(variant.price * qty)}`}
          </button>
        </div>
      }
    >
      <div className="stack">
        <div className="quick-add__head">
          <ProductThumb product={product} size={3.5} />
          <span className="row__grow">
            <span className="tag">{product.brand}</span>
            <Link to="/shop/$id" params={{ id: product.id }} search={{ v: variant.id }} className="row__title" onClick={onClose}>
              {product.name}
            </Link>
          </span>
        </div>
        <VariantPrice variant={variant} />
        <VariantPicker product={product} value={variant} onChange={setVariant} />
        {variant.stock > 0 && variant.stock <= 5 && (
          <p className="row__sub" style={{ color: 'var(--color-warn)' }}>Only {variant.stock} left in this option</p>
        )}
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------ change cart line */

export function ChangeVariantSheet({
  product,
  variantId,
  open,
  onClose,
}: {
  product: Product
  variantId?: string
  open: boolean
  onClose: () => void
}) {
  const [variant, setVariant] = useState(() => resolveVariant(product, variantId))

  useEffect(() => {
    if (open) setVariant(resolveVariant(product, variantId))
  }, [open, product, variantId])

  const original = resolveVariant(product, variantId)
  const unchanged = variant.id === original.id

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Change ${product.name}`}
      footer={
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={unchanged || variant.stock === 0}
          onClick={() => {
            changeCartVariant(product.id, variantId, variant.id)
            onClose()
            pushToast(`Switched to ${variantLabel(product, variant)}`)
          }}
        >
          {unchanged ? (
            <>
              <Check size={15} strokeWidth={2.25} /> Current option
            </>
          ) : variant.stock === 0 ? (
            'Sold out'
          ) : (
            `Switch · ${money(variant.price)} each`
          )}
        </button>
      }
    >
      <div className="stack">
        <VariantPrice variant={variant} />
        <VariantPicker product={product} value={variant} onChange={setVariant} />
      </div>
    </Sheet>
  )
}
