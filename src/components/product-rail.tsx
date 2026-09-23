import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { ProductCard } from './cards'

/**
 * A rail that is honestly scrollable: touch snap-scroll with a peeking next
 * card on phones, arrow buttons on wide screens. Arrows sit in the page
 * gutter (never over a card) and disappear at either end of the rail.
 */
export function ProductRail({ ids, label = 'Product picks' }: { ids: string[]; label?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () =>
      setEdges({
        start: el.scrollLeft <= 4,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      })
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ids.length])

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
        aria-label="Scroll back"
        hidden={edges.start}
      >
        <ChevronLeft size={17} strokeWidth={2} />
      </button>
      <div className="rail" ref={ref} role="list" aria-label={label} tabIndex={0}>
        {ids.map((id, i) => (
          <ProductCard key={id} id={id} i={i} />
        ))}
      </div>
      <button
        type="button"
        className="icon-btn rail-arrow rail-arrow--next"
        onClick={() => nudge(1)}
        aria-label="Scroll forward"
        hidden={edges.end}
      >
        <ChevronRight size={17} strokeWidth={2} />
      </button>
    </div>
  )
}
