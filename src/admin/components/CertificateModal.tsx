import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Trash2, FileText, ExternalLink } from 'lucide-react'
import api, { getImageUrl } from '../services/api'
import { btn, inputCls, labelCls } from '../ui'
import type { Certificate, CertificateInput } from '../../types/api'
import ImageCropper from './ImageCropper'
import Portal from './Portal'
import DiscardDialog from './DiscardDialog'
import type { ReactNode } from 'react'

interface CertificateFormData {
  title: string
  provider: string
  thumbnail: string
  issue_date: string
  credential_url: string
  pdf_file: string
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

interface CertificateModalProps {
  certificate: Certificate | null
  onClose: () => void
  onSuccess: () => void
}

export default function CertificateModal({ certificate, onClose, onSuccess }: CertificateModalProps) {
  const [formData, setFormData] = useState<CertificateFormData>({
    title: certificate?.title || '',
    provider: certificate?.provider || '',
    thumbnail: certificate?.thumbnail || '',
    issue_date: certificate?.issue_date || '',
    credential_url: certificate?.credential_url || '',
    pdf_file: certificate?.pdf_file || '',
  })
  const [uploading, setUploading] = useState(false)
  const [uploadingPDF, setUploadingPDF] = useState(false)
  const [saving, setSaving] = useState(false)

  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Discard guard
  const [showDiscard, setShowDiscard] = useState(false)

  const isEditing = !!certificate
  const hasChanges = () => {
    if (isEditing) {
      return (
        formData.title !== (certificate?.title || '') ||
        formData.provider !== (certificate?.provider || '') ||
        formData.thumbnail !== (certificate?.thumbnail || '') ||
        formData.issue_date !== (certificate?.issue_date || '') ||
        formData.credential_url !== (certificate?.credential_url || '') ||
        formData.pdf_file !== (certificate?.pdf_file || '')
      )
    }
    return (
      formData.title.trim() !== '' ||
      formData.provider.trim() !== '' ||
      formData.thumbnail !== '' ||
      formData.pdf_file !== ''
    )
  }

  const handleAttemptClose = () => {
    if (hasChanges()) {
      setShowDiscard(true)
    } else {
      onClose()
    }
  }

  // Best-effort R2 cleanup for an upload that is no longer referenced.
  // Skips the certificate's original files — the backend deletes those on save.
  const dropUpload = async (url: string, type: string, original?: string | null) => {
    if (!url || url === (original || '')) return
    const filename = url.split('/').pop()
    if (!filename) return
    try { await api.deleteImage(filename, type) } catch { /* ignore */ }
  }

  const handleConfirmDiscard = async () => {
    // Delete newly uploaded files from R2 (originals are left to the backend)
    await dropUpload(formData.thumbnail, 'certificates', certificate?.thumbnail)
    await dropUpload(formData.pdf_file, 'pdf_certif', certificate?.pdf_file)
    setShowDiscard(false)
    onClose()
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
      const data = await api.uploadImage(croppedFile, 'certificates')
      if (data.success && data.data?.path) {
        const replaced = formData.thumbnail
        setFormData(prev => ({ ...prev, thumbnail: data.data.path }))
        await dropUpload(replaced, 'certificates', certificate?.thumbnail)
      } else throw new Error('Invalid upload response')
    } catch (err) {
      alert('Upload failed: ' + (err instanceof Error ? err.message : err))
    } finally {
      setUploading(false)
      setImageToCrop(null)
      setSelectedFile(null)
    }
  }

  const handlePDFSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { alert('Only PDF files are allowed'); return }
    if (file.size > 10 * 1024 * 1024) { alert('PDF must be less than 10MB'); return }

    setUploadingPDF(true)
    try {
      const data = await api.uploadPDF(file)
      if (data.success && data.data?.path) {
        setFormData(prev => ({ ...prev, pdf_file: data.data.path }))
      } else throw new Error('Invalid upload response')
    } catch (err) {
      alert('PDF Upload failed: ' + (err instanceof Error ? err.message : err))
    } finally {
      setUploadingPDF(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: CertificateInput = formData
      if (certificate) await api.updateCertificate(certificate.id, payload)
      else await api.createCertificate(payload)
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
                {certificate ? 'Edit certificate' : 'New certificate'}
              </h2>
              <button className="admin-iconbtn" style={{ width: 32, height: 32 }} onClick={handleAttemptClose} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div className="admin-modal-body space-y-5">

                {/* Title */}
                <Field label="Title *">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                    className={inputCls}
                    placeholder="Certificate title"
                    required
                  />
                </Field>

                {/* Provider */}
                <Field label="Provider *">
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData(p => ({ ...p, provider: e.target.value }))}
                    className={inputCls}
                    placeholder="e.g. Google, Coursera, Udemy"
                    required
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
                        <img src={getImageUrl(formData.thumbnail) || undefined} alt="Preview"
                          className="w-full object-cover" style={{ height: 176, display: 'block' }} />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>Preview</span>
                          <button
                            type="button"
                            className={btn.dangerSm}
                            onClick={() => { dropUpload(formData.thumbnail, 'certificates', certificate?.thumbnail); setFormData(p => ({ ...p, thumbnail: '' })) }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </Field>

                {/* PDF Upload */}
                <Field label={`Certificate PDF${!certificate ? ' *' : ''}`}>
                  <div className="space-y-3">
                    {!formData.pdf_file && (
                      <label className="admin-dropzone">
                        <FileText size={16} />
                        <span>{uploadingPDF ? 'Uploading…' : 'Upload PDF'}</span>
                        <span className="admin-hint" style={{ marginLeft: 'auto', marginTop: 0 }}>Max 10MB</span>
                        <input type="file" accept="application/pdf" onChange={handlePDFSelect} className="hidden" disabled={uploadingPDF} />
                      </label>
                    )}

                    {uploadingPDF && (
                      <div className="flex items-center gap-2" style={{ fontSize: 13, color: 'var(--a-muted)' }}>
                        <Spinner /> Uploading PDF…
                      </div>
                    )}

                    {formData.pdf_file && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3"
                        style={{
                          padding: '12px 14px',
                          background: 'var(--a-bg-soft)',
                          border: '1px solid var(--a-border)',
                          borderRadius: 'var(--a-radius-sm)',
                        }}
                      >
                        <div style={{ width: 34, height: 34, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 6, background: 'var(--a-surface-2)', border: '1px solid var(--a-border)', color: 'var(--a-text-dim)' }}>
                          <FileText size={16} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--a-text)' }}>PDF uploaded</p>
                          <p style={{ fontSize: 11.5, color: 'var(--a-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {formData.pdf_file.split('/').pop()}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <a
                            href={formData.pdf_file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-iconbtn"
                            style={{ width: 32, height: 32 }}
                            title="View PDF"
                          >
                            <ExternalLink size={15} />
                          </a>
                          <button
                            type="button"
                            className="admin-iconbtn"
                            style={{ width: 32, height: 32, color: 'var(--a-red)' }}
                            onClick={() => { dropUpload(formData.pdf_file, 'pdf_certif', certificate?.pdf_file); setFormData(p => ({ ...p, pdf_file: '' })) }}
                            title="Remove PDF"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </Field>

                {/* Issue Date */}
                <Field label="Issue date">
                  <input
                    type="text"
                    value={formData.issue_date}
                    onChange={(e) => setFormData(p => ({ ...p, issue_date: e.target.value }))}
                    className={inputCls}
                    placeholder="e.g. January 2024"
                  />
                </Field>

                {/* Credential URL */}
                <Field label="Credential URL" hint="Optional — leave empty if using PDF only">
                  <input
                    type="url"
                    value={formData.credential_url}
                    onChange={(e) => setFormData(p => ({ ...p, credential_url: e.target.value }))}
                    className={inputCls}
                    placeholder="https://..."
                  />
                </Field>
              </div>

              {/* Actions */}
              <div className="admin-modal-foot">
                <button type="button" onClick={handleAttemptClose} className={btn.ghost + ' flex-1'}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || (!certificate && !formData.pdf_file)}
                  className={btn.primary + ' flex-1'}
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner /> Saving…
                    </span>
                  ) : (
                    certificate ? 'Update certificate' : 'Create certificate'
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
              aspectRatio={4 / 3}
            />
          )}
        </AnimatePresence>
        <DiscardDialog
          open={showDiscard}
          onCancel={() => setShowDiscard(false)}
          onConfirm={handleConfirmDiscard}
          isDeleting={
            (!!formData.thumbnail && formData.thumbnail !== (certificate?.thumbnail || '')) ||
            (!!formData.pdf_file && formData.pdf_file !== (certificate?.pdf_file || ''))
          }
        />
      </>
    </Portal>
  )
}
