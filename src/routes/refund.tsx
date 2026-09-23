import { createFileRoute } from '@tanstack/react-router'

import { LegalPage, type LegalSection } from '../components/legal'
import { breadcrumbLd, seo } from '../lib/seo'

export const Route = createFileRoute('/refund')({
  head: () =>
    seo({
      title: 'Refund and return policy',
      description: 'PetSafeCare returns and refunds — 30-day returns, refunds timeline and clinic booking cancellations.',
      path: '/refund',
      type: 'article',
      jsonLd: breadcrumbLd([['Home', '/'], ['Refund policy', '/refund']]),
    }),
  component: () => <LegalPage title="Refund and return policy" updated="Sep 1, 2026" intro={INTRO} sections={SECTIONS} />,
})

const INTRO = 'If it didn’t work out — for you or your pet — here is exactly how returns and refunds work.'

const SECTIONS: LegalSection[] = [
  {
    id: 'returns',
    title: 'What you can return',
    body: [
      'Unopened items can be returned within 30 days of delivery, no questions asked.',
      'Opened food can be returned within 14 days if your pet refuses it — we would rather refund you than have it go to waste.',
      'For hygiene reasons, opened grooming products and health treatments cannot be returned unless they arrived damaged.',
    ],
  },
  {
    id: 'refunds',
    title: 'How refunds work',
    body: [
      'Refunds go back to the original payment method 3–5 days after the return reaches our warehouse.',
      'If an item sells out after you order, we refund it in full straight away — you never wait for us.',
    ],
  },
  {
    id: 'bookings',
    title: 'Clinic bookings',
    body: [
      'Clinic appointments can be cancelled or rescheduled free of charge up to 24 hours before the visit, right from your bookings page.',
      'Later cancellations may be charged by the clinic, since the vet held the slot for your pet. Clinic fees are refunded by the clinic, not PetSafeCare.',
    ],
  },
  {
    id: 'how',
    title: 'Starting a return',
    body: [
      'Open the order in your Orders page and choose “Return items”, or contact the Help centre. You get a prepaid return label by email — drop the parcel at any courier point.',
    ],
  },
]
