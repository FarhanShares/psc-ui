import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CalendarDays } from 'lucide-react'

import { BookingCard } from '../components/cards'
import { EmptyState } from '../components/ui'
import { useAppState } from '../lib/store'
import { seo } from '../lib/seo'

export const Route = createFileRoute('/bookings/')({
  head: () => seo({ title: 'Bookings', path: '/bookings', noindex: true }),
  component: BookingsPage,
})

type TabId = 'upcoming' | 'completed' | 'cancelled'

const TABS: { id: TabId; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Past' },
  { id: 'cancelled', label: 'Cancelled' },
]

function BookingsPage() {
  const { bookings } = useAppState()
  const [tab, setTab] = useState<TabId>('upcoming')

  const list = bookings
    .filter((b) => b.status === tab)
    .sort((a, b) => (tab === 'upcoming' ? a.dayOffset - b.dayOffset : b.dayOffset - a.dayOffset))

  const upcoming = bookings.filter((b) => b.status === 'upcoming')

  return (
    <div className="page">
      <header className="rise" style={{ '--i': 0 } as React.CSSProperties}>
        <h1 className="page-title">Bookings</h1>
        <p className="muted" style={{ fontSize: 'var(--text-sm)', marginTop: 2 }}>
          {upcoming.length > 0
            ? `${upcoming.length} appointment${upcoming.length === 1 ? '' : 's'} ahead.`
            : 'Nothing booked right now.'}
        </p>
      </header>

      <div
        className="chips rise"
        style={{ '--i': 1 } as React.CSSProperties}
        role="tablist"
        aria-label="Booking status"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className="chip"
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length > 0 ? (
        <div className="history-grid rise" style={{ '--i': 2 } as React.CSSProperties}>
          {list.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      ) : (
        <div className="rise" style={{ '--i': 2 } as React.CSSProperties}>
          <EmptyState
            title={tab === 'upcoming' ? 'No upcoming appointments' : tab === 'completed' ? 'No past visits' : 'Nothing cancelled'}
            text={
              tab === 'upcoming'
                ? 'Book a consultation, vaccination or grooming session in a few taps.'
                : 'This list fills itself as you use the app.'
            }
            actionLabel={tab === 'upcoming' ? 'Find a clinic' : undefined}
            actionTo={tab === 'upcoming' ? '/clinics' : undefined}
            icon={<CalendarDays size={20} strokeWidth={1.75} />}
          />
        </div>
      )}
    </div>
  )
}
