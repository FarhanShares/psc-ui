import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { CreditCard, LifeBuoy, MapPin, Package, RotateCcw, Undo2 } from 'lucide-react'

import { Crumbs, SuccessMark, Timeline, type TimelineStep } from '../components/blocks'
import { CategoryIcon, EmptyState, OrderStatusLabel, Sheet, tileClass } from '../components/ui'
import { getProduct } from '../lib/data'
import { dateFromOffset, longDate, money, plural, shortDate } from '../lib/format'
import { seo } from '../lib/seo'
import { pushToast, reorder, useAppState } from '../lib/store'
import type { Order } from '../lib/types'

export const Route = createFileRoute('/orders/$id')({
  head: ({ params }) => seo({ title: `Order #${params.id}`, path: `/orders/${params.id}`, noindex: true }),
  component: OrderPage,
})

const RETURN_REASONS = [
  'My pet won’t eat or use it',
  'Arrived damaged',
  'Wrong item sent',
  'Ordered by mistake',
  'Something else',
]

function steps(order: Order): TimelineStep[] {
  const placed = dateFromOffset(-order.placedAtDaysAgo)
  const rank = order.status === 'placed' ? 0 : order.status === 'transit' ? 2 : 3
  const state = (i: number): TimelineStep['state'] => (i < rank ? 'done' : i === rank ? (rank === 3 ? 'done' : 'current') : 'todo')
  return [
    { label: 'Order placed', detail: longDate(placed), state: 'done' },
    {
      label: 'Packed',
      detail: rank >= 1 ? longDate(dateFromOffset(-order.placedAtDaysAgo + 1)) : 'Usually within a day',
      state: rank === 0 ? 'current' : 'done',
    },
    {
      label: 'On the way',
      detail: rank === 2 ? 'Courier expects delivery tomorrow before 8 pm' : rank > 2 ? 'Handed to courier' : 'We email when it ships',
      state: state(2),
    },
    {
      label: 'Delivered',
      detail: rank === 3 ? `${longDate(dateFromOffset(-order.placedAtDaysAgo + 3))} · ${order.addressLine}` : rank === 2 ? `Expected ${longDate(dateFromOffset(1))}` : 'Estimated in 2–4 days',
      state: state(3),
    },
  ]
}

function OrderPage() {
  const { id } = Route.useParams()
  const { orders } = useAppState()
  const navigate = useNavigate()
  const order = orders.find((o) => o.id === id)

  const [returnOpen, setReturnOpen] = useState(false)
  const [reason, setReason] = useState(RETURN_REASONS[0])
  const [returnPicks, setReturnPicks] = useState<string[]>([])
  const [returned, setReturned] = useState(false)

  if (!order) {
    return (
      <div className="page">
        <Crumbs items={[{ label: 'Orders', to: '/orders' }, { label: 'Not found' }]} />
        <EmptyState
          title="We can’t find that order"
          text="It may belong to a different account, or the link is incomplete."
          actionLabel="See all orders"
          actionTo="/orders"
          icon={<Package size={20} strokeWidth={1.75} />}
        />
      </div>
    )
  }

  const count = order.items.reduce((n, i) => n + i.qty, 0)

  function handleReorder() {
    const added = reorder(order!.id)
    if (added === 0) {
      pushToast('Those items are out of stock right now')
      return
    }
    pushToast(`${plural(added, 'item')} added to cart`, {
      actionLabel: 'View cart',
      onAction: () => navigate({ to: '/cart' }),
    })
  }

  return (
    <div className="page">
      <Crumbs items={[{ label: 'Account', to: '/profile' }, { label: 'Orders', to: '/orders' }, { label: `#${order.id}` }]} />

      <header className="rise split" style={{ '--i': 0, alignItems: 'flex-end', flexWrap: 'wrap' } as React.CSSProperties}>
        <div>
          <p className="mono-label">Placed {shortDate(dateFromOffset(-order.placedAtDaysAgo))}</p>
          <h1 className="page-title">Order #{order.id}</h1>
        </div>
        <OrderStatusLabel status={order.status} />
      </header>

      <div className="detail-grid rise" style={{ '--i': 1 } as React.CSSProperties}>
        <div className="stack">
          <section className="card card--pad">
            <h2 className="section-head__title" style={{ marginBottom: 'var(--space-sm)' }}>Tracking</h2>
            <Timeline steps={steps(order)} />
          </section>

          <section className="card card--pad">
            <div className="section-head" style={{ marginBottom: 'var(--space-2xs)' }}>
              <h2 className="section-head__title">Items</h2>
              <span className="mono-label">{plural(count, 'item')}</span>
            </div>
            {order.items.map((item) => {
              const p = getProduct(item.productId)
              if (!p) return null
              return (
                <Link
                  key={`${item.productId}-${item.variantId ?? ''}`}
                  to="/shop/$id"
                  params={{ id: p.id }}
                  search={item.variantId ? { v: item.variantId } : {}}
                  className="row line-item"
                >
                  <span className={`tile ${tileClass(p.category)}`} style={{ width: '2.75rem', height: '2.75rem' }}>
                    <CategoryIcon category={p.category} size={18} />
                  </span>
                  <span className="row__grow">
                    <span className="row__title">{p.name}</span>
                    {item.variantLabel && <span className="row__sub line-item__variant">{item.variantLabel}</span>}
                    <span className="row__sub num">
                      {money(item.priceAtPurchase)} × {item.qty}
                    </span>
                  </span>
                  <span className="price">{money(item.priceAtPurchase * item.qty)}</span>
                </Link>
              )
            })}
          </section>
        </div>

        <div className="stack side-col">
          <div className="summary">
            <div className="summary__row">
              <span>Subtotal</span>
              <span className="price">{money(order.subtotal)}</span>
            </div>
            <div className="summary__row">
              <span>Delivery</span>
              <span className="price">{order.delivery === 0 ? 'Free' : money(order.delivery)}</span>
            </div>
            <div className="summary__row summary__row--total">
              <span>Total</span>
              <span className="price">{money(order.total)}</span>
            </div>
          </div>

          <section className="card card--pad stack" style={{ gap: 'var(--space-xs)' }}>
            <div className="icon-line">
              <MapPin size={15} strokeWidth={1.75} aria-hidden />
              <span>
                <span className="tag">Deliver to</span>
                <span className="row__title" style={{ display: 'block' }}>{order.addressLine}</span>
              </span>
            </div>
            <div className="icon-line">
              <CreditCard size={15} strokeWidth={1.75} aria-hidden />
              <span>
                <span className="tag">Paid with</span>
                <span className="row__title num" style={{ display: 'block' }}>Card ending 4242</span>
              </span>
            </div>
          </section>

          <button type="button" className="btn btn--primary btn--block" onClick={handleReorder}>
            <RotateCcw size={15} strokeWidth={2} /> Buy these again
          </button>
          <div className="btn-pair">
            {order.status === 'delivered' && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setReturned(false)
                  setReturnPicks(order.items.map((i) => `${i.productId}::${i.variantId ?? ''}`))
                  setReturnOpen(true)
                }}
              >
                <Undo2 size={15} strokeWidth={1.75} /> Return items
              </button>
            )}
            <Link to="/help" search={{ topic: 'orders' }} className="btn btn--ghost">
              <LifeBuoy size={15} strokeWidth={1.75} /> Get help
            </Link>
          </div>
        </div>
      </div>

      <Sheet
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        title={returned ? 'Return requested' : 'Return items'}
        footer={
          returned ? (
            <button type="button" className="btn btn--primary btn--block" onClick={() => setReturnOpen(false)}>
              Done
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={returnPicks.length === 0}
              onClick={() => setReturned(true)}
            >
              Request return · {plural(returnPicks.length, 'item')}
            </button>
          )
        }
      >
        {returned ? (
          <div style={{ textAlign: 'center', paddingBlock: 'var(--space-md)' }}>
            <SuccessMark />
            <p className="row__title" style={{ fontSize: 'var(--text-md)' }}>We’ve emailed a return label</p>
            <p className="row__sub">
              Drop the parcel at any post office within 14 days. Refunds land 3–5 days after we receive it.
            </p>
          </div>
        ) : (
          <div className="stack">
            <fieldset className="plain-fieldset">
              <legend className="tag">Which items?</legend>
              <div className="option-list">
                {order.items.map((item) => {
                  const p = getProduct(item.productId)
                  if (!p) return null
                  const key = `${p.id}::${item.variantId ?? ''}`
                  const on = returnPicks.includes(key)
                  return (
                    <label key={key} className={`option-row${on ? ' is-selected' : ''}`}>
                      <input
                        type="checkbox"
                        className="check"
                        checked={on}
                        onChange={() =>
                          setReturnPicks((ps) => (on ? ps.filter((x) => x !== key) : [...ps, key]))
                        }
                      />
                      <span className="option-row__label">
                        {p.name}
                        {item.variantLabel && <span className="row__sub" style={{ display: 'block' }}>{item.variantLabel}</span>}
                      </span>
                      <span className="option-row__hint num">×{item.qty}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
            <div className="field">
              <label className="field__label" htmlFor="ret-reason">Reason</label>
              <select id="ret-reason" className="select" value={reason} onChange={(e) => setReason(e.target.value)}>
                {RETURN_REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
