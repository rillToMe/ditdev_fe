import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Award, ExternalLink, FileText } from 'lucide-react'
import api, { getImageUrl } from '../services/api'
import { btn } from '../ui'
import type { Certificate } from '../../types/api'
import CertificateModal from './CertificateModal'

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="admin-empty">
      <Award className="admin-empty-icon" size={40} />
      <div className="admin-empty-title">No certificates yet</div>
      <div className="admin-empty-text">Add your first certificate to showcase achievements.</div>
    </motion.div>
  )
}

interface CertificatesManagerProps {
  certificates: Certificate[]
  onUpdate: () => void
}

export default function CertificatesManager({ certificates, onUpdate }: CertificatesManagerProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingCert, setEditingCert] = useState<Certificate | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleEdit = (cert: Certificate) => { setEditingCert(cert); setShowModal(true) }
  const handleClose = () => { setShowModal(false); setEditingCert(null) }
  const handleSuccess = () => { handleClose(); onUpdate() }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this certificate?')) return
    setDeletingId(id)
    try {
      await api.deleteCertificate(id)
      onUpdate()
    } catch (err) {
      alert('Failed to delete: ' + (err instanceof Error ? err.message : err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-page-title">Certificates</h2>
          <p className="admin-page-sub">
            {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} published
          </p>
        </div>
        <button className={btn.primary} onClick={() => setShowModal(true)}>
          <Plus size={16} />
          New certificate
        </button>
      </div>

      {certificates.length === 0 ? <EmptyState /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {certificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: index * 0.05 }}
                className="admin-item"
              >
                {/* Thumbnail */}
                {cert.thumbnail ? (
                  <div className="admin-item-thumb">
                    <img src={getImageUrl(cert.thumbnail) || undefined} alt={cert.title} />
                  </div>
                ) : (
                  <div className="admin-item-thumb admin-item-thumb-fallback">
                    <Award size={30} />
                  </div>
                )}

                {/* Body */}
                <div className="admin-item-body">
                  <h3 className="admin-item-title" style={{ WebkitLineClamp: 2 }}>{cert.title}</h3>
                  <p className="admin-item-desc" style={{ marginBottom: 4, color: 'var(--a-text-dim)', fontWeight: 500 }}>
                    {cert.provider}
                  </p>

                  {cert.issue_date && (
                    <p className="admin-page-sub" style={{ fontSize: 12, marginBottom: 12 }}>
                      {cert.issue_date}
                    </p>
                  )}

                  {/* Links */}
                  <div className="flex flex-col gap-2 mb-4">
                    {cert.pdf_file && (
                      <a
                        href={cert.pdf_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5"
                        style={{ fontSize: 12.5, color: 'var(--a-link)', fontWeight: 500 }}
                      >
                        <FileText size={14} /> View PDF
                      </a>
                    )}
                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5"
                        style={{ fontSize: 12.5, color: 'var(--a-link)', fontWeight: 500 }}
                      >
                        <ExternalLink size={14} /> View credential
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="admin-item-actions">
                    <button className={btn.ghostSm + ' flex-1'} onClick={() => handleEdit(cert)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      className={btn.dangerSm + ' flex-1'}
                      onClick={() => handleDelete(cert.id)}
                      disabled={deletingId === cert.id}
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
        <CertificateModal certificate={editingCert} onClose={handleClose} onSuccess={handleSuccess} />
      )}
    </>
  )
}
