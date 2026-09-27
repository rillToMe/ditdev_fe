import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, FolderOpen, Globe, Monitor } from 'lucide-react'
import { FiGithub } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import api, { getImageUrl } from '../services/api'
import { btn } from '../ui'
import type { Project } from '../../types/api'
import ProjectModal from './ProjectModal'

const LINK_ICONS: Record<string, IconType> = { github: FiGithub, demo: Monitor, website: Globe }

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="admin-empty">
      <FolderOpen className="admin-empty-icon" size={40} />
      <div className="admin-empty-title">No projects yet</div>
      <div className="admin-empty-text">Create your first project to get started.</div>
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
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-page-title">Projects</h2>
          <p className="admin-page-sub">
            {projects.length} project{projects.length !== 1 ? 's' : ''} published
          </p>
        </div>
        <button className={btn.primary} onClick={() => setShowModal(true)}>
          <Plus size={16} />
          New project
        </button>
      </div>

      {projects.length === 0 ? <EmptyState /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: index * 0.05 }}
                className="admin-item"
              >
                {/* Thumbnail */}
                {project.thumbnail ? (
                  <div className="admin-item-thumb">
                    <img src={getImageUrl(project.thumbnail) || undefined} alt={project.title} />
                  </div>
                ) : (
                  <div className="admin-item-thumb admin-item-thumb-fallback">
                    <FolderOpen size={30} />
                  </div>
                )}

                {/* Body */}
                <div className="admin-item-body">
                  <h3 className="admin-item-title">{project.title}</h3>
                  <p className="admin-item-desc">{project.description}</p>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="admin-chip" style={{ fontSize: 11.5 }}>{tag}</span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="admin-chip" style={{ fontSize: 11.5 }}>+{project.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Links */}
                  {project.links && project.links.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {project.links.map((link, i) => {
                        const Icon = LINK_ICONS[link.type] || Globe
                        return (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={link.type}
                            className="admin-iconbtn"
                            style={{ width: 32, height: 32 }}
                          >
                            <Icon size={15} />
                          </a>
                        )
                      })}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="admin-item-actions">
                    <button className={btn.ghostSm + ' flex-1'} onClick={() => handleEdit(project)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      className={btn.dangerSm + ' flex-1'}
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
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
