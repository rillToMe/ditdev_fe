import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { wipe } from '../../lib/motion'

interface ZoneSectionProps {
  id: string
  children: ReactNode
  className?: string
  /** Opt into the "level load" wipe. Use at most on a few key zones. */
  wipeIn?: boolean
}

/**
 * Section shell with an optional level-load wipe. Keeps the id + base layout
 * consistent while letting each zone control its own interior.
 */
export default function ZoneSection({ id, children, className = '', wipeIn = false }: ZoneSectionProps) {
  if (!wipeIn) {
    return (
      <section id={id} className={`relative ${className}`}>
        {children}
      </section>
    )
  }

  return (
    <section id={id} className={`relative ${className}`}>
      <motion.div
        variants={wipe}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        {children}
      </motion.div>
    </section>
  )
}
