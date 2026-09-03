import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, FolderOpen, Globe, Monitor } from 'lucide-react'
import { FiGithub } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import api, { getImageUrl } from '../services/api'
import type { Project } from '../../types/api'
import ProjectModal from './ProjectModal'

const pixelClip = 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)'

const LINK_ICONS: Record<string, IconType> = { github: FiGithub, demo: Monitor, website: Globe }

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 gap-4">
      <FolderOpen className="w-16 h-16" style={{ color: 'rgba(79,140,255,0.15)' }} />
      <p className="font-pixel text-[10px] tracking-widest" style={{ color: 'rgba(148,163,184,0.3)' }}>
        NO PROJECTS FOUND
      </p>
      <p className="font-mono text-xs" style={{ color: 'rgba(148,163,184,0.2)' }}>
        Create your first project to get started
      </p>
    </motion.div>
  )
}

interface ProjectsManagerProps {
  projects: Project[]
  onUpdate: () => void
}

export default function ProjectsManager({ projects, onUpdate }: ProjectsManagerProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleEdit = (project: Project) => { setEditingProject(project); setShowModal(true) }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project?')) return
    setDeletingId(id)
    try {
      await api.deleteProject(id)
      onUpdate()
    } catch (err) {
      alert('Failed to delete: ' + (err instanceof Error ? err.message : err))
    } finally {
      setDeletingId(null)
    }
  }

  const handleClose = () => { setShowModal(false); setEditingProject(null) }
  const handleSuccess = () => { handleClose(); onUpdate() }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-pixel text-sm tracking-widest text-[#e2e8f0]">PROJECTS</h2>
          <p className="font-mono text-xs mt-1" style={{ color: 'rgba(148,163,184,0.35)' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} in realm
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 font-pixel text-[10px] tracking-widest transition-all duration-200"
          style={{ background: 'rgba(79,140,255,0.1)', border: '1px solid rgba(79,140,255,0.3)', color: '#4f8cff', clipPath: pixelClip }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(79,140,255,0.18)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(79,140,255,0.1)'}
        >
          <Plus className="w-3.5 h-3.5" />
          NEW PROJECT
        </motion.button>
      </div>

      {projects.length === 0 ? <EmptyState /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -4 }}
                className="group flex flex-col overflow-hidden"
                style={{
                  background: '#0d1220',
                  border: '1px solid rgba(79,140,255,0.1)',
                  clipPath: 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(79,140,255,0.25)'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(79,140,255,0.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(79,140,255,0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Thumbnail */}
                {project.thumbnail ? (
                  <div className="relative overflow-hidden h-40 flex-shrink-0">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      src={getImageUrl(project.thumbnail) || undefined}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0d1220 0%, transparent 50%)' }} />
                    {/* Corner pixel */}
                    <div className="absolute top-2 right-2 w-3 h-3" style={{ background: 'rgba(79,140,255,0.4)', clipPath: pixelClip }} />
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(79,140,255,0.03)', borderBottom: '1px solid rgba(79,140,255,0.08)' }}>
                    <FolderOpen className="w-8 h-8" style={{ color: 'rgba(79,140,255,0.15)' }} />
                  </div>
                )}

                {/* Body */}
                <div className="flex-1 flex flex-col p-4">
                  <h3 className="font-pixel text-xs tracking-wide text-[#e2e8f0] mb-2 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="font-mono text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: 'rgba(148,163,184,0.5)' }}>
                    {project.description}
                  </p>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.tags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 font-mono text-[10px]"
                          style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', color: 'rgba(0,212,255,0.6)', clipPath: pixelClip }}>
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 4 && (
                        <span className="px-2 py-0.5 font-mono text-[10px]"
                          style={{ color: 'rgba(148,163,184,0.3)' }}>
                          +{project.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Links */}
                  {project.links && project.links.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {project.links.map((link, i) => {
                        const Icon = LINK_ICONS[link.type] || Globe
                        return (
                          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 transition-colors"
                            style={{ color: 'rgba(148,163,184,0.3)', background: 'rgba(79,140,255,0.04)', border: '1px solid rgba(79,140,255,0.1)', clipPath: pixelClip }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#4f8cff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(148,163,184,0.3)'}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </a>
                        )
                      })}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleEdit(project)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 font-pixel text-[9px] tracking-widest transition-all duration-200"
                      style={{ background: 'rgba(79,140,255,0.06)', border: '1px solid rgba(79,140,255,0.2)', color: '#4f8cff', clipPath: pixelClip }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(79,140,255,0.14)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(79,140,255,0.06)'}
                    >
                      <Edit className="w-3 h-3" /> EDIT
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 font-pixel text-[9px] tracking-widest transition-all duration-200 disabled:opacity-40"
                      style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.6)', clipPath: pixelClip }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                    >
                      <Trash2 className="w-3 h-3" /> DELETE
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {showModal && (
        <ProjectModal project={editingProject} onClose={handleClose} onSuccess={handleSuccess} />
      )}
    </>
  )
}