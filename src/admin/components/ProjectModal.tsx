import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Trash2, Plus, Globe, Monitor } from 'lucide-react'
import { FiGithub } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import api, { getImageUrl } from '../services/api'
import { btn, inputCls, textareaCls, labelCls } from '../ui'
import type { Project, ProjectInput, ProjectLink } from '../../types/api'
import ImageCropper from './ImageCropper'
import Portal from './Portal'
import DiscardDialog from './DiscardDialog'
import type { ReactNode } from 'react'

const LINK_TYPES: { value: string; label: string; Icon: IconType; color: string }[] = [
  { value: 'github', label: 'GitHub', Icon: FiGithub, color: '#a3a3ab' },
  { value: 'demo', label: 'Demo', Icon: Monitor, color: '#a3a3ab' },
  { value: 'website', label: 'Website', Icon: Globe, color: '#a3a3ab' },
]

interface ProjectFormData {
  title: string
  description: string
  content: string
  thumbnail: string
  screenshots: string[]
  tags: string[]
  links: ProjectLink[]
}

function Spinner() {
  return <span className="admin-spinner admin-spinner--sm" />
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <p className="admin-hint">{hint}</p>}
    </div>
  )
}

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
  onSuccess: () => void
}

export default function ProjectModal({ project, onClose, onSuccess }: ProjectModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: project?.title || '',
    description: project?.description || '',
    content: project?.content || '',
    thumbnail: project?.thumbnail || '',
    screenshots: project?.screenshots || [],
    tags: project?.tags || [],
    links: project?.links || [],
  })
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadingShots, setUploadingShots] = useState(false)
  const [saving, setSaving] = useState(false)

  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Discard guard
  const [showDiscard, setShowDiscard] = useState(false)

  const isEditing = !!project
  const hasChanges = () => {
    if (isEditing) {
      return (
        formData.title !== (project?.title || '') ||
        formData.description !== (project?.description || '') ||
        formData.content !== (project?.content || '') ||
        formData.thumbnail !== (project?.thumbnail || '') ||
        JSON.stringify(formData.screenshots) !== JSON.stringify(project?.screenshots || []) ||
        JSON.stringify(formData.tags) !== JSON.stringify(project?.tags || []) ||
        JSON.stringify(formData.links) !== JSON.stringify(project?.links || [])
      )
    }
    // New project — dirty if any field filled or file uploaded
    return (
      formData.title.trim() !== '' ||
      formData.description.trim() !== '' ||
      formData.content.trim() !== '' ||
      formData.thumbnail !== '' ||
      formData.screenshots.length > 0 ||
      formData.tags.length > 0 ||
      formData.links.length > 0
    )
  }

  // Called when user tries to close (backdrop click, X button, Cancel)
  const handleAttemptClose = () => {
    if (hasChanges()) {
      setShowDiscard(true)
    } else {
      onClose()
    }
  }

  // Best-effort R2 cleanup for an upload that is no longer referenced.
  // Skips the project's original thumbnail — the backend deletes that on save.
  const dropUpload = async (url: string) => {
    if (!url || url === (project?.thumbnail || '')) return
    const filename = url.split('/').pop()
    if (!filename) return
    try { await api.deleteImage(filename, 'projects') } catch { /* ignore */ }
  }

  // Same idea for gallery screenshots: only newly-uploaded shots are cleaned up
  // here. Pre-existing ones are left for the backend, which diffs on save.
  const dropShot = async (url: string) => {
    if (!url || (project?.screenshots || []).includes(url)) return
    const filename = url.split('/').pop()
    if (!filename) return
    try { await api.deleteImage(filename, 'projects') } catch { /* ignore */ }
  }

  // Confirmed discard — delete uploaded files from R2 if new (not pre-existing)
  const handleConfirmDiscard = async () => {
    await dropUpload(formData.thumbnail)
    for (const shot of formData.screenshots) await dropShot(shot)
    setShowDiscard(false)
    onClose()
  }

  const removeScreenshot = (i: number) => {
    const shot = formData.screenshots[i]
    setFormData(prev => ({ ...prev, screenshots: prev.screenshots.filter((_, idx) => idx !== i) }))
    if (shot) dropShot(shot)
  }

  const handleShotsSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.target.value = '' // allow re-selecting the same file
    if (files.length === 0) return
    setUploadingShots(true)
    try {
      const added: string[] = []
      for (const file of files) {
        const data = await api.uploadImage(file, 'projects')
        added.push(data.data.path)
      }
      setFormData(prev => ({ ...prev, screenshots: [...prev.screenshots, ...added] }))
    } catch (err) {
      alert('Upload failed: ' + (err instanceof Error ? err.message : err))
    } finally {
      setUploadingShots(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = () => { setImageToCrop(reader.result as string); setShowCropper(true) }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false)
    setUploading(true)
    try {
      const croppedFile = new File([croppedBlob], selectedFile?.name || 'cropped.jpg', { type: 'image/jpeg' })
      const data = await api.uploadImage(croppedFile, 'projects')
      const replaced = formData.thumbnail
      setFormData(prev => ({ ...prev, thumbnail: data.data.path }))
      await dropUpload(replaced)
    } catch (err) {
      alert('Upload failed: ' + (err instanceof Error ? err.message : err))
    } finally {
      setUploading(false)
      setImageToCrop(null)
      setSelectedFile(null)
    }
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !formData.tags.includes(t)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, t] }))
      setTagInput('')
    }
  }
  const removeTag = (tag: string) =>
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))

  const addLink = () => setFormData(prev => ({ ...prev, links: [...prev.links, { type: 'github', url: '' }] }))
  const removeLink = (i: number) => setFormData(prev => ({ ...prev, links: prev.links.filter((_, idx) => idx !== i) }))
  const updateLink = (i: number, field: 'type' | 'url', val: string) => {
    const next = [...formData.links]
    next[i][field] = val
    setFormData(prev => ({ ...prev, links: next }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: ProjectInput = formData
      if (project) await api.updateProject(project.id, payload)
      else await api.createProject(payload)
      onSuccess()
    } catch (err) {
      alert('Failed to save: ' + (err instanceof Error ? err.message : err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Portal>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="admin-overlay"
          onClick={handleAttemptClose}
        >
          {/* Backdrop */}
          <div className="admin-overlay-backdrop" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.96, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 18, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="admin-modal"
            style={{ maxWidth: 672 }}
          >
            {/* Header */}
            <div className="admin-modal-head">
              <h2 className="admin-modal-title">
                {project ? 'Edit project' : 'New project'}
              </h2>
              <button className="admin-iconbtn" style={{ width: 32, height: 32 }} onClick={handleAttemptClose} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div className="admin-modal-body space-y-5">

                {/* Title */}
                <Field label="Title *">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={inputCls}
                    placeholder="Project title"
                    required
                  />
                </Field>

                {/* Description */}
                <Field label="Description *">
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={textareaCls}
                    rows={4}
                    placeholder="Project description"
                    required
                  />
                </Field>

                {/* Overview (markdown) */}
                <Field label="Overview (Markdown)" hint="Shown on the public project page · markdown supported">
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="admin-textarea"
                    rows={10}
                    placeholder={"Long-form overview shown on the project page.\nSupports markdown: # headings, **bold**, - lists, ```code```, etc."}
                  />
                </Field>

                {/* Thumbnail */}
                <Field label="Thumbnail">
                  <div className="space-y-3">
                    <label className="admin-dropzone">
                      <Upload size={16} />
                      <span>{uploading ? 'Uploading…' : 'Choose image'}</span>
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={uploading} />
                    </label>

                    {uploading && (
                      <div className="flex items-center gap-2" style={{ fontSize: 13, color: 'var(--a-muted)' }}>
                        <Spinner /> Uploading image…
                      </div>
                    )}

                    {formData.thumbnail && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group overflow-hidden"
                        style={{ borderRadius: 'var(--a-radius-sm)', border: '1px solid var(--a-border)' }}
                      >
                        <img
                          src={getImageUrl(formData.thumbnail) || undefined}
                          alt="Preview"
                          className="w-full object-cover"
                          style={{ height: 176, display: 'block' }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>Preview</span>
                          <button
                            type="button"
                            className={btn.dangerSm}
                            onClick={() => { dropUpload(formData.thumbnail); setFormData(prev => ({ ...prev, thumbnail: '' })) }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </Field>

                {/* Screenshots */}
                <Field label="Screenshots" hint="Gallery images shown on the project page · multiple allowed">
                  <div className="space-y-3">
                    {formData.screenshots.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        <AnimatePresence>
                          {formData.screenshots.map((shot, i) => (
                            <motion.div
                              key={shot}
                              initial={{ opacity: 0, scale: 0.94 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.94 }}
                              className="relative group overflow-hidden"
                              style={{ borderRadius: 'var(--a-radius-sm)', border: '1px solid var(--a-border)' }}
                            >
                              <img src={getImageUrl(shot) || undefined} alt={`Screenshot ${i + 1}`}
                                className="w-full object-cover" style={{ height: 80, display: 'block' }} />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button type="button" className={btn.dangerSm} onClick={() => removeScreenshot(i)} title="Remove screenshot">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}

                    <label className="admin-dropzone">
                      {uploadingShots ? (
                        <>
                          <Spinner />
                          <span>Uploading…</span>
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          <span>Add screenshot</span>
                        </>
                      )}
                      <input type="file" accept="image/*" multiple onChange={handleShotsSelect} className="hidden" disabled={uploadingShots} />
                    </label>
                  </div>
                </Field>

                {/* Tags */}
                <Field label="Tags">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                      className={inputCls + ' flex-1'}
                      placeholder="Add tag, press Enter"
                    />
                    <button type="button" className={btn.ghost} onClick={addTag}>
                      <Plus size={15} /> Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {formData.tags.map(tag => (
                        <motion.span
                          key={tag}
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.85, opacity: 0 }}
                          className="admin-chip"
                        >
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-[var(--a-text)] transition-colors">
                            <X size={12} />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </Field>

                {/* Links */}
                <Field label="Links">
                  <div className="space-y-2">
                    <AnimatePresence>
                      {formData.links.map((link, i) => {
                        const typeConf = LINK_TYPES.find(t => t.value === link.type) || LINK_TYPES[0]
                        const Icon = typeConf.Icon
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 12 }}
                            className="flex gap-2"
                          >
                            <div className="relative">
                              <Icon className="absolute pointer-events-none" size={15}
                                style={{ left: 11, top: '50%', transform: 'translateY(-50%)', color: typeConf.color }} />
                              <select
                                value={link.type}
                                onChange={(e) => updateLink(i, 'type', e.target.value)}
                                className="admin-select"
                                style={{ paddingLeft: 34, width: 'auto', color: typeConf.color }}
                              >
                                {LINK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </select>
                            </div>

                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => updateLink(i, 'url', e.target.value)}
                              placeholder="https://..."
                              className={inputCls + ' flex-1'}
                            />

                            <button
                              type="button"
                              onClick={() => removeLink(i)}
                              className="admin-iconbtn"
                              style={{ color: 'var(--a-red)', borderColor: 'transparent', background: 'transparent' }}
                              title="Remove link"
                            >
                              <Trash2 size={16} />
                            </button>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>

                  <button
                    type="button"
                    onClick={addLink}
                    className="inline-flex items-center gap-1.5 transition-colors"
                    style={{ marginTop: 10, fontSize: 13, fontWeight: 500, color: 'var(--a-link)' }}
                  >
                    <Plus size={14} /> Add link
                  </button>
                </Field>
              </div>

              {/* Actions */}
              <div className="admin-modal-foot">
                <button type="button" onClick={handleAttemptClose} className={btn.ghost + ' flex-1'}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={btn.primary + ' flex-1'}>
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner /> Saving…
                    </span>
                  ) : (
                    project ? 'Update project' : 'Create project'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>

        {/* Image Cropper */}
        <AnimatePresence>
          {showCropper && imageToCrop && (
            <ImageCropper
              image={imageToCrop}
              onComplete={handleCropComplete}
              onCancel={() => { setShowCropper(false); setImageToCrop(null); setSelectedFile(null) }}
              aspectRatio={16 / 9}
            />
          )}
        </AnimatePresence>
        <DiscardDialog
          open={showDiscard}
          onCancel={() => setShowDiscard(false)}
          onConfirm={handleConfirmDiscard}
          isDeleting={!!(formData.thumbnail && formData.thumbnail !== (project?.thumbnail || ''))}
        />
      </>
    </Portal>
  )
}
