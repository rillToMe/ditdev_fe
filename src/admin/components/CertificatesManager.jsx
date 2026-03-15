import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Award, ExternalLink, FileText } from 'lucide-react';
import api, { getImageUrl } from '../services/api';
import CertificateModal from './CertificateModal';

const pixelClip = 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)';

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 gap-4">
      <Award className="w-16 h-16" style={{ color: 'rgba(0,212,255,0.15)' }} />
      <p className="font-pixel text-[10px] tracking-widest" style={{ color: 'rgba(148,163,184,0.3)' }}>
        NO CERTIFICATES FOUND
      </p>
      <p className="font-mono text-xs" style={{ color: 'rgba(148,163,184,0.2)' }}>
        Add your first certificate to showcase achievements
      </p>
    </motion.div>
  );
}

export default function CertificatesManager({ certificates, onUpdate }) {
  const [showModal,      setShowModal]      = useState(false);
  const [editingCert,    setEditingCert]    = useState(null);
  const [deletingId,     setDeletingId]     = useState(null);

  const handleEdit    = (cert) => { setEditingCert(cert); setShowModal(true); };
  const handleClose   = ()     => { setShowModal(false); setEditingCert(null); };
  const handleSuccess = ()     => { handleClose(); onUpdate(); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this certificate?')) return;
    setDeletingId(id);
    try {
      await api.deleteCertificate(id);
      onUpdate();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-pixel text-sm tracking-widest text-[#e2e8f0]">CERTIFICATES</h2>
          <p className="font-mono text-xs mt-1" style={{ color: 'rgba(148,163,184,0.35)' }}>
            {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} in realm
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 font-pixel text-[10px] tracking-widest transition-all duration-200"
          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', clipPath: pixelClip }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,255,0.08)'}
        >
          <Plus className="w-3.5 h-3.5" />
          NEW CERTIFICATE
        </motion.button>
      </div>

      {certificates.length === 0 ? <EmptyState /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {certificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0  }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -4 }}
                className="flex flex-col overflow-hidden"
                style={{
                  background: '#0d1220',
                  border    : '1px solid rgba(0,212,255,0.08)',
                  clipPath  : 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)';
                  e.currentTarget.style.boxShadow   = '0 0 20px rgba(0,212,255,0.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.08)';
                  e.currentTarget.style.boxShadow   = 'none';
                }}
              >
                {/* Thumbnail */}
                {cert.thumbnail ? (
                  <div className="relative overflow-hidden h-40 flex-shrink-0">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      src={getImageUrl(cert.thumbnail)}
                      alt={cert.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0d1220 0%, transparent 50%)' }} />
                    <div className="absolute top-2 right-2 w-3 h-3" style={{ background: 'rgba(0,212,255,0.4)', clipPath: pixelClip }} />
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,212,255,0.02)', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                    <Award className="w-8 h-8" style={{ color: 'rgba(0,212,255,0.15)' }} />
                  </div>
                )}

                {/* Body */}
                <div className="flex-1 flex flex-col p-4">
                  <h3 className="font-pixel text-xs tracking-wide text-[#e2e8f0] mb-1 line-clamp-2 leading-relaxed">
                    {cert.title}
                  </h3>
                  <p className="font-mono text-xs mb-2" style={{ color: 'rgba(0,212,255,0.6)' }}>
                    {cert.provider}
                  </p>

                  {cert.issue_date && (
                    <p className="font-mono text-[10px] mb-3" style={{ color: 'rgba(148,163,184,0.35)' }}>
                      {cert.issue_date}
                    </p>
                  )}

                  {/* Links */}
                  <div className="flex flex-col gap-1.5 mb-4">
                    {cert.pdf_file && (
                      <a href={cert.pdf_file} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] transition-colors"
                        style={{ color: 'rgba(0,212,255,0.5)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,212,255,0.5)'}
                      >
                        <FileText className="w-3 h-3" /> view PDF
                      </a>
                    )}
                    {cert.credential_url && (
                      <a href={cert.credential_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] transition-colors"
                        style={{ color: 'rgba(79,140,255,0.5)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#4f8cff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(79,140,255,0.5)'}
                      >
                        <ExternalLink className="w-3 h-3" /> view credential
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleEdit(cert)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 font-pixel text-[9px] tracking-widest transition-all duration-200"
                      style={{ background: 'rgba(79,140,255,0.06)', border: '1px solid rgba(79,140,255,0.2)', color: '#4f8cff', clipPath: pixelClip }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,140,255,0.14)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,140,255,0.06)'}
                    >
                      <Edit className="w-3 h-3" /> EDIT
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleDelete(cert.id)}
                      disabled={deletingId === cert.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 font-pixel text-[9px] tracking-widest transition-all duration-200 disabled:opacity-40"
                      style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.6)', clipPath: pixelClip }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
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
        <CertificateModal certificate={editingCert} onClose={handleClose} onSuccess={handleSuccess} />
      )}
    </>
  );
}