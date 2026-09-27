import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FiGithub, FiExternalLink, FiLoader, FiArrowLeft, FiX, FiChevronLeft, FiChevronRight, FiCalendar, FiRefreshCw } from 'react-icons/fi'
import { projectsAPI } from '../services/api'
import { slugifyTitle } from '../utils/slug'
import type { Project } from '../types/api'

const SITE_URL = 'https://ditdev.kyuzenstudio.com'

// Images are served from R2 as full URLs; legacy local uploads get the API base.
const getImageUrl = (path?: string | null): string | null => {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  return `${base}${path}`
}

const pixelClip = 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))'

function formatDate(iso?: string): string {
  if (!iso) return 'unknown'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}

const TagBadge = ({ tag }: { tag: string }) => (
  <span className="px-2.5 py-1 font-mono text-xs text-pixel-blue/80 border border-pixel-blue/25 bg-pixel-blue/5"
    style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}>
    {tag}
  </span>
)

const pixelFrame = (url: string | null, title: string, ratio: string, imgClass = '') => (
  <div
    className="relative overflow-hidden border border-pixel-blue/20 bg-bg-card/30"
    style={{ clipPath: pixelClip, aspectRatio: ratio }}
  >
    {url ? (
      <img src={url} alt={title} className={`w-full h-full object-cover ${imgClass}`} loading="lazy" />
    ) : (
      <div className="absolute inset-0 grid-overlay flex items-center justify-center">
        <div className="text-center">
          <div className="font-pixel text-pixel-blue/20 text-4xl mb-2">◈</div>
          <p className="font-mono text-pixel-gray/30 text-xs">NO PREVIEW</p>
        </div>
      </div>
    )}
  </div>
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
        className="absolute top-5 right-5 z-10 p-2 border border-pixel-blue/30 text-pixel-gray hover:text-pixel-white hover:border-pixel-blue/70 transition-colors"
        aria-label="Close"
      >
        <FiX className="w-5 h-5" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        className="absolute left-3 sm:left-6 z-10 p-2 border border-pixel-blue/30 text-pixel-gray hover:text-pixel-blue hover:border-pixel-blue/70 transition-colors"
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
        className="max-w-[88vw] max-h-[82vh] object-contain border border-pixel-blue/25 shadow-[0_0_60px_rgba(79,140,255,0.15)]"
      />

      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        className="absolute right-3 sm:right-6 z-10 p-2 border border-pixel-blue/30 text-pixel-gray hover:text-pixel-blue hover:border-pixel-blue/70 transition-colors"
        aria-label="Next"
      >
        <FiChevronRight className="w-6 h-6" />
      </button>

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-pixel text-[10px] tracking-widest text-pixel-blue/70">
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050709' }}>
        <div className="flex items-center gap-3">
          <FiLoader className="text-pixel-blue text-xl animate-spin" />
          <span className="font-mono text-pixel-gray/60 text-sm">loading project data...</span>
        </div>
      </div>
    )
  }

  // Not found / invalid id
  if (notFound || !project) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 relative overflow-hidden"
        style={{ background: '#050709' }}
      >
        <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-15"
          style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.3) 3px,rgba(0,0,0,0.3) 4px)' }} />
        <p className="font-pixel text-pixel-blue/25 text-xs tracking-widest relative z-10">// QUEST NOT FOUND</p>
        <h1 className="font-pixel text-3xl relative z-10" style={{ color: '#4f8cff', textShadow: '0 0 30px rgba(79,140,255,0.5)' }}>
          ERROR_404
        </h1>
        <p className="font-mono text-sm text-pixel-gray/50 relative z-10">
          No project matching &quot;{nameprojects}&quot; exists in this realm.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-pixel inline-flex items-center gap-2 text-sm relative z-10"
        >
          <FiArrowLeft /> Back to Homepage
        </button>
      </div>
    )
  }

  const prevShot = () => setLightbox(v => (v === null ? v : (v - 1 + gallery.length) % gallery.length))
  const nextShot = () => setLightbox(v => (v === null ? v : (v + 1) % gallery.length))

  return (
    <div className="relative min-h-screen" style={{ background: '#050709' }}>
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
      <header className="sticky top-0 z-40 px-4 sm:px-8 border-b border-pixel-blue/10"
        style={{ background: 'rgba(5,7,9,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 relative">
              <div className="absolute inset-0 bg-pixel-blue/20 border border-pixel-blue/50"
                style={{ clipPath: 'polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)' }} />
              <span className="absolute inset-0 flex items-center justify-center font-pixel text-pixel-blue text-[7px]">RA</span>
            </div>
            <span className="font-mono text-pixel-white/80 text-sm group-hover:text-pixel-blue transition-colors">
              <span className="text-pixel-blue">@</span>adit
            </span>
          </Link>
          <span className="font-pixel text-[8px] tracking-widest text-pixel-blue/40 hidden md:inline">
            PROJECT_{String(project.id).padStart(3, '0')}
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        {/* Title block */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <button
            onClick={() => navigate(-1)}
            className="btn-pixel inline-flex items-center gap-2 text-xs px-4 py-2 mb-6"
          >
            <FiArrowLeft className="text-sm" /> Back
          </button>
          <p className="section-tag mb-4">// quest_log / {project.title.toLowerCase().replace(/\s+/g, '_')}</p>
          <h1 className="font-sans font-bold text-3xl sm:text-5xl text-pixel-white leading-tight mb-4">
            {project.title.split(' ').map((w, i) => i === 0 ? w : <span key={i}> <span className="gradient-text">{w}</span></span>)}
          </h1>

          {/* meta */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-pixel-gray/50 mb-5">
            <span className="flex items-center gap-1.5"><FiCalendar /> created {formatDate(project.created_at)}</span>
            {project.updated_at && project.updated_at !== project.created_at && (
              <span className="flex items-center gap-1.5"><FiRefreshCw /> updated {formatDate(project.updated_at)}</span>
            )}
          </div>

          {/* tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
            </div>
          )}

          {/* links */}
          {linkMeta && (
            <div className="flex flex-wrap gap-3 mb-8">
              {linkMeta.github && (
                <a href={linkMeta.github.url} target="_blank" rel="noopener noreferrer" className="btn-pixel inline-flex items-center gap-2 text-sm">
                  <FiGithub /> Source Code
                </a>
              )}
              {linkMeta.demo && (
                <a href={linkMeta.demo.url} target="_blank" rel="noopener noreferrer" className="btn-pixel btn-pixel-primary inline-flex items-center gap-2 text-sm">
                  <FiExternalLink /> Live Demo
                </a>
              )}
              {linkMeta.website && (
                <a href={linkMeta.website.url} target="_blank" rel="noopener noreferrer" className="btn-pixel inline-flex items-center gap-2 text-sm">
                  <FiExternalLink /> Website
                </a>
              )}
              {linkMeta.rest.map(l => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-xs text-pixel-cyan underline underline-offset-2 hover:text-pixel-blue transition-colors self-center">
                  {l.type}
                </a>
              ))}
            </div>
          )}

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-10"
          >
            {pixelFrame(hero, project.title, '16 / 9')}
          </motion.div>
        </motion.div>

        {/* Body: overview + gallery */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Overview */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="p-6 sm:p-8 border border-pixel-blue/15 bg-bg-card/20"
            style={{ clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="text-pixel-cyan text-[10px]">▸</span>
              <h2 className="font-pixel text-[10px] tracking-widest text-pixel-white/80">OVERVIEW</h2>
              <div className="flex-1 h-px bg-pixel-blue/15 ml-2" />
            </div>
            <div className="md-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{overview}</ReactMarkdown>
            </div>
          </motion.section>

          {/* Gallery sidebar */}
          {gallery.length > 0 && (
            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="space-y-3 lg:sticky lg:top-20"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-pixel-cyan text-[10px]">▸</span>
                <h2 className="font-pixel text-[10px] tracking-widest text-pixel-white/80">GALLERY</h2>
                <span className="font-mono text-[10px] text-pixel-gray/40">[{gallery.length}]</span>
                <div className="flex-1 h-px bg-pixel-blue/15 ml-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {gallery.map((shot, i) => (
                  <motion.button
                    key={shot}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i }}
                    onClick={() => setLightbox(i)}
                    className="relative group overflow-hidden cursor-zoom-in border border-pixel-blue/15 hover:border-pixel-blue/50 transition-colors"
                    style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)', aspectRatio: '4 / 3' }}
                  >
                    <img src={shot} alt={`${project.title} screenshot ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-pixel-blue/0 group-hover:bg-pixel-blue/10 transition-colors" />
                    <span className="absolute bottom-1.5 right-1.5 font-mono text-[9px] text-pixel-blue/0 group-hover:text-pixel-blue/80 transition-colors">
                      +ZOOM
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.aside>
          )}
        </div>

        {/* More quests */}
        {others.length > 0 && (
          <section className="mt-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="section-tag mb-2">// more_quests</p>
                <h2 className="font-sans font-bold text-2xl text-pixel-white">Other <span className="gradient-text">Projects</span></h2>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {others.slice(0, 3).map(p => {
                const thumb = p.thumbnail ? getImageUrl(p.thumbnail) : null
                return (
                  <Link
                    key={p.id}
                    to={`/projects/${slugifyTitle(p.title)}`}
                    className="group border border-pixel-blue/15 bg-bg-card/30 hover:border-pixel-blue/50 transition-all duration-300 overflow-hidden block"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
                  >
                    <div className="relative h-36 overflow-hidden border-b border-pixel-blue/10">
                      {thumb ? (
                        <img src={thumb} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="absolute inset-0 grid-overlay flex items-center justify-center">
                          <div className="font-pixel text-pixel-blue/20 text-xl">◈</div>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-bg-primary/80 border border-pixel-blue/30 font-pixel text-pixel-blue/60 text-[7px]">
                        #{String(p.id).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-sans font-bold text-pixel-white group-hover:text-pixel-blue transition-colors text-base line-clamp-1">{p.title}</h3>
                      <p className="font-mono text-pixel-gray/50 text-xs mt-1 line-clamp-2">{p.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </main>

      {/* Mini footer */}
      <footer className="relative z-10 border-t border-pixel-blue/10 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-xs text-pixel-gray/40">
            © {new Date().getFullYear()} Rahmat Aditya. All rights reserved.
          </p>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 font-mono text-xs text-pixel-gray/60 hover:text-pixel-blue transition-colors">
            <FiArrowLeft /> back to projects
          </button>
          <p className="font-pixel text-pixel-gray/25 text-[8px] tracking-widest">v2.0.0 · GAME ON</p>
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