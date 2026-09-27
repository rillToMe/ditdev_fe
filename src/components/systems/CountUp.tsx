import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

interface CountUpProps {
  value: number
  /** Animation length in ms. */
  duration?: number
  className?: string
  style?: React.CSSProperties
  /** Fixed decimals to render. */
  decimals?: number
  prefix?: string
  suffix?: string
}

/**
 * Rolls a number up the first time it scrolls into view, then re-tweens from
 * its current value whenever `value` changes — the "stat ticker" you see on
 * game HUDs and level-up screens. Plain rAF ease-out; snaps straight to the
 * final number under reduced-motion.
 */
export default function CountUp({
  value,
  duration = 1100,
  className = '',
  style,
  decimals = 0,
  prefix = '',
  suffix = '',
}: CountUpProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(reduced ? value : 0)
  const fromRef = useRef(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setDisplay(value)
      return
    }

    let raf = 0
    const start = performance.now()
    const from = fromRef.current
    const delta = value - from

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      // easeOutCubic — fast start, gentle settle
      const eased = 1 - Math.pow(1 - t, 3)
      const next = from + delta * eased
      setDisplay(next)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        fromRef.current = value
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration, reduced])

  const rendered = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString()

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{rendered}{suffix}
    </span>
  )
}
