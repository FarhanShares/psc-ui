import { useEffect, useState } from 'react'

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Advance an index on a timer while `enabled`. Pauses automatically when the
 * element is off-screen or the tab is hidden, and never runs for reduced motion.
 */
export function useAutoAdvance(
  count: number,
  ms: number,
  enabled: boolean,
  target: React.RefObject<HTMLElement | null>,
): [number, (i: number) => void] {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = target.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [target])

  useEffect(() => {
    if (!enabled || !visible || count < 2 || prefersReducedMotion()) return
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible') setIndex((i) => (i + 1) % count)
    }, ms)
    return () => window.clearInterval(t)
  }, [enabled, visible, count, ms])

  return [index, setIndex]
}
