import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiLoader, FiExternalLink, FiAward, FiX, FiCalendar } from 'react-icons/fi';
import { certificatesAPI } from '../services/api';

const FALLBACK_CERTS = [
  {
    id: 1,
    title: 'Unity Game Development',
    provider: 'Unity Technologies',
    thumbnail: null,
    issue_date: '2023-01-01',
    credential_url: null,
    pdf_file: null,
  },
];

const CertCard = ({ cert, index, onClick }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onClick={() => onClick(cert)}
      className="group relative cursor-pointer border border-pixel-blue/15 bg-bg-card/40 hover:border-pixel-yellow/40 hover:bg-bg-hover/30 transition-all duration-300 overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
    >
      {/* Thumbnail */}
      <div className="relative h-36 bg-bg-primary border-b border-pixel-blue/10 overflow-hidden">
        {cert.thumbnail ? (
          <img src={cert.thumbnail} alt={cert.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center grid-overlay">
            <FiAward className="text-4xl text-pixel-yellow/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-sans font-semibold text-base text-pixel-white group-hover:text-pixel-yellow transition-colors line-clamp-2 mb-1">
          {cert.title}
        </h3>
        <p className="font-mono text-pixel-gray/60 text-xs mb-2">{cert.provider}</p>
        {cert.issue_date && (
          <div className="flex items-center gap-1.5 text-pixel-gray/40">
            <FiCalendar className="text-xs" />
            <span className="font-mono text-xs">
              {new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
            </span>
          </div>
        )}
      </div>

      {/* Hover badge */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="font-pixel text-[7px] text-pixel-yellow px-2 py-1 bg-pixel-yellow/10 border border-pixel-yellow/30">
          VIEW
        </span>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-3 w-3 h-3 border-t-2 border-r-2 border-pixel-yellow/20 group-hover:border-pixel-yellow/50 transition-colors" />
    </motion.div>
  );
};

const CertModal = ({ cert, onClose }) => {
  if (!cert) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.2 }}
          className="relative max-w-lg w-full bg-bg-secondary border border-pixel-yellow/20 overflow-hidden"
          style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-pixel-blue/10">
            <div className="flex items-center gap-2">
              <FiAward className="text-pixel-yellow" />
              <span className="font-pixel text-pixel-yellow text-xs">CERTIFICATE</span>
            </div>
            <button onClick={onClose} className="text-pixel-gray hover:text-pixel-white transition-colors p-1">
              <FiX />
            </button>
          </div>

          {/* Thumbnail */}
          {cert.thumbnail && (
            <div className="h-48 overflow-hidden bg-bg-primary">
              <img src={cert.thumbnail} alt={cert.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Info */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-sans font-bold text-xl text-pixel-white mb-1">{cert.title}</h3>
              <p className="font-mono text-pixel-blue text-sm">{cert.provider}</p>
            </div>

            {cert.issue_date && (
              <div className="flex items-center gap-2 font-mono text-xs text-pixel-gray/60">
                <FiCalendar />
                <span>Issued: {new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {cert.pdf_file && (
                <a href={cert.pdf_file} target="_blank" rel="noopener noreferrer"
                  className="btn-pixel text-xs flex items-center gap-2">
                  <span>📄</span> View PDF
                </a>
              )}
              {cert.credential_url && (
                <a href={cert.credential_url} target="_blank" rel="noopener noreferrer"
                  className="btn-pixel text-xs flex items-center gap-2">
                  <FiExternalLink /> Verify
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await certificatesAPI.getAll();
        setCerts(res.data?.data || FALLBACK_CERTS);
      } catch {
        setCerts(FALLBACK_CERTS);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  return (
    <section id="certificates" className="relative py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="section-tag mb-3">// 03. certificates</p>
          <div className="flex items-end gap-4 flex-wrap">
            <h2 className="font-sans font-bold text-4xl md:text-5xl text-pixel-white">
              <span className="gradient-text">Achievements</span> Unlocked
            </h2>
            <span className="font-mono text-pixel-gray/40 text-sm mb-1">
              [{certs.length} badges earned]
            </span>
          </div>
          <div className="section-divider max-w-xs mt-4" />
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FiLoader className="text-pixel-blue text-2xl animate-spin mr-3" />
            <span className="font-mono text-pixel-gray text-sm">Loading certificates...</span>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {certs.map((cert, i) => (
              <CertCard key={cert.id} cert={cert} index={i} onClick={setSelected} />
            ))}
          </div>
        )}
      </div>

      {selected && <CertModal cert={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
