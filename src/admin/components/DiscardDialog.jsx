// components/DiscardDialog.jsx
// Shared confirmation dialog for discarding unsaved modal changes
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Portal from './Portal';

const pixelClip    = 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)';
const pixelClipLg  = 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)';

export default function DiscardDialog({ open, onConfirm, onCancel, isDeleting = false }) {
  if (!open) return null;

  return (
    <Portal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        {/* Backdrop — darker than modal */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

        <motion.div
          initial={{ scale: 0.92, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 12 }}
          transition={{ type: 'spring', damping: 24, stiffness: 340 }}
          className="relative w-full max-w-sm"
          style={{
            background: '#0a0e1a',
            border    : '1px solid rgba(239,68,68,0.25)',
            clipPath  : pixelClipLg,
            boxShadow : '0 0 40px rgba(239,68,68,0.08), 0 24px 48px rgba(0,0,0,0.7)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top accent — red */}
          <div className="h-0.5" style={{ background: 'linear-gradient(90deg,transparent,rgba(239,68,68,0.6),transparent)' }} />

          <div className="px-6 py-6 flex flex-col gap-5">
            {/* Icon + title */}
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center mt-0.5"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', clipPath: pixelClip }}
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="font-pixel text-xs tracking-widest text-[#e2e8f0] mb-1">
                  DISCARD CHANGES?
                </p>
                <p className="font-mono text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.55)' }}>
                  You have unsaved data in this form.
                  {isDeleting
                    ? ' Any uploaded files will also be permanently deleted from storage.'
                    : ' All changes will be lost if you close now.'}
                </p>
              </div>
            </div>

            {/* Uploaded file warning */}
            {isDeleting && (
              <div
                className="flex items-center gap-2 px-3 py-2.5"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', clipPath: pixelClip }}
              >
                <span className="text-red-400 text-xs">⚠</span>
                <p className="font-mono text-xs text-red-400/70">
                  Uploaded image / PDF will be removed from R2 storage.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              {/* Cancel — stay in modal */}
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 font-pixel text-[9px] tracking-widest border transition-all duration-200"
                style={{
                  borderColor: 'rgba(148,163,184,0.15)',
                  color      : 'rgba(148,163,184,0.45)',
                  clipPath   : pixelClip,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.35)'; e.currentTarget.style.color = 'rgba(148,163,184,0.8)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.15)'; e.currentTarget.style.color = 'rgba(148,163,184,0.45)'; }}
              >
                KEEP EDITING
              </button>

              {/* Confirm — discard */}
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 font-pixel text-[9px] tracking-widest transition-all duration-200"
                style={{
                  background : 'rgba(239,68,68,0.08)',
                  border     : '1px solid rgba(239,68,68,0.25)',
                  color      : '#f87171',
                  clipPath   : pixelClip,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.16)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
              >
                YES, DISCARD
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Portal>
  );
}