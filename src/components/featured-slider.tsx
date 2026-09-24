import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { CategoryIcon, tileClass } from './ui'
import { FREE_DELIVERY_THRESHOLD } from '../lib/data'
import { wholeMoney } from '../lib/format'
import { prefersReducedMotion, useAutoAdvance } from '../lib/use-auto-advance'
import type { ProductCategory } from '../lib/types'

interface Slide {
  id: string
  tag: string
  title: string
  meta: string
  cta: string
  to: '/shop' | '/shop/$id'
  params?: { id: string }
  search?: Record<string, string>
  image?: string
  category: ProductCategory
}

const SLIDES: Slide[] = [
  {
    id: 'flea',
    tag: 'Seasonal',
    title: 'Flea & tick season is here',
    meta: `Spot-ons dosed by weight band, plus chews and powders — free delivery over ${wholeMoney(FREE_DELIVERY_THRESHOLD)}.`,
    cta: 'Shop flea & tick',
    to: '/shop',
    search: { cat: 'health' },
    category: 'health',
  },
  {
    id: 'birds',
    tag: 'New',
    title: 'Now stocking for birds',
    meta: 'Seed blends, millet sprays, cuttlebone and rope perches for budgies to parrots.',
    cta: 'Shop bird supplies',
    to: '/shop',
    search: { for: 'bird' },
    image: '/products/p17-1.svg',
    category: 'food',
  },
  {
    id: 'kitten',
    tag: 'Life stage',
    title: 'Kitten starter kibble',
    meta: 'Ocean Feast Kitten — salmon first, with DHA for growing brains and eyes.',
    cta: 'Choose a size',
    to: '/shop/$id',
    params: { id: 'p02' },
    search: { v: 'p02-kitten-1kg' },
    image: '/products/p02-1.svg',
    category: 'food',
  },
  {
    id: 'pate',
    tag: 'Save $3.80',
    title: 'Stock up on wet food',
    meta: 'Purrfect Pâté 24-packs — the best price per tray, delivered free.',
    cta: 'See the 24-pack',
    to: '/shop/$id',
    params: { id: 'p14' },
    search: { v: 'p14-tuna-24' },
    image: '/products/p14-2.svg',
    category: 'food',
  },
]

/**
 * Featured promotions as one swipeable card: scroll-snap track that also
 * auto-advances (paused on hover, focus or touch, off-screen, or for reduced
 * motion), with dots and — on pointer devices — arrows.
 */
export function FeaturedSlider() {
  const wrap = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [index, setIndex] = useAutoAdvance(SLIDES.length, 6000, !paused, wrap)
  const fromScroll = useRef(false)
  const indexRef = useRef(index)
  indexRef.current = index

  useEffect(() => {
    const el = track.current
    if (!el || fromScroll.current) {
      fromScroll.current = false
      return
    }
    el.scrollTo({ left: index * el.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [index])

  useEffect(() => {
    const el = track.current
    if (!el) return
    let t = 0
    const onScroll = () => {
      window.clearTimeout(t)
      t = window.setTimeout(() => {
        const i = Math.round(el.scrollLeft / el.clientWidth)
        if (i === indexRef.current) return
        fromScroll.current = true
        setIndex(i)
      }, 90)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [setIndex])

  const go = (i: number) => setIndex((i + SLIDES.length) % SLIDES.length)

  return (
    <section
      ref={wrap}
      className="fslider"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div ref={track} className="fslider__track">
        {SLIDES.map((s, i) => (
          <article
            key={s.id}
            className="fslider__slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${SLIDES.length}: ${s.title}`}
            aria-hidden={i !== index || undefined}
          >
            <div className="fslider__copy">
              <span className="tag">{s.tag}</span>
              <h2 className="band__title">{s.title}</h2>
              <p className="band__meta">{s.meta}</p>
              <Link
                to={s.to}
                params={s.params as never}
                search={s.search as never}
                className="btn btn--primary btn--sm fslider__cta"
                tabIndex={i === index ? 0 : -1}
              >
                {s.cta}
              </Link>
            </div>
            <div className={`fslider__media ${tileClass(s.category)}`} aria-hidden>
              {s.image ? (
                <img src={s.image} alt="" width={800} height={800} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
              ) : (
                <CategoryIcon category={s.category} size={56} />
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="fslider__controls">
        <button type="button" className="fslider__arrow" onClick={() => go(index - 1)} aria-label="Previous featured item">
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <div className="fslider__dots" role="tablist" aria-label="Featured items">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={s.title}
              className="fslider__dot"
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button type="button" className="fslider__arrow" onClick={() => go(index + 1)} aria-label="Next featured item">
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>
    </section>
  )
}
