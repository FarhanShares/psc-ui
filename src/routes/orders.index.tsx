import { createFileRoute } from '@tanstack/react-router'
import { Package } from 'lucide-react'

import { OrderCard } from '../components/cards'
import { EmptyState } from '../components/ui'
import { useAppState } from '../lib/store'
import { seo } from '../lib/seo'

export const Route = createFileRoute('/orders/')({
  head: () => seo({ title: 'Orders', path: '/orders', noindex: true }),
  component: OrdersPage,
})

function OrdersPage() {
  const { orders } = useAppState()

  return (
    <div className="page">
      <header className="rise" style={{ '--i': 0 } as React.CSSProperties}>
        <h1 className="page-title">Orders</h1>
        <p className="muted" style={{ fontSize: 'var(--text-sm)', marginTop: 2 }}>
          Tap an order for its items and delivery details.
        </p>
      </header>

      {orders.length > 0 ? (
        <div className="history-grid rise" style={{ '--i': 1 } as React.CSSProperties}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="rise" style={{ '--i': 1 } as React.CSSProperties}>
          <EmptyState
            title="No orders yet"
            text="Your first delivery is one shop tab away."
            actionLabel="Browse the shop"
            actionTo="/shop"
            icon={<Package size={20} strokeWidth={1.75} />}
          />
        </div>
      )}
    </div>
  )
}
