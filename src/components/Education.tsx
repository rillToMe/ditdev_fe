import { useRef } from 'react'
import { GraduationCap } from 'lucide-react'
import { motion, useInView } from 'framer-motion'

interface EducationItem {
  id: number
  type: string
  period: string
  title: string
  institution: string
  location: string
  description: string
  tags: string[]
  status: 'ongoing' | 'completed'
  color: string
}

const EDUCATION: EducationItem[] = [
  {
    id: 1,
    type: 'education',
    period: '2024 - Present',
    title: 'SMK / Vocational School',
    institution: 'SMK NEGERI 4 PAYAKUMBUH',
    location: 'Payakumbuh, Sumatera Barat',
    description: 'Focusing on software engineering, game development, and web technologies. Active in school tech communities.',
    tags: ['Game Development', 'Software Engineering', 'Web Dev'],
    status: 'ongoing',
    color: '#4f8cff',
  },
  {
    id: 2,
    type: 'education',
    period: '2021 - 2024',
    title: 'MTsN / Sederajat',
    institution: 'MTs Negeri 3 Kab. Lima Puluh Kota',
    location: 'Guguak VIII Koto, Kec. Guguak, Kabupaten Lima Puluh Kota, Sumatera Barat',
    description: 'Started self-learning programming . First html project built during this period.',
    tags: ['Self Learning', 'Html', 'CSS', 'Web Dev'],
    status: 'completed',
    color: '#00d4ff',
  },
]

interface TimelineItemProps {
  item: EducationItem
  index: number
  isLast: boolean
}

function TimelineItem({ item, index, isLast }: TimelineItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="relative flex gap-6 pb-12"
    >
      {/* Vertical line */}
      {!isLast && (
        <div
          className="absolute left-[19px] top-10 bottom-0 w-px"
          style={{ background: 'linear-gradient(to bottom, rgba(79,140,255,0.3), transparent)' }}
        />
      )}

      {/* Node */}
      <div className="relative flex-shrink-0 flex flex-col items-center" style={{ width: 40 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.15 + 0.1, type: 'spring' }}
          className="w-10 h-10 flex items-center justify-center relative"
          style={{
            background: `${item.color}12`,
            border: `1px solid ${item.color}40`,
            clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)',
          }}
        >
          <GraduationCap size={16} style={{ color: item.color }} />
          {item.status === 'ongoing' && (
            <span
              className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 animate-pulse"
              style={{ clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' }}
            />
          )}
        </motion.div>
      </div>

      {/* Card */}
      <motion.div
        whileHover={{ y: -3 }}
        className="flex-1 min-w-0 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d1220 0%, #0a0e1a 100%)',
          border: `1px solid ${item.color}20`,
          clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = `${item.color}45` }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = `${item.color}20` }}
      >
        {/* Top accent */}
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, ${item.color}60, transparent)` }} />

        {/* Corner cut decoration */}
        <div
          className="absolute top-0 right-0 w-4 h-4"
          style={{ background: `linear-gradient(135deg, transparent 50%, ${item.color}15 50%)` }}
        />

        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-pixel text-sm tracking-wide text-pixel-white mb-1">{item.title}</h3>
              <p className="font-mono text-xs" style={{ color: item.color }}>{item.institution}</p>
              <p className="font-mono text-[11px] text-pixel-gray/50 mt-0.5">{item.location}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span
                className="font-pixel text-[9px] tracking-widest px-2 py-1"
                style={{ color: `${item.color}90`, border: `1px solid ${item.color}25`, background: `${item.color}08` }}
              >
                {item.period}
              </span>
              {item.status === 'ongoing' && (
                <span className="font-pixel text-[8px] tracking-widest text-green-400 px-2 py-0.5 border border-green-400/25 bg-green-400/05">
                  ● ONGOING
                </span>
              )}
            </div>
          </div>

          <p className="font-mono text-xs text-pixel-gray/60 leading-relaxed mb-4">{item.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {item.tags.map(tag => (
              <span
                key={tag}
                className="font-mono text-[10px] px-2 py-0.5"
                style={{
                  color: `${item.color}80`,
                  border: `1px solid ${item.color}18`,
                  background: `${item.color}06`,
                  clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Education() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true })

  return (
    <section id="education" className="relative py-28 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-pixel-blue/20 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-pixel-blue/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="section-tag mb-3">// 05. education</p>
          <h2 className="font-sans font-bold text-4xl md:text-5xl text-pixel-white">
            Quest <span className="gradient-text">Log</span>
          </h2>
          <div className="section-divider max-w-xs mt-4" />
          <p className="font-mono text-pixel-gray/50 text-sm mt-4">
            // Academic journey & learning milestones
          </p>
        </motion.div>

        {/* Timeline */}
        <div>
          {EDUCATION.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              index={index}
              isLast={index === EDUCATION.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}