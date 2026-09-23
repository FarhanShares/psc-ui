import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BellOff, CalendarDays, Package, RefreshCw, Settings2, Syringe, Tag } from 'lucide-react'

import { EmptyState } from '../components/ui'
import { timeAgo } from '../lib/format'
import { seo } from '../lib/seo'
import { deriveNotices, markNoticeRead, markNoticesRead, useAppState } from '../lib/store'
import type { NoticeKind } from '../lib/types'

export const Route = createFileRoute('/notifications')({
  head: () => seo({ title: 'Notifications', path: '/notifications', noindex: true }),
  component: NotificationsPage,
})

const ICONS: Record<NoticeKind, typeof Syringe> = {
  vaccine: Syringe,
  order: Package,
  booking: CalendarDays,
  offer: Tag,
  sync: RefreshCw,
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'vaccine', label: 'Health' },
  { id: 'order', label: 'Orders' },
  { id: 'booking', label: 'Visits' },
] as const

function NotificationsPage() {
  const state = useAppState()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const notices = deriveNotices(state)
  const unread = notices.filter((n) => !state.readNotices.includes(n.id))

  const list = notices.filter((n) =>
    filter === 'all' ? true : filter === 'unread' ? !state.readNotices.includes(n.id) : n.kind === filter,
  )

  return (
    <div className="page">
      <header className="rise split" style={{ '--i': 0, alignItems: 'flex-end', flexWrap: 'wrap' } as React.CSSProperties}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="muted" style={{ fontSize: 'var(--text-sm)', marginTop: 2 }}>
            {unread.length > 0 ? `${unread.length} unread` : 'You’re all caught up.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2xs)' }}>
          {unread.length > 0 && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => markNoticesRead(unread.map((n) => n.id))}>
              Mark all read
            </button>
          )}
          <Link to="/profile" hash="notifications" className="icon-btn" aria-label="Notification settings">
            <Settings2 size={16} strokeWidth={1.75} />
          </Link>
        </div>
      </header>

      <div className="chips rise" style={{ '--i': 1 } as React.CSSProperties} role="tablist" aria-label="Filter notifications">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            aria-pressed={filter === f.id}
            className="chip"
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            {f.id === 'unread' && unread.length > 0 && <span className="chip__count num">{unread.length}</span>}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={filter === 'unread' ? 'Nothing unread' : 'No notifications here'}
          text="Reminders for vaccines, deliveries and visits land here."
          icon={<BellOff size={20} strokeWidth={1.75} />}
        />
      ) : (
        <ul className="notice-list rise" style={{ '--i': 2 } as React.CSSProperties}>
          {list.map((n) => {
            const Icon = ICONS[n.kind]
            const isUnread = !state.readNotices.includes(n.id)
            return (
              <li key={n.id}>
                <Link
                  to={n.to}
                  params={n.params as never}
                  search={n.search as never}
                  className={`notice${isUnread ? ' notice--unread' : ''}${n.urgent ? ' notice--urgent' : ''}`}
                  onClick={() => markNoticeRead(n.id)}
                >
                  <span className={`notice__icon notice__icon--${n.kind}`} aria-hidden>
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <span className="row__grow">
                    <span className="notice__title">
                      {n.title}
                      {isUnread && <span className="visually-hidden"> (unread)</span>}
                    </span>
                    <span className="row__sub">{n.body}</span>
                    <span className="mono-label">{timeAgo(n.minutesAgo)}</span>
                  </span>
                  {isUnread && <span className="notice__dot" aria-hidden />}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
