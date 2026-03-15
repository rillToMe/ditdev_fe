import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, Plus, Github, Globe, Monitor } from 'lucide-react';
import api, { getImageUrl } from '../services/api';
import ImageCropper from './ImageCropper';
import Portal from './Portal';

const S = {
  overlay : 'fixed inset-0 z-50 flex items-center justify-center p-4',
  backdrop: 'absolute inset-0 bg-black/75 backdrop-blur-sm',
  modal   : 'relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col',

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

  divider: 'border-t border-[rgba(79,140,255,0.08)]',
};

const pixelClip = 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)';
const pixelClipLg = 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)';

const LINK_TYPES = [
  { value: 'github',  label: 'GitHub',  Icon: Github,  color: '#94a3b8' },
  { value: 'demo',    label: 'Demo',    Icon: Monitor, color: '#00d4ff' },
  { value: 'website', label: 'Website', Icon: Globe,   color: '#4f8cff' },
];

function PixelSpinner({ color = '#4f8cff' }) {
  return (
    <div className="w-4 h-4 border-2 rounded-full animate-spin"
      style={{ borderColor: `${color}30`, borderTopColor: color }} />
  );
}

function Field({ label, delay = 0, children }) {
  return (
    <motion.div
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <label className={S.label}>{label}</label>
      {children}
    </motion.div>
  );
}

export default function ProjectModal({ project, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title      : project?.title       || '',
    description: project?.description || '',
    thumbnail  : project?.thumbnail   || '',
    tags       : project?.tags        || [],
    links      : project?.links       || [],
  });
  const [tagInput,  setTagInput]  = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const [imageToCrop,  setImageToCrop]  = useState(null);
  const [showCropper,  setShowCropper]  = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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
      const data = await api.uploadImage(croppedFile, 'projects');
      setFormData(prev => ({ ...prev, thumbnail: data.data.path }));
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setImageToCrop(null);
      setSelectedFile(null);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !formData.tags.includes(t)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, t] }));
      setTagInput('');
    }
  };
  const removeTag = (tag) =>
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const addLink    = () => setFormData(prev => ({ ...prev, links: [...prev.links, { type: 'github', url: '' }] }));
  const removeLink = (i) => setFormData(prev => ({ ...prev, links: prev.links.filter((_, idx) => idx !== i) }));
  const updateLink = (i, field, val) => {
    const next = [...formData.links];
    next[i][field] = val;
    setFormData(prev => ({ ...prev, links: next }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      project ? await api.updateProject(project.id, formData) : await api.createProject(formData);
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
        className={S.overlay}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className={S.backdrop} />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.94, y: 24, opacity: 0 }}
          animate={{ scale: 1,    y: 0,  opacity: 1 }}
          exit={{ scale: 0.94,    y: 24, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className={S.modal}
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
              {/* Pixel accent */}
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#4f8cff]"  style={{ clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' }} />
                <div className="w-2 h-2 bg-[#00d4ff]/60" style={{ clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' }} />
              </div>
              <h2 className="font-pixel text-xs tracking-widest text-[#e2e8f0]">
                {project ? '// EDIT_PROJECT' : '// NEW_PROJECT'}
              </h2>
            </div>
            <motion.button
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 text-[rgba(148,163,184,0.4)] hover:text-[rgba(148,163,184,0.8)] transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Form body */}
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
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={S.input}
                style={{ clipPath: pixelClip }}
                placeholder="Project title"
                required
              />
            </Field>

            {/* Description */}
            <Field label="Description *" delay={0.1}>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={S.input + ' resize-none'}
                style={{ clipPath: 'none' }}
                rows={4}
                placeholder="Project description"
                required
              />
            </Field>

            {/* Thumbnail */}
            <Field label="Thumbnail" delay={0.15}>
              <div className="space-y-3">
                {/* Upload button */}
                <label
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer transition-all duration-200 group"
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

                {/* Upload indicator */}
                {uploading && (
                  <div className="flex items-center gap-2">
                    <PixelSpinner />
                    <span className="font-mono text-xs text-[rgba(79,140,255,0.6)]">uploading image...</span>
                  </div>
                )}

                {/* Preview */}
                {formData.thumbnail && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group overflow-hidden"
                    style={{ clipPath: pixelClip }}
                  >
                    <img
                      src={getImageUrl(formData.thumbnail)}
                      alt="Preview"
                      className="w-full h-44 object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <span className="font-pixel text-[10px] text-white/80 tracking-widest">PREVIEW</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                        className="p-1.5 bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/40 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Pixel corner accent */}
                    <div className="absolute top-0 right-0 w-4 h-4 bg-[#4f8cff]/20 border-l border-b border-[#4f8cff]/30" />
                  </motion.div>
                )}
              </div>
            </Field>

            {/* Tags */}
            <Field label="Tags" delay={0.2}>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
                  className={S.input + ' flex-1'}
                  style={{ clipPath: pixelClip }}
                  placeholder="Add tag, press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 font-pixel text-[10px] tracking-widest text-[#4f8cff] border border-[rgba(79,140,255,0.3)] hover:bg-[rgba(79,140,255,0.1)] transition-all"
                  style={{ clipPath: pixelClip }}
                >
                  + ADD
                </button>
              </div>

              {/* Tag chips */}
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {formData.tags.map(tag => (
                    <motion.span
                      key={tag}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-1.5 px-3 py-1 font-mono text-xs"
                      style={{
                        background: 'rgba(0,212,255,0.06)',
                        border    : '1px solid rgba(0,212,255,0.2)',
                        color     : 'rgba(0,212,255,0.8)',
                        clipPath  : pixelClip,
                      }}
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}
                        className="hover:text-white transition-colors ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </Field>

            {/* Links */}
            <Field label="Links" delay={0.25}>
              <div className="space-y-2">
                <AnimatePresence>
                  {formData.links.map((link, i) => {
                    const typeConf = LINK_TYPES.find(t => t.value === link.type) || LINK_TYPES[0];
                    const Icon     = typeConf.Icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0  }}
                        exit={{ opacity: 0, x: 16    }}
                        className="flex gap-2"
                      >
                        {/* Type select */}
                        <div className="relative">
                          <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: typeConf.color }} />
                          <select
                            value={link.type}
                            onChange={e => updateLink(i, 'type', e.target.value)}
                            className="pl-8 pr-3 py-3 font-mono text-xs appearance-none cursor-pointer"
                            style={{
                              background: '#0a0e1a',
                              border    : '1px solid rgba(79,140,255,0.15)',
                              color     : typeConf.color,
                              clipPath  : pixelClip,
                              outline   : 'none',
                            }}
                          >
                            {LINK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>

                        {/* URL input */}
                        <input
                          type="url"
                          value={link.url}
                          onChange={e => updateLink(i, 'url', e.target.value)}
                          placeholder="https://..."
                          className={S.input + ' flex-1'}
                          style={{ clipPath: pixelClip }}
                        />

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeLink(i)}
                          className="px-3 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                          style={{ clipPath: pixelClip }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={addLink}
                className="mt-2 flex items-center gap-1.5 font-pixel text-[10px] tracking-widest text-[rgba(79,140,255,0.5)] hover:text-[rgba(79,140,255,0.9)] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                ADD LINK
              </button>
            </Field>

            {/* Actions */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0,  opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3 pt-4"
              style={{ borderTop: '1px solid rgba(79,140,255,0.08)' }}
            >
              <button type="button" onClick={onClose} className={S.btnGhost} style={{ clipPath: pixelClip }}>
                CANCEL
              </button>
              <button
                type="submit"
                disabled={saving}
                className={S.btnPrimary}
                style={{ clipPath: pixelClip }}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <PixelSpinner /> SAVING...
                  </span>
                ) : (
                  project ? 'UPDATE PROJECT' : 'CREATE PROJECT'
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
            aspectRatio={16 / 9}
          />
        )}
      </AnimatePresence>
      </>
    </Portal>
  );
}