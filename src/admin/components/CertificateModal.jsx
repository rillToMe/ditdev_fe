import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, FileText, ExternalLink } from 'lucide-react';
import api, { getImageUrl } from '../services/api';
import ImageCropper from './ImageCropper';
import Portal from './Portal';
import DiscardDialog from './DiscardDialog';

const S = {
  input: [
    'w-full px-4 py-3 text-sm font-mono',
    'bg-[#0a0e1a] border border-[rgba(79,140,255,0.15)]',
    'text-[#e2e8f0] placeholder-[rgba(148,163,184,0.35)]',
    'focus:outline-none focus:border-[rgba(79,140,255,0.5)] focus:bg-[#0d1220]',
    'transition-all duration-200',
  ].join(' '),

  label: 'block text-[11px] font-pixel tracking-widest text-[rgba(148,163,184,0.6)] mb-2 uppercase',

  btnPrimary: [
    'flex-1 px-6 py-3 font-pixel text-xs tracking-widest',
    'bg-[rgba(79,140,255,0.12)] border border-[rgba(79,140,255,0.35)]',
    'text-[#4f8cff] hover:bg-[rgba(79,140,255,0.2)] hover:border-[rgba(79,140,255,0.6)]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'transition-all duration-200',
  ].join(' '),

  btnGhost: [
    'flex-1 px-6 py-3 font-pixel text-xs tracking-widest',
    'border border-[rgba(148,163,184,0.15)] text-[rgba(148,163,184,0.5)]',
    'hover:border-[rgba(148,163,184,0.3)] hover:text-[rgba(148,163,184,0.8)]',
    'transition-all duration-200',
  ].join(' '),
};

const pixelClip   = 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)';
const pixelClipLg = 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)';

function PixelSpinner({ color = '#4f8cff' }) {
  return (
    <div className="w-4 h-4 border-2 rounded-full animate-spin"
      style={{ borderColor: `${color}30`, borderTopColor: color }} />
  );
}

function Field({ label, delay = 0, children, hint }) {
  return (
    <motion.div
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0,   opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <label className={S.label}>{label}</label>
      {children}
      {hint && <p className="mt-1.5 font-mono text-[10px] text-[rgba(148,163,184,0.35)]">{hint}</p>}
    </motion.div>
  );
}

export default function CertificateModal({ certificate, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title         : certificate?.title          || '',
    provider      : certificate?.provider       || '',
    thumbnail     : certificate?.thumbnail      || '',
    issue_date    : certificate?.issue_date     || '',
    credential_url: certificate?.credential_url || '',
    pdf_file      : certificate?.pdf_file       || '',
  });
  const [uploading,    setUploading]    = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [saving,       setSaving]       = useState(false);

  const [imageToCrop,  setImageToCrop]  = useState(null);
  const [showCropper,  setShowCropper]  = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Discard guard
  const [showDiscard, setShowDiscard] = useState(false);

  const isEditing = !!certificate;
  const hasChanges = () => {
    if (isEditing) {
      return (
        formData.title          !== (certificate?.title          || '') ||
        formData.provider       !== (certificate?.provider       || '') ||
        formData.thumbnail      !== (certificate?.thumbnail      || '') ||
        formData.issue_date     !== (certificate?.issue_date     || '') ||
        formData.credential_url !== (certificate?.credential_url || '') ||
        formData.pdf_file       !== (certificate?.pdf_file       || '')
      );
    }
    return (
      formData.title.trim()    !== '' ||
      formData.provider.trim() !== '' ||
      formData.thumbnail       !== '' ||
      formData.pdf_file        !== ''
    );
  };

  const handleAttemptClose = () => {
    if (hasChanges()) {
      setShowDiscard(true);
    } else {
      onClose();
    }
  };

  // Best-effort R2 cleanup for an upload that is no longer referenced.
  // Skips the certificate's original files — the backend deletes those on save.
  const dropUpload = async (url, type, original) => {
    if (!url || url === (original || '')) return;
    try { await api.deleteImage(url.split('/').pop(), type); } catch { /* ignore */ }
  };

  const handleConfirmDiscard = async () => {
    // Delete newly uploaded files from R2 (originals are left to the backend)
    await dropUpload(formData.thumbnail, 'certificates', certificate?.thumbnail);
    await dropUpload(formData.pdf_file,  'pdf_certif',   certificate?.pdf_file);
    setShowDiscard(false);
    onClose();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => { setImageToCrop(reader.result); setShowCropper(true); };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob) => {
    setShowCropper(false);
    setUploading(true);
    try {
      const croppedFile = new File([croppedBlob], selectedFile.name, { type: 'image/jpeg' });
      const data = await api.uploadImage(croppedFile, 'certificates');
      if (data.success && data.data?.path) {
        const replaced = formData.thumbnail;
        setFormData(prev => ({ ...prev, thumbnail: data.data.path }));
        await dropUpload(replaced, 'certificates', certificate?.thumbnail);
      } else throw new Error('Invalid upload response');
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setImageToCrop(null);
      setSelectedFile(null);
    }
  };

  const handlePDFSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { alert('Only PDF files are allowed'); return; }
    if (file.size > 10 * 1024 * 1024)   { alert('PDF must be less than 10MB'); return; }

    setUploadingPDF(true);
    try {
      const data = await api.uploadPDF(file);
      if (data.success && data.data?.path) {
        setFormData(prev => ({ ...prev, pdf_file: data.data.path }));
      } else throw new Error('Invalid upload response');
    } catch (err) {
      alert('PDF Upload failed: ' + err.message);
    } finally {
      setUploadingPDF(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      certificate ? await api.updateCertificate(certificate.id, formData) : await api.createCertificate(formData);
      onSuccess();
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleAttemptClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.94, y: 24, opacity: 0 }}
          animate={{ scale: 1,    y: 0,  opacity: 1 }}
          exit={{ scale: 0.94,    y: 24, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col"
          style={{
            background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1220 100%)',
            border    : '1px solid rgba(79,140,255,0.18)',
            clipPath  : pixelClipLg,
            boxShadow : '0 0 60px rgba(79,140,255,0.08), 0 32px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(79,140,255,0.1)', background: 'rgba(79,140,255,0.03)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#00d4ff]"     style={{ clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' }} />
                <div className="w-2 h-2 bg-[#4f8cff]/60"  style={{ clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' }} />
              </div>
              <h2 className="font-pixel text-xs tracking-widest text-[#e2e8f0]">
                {certificate ? '// EDIT_CERTIFICATE' : '// NEW_CERTIFICATE'}
              </h2>
            </div>
            <motion.button
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAttemptClose}
              className="p-1.5 text-[rgba(148,163,184,0.4)] hover:text-[rgba(148,163,184,0.8)] transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(79,140,255,0.2) transparent' }}
          >
            {/* Title */}
            <Field label="Title *" delay={0.05}>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                className={S.input}
                style={{ clipPath: pixelClip }}
                placeholder="Certificate title"
                required
              />
            </Field>

            {/* Provider */}
            <Field label="Provider *" delay={0.1}>
              <input
                type="text"
                value={formData.provider}
                onChange={e => setFormData(p => ({ ...p, provider: e.target.value }))}
                className={S.input}
                style={{ clipPath: pixelClip }}
                placeholder="e.g. Google, Coursera, Udemy"
                required
              />
            </Field>

            {/* Thumbnail */}
            <Field label="Thumbnail" delay={0.15}>
              <div className="space-y-3">
                <label
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer transition-all duration-200"
                  style={{
                    background: 'rgba(79,140,255,0.06)',
                    border    : '1px dashed rgba(79,140,255,0.25)',
                    clipPath  : pixelClip,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,140,255,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,140,255,0.06)'}
                >
                  <Upload className="w-4 h-4 text-[rgba(79,140,255,0.6)]" />
                  <span className="font-pixel text-[10px] tracking-widest text-[rgba(79,140,255,0.7)]">
                    {uploading ? 'UPLOADING...' : 'CHOOSE_IMAGE'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={uploading} />
                </label>

                {uploading && (
                  <div className="flex items-center gap-2">
                    <PixelSpinner />
                    <span className="font-mono text-xs text-[rgba(79,140,255,0.6)]">uploading image...</span>
                  </div>
                )}

                {formData.thumbnail && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group overflow-hidden"
                    style={{ clipPath: pixelClip }}
                  >
                    <img src={getImageUrl(formData.thumbnail)} alt="Preview" className="w-full h-44 object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <span className="font-pixel text-[10px] text-white/80 tracking-widest">PREVIEW</span>
                      <button
                        type="button"
                        onClick={() => { dropUpload(formData.thumbnail, 'certificates', certificate?.thumbnail); setFormData(p => ({ ...p, thumbnail: '' })); }}
                        className="p-1.5 bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/40 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="absolute top-0 right-0 w-4 h-4 bg-[#00d4ff]/20 border-l border-b border-[#00d4ff]/30" />
                  </motion.div>
                )}
              </div>
            </Field>

            {/* PDF Upload */}
            <Field label={`Certificate PDF${!certificate ? ' *' : ''}`} delay={0.2}>
              <div className="space-y-3">
                {/* Upload button - only show if no PDF yet */}
                {!formData.pdf_file && (
                  <label
                    className="flex items-center gap-2 px-4 py-3 cursor-pointer transition-all duration-200"
                    style={{
                      background: 'rgba(0,212,255,0.04)',
                      border    : '1px dashed rgba(0,212,255,0.2)',
                      clipPath  : pixelClip,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.09)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,255,0.04)'}
                  >
                    <FileText className="w-4 h-4 text-[rgba(0,212,255,0.6)]" />
                    <span className="font-pixel text-[10px] tracking-widest text-[rgba(0,212,255,0.7)]">
                      {uploadingPDF ? 'UPLOADING...' : 'UPLOAD_PDF'}
                    </span>
                    <span className="ml-auto font-mono text-[9px] text-[rgba(148,163,184,0.3)]">MAX 10MB</span>
                    <input type="file" accept="application/pdf" onChange={handlePDFSelect} className="hidden" disabled={uploadingPDF} />
                  </label>
                )}

                {/* Upload progress */}
                {uploadingPDF && (
                  <div className="flex items-center gap-2">
                    <PixelSpinner color="#00d4ff" />
                    <span className="font-mono text-xs text-[rgba(0,212,255,0.6)]">uploading PDF...</span>
                  </div>
                )}

                {/* PDF success card */}
                {formData.pdf_file && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{
                      background: 'rgba(0,212,255,0.04)',
                      border    : '1px solid rgba(0,212,255,0.2)',
                      clipPath  : pixelClip,
                    }}
                  >
                    {/* Icon */}
                    <div className="p-1.5 flex-shrink-0" style={{ background: 'rgba(0,212,255,0.1)', clipPath: pixelClip }}>
                      <FileText className="w-4 h-4 text-[#00d4ff]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-pixel text-[10px] tracking-widest text-[rgba(0,212,255,0.8)]">PDF UPLOADED</p>
                      <p className="font-mono text-[10px] text-[rgba(148,163,184,0.4)] truncate mt-0.5">
                        {formData.pdf_file.split('/').pop()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <a
                        href={formData.pdf_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)] transition-all"
                        style={{ clipPath: pixelClip }}
                        title="View PDF"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => { dropUpload(formData.pdf_file, 'pdf_certif', certificate?.pdf_file); setFormData(p => ({ ...p, pdf_file: '' })); }}
                        className="p-1.5 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        style={{ clipPath: pixelClip }}
                        title="Remove PDF"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </Field>

            {/* Issue Date */}
            <Field label="Issue Date" delay={0.25}>
              <input
                type="text"
                value={formData.issue_date}
                onChange={e => setFormData(p => ({ ...p, issue_date: e.target.value }))}
                className={S.input}
                style={{ clipPath: pixelClip }}
                placeholder="e.g. January 2024"
              />
            </Field>

            {/* Credential URL */}
            <Field
              label="Credential URL"
              delay={0.3}
              hint="Optional - leave empty if using PDF only"
            >
              <input
                type="url"
                value={formData.credential_url}
                onChange={e => setFormData(p => ({ ...p, credential_url: e.target.value }))}
                className={S.input}
                style={{ clipPath: pixelClip }}
                placeholder="https://..."
              />
            </Field>

            {/* Actions */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0,  opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex gap-3 pt-4"
              style={{ borderTop: '1px solid rgba(79,140,255,0.08)' }}
            >
              <button type="button" onClick={handleAttemptClose} className={S.btnGhost} style={{ clipPath: pixelClip }}>
                CANCEL
              </button>
              <button
                type="submit"
                disabled={saving || (!certificate && !formData.pdf_file)}
                className={S.btnPrimary}
                style={{ clipPath: pixelClip }}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <PixelSpinner /> SAVING...
                  </span>
                ) : (
                  certificate ? 'UPDATE CERTIFICATE' : 'CREATE CERTIFICATE'
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>

      {/* Image Cropper */}
      <AnimatePresence>
        {showCropper && imageToCrop && (
          <ImageCropper
            image={imageToCrop}
            onComplete={handleCropComplete}
            onCancel={() => { setShowCropper(false); setImageToCrop(null); setSelectedFile(null); }}
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
          (!!formData.pdf_file  && formData.pdf_file  !== (certificate?.pdf_file  || ''))
        }
      />
      </>
    </Portal>
  );
}