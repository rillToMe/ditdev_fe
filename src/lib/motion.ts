import type { Variants } from 'framer-motion'

type Bezier = [number, number, number, number]

/** Central easing curves. */
export const EASE: Record<'snap' | 'smooth' | 'inOut' | 'back', Bezier> = {
  snap:   [0.16, 1, 0.3, 1],
  smooth: [0.4, 0, 0.2, 1],
  inOut:  [0.65, 0, 0.35, 1],
  back:   [0.34, 1.56, 0.64, 1],
}

export const DUR = {
  instant: 0.12,
  base: 0.24,
  slow: 0.48,
  cinematic: 0.8,
} as const

/* ── Entrance archetypes ──────────────────────────────────────────────
   Four distinct motions instead of one repeated fade-up.
   Every section picks the archetype that fits its content. */

/** 1. Pixel-assemble — chunky rise + blur clear. HUD, titles, headings. */
export const assemble: Variants = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DUR.slow, ease: EASE.snap },
  },
}

/** 2. Slide-in — direction aware. Timeline, feeds, side panels. */
export const slideIn = (dir: 'left' | 'right' = 'left', distance = 28): Variants => ({
  hidden: { opacity: 0, x: dir === 'left' ? -distance : distance },
  show: { opacity: 1, x: 0, transition: { duration: DUR.slow, ease: EASE.snap } },
})

/** 3. Scale-pop — springy overshoot. Badges, achievements, trophies. */
export const scalePop: Variants = {
  hidden: { opacity: 0, scale: 0.82 },
  show: { opacity: 1, scale: 1, transition: { duration: DUR.slow, ease: EASE.back } },
}

/** 4. Scan — clip reveal from the left. Dialog, terminal, console. */
export const scan: Variants = {
  hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
  show: {
    opacity: 1,
    clipPath: 'inset(0 0% 0 0)',
    transition: { duration: DUR.slow, ease: EASE.smooth },
  },
}

/** Section "level load" wipe — used sparingly, at most once per zone. */
export const wipe: Variants = {
  hidden: { clipPath: 'inset(0 0 100% 0)', opacity: 0.6 },
  show: {
    clipPath: 'inset(0 0 0% 0)',
    opacity: 1,
    transition: { duration: DUR.cinematic, ease: EASE.snap },
  },
}

/** Parent container that staggers its children. */
export const stagger = (each = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: each, delayChildren: delay } },
})

/** Shared viewport config for whileInView reveals. */
export const VIEWPORT = { once: true, amount: 0.2 } as const
