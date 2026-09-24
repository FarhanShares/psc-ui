import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronDown, Trash2 } from 'lucide-react'

import { Stepper } from './ui'
import { ProductThumb } from './product-media'
import { ChangeVariantSheet } from './variant-picker'
import { findVariant, hasOptions, variantLabel } from '../lib/catalog'
import { money } from '../lib/format'
import { removeFromCart, setCartQty } from '../lib/store'
import type { CartItem } from '../lib/types'

/** one cart line on the /cart page — option label doubles as a "change" control */
export function CartLine({ item }: { item: CartItem }) {
  const [changeOpen, setChangeOpen] = useState(false)
  const found = findVariant(item.productId, item.variantId)
  if (!found) return null
  const { product: p, variant } = found
  const label = variantLabel(p, variant)
  const lowStock = variant.stock > 0 && variant.stock < item.qty

  return (
    <div className="card cart-line">
      <Link to="/shop/$id" params={{ id: p.id }} search={hasOptions(p) ? { v: variant.id } : {}} className="cart-line__tile" aria-hidden tabIndex={-1}>
        <ProductThumb product={p} />
      </Link>
      <div className="cart-line__body">
        <div className="cart-line__top">
          <Link to="/shop/$id" params={{ id: p.id }} search={hasOptions(p) ? { v: variant.id } : {}} className="row__title">
            {p.name}
          </Link>
          <span className="price price--lg">{money(variant.price * item.qty)}</span>
        </div>
        {label ? (
          <button type="button" className="cart-line__option" onClick={() => setChangeOpen(true)} aria-haspopup="dialog">
            {label}
            <ChevronDown size={13} strokeWidth={2} aria-hidden />
            <span className="visually-hidden">, change option</span>
          </button>
        ) : (
          <span className="row__sub num">{variant.unit}</span>
        )}
        <span className="row__sub num">{money(variant.price)} each{label && variant.unit !== label ? ` · ${variant.unit}` : ''}</span>
        {lowStock && <span className="row__sub" style={{ color: 'var(--color-warn)' }}>Only {variant.stock} left — we’ll send what we have</span>}
        <div className="cart-line__actions">
          <Stepper
            value={item.qty}
            onChange={(v) => setCartQty(p.id, v, variant.id)}
            label={`Quantity of ${p.name}${label ? `, ${label}` : ''}`}
          />
          <button
            type="button"
            className="btn btn--quiet btn--sm"
            onClick={() => removeFromCart(p.id, variant.id)}
            aria-label={`Remove ${p.name}${label ? `, ${label}` : ''}`}
          >
            <Trash2 size={14} strokeWidth={1.75} /> <span className="cart-line__remove-text">Remove</span>
          </button>
        </div>
      </div>
      {changeOpen && (
        <ChangeVariantSheet product={p} variantId={variant.id} open onClose={() => setChangeOpen(false)} />
      )}
    </div>
  )
}
