import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

interface ScrambleTextProps {
  text: string
  className?: string
  /** ms before the resolve starts. */
  delay?: number
  /** ms per character reveal step. */
  speed?: number
  /** Characters cycled through while a slot is still unresolved. */
  charset?: string
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3'
  /** Gate the effect — it waits for both `play` and the element being in view. */
  play?: boolean
}

const DEFAULT_CHARS = '!<>-_\\/[]{}—=+*^?#________'

/**
 * Resolves text from random glyph noise into the real string — the classic
 * "decrypting / booting" effect. Plays once when scrolled into view. Under
 * reduced-motion it renders the final string immediately.
 */
export default function ScrambleText({
  text,
  className = '',
  delay = 0,
  speed = 34,
  charset = DEFAULT_CHARS,
  as = 'span',
  play = true,
}: ScrambleTextProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })
  const active = play && inView
  const [output, setOutput] = useState(() => (reduced ? text : text.replace(/\S/g, '\u00A0')))

  useEffect(() => {
    if (!active || reduced) {
      if (reduced) setOutput(text)
      return
    }

    let raf = 0
    let started = false
    const startAt = performance.now() + delay
    // Each character resolves at its own time, staggered left→right.
    const revealAt = Array.from(text, (_, i) => i * speed)

    const tick = (now: number) => {
      if (!started) {
        if (now < startAt) {
          raf = requestAnimationFrame(tick)
          return
        }
        started = true
      }

      const elapsed = now - startAt
      let done = true
      let next = ''

      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (ch === ' ') {
          next += ' '
          continue
        }
        if (elapsed >= revealAt[i]) {
          next += ch
        } else {
          done = false
          next += charset[Math.floor(Math.random() * charset.length)]
        }
      }

      setOutput(next)
      // Stop the moment every slot has resolved to its real glyph.
      if (!done) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, reduced, text, delay, speed, charset])

  const Tag = as as 'span'
  return (
    <Tag ref={ref as React.Ref<HTMLSpanElement>} className={className} aria-label={text}>
      {output}
    </Tag>
  )
}
