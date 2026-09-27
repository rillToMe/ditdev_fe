// Shared confirmation dialog for discarding unsaved modal changes
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import type { MouseEvent } from 'react'
import Portal from './Portal'
import { btn } from '../ui'

interface DiscardDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

export default function DiscardDialog({ open, onConfirm, onCancel, isDeleting = false }: DiscardDialogProps) {
  if (!open) return null

  return (
    <Portal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="admin-overlay"
        style={{ zIndex: 90 }}
      >
        {/* Backdrop — darker than modal */}
        <div className="admin-overlay-backdrop" onClick={onCancel} />

        <motion.div
          initial={{ scale: 0.96, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 12 }}
          transition={{ type: 'spring', damping: 24, stiffness: 340 }}
          className="admin-modal"
          style={{ maxWidth: 400 }}
          onClick={(e: MouseEvent) => e.stopPropagation()}
        >
          <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Icon + title */}
            <div className="flex items-start gap-4">
              <div
                style={{
                  flexShrink: 0, width: 40, height: 40, marginTop: 2,
                  display: 'grid', placeItems: 'center', borderRadius: 10,
                  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.28)',
                  color: 'var(--a-red)',
                }}
              >
                <AlertTriangle size={19} />
              </div>
              <div>
                <p style={{ fontSize: 14.5, fontWeight: 650, marginBottom: 5 }}>Discard changes?</p>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--a-muted)' }}>
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
                className="flex items-center gap-2"
                style={{
                  padding: '10px 13px', borderRadius: 'var(--a-radius-sm)',
                  background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                  fontSize: 12.5, color: 'var(--a-red)',
                }}
              >
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span>Uploaded image / PDF will be removed from storage.</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={onCancel} className={btn.ghost + ' flex-1'}>
                Keep editing
              </button>
              <button onClick={onConfirm} className={btn.danger + ' flex-1'}>
                Discard
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Portal>
  )
}
