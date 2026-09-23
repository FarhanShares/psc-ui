import { createFileRoute, notFound } from '@tanstack/react-router'

import { ReviewsPage } from '../components/reviews-page'
import { getClinic } from '../lib/data'
import { absoluteUrl, breadcrumbLd, seo } from '../lib/seo'

export const Route = createFileRoute('/clinics/$id_/reviews')({
  beforeLoad: ({ params }) => {
    if (!getClinic(params.id)) throw notFound()
  },
  head: ({ params }) => {
    const c = getClinic(params.id)!
    return seo({
      title: `${c.name} reviews`,
      description: `Read all ${c.reviews} reviews of ${c.name} in ${c.area} — rated ${c.rating.toFixed(1)} out of 5. Filter by service and star rating.`,
      path: `/clinics/${c.id}/reviews`,
      jsonLd: [
        {
          '@type': 'VeterinaryCare',
          name: c.name,
          url: absoluteUrl(`/clinics/${c.id}`),
          aggregateRating: { '@type': 'AggregateRating', ratingValue: c.rating, reviewCount: c.reviews },
        },
        breadcrumbLd([
          ['Clinics', '/clinics'],
          [c.name, `/clinics/${c.id}`],
          ['Reviews', `/clinics/${c.id}/reviews`],
        ]),
      ],
    })
  },
  component: function ClinicReviews() {
    const { id } = Route.useParams()
    return <ReviewsPage kind="clinic" id={id} />
  },
})
