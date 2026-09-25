import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Heart } from 'lucide-react'

import { ClinicCard, ProductCard } from '../components/cards'
import { EmptyState } from '../components/ui'
import { getClinic, getProduct } from '../lib/data'
import { seo } from '../lib/seo'
import { addToCart, pushToast, useAppState } from '../lib/store'

export const Route = createFileRoute('/saved')({
  head: () => seo({ title: 'Saved', path: '/saved', noindex: true }),
  component: SavedPage,
})

function SavedPage() {
  const { savedProducts, savedClinics } = useAppState()
  const [tab, setTab] = useState<'products' | 'clinics'>('products')

  const products = savedProducts.filter((id) => getProduct(id))
  const clinics = savedClinics.filter((id) => getClinic(id))
  const inStock = products.filter((id) => (getProduct(id)?.stock ?? 0) > 0)

  return (
    <div className="page">
      <header className="rise split" style={{ '--i': 0, alignItems: 'flex-end', flexWrap: 'wrap' } as React.CSSProperties}>
        <div>
          <h1 className="page-title">Saved</h1>
          <p className="muted" style={{ fontSize: 'var(--text-sm)', marginTop: 2 }}>
            Things you’re keeping an eye on.
          </p>
        </div>
        {tab === 'products' && inStock.length > 1 && (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              inStock.forEach((id) => addToCart(id))
              pushToast(`${inStock.length} saved items added — default sizes, change them in the cart`)
            }}
          >
            Add all to cart
          </button>
        )}
      </header>

      <div className="segmented segmented--wide rise" style={{ '--i': 1 } as React.CSSProperties} role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'products'} aria-pressed={tab === 'products'} onClick={() => setTab('products')}>
          Supplies <span className="num muted">{products.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'clinics'} aria-pressed={tab === 'clinics'} onClick={() => setTab('clinics')}>
          Clinics <span className="num muted">{clinics.length}</span>
        </button>
      </div>

      {tab === 'products' &&
        (products.length > 0 ? (
          <div className="grid-products rise" style={{ '--i': 2 } as React.CSSProperties}>
            {products.map((id, i) => (
              <ProductCard key={id} id={id} i={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No saved supplies"
            text="Tap the heart on anything in the shop to keep it here."
            actionLabel="Browse the shop"
            actionTo="/shop"
            icon={<Heart size={20} strokeWidth={1.75} />}
          />
        ))}

      {tab === 'clinics' &&
        (clinics.length > 0 ? (
          <div className="clinic-grid rise" style={{ '--i': 2 } as React.CSSProperties}>
            {clinics.map((id) => (
              <ClinicCard key={id} id={id} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No saved clinics"
            text="Save a clinic you trust so booking again takes two taps."
            actionLabel="Find a clinic"
            actionTo="/clinics"
            icon={<Heart size={20} strokeWidth={1.75} />}
          />
        ))}
    </div>
  )
}
