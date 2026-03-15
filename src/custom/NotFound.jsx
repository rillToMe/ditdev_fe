import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DEATH_MESSAGES = [
  'The page you seek does not exist in this realm.',
  'You have wandered beyond the map boundary.',
  'This URL leads only to the void.',
  'A 404 error has slain you.',
  'The quest marker points to nothing.',
];

export default function NotFound() {
  const navigate = useNavigate();
  const [phase,   setPhase]   = useState('fade-in');  // fade-in → died → respawn
  const [message, setMessage] = useState('');
  const [souls,   setSouls]   = useState(0);

  useEffect(() => {
    setMessage(DEATH_MESSAGES[Math.floor(Math.random() * DEATH_MESSAGES.length)]);
    // Random souls lost
    setSouls(Math.floor(Math.random() * 9000) + 1000);

    // Phase sequence
    const t1 = setTimeout(() => setPhase('died'),   800);
    return () => clearTimeout(t1);
  }, []);

  const handleRespawn = () => {
    setPhase('respawn');
    setTimeout(() => navigate('/'), 800);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#050709' }}
    >
      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.85) 100%)' }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)' }}
      />

      <AnimatePresence mode="wait">

        {/* Phase: YOU DIED */}
        {phase === 'died' && (
          <motion.div
            key="died"
            className="flex flex-col items-center gap-8 relative z-10"
          >
            {/* YOU DIED text - big, red, cinematic */}
            <motion.div
              initial={{ opacity: 0, scaleX: 2.5, scaleY: 0.3 }}
              animate={{ opacity: 1, scaleX: 1,   scaleY: 1   }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <h1
                className="font-pixel tracking-[0.15em] select-none"
                style={{
                  fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                  color: '#8b0000',
                  textShadow: '0 0 40px #8b000099, 0 0 80px #8b000044, 0 2px 0 #000',
                  letterSpacing: '0.2em',
                }}
              >
                YOU DIED
              </h1>
            </motion.div>

            {/* 404 badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-px bg-red-900/60" />
              <p className="font-pixel text-red-900/80 text-xs tracking-widest">ERROR 404</p>
              <div className="w-12 h-px bg-red-900/60" />
            </motion.div>

            {/* Death message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="font-mono text-center max-w-xs leading-relaxed"
              style={{ color: 'rgba(180,160,140,0.7)', fontSize: '0.8rem' }}
            >
              {message}
            </motion.p>

            {/* Souls lost */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col items-center gap-1"
            >
              <p className="font-pixel text-yellow-700/60 text-[10px] tracking-widest">LOST</p>
              <p
                className="font-pixel"
                style={{ color: '#b8a060', fontSize: '1.4rem', textShadow: '0 0 12px #b8a06044' }}
              >
                {souls.toLocaleString()}
              </p>
              <p className="font-pixel text-yellow-700/50 text-[10px] tracking-widest">SOULS</p>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ delay: 1.2 }}
              className="flex flex-col items-center gap-3 mt-2"
            >
              {/* Respawn */}
              <button
                onClick={handleRespawn}
                className="group relative font-pixel text-xs px-8 py-3 transition-all duration-200"
                style={{
                  color: '#c8b89a',
                  border: '1px solid rgba(180,150,100,0.3)',
                  background: 'rgba(180,150,100,0.05)',
                  clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(180,150,100,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(180,150,100,0.6)';
                  e.currentTarget.style.color = '#e8d0aa';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(180,150,100,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(180,150,100,0.3)';
                  e.currentTarget.style.color = '#c8b89a';
                }}
              >
                ↺ &nbsp; RESPAWN AT HOMEPAGE
              </button>

              {/* Go back */}
              <button
                onClick={() => navigate(-1)}
                className="font-mono text-[11px] transition-colors duration-200"
                style={{ color: 'rgba(140,120,100,0.5)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(180,160,130,0.8)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(140,120,100,0.5)'}
              >
                ← return to previous area
              </button>
            </motion.div>

            {/* CHANGLI-AI hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="font-pixel absolute bottom-[-80px] text-center"
              style={{ color: 'rgba(79,140,255,0.25)', fontSize: '8px', letterSpacing: '0.15em' }}
            >
              CHANGLI-AI: "Even in death, the realm remembers you, traveler."
            </motion.p>
          </motion.div>
        )}

        {/* Phase: fade-in (initial black screen) */}
        {phase === 'fade-in' && (
          <motion.div
            key="fadein"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="fixed inset-0 bg-black z-20"
          />
        )}

        {/* Phase: respawn flash */}
        {phase === 'respawn' && (
          <motion.div
            key="respawn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-white z-20"
          />
        )}

      </AnimatePresence>

      {/* Corner decoration */}
      <div className="absolute top-4 left-4 font-pixel text-red-900/20 text-[9px] tracking-widest">
        REALM_404
      </div>
      <div className="absolute bottom-4 right-4 font-pixel text-red-900/15 text-[8px]">
        v2.0.0
      </div>
    </div>
  );
}