import { Link, useRouterState } from '@tanstack/react-router'
import { Bell, CalendarDays, HeartPulse, LogIn, Package, PawPrint } from 'lucide-react'

import { useAppState } from '../lib/store'

export type GateKind = 'health' | 'pets' | 'orders' | 'bookings' | 'notifications'

const COPY: Record<GateKind, { title: string; text: string; points: string[]; icon: typeof Bell }> = {
  health: {
    title: 'Health',
    text: 'Sign in to see vaccination records and get reminded before anything is due.',
    points: ['Records sync from your clinic', 'Reminders two weeks ahead', 'Book the jab in one tap'],
    icon: HeartPulse,
  },
  pets: {
    title: 'Your pets',
    text: 'Sign in to keep a profile for every pet — weight, microchip, allergies and visits.',
    points: ['Shared with clinics when you book', 'Food picks that fit each pet', 'Weight trend over time'],
    icon: PawPrint,
  },
  orders: {
    title: 'Orders',
    text: 'Sign in to track deliveries, reorder in one tap and start returns.',
    points: ['Live delivery tracking', 'Buy it again', '30-day returns from the order page'],
    icon: Package,
  },
  bookings: {
    title: 'Bookings',
    text: 'Sign in to see upcoming visits, reschedule or cancel for free up to a day before.',
    points: ['Reminders the day before', 'Directions and calendar invites', 'Rate a visit afterwards'],
    icon: CalendarDays,
  },
  notifications: {
    title: 'Notifications',
    text: 'Sign in to get vaccine reminders, delivery updates and visit reminders in one place.',
    points: ['Only what matters for your pets', 'Choose what you hear about', 'No marketing unless you ask'],
    icon: Bell,
  },
}

/**
 * Account pages render this for signed-out visitors instead of someone's
 * data. `data-guest-view` lets pre-hydration CSS hide it for returning
 * signed-in users so they never see a flash of the gate.
 */
export function SignInGate({ kind }: { kind: GateKind }) {
  const here = useRouterState({ select: (s) => s.location.href })
  const c = COPY[kind]
  return (
    <div className="page" data-guest-view>
      <header className="rise">
        <h1 className="page-title">{c.title}</h1>
      </header>
      <section className="gate rise" style={{ '--i': 1 } as React.CSSProperties}>
        <span className="gate__icon" aria-hidden>
          <c.icon size={22} strokeWidth={1.75} />
        </span>
        <p className="gate__text">{c.text}</p>
        <ul className="check-list gate__points">
          {c.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <div className="btn-pair gate__actions">
          <Link to="/login" search={{ redirect: here }} className="btn btn--primary">
            <LogIn size={15} strokeWidth={2} /> Sign in
          </Link>
          <Link to="/signup" search={{ redirect: here }} className="btn btn--ghost">
            Create free account
          </Link>
        </div>
      </section>
    </div>
  )
}

/** route wrapper: signed-in → the page, signed-out → a sign-in gate */
export function RequireAccount({ kind, children }: { kind: GateKind; children: React.ReactNode }) {
  const { signedIn } = useAppState()
  return signedIn ? <>{children}</> : <SignInGate kind={kind} />
}
