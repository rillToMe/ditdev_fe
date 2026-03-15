// easter eggs:
// - Konami code: ↑↑↓↓←→←→BA → special response

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IDLE_TIMEOUT      = 30_000;  
const LONG_IDLE_TIMEOUT = 120_000; 
const SHAKE_THRESHOLD   = 800;     

const IDLE_MESSAGES = [
  {
    title: 'Traveler?',
    body : 'You seem to have wandered off.\nThe realm awaits your return.',
    icon : '👁️',
  },
  {
    title: 'Still there?',
    body : 'The constellation grows dim\nwithout a traveler to guide.',
    icon : '🌌',
  },
  {
    title: 'The realm is quiet...',
    body : 'Even the stars have stopped\nblinking. Are you still here?',
    icon : '⭐',
  },
  {
    title: 'Quest paused.',
    body : 'Your journey through Rahmat\'s\nportfolio has been suspended.',
    icon : '⏸️',
  },
  {
    title: 'I am watching.',
    body : 'CHANGLI-AI never sleeps.\nBut you seem to have.',
    icon : '🤖',
  },
];

const LONG_IDLE_MESSAGES = [
  {
    title: 'HELLO?? 👋',
    body : 'It has been a while, traveler.\nAre you lost in another realm?',
    icon : '📡',
  },
  {
    title: 'System alert.',
    body : 'Inactivity detected for 2+ minutes.\nThe guardian grows impatient.',
    icon : '⚠️',
  },
];

const WAKEUP_MESSAGES = [
  'Welcome back, traveler. ⚔️',
  'The realm lives again.',
  'Quest resumed.',
  'Good, you have returned.',
  'I knew you would come back.',
];

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

function Firefly({ id }) {
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const size   = 2 + Math.random() * 3;
  const dur    = 6 + Math.random() * 8;
  const delay  = Math.random() * 4;
  const color  = ['#00d4ff','#4f8cff','#ffd700','#a29bfe','#55efc4'][Math.floor(Math.random() * 5)];

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, boxShadow: `0 0 ${size * 3}px ${color}`, left: `${startX}%`, top: `${startY}%` }}
      animate={{
        x      : [0, (Math.random()-0.5)*200, (Math.random()-0.5)*150, 0],
        y      : [0, (Math.random()-0.5)*150, (Math.random()-0.5)*200, 0],
        opacity: [0, 0.8, 0.6, 0.9, 0],
        scale  : [0, 1, 1.3, 0.8, 0],
      }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function AFKOverlay({ isIdle, isLongIdle, onWake, konamiActive }) {
  const [msgIndex,   setMsgIndex]   = useState(0);
  const [blink,      setBlink]      = useState(true);
  const [wakeMsg,    setWakeMsg]    = useState(null);
  const [showWake,   setShowWake]   = useState(false);

  useEffect(() => {
    if (!isIdle) return;
    setMsgIndex(Math.floor(Math.random() * IDLE_MESSAGES.length));
    const id = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % IDLE_MESSAGES.length);
    }, 15_000);
    return () => clearInterval(id);
  }, [isIdle]);

  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 600);
    return () => clearInterval(id);
  }, []);

  const handleWake = useCallback(() => {
    const msg = WAKEUP_MESSAGES[Math.floor(Math.random() * WAKEUP_MESSAGES.length)];
    setWakeMsg(msg);
    setShowWake(true);
    setTimeout(() => { setShowWake(false); onWake(); }, 1800);
  }, [onWake]);

  const pool    = isLongIdle ? LONG_IDLE_MESSAGES : IDLE_MESSAGES;
  const current = pool[msgIndex % pool.length];

  const fireflies = Array.from({ length: 18 }, (_, i) => i);

  return (
    <AnimatePresence>
      {isIdle && (
        <motion.div
          key="afk-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="fixed inset-0 z-[9998] cursor-pointer overflow-hidden"
          onClick={handleWake}
          style={{ background: 'rgba(5, 7, 15, 0.88)', backdropFilter: 'blur(2px)' }}
        >
          {/* Fireflies */}
          {fireflies.map(id => <Firefly key={id} id={id} />)}

          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none opacity-20"
            style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.2) 3px, rgba(0,0,0,0.2) 4px)' }} />

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">

            {/* Konami easter egg mode */}
            <AnimatePresence>
              {konamiActive && (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0   }}
                  exit={{ scale: 0 }}
                  className="absolute top-12 left-1/2 -translate-x-1/2 text-center"
                >
                  <p className="font-pixel text-yellow-400 text-sm">★ KONAMI CODE ACTIVATED ★</p>
                  <p className="font-mono text-yellow-400/60 text-xs mt-1">+99 RESPECT POINTS</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CHANGLI-AI card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current.title}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{ opacity: 0, y: -10, scale: 0.97   }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Icon */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-4xl"
                >
                  {current.icon}
                </motion.div>

                {/* Dialog box */}
                <div
                  className="px-8 py-5 max-w-sm text-center"
                  style={{
                    background : 'rgba(10,14,26,0.95)',
                    border     : '1px solid rgba(79,140,255,0.2)',
                    clipPath   : 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
                    boxShadow  : '0 0 40px rgba(79,140,255,0.08)',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="font-pixel text-pixel-cyan text-[9px] tracking-widest">CHANGLI-AI</p>
                  </div>

                  <p className="font-pixel text-pixel-white text-sm mb-2 leading-relaxed">
                    {current.title}
                  </p>
                  <p className="font-mono text-pixel-gray/60 text-xs leading-relaxed whitespace-pre-line">
                    {current.body}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Press any key */}
            <motion.p
              animate={{ opacity: blink ? 0.6 : 0.15 }}
              transition={{ duration: 0.3 }}
              className="font-pixel text-pixel-blue/60 text-[10px] tracking-widest"
            >
              [ PRESS ANY KEY TO CONTINUE ]
            </motion.p>

            {/* Long idle extra */}
            <AnimatePresence>
              {isLongIdle && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="font-pixel text-red-500/50 text-[9px] tracking-widest"
                >
                  ⚠ EXTENDED INACTIVITY DETECTED
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Wake message overlay */}
          <AnimatePresence>
            {showWake && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'rgba(5,7,15,0.7)' }}
              >
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  className="font-pixel text-pixel-cyan text-base tracking-widest"
                >
                  {wakeMsg}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corner tag */}
          <div className="absolute bottom-4 right-4 font-pixel text-pixel-blue/15 text-[8px]">
            AFK MODE · CHANGLI-AI ACTIVE
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function IdleManager({ children }) {
  const [isIdle,       setIsIdle]       = useState(false);
  const [isLongIdle,   setIsLongIdle]   = useState(false);
  const [konamiActive, setKonamiActive] = useState(false);
  const [shakeAlert,   setShakeAlert]   = useState(false);

  const idleTimer     = useRef(null);
  const longIdleTimer = useRef(null);
  const konamiSeq     = useRef([]);
  const lastMousePos  = useRef({ x: 0, y: 0, t: 0 });
  const shakeTimer    = useRef(null);

  const resetIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    clearTimeout(longIdleTimer.current);
    setIsLongIdle(false);

    idleTimer.current = setTimeout(() => {
      setIsIdle(true);
      longIdleTimer.current = setTimeout(() => setIsLongIdle(true), LONG_IDLE_TIMEOUT - IDLE_TIMEOUT);
    }, IDLE_TIMEOUT);
  }, []);

  const handleWake = useCallback(() => {
    setIsIdle(false);
    setIsLongIdle(false);
    setKonamiActive(false);
    resetIdle();
  }, [resetIdle]);

  const handleMouseMove = useCallback((e) => {
    const now = Date.now();
    const dx  = e.clientX - lastMousePos.current.x;
    const dy  = e.clientY - lastMousePos.current.y;
    const dt  = now - lastMousePos.current.t || 1;
    const speed = Math.sqrt(dx*dx + dy*dy) / dt * 1000; 

    lastMousePos.current = { x: e.clientX, y: e.clientY, t: now };

    if (speed > SHAKE_THRESHOLD && !isIdle) {
      clearTimeout(shakeTimer.current);
      setShakeAlert(true);
      shakeTimer.current = setTimeout(() => setShakeAlert(false), 1500);
    }

    resetIdle();
  }, [isIdle, resetIdle]);

  const handleKeyDown = useCallback((e) => {
    if (isIdle) { handleWake(); return; }

    resetIdle();

    konamiSeq.current = [...konamiSeq.current, e.key].slice(-KONAMI.length);
    if (konamiSeq.current.join(',') === KONAMI.join(',')) {
      setKonamiActive(true);
      setIsIdle(true); 
      konamiSeq.current = [];
    }
  }, [isIdle, handleWake, resetIdle]);

  useEffect(() => {
    const events = ['mousedown', 'touchstart', 'scroll', 'click'];

    const onActivity = () => { if (!isIdle) resetIdle(); };

    window.addEventListener('mousemove',  handleMouseMove);
    window.addEventListener('keydown',    handleKeyDown);
    events.forEach(ev => window.addEventListener(ev, onActivity, { passive: true }));

    resetIdle(); 

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown',   handleKeyDown);
      events.forEach(ev => window.removeEventListener(ev, onActivity));
      clearTimeout(idleTimer.current);
      clearTimeout(longIdleTimer.current);
      clearTimeout(shakeTimer.current);
    };
  }, [handleMouseMove, handleKeyDown, resetIdle, isIdle]);

  return (
    <>
      {children}

      {/* AFK Overlay */}
      <AFKOverlay
        isIdle={isIdle}
        isLongIdle={isLongIdle}
        onWake={handleWake}
        konamiActive={konamiActive}
      />

      {/* Mouse shake alert */}
      <AnimatePresence>
        {shakeAlert && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0,  x: '-50%' }}
            exit={{ opacity: 0, y: -10, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-[9997] pointer-events-none"
          >
            {/* <div
              className="px-4 py-2"
              style={{
                background: 'rgba(10,14,26,0.95)',
                border    : '1px solid rgba(79,140,255,0.25)',
                clipPath  : 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
              }}
            >
              <p className="font-pixel text-pixel-cyan text-[9px] tracking-widest whitespace-nowrap">
                ⚡ Easy there, traveler.
              </p>
            </div> */}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}