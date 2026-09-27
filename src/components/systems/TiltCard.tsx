import { useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { Variants } from 'framer-motion'

interface TiltCardProps {
  children: ReactNode
  /** Peak rotation in degrees at the corners. */
  max?: number
  /** Lift (px) applied while hovered. */
  lift?: number
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  role?: string
  tabIndex?: number
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>
  /** Pass-through motion props so a TiltCard can slot in where a motion.div was. */
  variants?: Variants
  initial?: string
  animate?: string
  whileInView?: string
  viewport?: { once?: boolean; amount?: number; margin?: string }
  'aria-label'?: string
}

/**
 * Wraps any card in a perspective tilt that tracks the cursor — the card
 * leans toward the pointer and springs back on leave. A radial sheen follows
 * the cursor across the surface so the tilt reads as a real, lit plane
 * instead of a flat element being rotated.
 *
 * Honours reduced-motion by rendering a plain, static wrapper.
 */
export default function TiltCard({
  children,
  max = 10,
  lift = 6,
  className = '',
  style,
  onClick,
  role,
  tabIndex,
  onKeyDown,
  variants,
  initial,
  animate,
  whileInView,
  viewport,
  'aria-label': ariaLabel,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  // Normalised pointer position within the card, −0.5 .. 0.5
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sheenOpacity = useMotionValue(0)

  const sx = useSpring(px, { stiffness: 220, damping: 20, mass: 0.5 })
  const sy = useSpring(py, { stiffness: 220, damping: 20, mass: 0.5 })

  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max])
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max])
  const sheenX = useTransform(sx, [-0.5, 0.5], ['0%', '100%'])
  const sheenY = useTransform(sy, [-0.5, 0.5], ['0%', '100%'])
  const sheen = useTransform(
    [sheenX, sheenY],
    ([x, y]) => `radial-gradient(240px circle at ${x} ${y}, rgba(0,212,255,0.16), transparent 62%)`,
  )

  // Cache the card's box on enter instead of measuring on every mousemove —
  // a layout read per pointer move is a forced-reflow source.
  const rectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null)

  const handleEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    rectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height }
    handleMove(e)
  }

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    let r = rectRef.current
    if (!r) {
      const el = ref.current
      if (!el) return
      const b = el.getBoundingClientRect()
      r = rectRef.current = { left: b.left, top: b.top, width: b.width, height: b.height }
    }
    if (!r.width || !r.height) return
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
    sheenOpacity.set(1)
  }

  const reset = () => {
    rectRef.current = null
    px.set(0)
    py.set(0)
    sheenOpacity.set(0)
  }

  // A scroll or resize moves the card under the pointer, so the cached box
  // must be dropped; the next mousemove re-measures it.
  useEffect(() => {
    if (reduced) return
    const invalidate = () => { rectRef.current = null }
    window.addEventListener('scroll', invalidate, { passive: true })
    window.addEventListener('resize', invalidate, { passive: true })
    return () => {
      window.removeEventListener('scroll', invalidate)
      window.removeEventListener('resize', invalidate)
    }
  }, [reduced])

  if (reduced) {
    return (
      <div
        ref={ref}
        className={className}
        style={style}
        onClick={onClick}
        role={role}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      className={className}
      variants={variants}
      initial={initial}
      animate={animate}
      whileInView={whileInView}
      viewport={viewport}
      style={{
        ...style,
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ y: -lift, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26, mass: 0.6 }}
    >
      {children}
      {/* Cursor-tracking sheen — fades in only while the card is hovered */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 mix-blend-screen"
        style={{ background: sheen, opacity: sheenOpacity }}
      />
    </motion.div>
  )
}
