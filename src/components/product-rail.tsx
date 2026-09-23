import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { ProductCard } from './cards'

/**
 * A rail that is honestly scrollable: touch snap-scroll with a peeking next
 * card on phones, arrow buttons on wide screens.
 */
export function ProductRail({ ids }: { ids: string[] }) {
  const ref = useRef<HTMLDivElement>(null)

  function nudge(dir: 1 | -1) {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="rail-wrap">
      <button
        type="button"
        className="icon-btn rail-arrow rail-arrow--prev"
        onClick={() => nudge(-1)}
        aria-label="Scroll picks back"
      >
        <ChevronLeft size={17} strokeWidth={2} />
      </button>
      <div className="rail" ref={ref} role="list" aria-label="Product picks" tabIndex={0}>
        {ids.map((id, i) => (
          <ProductCard key={id} id={id} i={i} />
        ))}
      </div>
      <button
        type="button"
        className="icon-btn rail-arrow rail-arrow--next"
        onClick={() => nudge(1)}
        aria-label="Scroll picks forward"
      >
        <ChevronRight size={17} strokeWidth={2} />
      </button>
    </div>
  )
}
