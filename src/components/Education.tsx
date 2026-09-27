import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import ZoneHeader from './systems/ZoneHeader'
import PixelIcon from './systems/PixelIcon'
import { slideIn, stagger, DUR, EASE } from '../lib/motion'

interface Waypoint {
  id: number
  period: string
  title: string
  institution: string
  location: string
  description: string
  tags: string[]
  status: 'ongoing' | 'completed'
  color: string
  icon: 'flag' | 'crown' | 'star' | 'scroll'
}

const JOURNEY: Waypoint[] = [
  {
    id: 1,
    period: '2024 — PRESENT',
    title: 'Vocational School',
    institution: 'SMK NEGERI 4 PAYAKUMBUH',
    location: 'Payakumbuh, Sumatera Barat',
    description: 'Software engineering, game development and web technologies. Active in the school tech community.',
    tags: ['Game Development', 'Software Engineering', 'Web Dev'],
    status: 'ongoing',
    color: '#4f8cff',
    icon: 'flag',
  },
  {
    id: 2,
    period: '2021 — 2024',
    title: 'First Descent',
    institution: 'MTs Negeri 3 Kab. Lima Puluh Kota',
    location: 'Guguak VIII Koto, Sumatera Barat',
    description: 'Started self-learning programming. Built the first HTML project during this stretch.',
    tags: ['Self Learning', 'HTML', 'CSS', 'Web Dev'],
    status: 'completed',
    color: '#00d4ff',
    icon: 'star',
  },
]

/* Small status flag used in the dossier header. */
function StatusPill({ item }: { item: Waypoint }) {
  const ongoing = item.status === 'ongoing'
  return (
    <span className="shrink-0 inline-flex items-center gap-1.5 font-pixel text-[8px] tracking-widest px-2 py-1 border border-pixel-dark text-pixel-gray/70">
      {ongoing ? (
        <span className="w-1.5 h-1.5 animate-pulse bg-green-400/70" />
      ) : (
        <PixelIcon name="check" size={9} className="text-pixel-gray/50" />
      )}
      {ongoing ? 'IN PROGRESS' : 'CLEARED'}
    </span>
  )
}

function WaypointRow({
  item,
  index,
  total,
  isLast,
}: {
  item: Waypoint
  index: number
  total: number
  isLast: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const fromLeft = index % 2 === 0
  const code = String(item.id).padStart(2, '0')

  return (
    <motion.div
      ref={ref}
      variants={slideIn(fromLeft ? 'left' : 'right', 28)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className="relative flex gap-5 sm:gap-7 pb-14 last:pb-0"
    >
      {/* Trail — dashed, fades toward the next waypoint */}
      {!isLast && (
        <div
          className="absolute left-[21px] top-14 bottom-0 w-px"
          style={{ backgroundImage: 'repeating-linear-gradient(to bottom, #1e2a3a 0 4px, transparent 4px 9px)' }}
        />
      )}

      {/* Waypoint crest */}
      <div className="relative shrink-0 flex flex-col items-center" style={{ width: 44 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.15 + 0.1, type: 'spring', bounce: 0.35 }}
          className="relative w-11 h-11 flex items-center justify-center"
        >
          <div
            className="w-9 h-9 flex items-center justify-center bg-bg-primary border border-pixel-dark"
            style={{
              clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
            }}
          >
            <PixelIcon name={item.icon} size={16} style={{ color: item.color }} />
          </div>
          {item.status === 'ongoing' && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400/70 animate-pulse" />
          )}
          {item.status === 'completed' && (
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-bg-primary border border-pixel-dark text-pixel-gray/60">
              <PixelIcon name="check" size={9} />
            </span>
          )}
        </motion.div>
      </div>

      {/* Dossier card */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: DUR.base, ease: EASE.snap }}
        className="group flex-1 min-w-0 relative"
      >
        <div
          className="relative overflow-hidden border border-pixel-dark bg-bg-card/40 transition-colors duration-300"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)',
          }}
        >
          {/* Faint grid + color spine */}
          <div className="absolute inset-0 grid-faint opacity-30 pointer-events-none" />
          <div
            className="absolute left-0 top-0 bottom-0 w-[2px]"
            style={{ background: `linear-gradient(to bottom, ${item.color}99, ${item.color}14)` }}
          />

        {/* Header bar */}
        <div className="relative flex items-center gap-2.5 px-5 py-2.5 border-b border-pixel-dark bg-black/20">
          <span className="w-1.5 h-1.5 shrink-0" style={{ background: item.color }} />
          <span className="font-mono text-[10px] tracking-widest text-pixel-gray/60">
            WAYPOINT {code}/{String(total).padStart(2, '0')}
          </span>
          <span className="hidden sm:inline font-mono text-[10px] text-pixel-gray/35">· {item.period}</span>
          <span className="flex-1 h-px bg-pixel-dark" />
          <StatusPill item={item} />
        </div>

        {/* Body */}
        <div className="relative p-5">
          <p className="sm:hidden font-mono text-[10px] tracking-widest text-pixel-gray/40 mb-1.5">{item.period}</p>
          <h3 className="font-pixel text-xs sm:text-sm text-pixel-white mb-2.5 leading-relaxed relative">
            {item.title}
          </h3>

          <div className="space-y-1.5 mb-4 relative">
            <p className="flex items-center gap-2 font-mono text-xs text-pixel-white/80">
              <PixelIcon name="shield" size={11} className="text-pixel-gray/50" />
              {item.institution}
            </p>
            <p className="flex items-center gap-2 font-mono text-[11px] text-pixel-gray/50">
              <PixelIcon name="pin" size={10} className="text-pixel-gray/40" />
              {item.location}
            </p>
          </div>

          <div className="relative pl-3 mb-4 border-l border-pixel-dark">
            <p className="font-mono text-xs text-pixel-gray/70 leading-relaxed">{item.description}</p>
          </div>

          <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="flex items-center gap-1.5 font-pixel text-[8px] tracking-widest text-pixel-gray/40">
              <PixelIcon name="sparkle" size={10} className="text-pixel-gray/40" />
              SKILLS
            </span>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map(tag => (
                <span
                  key={tag}
                  className="font-mono text-[10px] px-2 py-0.5 text-pixel-gray/70 border border-pixel-dark bg-bg-primary/40"
                  style={{
                    clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Education() {
  return (
    <section id="education" className="relative pt-28 pb-14 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-pixel-blue/20 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-pixel-blue/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <ZoneHeader
          variant="side-tag"
          index="06"
          tag="JOURNEY"
          title="Journey"
          accent="Map"
          icon="map"
          subtitle="Waypoints cleared on the road to mastery."
        />

        <motion.div variants={stagger(0.14)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          {JOURNEY.map((item, index) => (
            <WaypointRow
              key={item.id}
              item={item}
              index={index}
              total={JOURNEY.length}
              isLast={index === JOURNEY.length - 1}
            />
          ))}
        </motion.div>

        {/* Destination marker */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.slow, ease: EASE.snap, delay: 0.2 }}
          className="mt-2 flex items-center gap-3 pl-0 sm:pl-1"
        >
          <span className="w-2 h-2 bg-yellow-400/60" />
          <span className="font-pixel text-[9px] text-yellow-400/50 tracking-widest">
            JOURNEY CONTINUES…
          </span>
        </motion.div>
      </div>
    </section>
  )
}
