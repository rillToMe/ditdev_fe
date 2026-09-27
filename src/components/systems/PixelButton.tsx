import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import PixelIcon from './PixelIcon'
import type { PixelIconName } from './PixelIcon'
import { EASE } from '../../lib/motion'

type Variant = 'primary' | 'ghost' | 'danger' | 'gold'

interface PixelButtonProps {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: Variant
  icon?: PixelIconName
  /** Show the selectable "▶" cursor, game-menu style. */
  cursor?: boolean
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  title?: string
}

const VARIANTS: Record<Variant, string> = {
  primary: 'border-pixel-blue/60 text-pixel-white bg-pixel-blue/15 hover:bg-pixel-blue/25 hover:border-pixel-blue',
  ghost:   'border-pixel-blue/25 text-pixel-blue/90 bg-transparent hover:bg-pixel-blue/10 hover:border-pixel-blue/50',
  danger:  'border-red-500/50 text-red-300 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500',
  gold:    'border-yellow-400/50 text-yellow-300 bg-yellow-400/10 hover:bg-yellow-400/20 hover:border-yellow-400',
}

const CLIP = 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)'

/**
 * Game-menu button with a press-down pixel nudge and an optional leading
 * selection cursor. Replaces the flat `.btn-pixel` links across the site.
 */
export default function PixelButton({
  children,
  onClick,
  href,
  variant = 'ghost',
  icon,
  cursor = false,
  className = '',
  type = 'button',
  disabled = false,
  title,
}: PixelButtonProps) {
  const base =
    'group relative inline-flex items-center gap-2 font-mono text-xs tracking-wide px-4 py-2.5 border transition-colors duration-150 select-none ' +
    VARIANTS[variant] +
    (disabled ? ' opacity-50 pointer-events-none' : '') +
    ' ' + className

  const inner = (
    <>
      {cursor && (
        <motion.span
          initial={false}
          className="text-pixel-cyan"
          animate={{ x: 0 }}
          whileHover={{ x: 2 }}
          aria-hidden
        >
          ▶
        </motion.span>
      )}
      {icon && <PixelIcon name={icon} size={13} />}
      <span>{children}</span>
    </>
  )

  const motionProps = {
    style: { clipPath: CLIP },
    whileHover: { y: -2 },
    whileTap: { y: 1, scale: 0.98 },
    transition: { duration: 0.15, ease: EASE.snap },
  }

  if (href) {
    const external = href.startsWith('http') || href.startsWith('mailto:')
    return (
      <motion.a
        {...motionProps}
        href={href}
        title={title}
        className={base}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {inner}
      </motion.a>
    )
  }

  return (
    <motion.button
      {...motionProps}
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={base}
    >
      {inner}
    </motion.button>
  )
}
