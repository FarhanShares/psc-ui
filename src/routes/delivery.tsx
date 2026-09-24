import { createFileRoute } from '@tanstack/react-router'

import { LegalPage, type LegalSection } from '../components/legal'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '../lib/data'
import { money, wholeMoney } from '../lib/format'
import { breadcrumbLd, seo } from '../lib/seo'

export const Route = createFileRoute('/delivery')({
  head: () =>
    seo({
      title: 'Delivery policy',
      description: 'How PetSafeCare delivers pet supplies — speed, costs, cut-offs and what happens if a delivery is missed.',
      path: '/delivery',
      type: 'article',
      jsonLd: breadcrumbLd([['Home', '/'], ['Delivery', '/delivery']]),
    }),
  component: () => <LegalPage title="Delivery policy" updated="Sep 1, 2026" intro={INTRO} sections={SECTIONS} />,
})

const INTRO = 'Everything we ship, in plain language — costs, timing and what to expect at the door.'

const SECTIONS: LegalSection[] = [
  {
    id: 'cost',
    title: 'Cost',
    body: [
      `Delivery is free on orders over ${wholeMoney(FREE_DELIVERY_THRESHOLD)}. Below that, delivery is ${money(DELIVERY_FEE)} — the counter in your cart shows exactly how much more unlocks free delivery.`,
    ],
  },
  {
    id: 'timing',
    title: 'Timing',
    body: [
      'Most orders arrive in 2–4 days. Orders placed before 2 pm usually leave the same day; you get an email when the parcel ships.',
      'The courier aims to deliver before 8 pm and calls the phone number on your order if they cannot reach the door.',
    ],
  },
  {
    id: 'areas',
    title: 'Where we deliver',
    body: [
      'We currently deliver within our service region. If an address falls outside it, the checkout will say so before you can place the order — you will never be charged for an undeliverable order.',
    ],
  },
  {
    id: 'missed',
    title: 'Missed deliveries',
    body: [
      'If nobody is home, the courier tries once more the next day and leaves a note. After two attempts the parcel returns to us and we refund the order in full, including the delivery fee.',
    ],
  },
  {
    id: 'problems',
    title: 'Damaged or wrong items',
    body: [
      'Check the parcel when it arrives. If anything is damaged or incorrect, contact the Help centre within 48 hours — we replace or refund it, including delivery, at our cost.',
    ],
  },
]
