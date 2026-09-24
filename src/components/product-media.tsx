import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion, useAutoAdvance } from '../lib/use-auto-advance'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { CategoryIcon, tileClass } from './ui'
import type { Product } from '../lib/types'

/* -------------------------------------------------------------- card media */

/**
 * Product card image area. No images → the category icon tile (unchanged).
 * One image → that image. Several → a slow crossfade while the card is on
 * screen, paused on hover/focus, with dots showing position.
 */
export function CardMedia({ product, children }: { product: Product; children?: React.ReactNode }) {
  const images = product.images ?? []
  const ref = useRef<HTMLSpanElement>(null)
  const [paused, setPaused] = useState(false)
  // stagger cards so a grid doesn't flip in unison
  const period = 3200 + (product.id.charCodeAt(product.id.length - 1) % 5) * 280
  const [index] = useAutoAdvance(images.length, period, !paused, ref)

  if (images.length === 0) {
    return (
      <span className={`tile tile--card ${tileClass(product.category)}`}>
        <CategoryIcon category={product.category} size={34} />
        {children}
      </span>
    )
  }

  return (
    <span
      ref={ref}
      className={`tile tile--card tile--media ${tileClass(product.category)}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === 0 ? product.name : ''}
          width={800}
          height={800}
          loading="lazy"
          decoding="async"
          className={`media-fade${i === index ? ' is-on' : ''}`}
          aria-hidden={i !== 0 || undefined}
        />
      ))}
      {images.length > 1 && (
        <span className="media-dots" aria-hidden>
          {images.map((src, i) => (
            <span key={src} className={i === index ? 'is-on' : undefined} />
          ))}
        </span>
      )}
      {children}
    </span>
  )
}

/* ---------------------------------------------------------------- gallery */

/**
 * Product detail gallery: a swipeable scroll-snap track that also auto-advances
 * (pausing while the shopper hovers, touches or focuses it), with arrows on
 * wide screens and a thumbnail strip. Falls back to the icon tile.
 */
export function ProductGallery({
  product,
  overlay,
}: {
  product: Product
  /** floating extras over the image — save button, option tag, stock flag */
  overlay?: React.ReactNode
}) {
  const images = product.images ?? []
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [interacting, setInteracting] = useState(false)
  const [index, setIndex] = useAutoAdvance(images.length, 4500, !interacting, wrap)
  const fromScroll = useRef(false)
  const indexRef = useRef(index)
  indexRef.current = index

  // index → scroll position (autoplay, dots, thumbs, arrows)
  useEffect(() => {
    const el = track.current
    if (!el || fromScroll.current) {
      fromScroll.current = false
      return
    }
    el.scrollTo({ left: index * el.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [index])

  // scroll position → index (swipes)
  useEffect(() => {
    const el = track.current
    if (!el) return
    let t = 0
    const onScroll = () => {
      window.clearTimeout(t)
      t = window.setTimeout(() => {
        const i = Math.round(el.scrollLeft / el.clientWidth)
        if (i === indexRef.current) return
        // the shopper swiped — record it so the index effect doesn't scroll back
        fromScroll.current = true
        setIndex(i)
      }, 90)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [setIndex])

  if (images.length === 0) {
    return (
      <div className="gallery">
        <span className={`tile pdp__tile ${tileClass(product.category)}`}>
          <CategoryIcon category={product.category} size={88} />
        </span>
        {overlay}
      </div>
    )
  }

  const go = (i: number) => setIndex((i + images.length) % images.length)

  return (
    <div
      ref={wrap}
      className="gallery"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${product.name} images`}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onTouchStart={() => setInteracting(true)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={() => setInteracting(false)}
    >
      <div className="gallery__stage">
        <div ref={track} className={`gallery__track ${tileClass(product.category)}`} tabIndex={0} aria-live="off">
          {images.map((src, i) => (
            <figure
              key={src}
              className="gallery__slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${images.length}`}
            >
              <img
                src={src}
                alt={`${product.name} — image ${i + 1} of ${images.length}`}
                width={800}
                height={800}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={i === 0 ? 'high' : undefined}
              />
            </figure>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button type="button" className="icon-btn gallery__arrow gallery__arrow--prev" onClick={() => go(index - 1)} aria-label="Previous image">
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <button type="button" className="icon-btn gallery__arrow gallery__arrow--next" onClick={() => go(index + 1)} aria-label="Next image">
              <ChevronRight size={18} strokeWidth={2} />
            </button>
            <span className="media-dots media-dots--lg" aria-hidden>
              {images.map((src, i) => (
                <span key={src} className={i === index ? 'is-on' : undefined} />
              ))}
            </span>
          </>
        )}
        {overlay}
      </div>

      {images.length > 1 && (
        <div className="gallery__thumbs" role="tablist" aria-label="Choose image">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show image ${i + 1}`}
              className={`gallery__thumb ${tileClass(product.category)}`}
              onClick={() => go(i)}
            >
              <img src={src} alt="" width={96} height={96} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
