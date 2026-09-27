import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FiX, FiChevronLeft, FiChevronRight, FiLoader } from 'react-icons/fi'
import PixelIcon from './systems/PixelIcon'
import type { PixelIconName } from './systems/PixelIcon'
import PixelButton from './systems/PixelButton'
import { projectsAPI } from '../services/api'
import { slugifyTitle } from '../utils/slug'
import { getDifficulty, getStage } from '../utils/difficulty'
import { SITE } from '../data/site'
import { wipe } from '../lib/motion'
import type { Project } from '../types/api'

const SITE_URL = 'https://ditdev.kyuzenstudio.com'

// Images are served from R2 as full URLs; legacy local uploads get the API base.
const getImageUrl = (path?: string | null): string | null => {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  return `${base}${path}`
}

function formatDate(iso?: string): string {
  if (!iso) return 'unknown'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Grounded HUD corner brackets — no glow, just crisp L-marks inset within the frame. */
function CornerBrackets({ className = 'border-pixel-cyan/50' }: { className?: string }) {
  const c = `absolute w-3 h-3 pointer-events-none z-10 ${className}`
  return (
    <>
      <span className={`${c} top-2 left-2 border-t border-l`} />
      <span className={`${c} top-2 right-2 border-t border-r`} />
      <span className={`${c} bottom-2 left-2 border-b border-l`} />
      <span className={`${c} bottom-2 right-2 border-b border-r`} />
    </>
  )
}

/** Real pixel-star rating meter — filled stars in the rank colour, empty in dim gray. */
function StarMeter({ value, max = 5, color }: { value: number; max?: number; color: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} of ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <PixelIcon
          key={i}
          name="star"
          size={11}
          className={i < value ? '' : 'text-pixel-gray/30'}
          style={i < value ? { color } : undefined}
        />
      ))}
    </span>
  )
}

/** One cell of the quest dossier stat strip. Opaque bg so the 1px gaps read as dividers. */
function StatCell({ label, icon, children }: { label: string; icon?: PixelIconName; children: React.ReactNode }) {
  return (
    <div className="bg-bg-card px-4 py-3.5">
      <p className="flex items-center gap-1.5 font-pixel text-[9px] tracking-[0.18em] text-pixel-gray/80 mb-2.5">
        {icon && <PixelIcon name={icon} size={10} className="text-pixel-cyan/80" />}
        {label}
      </p>
      {children}
    </div>
  )
}

/** Reusable HUD panel with a terminal-style caption bar. */
function Panel({
  icon, title, meta, className = '', children,
}: {
  icon: PixelIconName
  title: string
  meta?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={`relative border border-pixel-blue/20 bg-bg-card/30 ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-pixel-blue/15 bg-black/30">
        <PixelIcon name={icon} size={12} className="text-pixel-cyan" />
        <h2 className="font-pixel text-[10px] tracking-widest text-pixel-white">{title}</h2>
        {meta && <span className="ml-auto font-mono text-[10px] text-pixel-gray/70">{meta}</span>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

/** Mission checklist derived only from facts the project actually carries. */
function Objectives({ items }: { items: { label: string; done: boolean }[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map(o => (
        <li key={o.label} className="flex items-center gap-3 font-mono text-sm">
          <span
            className={`w-4 h-4 flex items-center justify-center border shrink-0 ${
              o.done ? 'border-pixel-green/50 text-pixel-green' : 'border-pixel-dark text-pixel-gray/40'
            }`}
          >
            {o.done ? <PixelIcon name="check" size={9} /> : <span className="w-1.5 h-1.5 bg-pixel-gray/30" />}
          </span>
          <span className={o.done ? 'text-pixel-white/85' : 'text-pixel-gray/60'}>{o.label}</span>
        </li>
      ))}
    </ul>
  )
}

const TagBadge = ({ tag }: { tag: string }) => (
  <span className="px-2.5 py-1 font-mono text-xs text-pixel-white border border-pixel-blue/30 bg-pixel-blue/10"
    style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}>
    {tag}
  </span>
)

function Lightbox({
  images, index, onClose, onPrev, onNext,
}: {
  images: string[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-10"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.5) 3px,rgba(0,0,0,0.5) 4px)' }} />

      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 p-2 border border-pixel-blue/40 text-pixel-gray hover:text-pixel-white hover:border-pixel-blue/80 transition-colors"
        aria-label="Close"
      >
        <FiX className="w-5 h-5" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        className="absolute left-3 sm:left-6 z-10 p-2 border border-pixel-blue/40 text-pixel-gray hover:text-pixel-blue hover:border-pixel-blue/80 transition-colors"
        aria-label="Previous"
      >
        <FiChevronLeft className="w-6 h-6" />
      </button>

      <motion.img
        key={index}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        src={images[index]}
        alt={`Screenshot ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[88vw] max-h-[82vh] object-contain border border-pixel-blue/30"
      />

      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        className="absolute right-3 sm:right-6 z-10 p-2 border border-pixel-blue/40 text-pixel-gray hover:text-pixel-blue hover:border-pixel-blue/80 transition-colors"
        aria-label="Next"
      >
        <FiChevronRight className="w-6 h-6" />
      </button>

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-pixel text-[10px] tracking-widest text-pixel-cyan">
        {index + 1} / {images.length}
      </p>
    </motion.div>
  )
}

export default function ProjectDetail() {
  const { nameprojects } = useParams<{ nameprojects: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [others, setOthers] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [nameprojects])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)

    const resolve = async () => {
      // Numeric segment = legacy /projects/:id link; everything else is a slug
      // derived from the project title (slugifyTitle(title) === nameprojects).
      const isNumeric = /^\d+$/.test(nameprojects || '')
      const slug = nameprojects || ''
      let found: Project | undefined

      const listRes = await projectsAPI.getAll()
      const list = listRes.data.data || []
      if (isNumeric) {
        const num = Number(slug)
        found = list.find(p => p.id === num)
        // Deep link to a numeric id with an empty/failed list: fall back to the
        // single-project endpoint so old shared links keep working.
        if (!found) {
          const detailRes = await projectsAPI.getById(num)
          found = detailRes.data.data
        }
      } else {
        found = list.find(p => slugifyTitle(p.title) === slug)
      }

      if (found) {
        setProject(found)
        setOthers(list.filter(p => p.id !== found!.id))
      } else {
        setNotFound(true)
      }
    }

    resolve()
      .catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [nameprojects])

  const screenshots = useMemo(
    () => (project?.screenshots || []).map(s => getImageUrl(s)).filter((s): s is string => !!s),
    [project],
  )
  const hero = project ? getImageUrl(project.thumbnail) : null
  const overview = project?.content?.trim() || project?.description || ''
  const gallery = screenshots.length > 0 ? screenshots : (hero ? [hero] : [])
  const difficulty = useMemo(() => (project ? getDifficulty(project) : null), [project])
  const stage = useMemo(() => (project ? getStage(project) : null), [project])

  // Every objective is a real boolean about the project — nothing invented.
  const objectives = useMemo(() => {
    if (!project) return []
    const links = project.links || []
    const hasBrief = (project.content || project.description || '').trim().length > 0
    return [
      { label: 'Quest entry logged', done: true },
      { label: 'Mission briefing written', done: hasBrief },
      { label: 'Source repository linked', done: links.some(l => l.type === 'github') },
      { label: 'Live build deployed', done: links.some(l => l.type === 'demo' || l.type === 'website') },
      { label: 'Screenshots archived', done: (project.screenshots?.length || 0) > 0 },
      { label: 'Tech stack declared', done: (project.tags?.length || 0) > 0 },
    ]
  }, [project])

  const linkMeta = useMemo(() => {
    if (!project?.links?.length) return null
    const byType = (t: string) => project!.links!.find(l => l.type === t)
    const github = byType('github')
    const demo = byType('demo')
    const website = byType('website')
    const rest = (project!.links || []).filter(l => !['github', 'demo', 'website'].includes(l.type))
    return { github, demo, website, rest }
  }, [project])

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex items-center gap-3">
          <FiLoader className="text-pixel-blue text-xl animate-spin" />
          <span className="font-mono text-pixel-gray text-sm">loading quest data...</span>
        </div>
      </div>
    )
  }

  // Not found / invalid id
  if (notFound || !project) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 relative overflow-hidden bg-bg-primary"
      >
        <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-15"
          style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.3) 3px,rgba(0,0,0,0.3) 4px)' }} />
        <p className="font-pixel text-pixel-blue/60 text-xs tracking-widest relative z-10">// QUEST NOT FOUND</p>
        <h1 className="font-pixel text-3xl relative z-10 text-pixel-blue">
          ERROR_404
        </h1>
        <p className="font-mono text-sm text-pixel-gray relative z-10">
          No project matching &quot;{nameprojects}&quot; exists in this realm.
        </p>
        <PixelButton variant="ghost" icon="arrowLeft" onClick={() => navigate('/')}>
          BACK TO HOMEPAGE
        </PixelButton>
      </div>
    )
  }

  const prevShot = () => setLightbox(v => (v === null ? v : (v - 1 + gallery.length) % gallery.length))
  const nextShot = () => setLightbox(v => (v === null ? v : (v + 1) % gallery.length))

  return (
    <div className="relative min-h-screen bg-bg-primary">
      <Helmet>
        <title>{project.title} | Rahmat Aditya Portfolio</title>
        <meta name="description" content={project.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${SITE_URL}/projects/${slugifyTitle(project.title)}`} />
        <meta property="og:title" content={`${project.title} | Rahmat Aditya`} />
        <meta property="og:description" content={project.description} />
        {hero && <meta property="og:image" content={hero} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${project.title} | Rahmat Aditya`} />
        <meta name="twitter:description" content={project.description} />
        {hero && <meta name="twitter:image" content={hero} />}
      </Helmet>

      {/* background fx */}
      <div className="fixed inset-0 pointer-events-none opacity-60 grid-overlay" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.12]"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.2) 3px,rgba(0,0,0,0.2) 4px)' }} />

      {/* Top bar */}
      <header className="sticky top-0 z-40 px-4 sm:px-8 border-b border-pixel-blue/15"
        style={{ background: 'rgba(10,14,26,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 relative">
              <div className="absolute inset-0 bg-pixel-blue/25 border border-pixel-blue/60"
                style={{ clipPath: 'polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)' }} />
              <span className="absolute inset-0 flex items-center justify-center font-pixel text-pixel-blue text-[7px]">RA</span>
            </div>
            <span className="font-mono text-pixel-white/90 text-sm group-hover:text-pixel-blue transition-colors">
              <span className="text-pixel-blue">@</span>adit
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {stage && (
              <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-pixel-white/90">
                <span className="w-2 h-2" style={{ background: stage.color }} />
                {stage.label}
              </span>
            )}
            <span className="font-pixel text-[9px] tracking-widest text-pixel-blue/80">
              QUEST_{String(project.id).padStart(3, '0')}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        {/* Briefing block — plays the level-load wipe once */}
        <motion.div variants={wipe} initial="hidden" animate="show">
          <div className="mb-6">
            <PixelButton variant="ghost" icon="arrowLeft" onClick={() => navigate(-1)}>
              BACK
            </PixelButton>
          </div>

          <p className="flex items-center gap-2 font-mono text-xs text-pixel-cyan tracking-widest mb-4">
            <PixelIcon name="scroll" size={13} />
            QUEST_LOG / {project.title.toLowerCase().replace(/\s+/g, '_')}
          </p>

          {/* Mission brief — title + rank/stage readout + stack + links, one HUD card */}
          <section className="relative border border-pixel-blue/25 bg-bg-card/30 mb-8">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-pixel-blue/15 bg-black/40">
              <span className="w-2 h-2 bg-red-400/60" />
              <span className="w-2 h-2 bg-yellow-400/60" />
              <span className="w-2 h-2 bg-green-400/60" />
              <PixelIcon name="scroll" size={12} className="text-pixel-cyan ml-1" />
              <span className="font-pixel text-[10px] tracking-widest text-pixel-white">MISSION BRIEF</span>
              <span className="ml-auto font-pixel text-[9px] text-pixel-gray/70 tracking-widest">
                QUEST #{String(project.id).padStart(3, '0')}
              </span>
            </div>

            <div className="p-5 sm:p-7">
              <h1 className="font-pixel text-2xl sm:text-4xl text-pixel-white leading-[1.3] mb-6">
                {project.title.split(' ').map((w, i) => i === 0 ? w : <span key={i}> <span className="gradient-text">{w}</span></span>)}
              </h1>

              {/* Quest dossier — stat strip */}
              {difficulty && stage && (
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-pixel-blue/15 border border-pixel-blue/20 mb-6"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' }}
                >
                  <StatCell label="RANK" icon="trophy">
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[11px]" style={{ color: difficulty.color }}>{difficulty.label}</span>
                      <StarMeter value={difficulty.stars} color={difficulty.color} />
                    </div>
                  </StatCell>
                  <StatCell label="STAGE" icon="flag">
                    <span className="inline-flex items-center gap-2 font-mono text-sm text-pixel-white">
                      <span className="w-2 h-2" style={{ background: stage.color }} />
                      {stage.label}
                    </span>
                  </StatCell>
                  <StatCell label="LOGGED" icon="calendar">
                    <span className="font-mono text-sm text-pixel-white/90">{formatDate(project.created_at)}</span>
                  </StatCell>
                  <StatCell label="UPDATED" icon="calendar">
                    <span className="font-mono text-sm text-pixel-white/90">{formatDate(project.updated_at || project.created_at)}</span>
                  </StatCell>
                </div>
              )}

              {/* tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
                </div>
              )}

              {/* links */}
              {linkMeta && (
                <div className="flex flex-wrap gap-3">
                  {linkMeta.github && (
                    <PixelButton variant="ghost" icon="external" href={linkMeta.github.url}>
                      SOURCE CODE
                    </PixelButton>
                  )}
                  {linkMeta.demo && (
                    <PixelButton variant="primary" icon="bolt" href={linkMeta.demo.url}>
                      LIVE DEMO
                    </PixelButton>
                  )}
                  {linkMeta.website && (
                    <PixelButton variant="ghost" icon="external" href={linkMeta.website.url}>
                      WEBSITE
                    </PixelButton>
                  )}
                  {linkMeta.rest.map(l => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                      className="font-mono text-xs text-pixel-cyan underline underline-offset-2 hover:text-pixel-blue transition-colors self-center">
                      {l.type}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <CornerBrackets className="border-pixel-cyan/50" />
          </section>

          {/* Hero preview — framed viewer with caption bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="relative border border-pixel-blue/25 bg-bg-card/30 mb-8 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-pixel-blue/15 bg-black/40">
              <PixelIcon name="gamepad" size={11} className="text-pixel-cyan" />
              <span className="font-pixel text-[9px] tracking-widest text-pixel-white">PREVIEW</span>
              <span className="ml-auto font-mono text-[10px] text-pixel-gray/70">cover.png</span>
            </div>
            <div className="relative" style={{ aspectRatio: '16 / 9' }}>
              {hero ? (
                <img src={hero} alt={project.title} className="w-full h-full object-cover" decoding="async" fetchPriority="high" />
              ) : (
                <div className="absolute inset-0 grid-overlay flex items-center justify-center">
                  <div className="text-center">
                    <PixelIcon name="scroll" size={36} className="text-pixel-blue/40 mx-auto mb-2" />
                    <p className="font-mono text-pixel-gray/70 text-xs">NO PREVIEW</p>
                  </div>
                </div>
              )}
              <CornerBrackets className="border-pixel-cyan/60" />
            </div>
          </motion.div>
        </motion.div>

        {/* Body: objectives + briefing | evidence + mission data */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="space-y-6">
            {/* Objectives */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <Panel
                icon="check"
                title="OBJECTIVES"
                meta={`${objectives.filter(o => o.done).length} / ${objectives.length}`}
              >
                <Objectives items={objectives} />
              </Panel>
            </motion.div>

            {/* Briefing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Panel icon="scroll" title="BRIEFING" meta="mission_brief.md">
                <div className="md-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{overview}</ReactMarkdown>
                </div>
              </Panel>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-6 lg:sticky lg:top-20"
          >
            {gallery.length > 0 && (
              <Panel icon="gamepad" title="EVIDENCE" meta={`[${gallery.length}]`}>
                <div className="grid grid-cols-2 gap-3">
                  {gallery.map((shot, i) => (
                    <motion.button
                      key={shot}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * i }}
                      onClick={() => setLightbox(i)}
                      className="relative group overflow-hidden cursor-zoom-in border border-pixel-blue/20 hover:border-pixel-blue/60 transition-colors"
                      style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)', aspectRatio: '4 / 3' }}
                    >
                      <img src={shot} alt={`${project.title} screenshot ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                      <div className="absolute inset-0 bg-pixel-blue/0 group-hover:bg-pixel-blue/10 transition-colors" />
                      <span className="absolute bottom-1.5 right-1.5 font-mono text-[9px] text-pixel-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                        +ZOOM
                      </span>
                    </motion.button>
                  ))}
                </div>
              </Panel>
            )}

            <Panel icon="shield" title="MISSION DATA">
              <dl className="space-y-2.5 font-mono text-sm">
                {([
                  ['STACK', `${project.tags?.length ?? 0} modules`],
                  ['EVIDENCE', `${gallery.length} frames`],
                  ['CHANNELS', `${project.links?.length ?? 0} links`],
                  ['LOGGED', formatDate(project.created_at)],
                  ['UPDATED', formatDate(project.updated_at || project.created_at)],
                ] as const).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <dt className="text-pixel-gray/70 text-xs tracking-widest">{k}</dt>
                    <dd className="text-pixel-white/90">{v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </motion.aside>
        </div>

        {/* More quests */}
        {others.length > 0 && (
          <section className="mt-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="flex items-center gap-2 font-mono text-[11px] text-pixel-cyan tracking-widest mb-2">
                  <PixelIcon name="scroll" size={12} />
                  MORE_QUESTS
                </p>
                <h2 className="font-pixel text-lg text-pixel-white">Other <span className="gradient-text">Quests</span></h2>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {others.slice(0, 3).map(p => {
                const thumb = p.thumbnail ? getImageUrl(p.thumbnail) : null
                return (
                  <Link
                    key={p.id}
                    to={`/projects/${slugifyTitle(p.title)}`}
                    className="group border border-pixel-blue/20 bg-bg-card/40 hover:border-pixel-blue/60 transition-all duration-300 overflow-hidden block"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
                  >
                    <div className="relative h-36 overflow-hidden border-b border-pixel-blue/15">
                      {thumb ? (
                        <img src={thumb} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="absolute inset-0 grid-overlay flex items-center justify-center">
                          <PixelIcon name="scroll" size={26} className="text-pixel-blue/30" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-bg-primary/85 border border-pixel-blue/40 font-pixel text-pixel-blue text-[7px]">
                        #{String(p.id).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-pixel text-pixel-white group-hover:text-pixel-cyan transition-colors text-[11px] leading-relaxed line-clamp-1">{p.title}</h3>
                      <p className="font-mono text-pixel-gray/80 text-xs mt-2 line-clamp-2">{p.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </main>

      {/* Mini footer */}
      <footer className="relative z-10 border-t border-pixel-blue/15 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-xs text-pixel-gray/80">
            © {new Date().getFullYear()} Rahmat Aditya. All rights reserved.
          </p>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 font-mono text-xs text-pixel-gray hover:text-pixel-cyan transition-colors">
            <PixelIcon name="arrowLeft" size={12} /> back to quests
          </button>
          <p className="font-pixel text-pixel-gray/60 text-[8px] tracking-widest">{SITE.version} · GAME ON</p>
        </div>
      </footer>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && gallery[lightbox] && (
          <Lightbox
            images={gallery}
            index={lightbox}
            onClose={() => setLightbox(null)}
            onPrev={prevShot}
            onNext={nextShot}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
