import { createFileRoute, notFound } from '@tanstack/react-router'

import { ReviewsPage } from '../components/reviews-page'
import { getProduct } from '../lib/data'
import { absoluteUrl, breadcrumbLd, seo } from '../lib/seo'

export const Route = createFileRoute('/shop/$id_/reviews')({
  beforeLoad: ({ params }) => {
    if (!getProduct(params.id)) throw notFound()
  },
  head: ({ params }) => {
    const p = getProduct(params.id)!
    return seo({
      title: `${p.name} reviews`,
      description: `Read all ${p.reviews} reviews of ${p.name} by ${p.brand} — rated ${p.rating.toFixed(1)} out of 5 by dog and cat parents.`,
      path: `/shop/${p.id}/reviews`,
      jsonLd: [
        {
          '@type': 'Product',
          name: p.name,
          brand: { '@type': 'Brand', name: p.brand },
          url: absoluteUrl(`/shop/${p.id}`),
          aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
        },
        breadcrumbLd([
          ['Shop', '/shop'],
          [p.name, `/shop/${p.id}`],
          ['Reviews', `/shop/${p.id}/reviews`],
        ]),
      ],
    })
  },
  component: function ProductReviews() {
    const { id } = Route.useParams()
    return <ReviewsPage kind="product" id={id} />
  },
})
