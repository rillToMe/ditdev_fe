import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiLoader, FiCalendar, FiX } from 'react-icons/fi'
import ZoneHeader from './systems/ZoneHeader'
import PixelIcon from './systems/PixelIcon'
import PixelButton from './systems/PixelButton'
import { certificatesAPI } from '../services/api'
import { scalePop, stagger, assemble, VIEWPORT, DUR, EASE } from '../lib/motion'
import type { Certificate } from '../types/api'

const FALLBACK_CERTS: Certificate[] = [
  {
    id: 1,
    title: 'Unity Game Development',
    provider: 'Unity Technologies',
    thumbnail: null,
    issue_date: '2023-01-01',
    credential_url: null,
    pdf_file: '',
    created_at: '',
  },
]

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : null

/* ── Credential card: framed certificate document ─────────────────────── */
function CertCard({ cert, index, onClick }: { cert: Certificate; index: number; onClick: () => void }) {
  const date = formatDate(cert.issue_date)

  return (
    <motion.button
      type="button"
      variants={scalePop}
      onClick={onClick}
      className="group relative flex flex-col items-center text-center p-5 border border-yellow-400/15 bg-bg-card/30 hover:border-yellow-400/45 hover:bg-bg-hover/30 transition-colors outline-none focus-visible:border-yellow-400/70"
      style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
      aria-label={`View ${cert.title}`}
    >
      {/* Certificate document */}
      <div className="relative w-full mb-4 mt-1">
        <div className="relative w-full aspect-[4/3] border-2 border-yellow-400/35 bg-bg-primary/60 overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]">
          {/* inner hairline frame */}
          <div className="absolute inset-1.5 border border-yellow-400/15 pointer-events-none z-10" />

          {cert.thumbnail ? (
            <img src={cert.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <PixelIcon name="certificate" size={26} className="text-yellow-400/60" />
              <span className="font-pixel text-[6px] tracking-widest text-yellow-400/40">CERTIFIED</span>
            </div>
          )}

          {/* Wax seal */}
          <div
            className="absolute -bottom-2 -right-2 w-9 h-9 flex items-center justify-center bg-gradient-to-br from-yellow-300 to-amber-600 border-2 border-yellow-200/60 z-20"
            style={{ clipPath: 'polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%)' }}
          >
            <PixelIcon name="check" size={13} className="text-bg-primary" />
          </div>

          {/* Shine sweep on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none overflow-hidden z-10">
            <div className="scan-sweep absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-yellow-200/25 to-transparent" />
          </div>
        </div>
      </div>

      <h3 className="font-mono text-sm text-pixel-white group-hover:text-yellow-300 transition-colors line-clamp-2 mb-1.5">
        {cert.title}
      </h3>
      <p className="font-mono text-[11px] text-pixel-gray/60 mb-2">{cert.provider}</p>
      {date && (
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-pixel-gray/40">
          <FiCalendar className="text-[10px]" />
          {date}
        </span>
      )}

      <span className="mt-3 inline-flex items-center gap-1 font-pixel text-[7px] tracking-widest text-yellow-400/0 group-hover:text-yellow-400/80 transition-colors">
        INSPECT
        <PixelIcon name="arrowRight" size={9} />
      </span>

      <span className="absolute top-2.5 left-3 font-pixel text-[8px] text-yellow-400/25">
        {String(index + 1).padStart(2, '0')}
      </span>
    </motion.button>
  )
}

/** Grounded HUD corner brackets — crisp L-marks, no glow. */
function CornerBrackets({ className = 'border-pixel-cyan/50' }: { className?: string }) {
  const c = `absolute w-3 h-3 pointer-events-none z-10 ${className}`
  return (
    <>
      <span className={`${c} top-2 left-2 border-t border-l`} />
      <span className={`${c} top-2 right-2 border-t border-r`} />
      <span className={`${c} bottom-2 left-2 border-b border-l`} />
      <span className={`${c} bottom-2 right-2 border-b border-r`} />
    </>
  )
}

function CertModal({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  const date = formatDate(cert.issue_date)
  const recordId = `CERT-${String(cert.id).padStart(3, '0')}`
  const hasActions = !!cert.pdf_file || !!cert.credential_url

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          className="relative max-w-md w-full max-h-[90vh] overflow-y-auto bg-bg-secondary border border-yellow-400/20"
          style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 p-1.5 text-pixel-gray bg-bg-primary/70 border border-white/10 hover:text-pixel-white hover:border-white/25 transition-colors"
            aria-label="Close"
          >
            <FiX size={15} />
          </button>

          {/* Seal viewer */}
          <div className="relative bg-bg-primary">
            {cert.thumbnail ? (
              <div className="relative" style={{ aspectRatio: '16 / 9' }}>
                <img src={cert.thumbnail} alt={cert.title} className="w-full h-full object-cover" />
                <div className="absolute inset-1.5 border border-yellow-400/12 pointer-events-none" />
                <CornerBrackets className="border-pixel-cyan/45" />
              </div>
            ) : (
              <div className="relative h-44 grid-overlay flex flex-col items-center justify-center gap-2">
                <PixelIcon name="certificate" size={28} className="text-yellow-400/40" />
                <span className="font-pixel text-[7px] tracking-widest text-yellow-400/35">NO SEAL IMAGE</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <p className="font-mono text-[11px] tracking-[0.2em] text-pixel-gray/50 mb-3">{recordId}</p>
            <h3 className="font-pixel text-xs leading-relaxed text-pixel-white mb-3">{cert.title}</h3>
            <p className="font-mono text-sm text-pixel-blue">{cert.provider}</p>

            {date && (
              <p className="flex items-center gap-2 font-mono text-xs text-pixel-gray/70 mt-4 pt-4 border-t border-white/10">
                <FiCalendar size={12} />
                Issued {date}
              </p>
            )}

            {hasActions && (
              <div className="flex flex-wrap gap-3 mt-5">
                {cert.pdf_file && (
                  <PixelButton variant="gold" icon="scroll" href={cert.pdf_file}>
                    VIEW PDF
                  </PixelButton>
                )}
                {cert.credential_url && (
                  <PixelButton variant="ghost" icon="external" href={cert.credential_url}>
                    VERIFY
                  </PixelButton>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function Certificates() {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Certificate | null>(null)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 })

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await certificatesAPI.getAll()
        setCerts(res.data?.data || FALLBACK_CERTS)
      } catch {
        setCerts(FALLBACK_CERTS)
      } finally {
        setLoading(false)
      }
    }
    fetchCerts()
  }, [])

  return (
    <section id="certificates" className="relative py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <ZoneHeader
          variant="banner"
          index="04"
          tag="CREDENTIAL ARCHIVE"
          title="Certificate"
          accent="Archive"
          icon="certificate"
          meta={loading ? undefined : `[${certs.length} unlocked]`}
          subtitle="Verified credentials earned across the journey. Inspect one for the full record."
        />

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FiLoader className="text-yellow-400 text-2xl animate-spin mr-3" />
            <span className="font-mono text-pixel-gray text-sm">Loading credentials...</span>
          </div>
        ) : certs.length === 0 ? (
          <div className="text-center py-24 border border-yellow-400/10">
            <p className="font-pixel text-pixel-gray/30 text-xs">NO CREDENTIALS YET</p>
          </div>
        ) : (
          <motion.div
            ref={ref}
            variants={stagger(0.1)}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {certs.map((cert, i) => (
              <CertCard key={cert.id} cert={cert} index={i} onClick={() => setSelected(cert)} />
            ))}
          </motion.div>
        )}

        {/* Archive rail */}
        <motion.div
          variants={assemble}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          transition={{ duration: DUR.slow, ease: EASE.snap, delay: 0.2 }}
          className="mt-6 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"
        />
      </div>

      {selected && <CertModal cert={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
