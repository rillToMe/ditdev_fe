import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import Portal from './Portal';

const pixelClip = 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)';
const pixelClipLg = 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)';

const inputClass = [
  'w-full px-4 py-3 text-sm font-mono',
  'bg-[#070a14] border border-[rgba(79,140,255,0.15)]',
  'text-[#e2e8f0] placeholder-[rgba(148,163,184,0.3)]',
  'focus:outline-none focus:border-[rgba(79,140,255,0.4)]',
  'transition-all duration-200',
].join(' ');

export default function RegisterAdmin({ onClose }) {
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 4) { setError('Password must be at least 4 characters'); return; }

    setLoading(true);
    try {
      await api.register({ username: formData.username, password: formData.password });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md"
        style={{
          background: '#0a0e1a',
          border    : '1px solid rgba(0,212,255,0.18)',
          clipPath  : pixelClipLg,
          boxShadow : '0 0 60px rgba(0,212,255,0.06), 0 32px 64px rgba(0,0,0,0.7)',
        }}
      >
        {/* Top accent */}
        <div className="h-0.5" style={{ background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.5),rgba(79,140,255,0.3),transparent)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(0,212,255,0.08)', background: 'rgba(0,212,255,0.02)' }}>
          <div className="flex items-center gap-3">
            <div className="p-1.5" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', clipPath: pixelClip }}>
              <UserPlus className="w-4 h-4" style={{ color: '#00d4ff' }} />
            </div>
            <h2 className="font-pixel text-xs tracking-widest text-[#e2e8f0]">// NEW_ADMIN</h2>
          </div>
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 transition-colors" style={{ color: 'rgba(148,163,184,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(148,163,184,0.8)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.35)'}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4 py-8 text-center"
              >
                <div className="w-16 h-16 flex items-center justify-center text-3xl"
                  style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}>
                  ✅
                </div>
                <div>
                  <p className="font-pixel text-sm tracking-widest text-[#00d4ff]">ADMIN CREATED</p>
                  <p className="font-mono text-xs mt-1" style={{ color: 'rgba(148,163,184,0.4)' }}>
                    New admin account has been registered
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block font-pixel text-[9px] tracking-widest text-[rgba(148,163,184,0.5)] mb-1.5 uppercase">
                    Username *
                  </label>
                  <input
                    type="text" value={formData.username}
                    onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                    className={inputClass} style={{ clipPath: pixelClip }}
                    placeholder="enter username" required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block font-pixel text-[9px] tracking-widest text-[rgba(148,163,184,0.5)] mb-1.5 uppercase">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'} value={formData.password}
                      onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                      className={inputClass + ' pr-12'} style={{ clipPath: pixelClip }}
                      placeholder="min 4 characters" required
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'rgba(148,163,184,0.3)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(148,163,184,0.7)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.3)'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block font-pixel text-[9px] tracking-widest text-[rgba(148,163,184,0.5)] mb-1.5 uppercase">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword}
                      onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                      className={inputClass + ' pr-12'} style={{ clipPath: pixelClip }}
                      placeholder="repeat password" required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'rgba(148,163,184,0.3)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(148,163,184,0.7)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.3)'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 px-4 py-3"
                    style={{ background: 'rgba(139,0,0,0.12)', border: '1px solid rgba(239,68,68,0.25)', clipPath: pixelClip }}
                  >
                    <span className="text-red-500 text-xs mt-0.5">⚠</span>
                    <p className="font-mono text-xs text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-3 font-pixel text-[9px] tracking-widest border border-[rgba(148,163,184,0.15)] text-[rgba(148,163,184,0.4)] hover:text-[rgba(148,163,184,0.7)] hover:border-[rgba(148,163,184,0.3)] transition-all"
                    style={{ clipPath: pixelClip }}>
                    CANCEL
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 font-pixel text-[9px] tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', clipPath: pixelClip }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(0,212,255,0.15)'; }}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,255,0.08)'}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(0,212,255,0.3)', borderTopColor: '#00d4ff' }} />
                        CREATING...
                      </span>
                    ) : 'CREATE ADMIN'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
    </Portal>
  );
}