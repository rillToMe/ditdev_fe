import { motion } from 'framer-motion'
import PixelIcon from './PixelIcon'
import type { PixelIconName } from './PixelIcon'
import { assemble, slideIn, scan, stagger, VIEWPORT, EASE } from '../../lib/motion'

type ZoneVariant = 'banner' | 'side-tag' | 'terminal'

interface ZoneHeaderProps {
  variant: ZoneVariant
  index: string
  tag: string
  title: string
  /** Second word(s) of the title, rendered in the accent gradient. */
  accent?: string
  subtitle?: string
  icon?: PixelIconName
  /** Optional right-aligned meta line (e.g. "[3 quests completed]"). */
  meta?: string
}

/**
 * Replaces the identical `// 0X. section → heading → divider` block that was
 * copy-pasted across seven sections. Three distinct layouts give each zone
 * its own identity.
 */
export default function ZoneHeader({
  variant,
  index,
  tag,
  title,
  accent,
  subtitle,
  icon,
  meta,
}: ZoneHeaderProps) {
  if (variant === 'banner') {
    return (
      <motion.header
        variants={stagger(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="relative mb-14"
      >
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-pixel-cyan/50 via-pixel-blue/30 to-transparent" />
        <motion.div variants={assemble} className="flex items-center gap-3 mb-3">
          {icon && <PixelIcon name={icon} size={16} className="text-pixel-cyan" />}
          <span className="font-pixel text-[10px] text-pixel-cyan tracking-[0.25em]">{tag}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-pixel-cyan/30 to-transparent" />
          <span className="font-pixel text-[10px] text-pixel-gray/30">{index}</span>
        </motion.div>
        <div className="flex items-end gap-4 flex-wrap">
          <motion.h2
            variants={assemble}
            className="font-pixel text-2xl sm:text-3xl md:text-4xl text-pixel-white leading-[1.25]"
          >
            {title}
            {accent && <> <span className="gradient-text">{accent}</span></>}
          </motion.h2>
          {meta && (
            <motion.span variants={assemble} className="font-mono text-pixel-gray/40 text-sm mb-1.5">
              {meta}
            </motion.span>
          )}
        </div>
        {subtitle && (
          <motion.p variants={assemble} className="font-mono text-pixel-gray/50 text-sm mt-3">
            {subtitle}
          </motion.p>
        )}
      </motion.header>
    )
  }

  if (variant === 'side-tag') {
    return (
      <motion.header
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="mb-14 flex gap-5 sm:gap-8"
      >
        {/* Vertical rail */}
        <div className="hidden sm:flex flex-col items-center shrink-0 pt-1">
          <motion.span
            variants={slideIn('left', 16)}
            className="font-pixel text-[10px] text-pixel-cyan tracking-[0.3em]"
            style={{ writingMode: 'vertical-rl' }}
          >
            {tag}
          </motion.span>
          <motion.span
            variants={slideIn('left', 16)}
            className="mt-3 w-px flex-1 min-h-16 bg-gradient-to-b from-pixel-cyan/40 to-transparent"
          />
        </div>

        <div className="min-w-0">
          <motion.div variants={assemble} className="flex items-center gap-2 mb-2">
            {icon && <PixelIcon name={icon} size={14} className="text-pixel-blue" />}
            <span className="font-mono text-[11px] text-pixel-blue/70 tracking-widest uppercase sm:hidden">{tag}</span>
            <span className="font-pixel text-[9px] text-pixel-gray/30">ZONE {index}</span>
          </motion.div>
          <motion.h2
            variants={assemble}
            className="font-pixel text-2xl sm:text-3xl md:text-4xl text-pixel-white leading-[1.25]"
          >
            {title}
            {accent && <> <span className="gradient-text">{accent}</span></>}
          </motion.h2>
          {subtitle && (
            <motion.p variants={assemble} className="font-mono text-pixel-gray/50 text-sm mt-3 max-w-xl">
              {subtitle}
            </motion.p>
          )}
        </div>
      </motion.header>
    )
  }

  // terminal
  // NOTE: the `scan` variant's hidden state clips the element to zero width
  // (`clip-path: inset(0 100% 0 0)`). If that clip sits on the *same* element
  // that owns `whileInView` (threshold 0.2), the IntersectionObserver sees a
  // zero-area box, reports ratio 0 forever, and the reveal never fires — the
  // header stays invisible while still occupying layout (a dead gap).
  // So the unclipped outer header owns the viewport trigger, and the `scan`
  // clip animation runs on an inner wrapper.
  return (
    <motion.header
      variants={{ hidden: {}, show: {} }}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className="mb-14"
    >
      <motion.div variants={scan}>
        <div
          className="border border-pixel-blue/12 bg-bg-card/20 px-4 sm:px-6 py-4"
          style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' }}
        >
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-pixel-blue/10">
            <span className="w-2 h-2 bg-red-400/60" />
            <span className="w-2 h-2 bg-yellow-400/60" />
            <span className="w-2 h-2 bg-green-400/60" />
            <span className="font-mono text-[11px] text-pixel-gray/40 ml-2">{tag}.zone</span>
            <span className="ml-auto font-pixel text-[9px] text-pixel-gray/25">{index}</span>
          </div>
          <p className="font-mono text-xs mb-2">
            <span className="text-pixel-cyan">$</span>{' '}
            <span className="text-pixel-gray/50">run</span>{' '}
            <span className="text-pixel-white">{tag}</span>
          </p>
          <div className="flex items-end gap-3 flex-wrap">
            {icon && <PixelIcon name={icon} size={18} className="text-pixel-cyan mb-1" />}
            <h2 className="font-pixel text-xl sm:text-2xl md:text-3xl text-pixel-white leading-[1.3]">
              {title}
              {accent && <> <span className="gradient-text">{accent}</span></>}
            </h2>
            {meta && <span className="font-mono text-pixel-gray/40 text-sm mb-1">{meta}</span>}
          </div>
          {subtitle && <p className="font-mono text-pixel-gray/50 text-sm mt-3">{subtitle}</p>}
        </div>
      </motion.div>
    </motion.header>
  )
}

/** Small inline chip used by several zone headers. */
export function ZoneChip({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.3, ease: EASE.back }}
      className="inline-flex items-center gap-1.5 font-mono text-xs text-pixel-cyan border border-pixel-cyan/25 bg-pixel-cyan/5 px-2.5 py-1"
      style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
    >
      {children}
    </motion.span>
  )
}
