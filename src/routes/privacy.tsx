import { createFileRoute } from '@tanstack/react-router'

import { LegalPage, type LegalSection } from '../components/legal'
import { SUPPORT } from '../lib/data'
import { breadcrumbLd, seo } from '../lib/seo'

export const Route = createFileRoute('/privacy')({
  head: () =>
    seo({
      title: 'Privacy policy',
      description: 'What PetSafeCare collects about you and your pets, why, who we share it with, and how to delete it.',
      path: '/privacy',
      type: 'article',
      jsonLd: breadcrumbLd([['Home', '/'], ['Privacy', '/privacy']]),
    }),
  component: () => <LegalPage title="Privacy policy" updated="Sep 1, 2026" intro={INTRO} sections={SECTIONS} />,
})

const INTRO =
  'The short version: we collect what we need to deliver orders, book visits and remind you about vaccinations. We never sell your data.'

const SECTIONS: LegalSection[] = [
  {
    id: 'collect',
    title: 'What we collect',
    body: [
      'Account details you give us — name, email, phone number and delivery addresses.',
      'Pet details — name, species, breed, age, weight, allergies and vaccination records you add or a linked clinic shares.',
      'Order and booking history, and basic device information used to keep the app secure.',
    ],
  },
  {
    id: 'use',
    title: 'How we use it',
    body: [
      'To deliver orders, confirm clinic bookings and send the reminders you switch on.',
      'To improve the catalogue and the app, using aggregated statistics rather than individual profiles.',
    ],
  },
  {
    id: 'share',
    title: 'Who we share it with',
    body: [
      'Clinics you book receive your contact details and the relevant pet’s profile, so they can prepare for the visit.',
      'Couriers receive your name, phone and address for delivery. Payment processors handle card details — we never store full card numbers.',
    ],
  },
  {
    id: 'rights',
    title: 'Your choices and rights',
    body: [
      'Change notification settings at any time from your profile. You can request a copy of your data, a correction, or deletion.',
      `Email ${SUPPORT.email} and we will respond within 30 days.`,
    ],
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: [
      'We keep order records for as long as tax law requires, and everything else until you delete your account.',
    ],
  },
]
