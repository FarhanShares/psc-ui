import { createFileRoute } from '@tanstack/react-router'

import { LegalPage, type LegalSection } from '../components/legal'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '../lib/data'
import { money, wholeMoney } from '../lib/format'
import { breadcrumbLd, seo } from '../lib/seo'

export const Route = createFileRoute('/terms')({
  head: () =>
    seo({
      title: 'Terms of service',
      description: 'The terms for shopping, booking clinic visits and using PetSafeCare — deliveries, returns, cancellations and more.',
      path: '/terms',
      type: 'article',
      jsonLd: breadcrumbLd([['Home', '/'], ['Terms', '/terms']]),
    }),
  component: () => <LegalPage title="Terms of service" updated="Sep 1, 2026" intro={INTRO} sections={SECTIONS} />,
})

const INTRO = 'These terms cover buying supplies and booking clinic services through PetSafeCare. Plain language, no tricks.'

const SECTIONS: LegalSection[] = [
  {
    id: 'orders',
    title: 'Orders and delivery',
    body: [
      `Delivery is free on orders over ${wholeMoney(FREE_DELIVERY_THRESHOLD)} and ${money(DELIVERY_FEE)} below that. Most orders arrive in 2–4 days.`,
      'Prices include tax. If an item sells out after you order, we refund it in full straight away.',
    ],
  },
  {
    id: 'returns',
    title: 'Returns',
    body: [
      'Unopened items can be returned within 30 days. Opened food can be returned within 14 days if your pet refuses it.',
      'Refunds go back to the original payment method 3–5 days after we receive the return.',
    ],
  },
  {
    id: 'bookings',
    title: 'Clinic bookings',
    body: [
      'Clinics set their own prices and provide the veterinary service; PetSafeCare arranges the booking. You pay the clinic directly.',
      'Cancelling or rescheduling is free up to 24 hours before the appointment. Late cancellations may be charged by the clinic.',
    ],
  },
  {
    id: 'advice',
    title: 'Not veterinary advice',
    body: [
      'Product descriptions, reminders and emergency guidance are general information. Always follow your vet’s advice for your pet.',
    ],
  },
  {
    id: 'account',
    title: 'Your account',
    body: [
      'Keep your login details private. You can close your account at any time from the Help page.',
    ],
  },
]
