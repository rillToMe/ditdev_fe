import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useNavigate } from 'react-router-dom'
import { FiLoader } from 'react-icons/fi'
import ZoneHeader from './systems/ZoneHeader'
import PixelButton from './systems/PixelButton'
import PixelIcon from './systems/PixelIcon'
import TiltCard from './systems/TiltCard'
import { useAchievements } from './systems/AchievementsProvider'
import { projectsAPI } from '../services/api'
import { slugifyTitle } from '../utils/slug'
import { getDifficulty, type Difficulty } from '../utils/difficulty'
import { SITE } from '../data/site'
import { assemble, stagger, slideIn, scalePop, VIEWPORT, DUR, EASE } from '../lib/motion'
import type { Project } from '../types/api'

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Sample Game Project',
    description: 'A 2D platformer built with Unity featuring pixel art graphics and challenging gameplay mechanics.',
    thumbnail: null,
    tags: ['Unity', 'C#', 'Game Dev'],
    links: [{ type: 'github', url: 'https://github.com/rillToMe' }],
    created_at: '',
    updated_at: '',
  },
]

const TagBadge = ({ tag }: { tag: string }) => (
  <span
    className="px-2 py-0.5 font-mono text-[10px] text-pixel-blue/70 border border-pixel-blue/20 bg-pixel-blue/5"
    style={{ clipPath: 'polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)' }}
  >
    {tag}
  </span>
)

function DifficultyTag({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 border font-pixel text-[7px] tracking-widest"
      style={{ color: difficulty.color, borderColor: `${difficulty.color}44`, background: `${difficulty.color}0d` }}
    >
      {difficulty.label}
      <span className="flex gap-px" aria-hidden>
        {Array.from({ length: difficulty.stars }).map((_, i) => (
          <span key={i} className="w-1 h-1" style={{ background: difficulty.color }} />
        ))}
      </span>
    </span>
  )
}

/* ── Featured quest (first project, larger) ─────────────────────────── */
function FeaturedQuest({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const difficulty = getDifficulty(project)

  return (
    <TiltCard
      variants={assemble}
      max={7}
      lift={8}
      onClick={onOpen}
      role="link"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onOpen() }}
      className="group relative grid md:grid-cols-2 border border-pixel-blue/20 bg-bg-card/40 hover:border-pixel-blue/50 transition-colors overflow-hidden cursor-pointer outline-none focus-visible:border-pixel-cyan/70"
      style={{ clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))' }}
    >
      {/* Preview */}
      <div className="relative h-56 md:h-full min-h-56 bg-bg-primary border-b md:border-b-0 md:border-r border-pixel-blue/10 overflow-hidden">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid-faint flex items-center justify-center">
            <PixelIcon name="scroll" size={44} className="text-pixel-blue/25" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-1 bg-bg-primary/85 border border-yellow-400/40 font-pixel text-[8px] text-yellow-400 tracking-widest">
            <PixelIcon name="star" size={10} />
            FEATURED
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-3">
          <DifficultyTag difficulty={difficulty} />
          <span className="font-mono text-[10px] text-pixel-gray/40">
            QUEST #{String(project.id).padStart(2, '0')}
          </span>
        </div>
        <h3 className="font-pixel text-pixel-white text-base leading-relaxed mb-3 group-hover:text-pixel-cyan transition-colors">
          {project.title}
        </h3>
        <p className="font-mono text-pixel-gray/70 text-sm leading-relaxed mb-4 line-clamp-3">
          {project.description}
        </p>
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.tags.slice(0, 5).map(tag => <TagBadge key={tag} tag={tag} />)}
          </div>
        )}
        <span className="inline-flex items-center gap-2 font-pixel text-[9px] text-pixel-cyan/80 group-hover:text-pixel-cyan tracking-widest">
          OPEN QUEST LOG
          <PixelIcon name="arrowRight" size={12} />
        </span>
      </div>
    </TiltCard>
  )
}

/* ── Standard quest card ─────────────────────────────────────────────── */
function QuestCard({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  const difficulty = getDifficulty(project)

  return (
    <TiltCard
      variants={slideIn('left', 24)}
      max={9}
      lift={6}
      onClick={onOpen}
      role="link"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onOpen() }}
      className="group relative border border-pixel-blue/15 bg-bg-card/40 hover:border-pixel-blue/40 hover:bg-bg-hover/50 transition-colors duration-300 overflow-hidden cursor-pointer outline-none focus-visible:border-pixel-blue/70 flex flex-col"
      style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
    >
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden bg-bg-primary border-b border-pixel-blue/10 shrink-0">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid-faint flex items-center justify-center">
            <PixelIcon name="scroll" size={34} className="text-pixel-blue/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-pixel-blue/0 group-hover:bg-pixel-blue/5 transition-colors" />
        <div className="absolute top-2.5 left-2.5 px-2 py-1 bg-bg-primary/85 border border-pixel-blue/30 font-pixel text-pixel-blue/70 text-[8px]">
          #{String(index + 1).padStart(2, '0')}
        </div>
        <div className="absolute bottom-2.5 right-2.5">
          <DifficultyTag difficulty={difficulty} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-pixel text-pixel-white text-xs leading-relaxed mb-2 group-hover:text-pixel-cyan transition-colors line-clamp-2">
          {project.title}
        </h3>
        <p className="font-mono text-pixel-gray/70 text-xs leading-relaxed mb-4 line-clamp-3 flex-1">
          {project.description}
        </p>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tags.slice(0, 4).map(tag => <TagBadge key={tag} tag={tag} />)}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-pixel-blue/10 mt-auto">
          <span className="font-pixel text-[8px] text-pixel-gray/40 tracking-widest">OPEN ▸</span>
          {project.links && project.links.length > 0 && (
            <div className="flex items-center gap-3">
              {project.links.slice(0, 2).map(link => (
                <a
                  key={link.type}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-pixel-gray/50 hover:text-pixel-cyan transition-colors"
                  aria-label={link.type === 'github' ? 'Source code' : 'Live demo'}
                >
                  <PixelIcon name={link.type === 'github' ? 'external' : 'bolt'} size={13} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </TiltCard>
  )
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 })
  const navigate = useNavigate()
  const { record } = useAchievements()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectsAPI.getAll()
        setProjects(res.data?.data || FALLBACK_PROJECTS)
      } catch {
        setProjects(FALLBACK_PROJECTS)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  // Opening a quest log counts toward QUEST COMPLETE (3 opens).
  const openQuest = (project: Project) => {
    record('projects_opened', 3, 'quest_complete')
    navigate(`/projects/${slugifyTitle(project.title)}`)
  }

  const [featured, ...rest] = projects

  return (
    <section id="projects" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 grid-faint opacity-60 pointer-events-none" />

      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <ZoneHeader
          variant="banner"
          index="03"
          tag="QUEST BOARD"
          title="Quest"
          accent="Board"
          icon="scroll"
          meta={loading ? undefined : `[${projects.length} quests available]`}
          subtitle="Pick a quest to inspect the full log, screenshots and source."
        />

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FiLoader className="text-pixel-blue text-2xl animate-spin mr-3" />
            <span className="font-mono text-pixel-gray text-sm">Loading quest board...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 border border-pixel-blue/10">
            <p className="font-pixel text-pixel-gray/30 text-xs">NO QUESTS POSTED</p>
          </div>
        ) : (
          <motion.div
            variants={stagger(0.12)}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className="space-y-6"
          >
            <FeaturedQuest project={featured} onOpen={() => openQuest(featured)} />

            {rest.length > 0 && (
              <motion.div variants={stagger(0.09)} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((project, index) => (
                  <QuestCard
                    key={project.id}
                    project={project}
                    index={index + 1}
                    onOpen={() => openQuest(project)}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Footer CTA */}
        <motion.div
          variants={scalePop}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          transition={{ duration: DUR.slow, ease: EASE.back, delay: 0.15 }}
          className="mt-12 flex justify-center"
        >
          <PixelButton
            variant="ghost"
            icon="external"
            href={`https://github.com/${SITE.githubUser}`}
          >
            VIEW ALL REPOSITORIES
          </PixelButton>
        </motion.div>
      </div>
    </section>
  )
}
