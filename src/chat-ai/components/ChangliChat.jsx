import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiZap } from 'react-icons/fi';
import { useChat } from '../hooks/useChat';
import MarkdownRenderer from './MarkdownRenderer';

import avatarImg from '../../assets/img/icons/ai_icon.jpg';

function NpcAvatar({ size = 32, pulse = false }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {/* Scan-line glow pulse */}
      {pulse && (
        <div
          className="absolute -inset-1 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(0,212,255,0.25) 0%, transparent 70%)',
            borderRadius: '2px',
          }}
        />
      )}

      {/* Pixel-cut frame border */}
      <div
        className="absolute inset-0 border-2 border-pixel-cyan/70 z-10 pointer-events-none"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
        }}
      />

      {/* Source image */}
      <div
        className="w-full h-full overflow-hidden"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
        }}
      >
        <img
          src={avatarImg}
          alt="Changli"
          className="w-full h-full object-cover object-top"
          style={{
            filter: 'saturate(0.85) brightness(0.9) contrast(1.05)',
          }}
        />

        {/* Cyan tint overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(0,212,255,0.05)' }}
        />
      </div>

      {/* Online dot */}
      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-bg-primary z-20" />
    </div>
  );
}

//Single message bubble 
function MessageBubble({ message }) {
  const isAI = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-2 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      {isAI && <NpcAvatar size={28} />}

      <div
        className={`max-w-[85%] px-3 py-2.5 font-mono ${
          isAI
            ? 'bg-bg-hover/60 border border-pixel-blue/20 text-pixel-white/90'
            : 'bg-pixel-blue/15 border border-pixel-blue/40 text-pixel-white ml-auto'
        }`}
        style={{
          clipPath: isAI
            ? 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
            : 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)',
          background: isAI ? '#0d1528' : '#0a1a3a',
        }}
      >
        {isAI ? (
          <MarkdownRenderer content={message.content} />
        ) : (
          <p className="text-[11px] leading-relaxed">{message.content}</p>
        )}
      </div>
    </motion.div>
  );
}

//Typing indicator 
function TypingIndicator() {
  return (
    <div className="flex gap-2 items-center">
      <NpcAvatar size={28} />
      <div
        className="px-3 py-2.5 border border-pixel-blue/20 flex items-center gap-1"
        style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)', background: '#0d1528' }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-pixel-cyan/70"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}

//Main widget 
export default function ChangliChat() {
  const {
    messages, input, setInput, isLoading,
    isOpen, setIsOpen, sendMessage,
    sectionHint, setSectionHint, quickPrompts,
  } = useChat();

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/*Section hint toast*/}
      <AnimatePresence>
        {sectionHint && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-24 right-6 z-40 max-w-[220px] cursor-pointer"
            onClick={() => { setIsOpen(true); setSectionHint(null); }}
          >
            <div
              className="bg-bg-secondary/95 border border-pixel-cyan/30 px-3 py-2.5 backdrop-blur-sm"
              style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
            >
              <p className="font-pixel text-[7px] text-pixel-cyan mb-1">CHANGLI-AI</p>
              <p className="font-mono text-pixel-white/80 text-xs leading-relaxed">{sectionHint}</p>
            </div>
            {/* Arrow pointing to button */}
            <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-bg-secondary border-r border-b border-pixel-cyan/30 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/*FAB button*/}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        title="Talk to CHANGLI-AI"
      >
        {/* Glow halo */}
        <div
          className="absolute -inset-1 animate-pulse pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Pixel-cut border frame */}
        <div
          className="absolute inset-0 border-2 border-pixel-cyan/80 pointer-events-none z-10"
          style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
        />

        {/* Photo + close icon container */}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex items-center justify-center bg-bg-secondary/90 z-20"
              style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
            >
              <FiX className="text-pixel-cyan text-xl" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
            >
              {/* IMG */}
              <img
                src={avatarImg}
                alt="CHANGLI"
                className="w-full h-full object-cover object-top"
                style={{ filter: 'saturate(0.8) brightness(0.85) contrast(1.1)' }}
              />

              {/* Cyan tint */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,212,255,0.07)' }} />

              <div className="absolute bottom-0 left-0 right-0 bg-black/60 flex items-center justify-center py-0.5">
                <span className="font-pixel text-pixel-cyan text-[6px] tracking-widest">CHANGLI</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Online dot */}
        <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-bg-primary z-30" />
      </motion.button>

      {/*Chat panel*/}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col"
            style={{
              height: '520px',
              clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
            }}
          >
            {/* Panel background */}
            <div className="absolute inset-0 border border-pixel-cyan/30" style={{ background: "#080c18" }} />

            {/* Content */}
            <div className="relative flex flex-col h-full">

              {/*Header*/}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-pixel-blue/15">
                <NpcAvatar size={36} pulse />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-pixel text-pixel-cyan text-[10px]">CHANGLI-AI</p>
                    <span className="font-mono text-green-400 text-[9px]">● ONLINE</span>
                  </div>
                  <p className="font-mono text-pixel-gray/50 text-[9px] truncate">
                    Guardian of Rahmat's Portfolio · Quest Guide
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-pixel-gray/40 hover:text-pixel-white transition-colors p-1"
                >
                  <FiX className="text-sm" />
                </button>
              </div>

              {/*Messages*/}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>

              {/*Quick prompts*/}
              {messages.length <= 1 && (
                <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                  {quickPrompts.map(({ label, text }) => (
                    <button
                      key={label}
                      onClick={() => sendMessage(text)}
                      className="font-mono text-[10px] text-pixel-blue/70 border border-pixel-blue/20 px-2 py-1 hover:border-pixel-blue/60 hover:text-pixel-blue hover:bg-pixel-blue/5 transition-all"
                      style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/*Input*/}
              <div className="px-3 pb-3 border-t border-pixel-blue/10 pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Ask the guide..."
                      maxLength={500}
                      className="w-full px-3 py-2 border border-pixel-blue/20 font-mono text-xs text-pixel-white placeholder-pixel-gray/30 focus:outline-none focus:border-pixel-cyan/50 transition-all" style={{ background: '#060a14' }}
                    />
                  </div>
                  <button
                    onClick={() => sendMessage()}
                    disabled={isLoading || !input.trim()}
                    className="w-9 h-9 flex items-center justify-center border border-pixel-blue/30 bg-pixel-blue/10 text-pixel-blue hover:bg-pixel-blue/25 hover:border-pixel-blue/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {isLoading
                      ? <FiZap className="text-sm animate-pulse text-pixel-cyan" />
                      : <FiSend className="text-sm" />
                    }
                  </button>
                </div>
                <p className="font-pixel text-pixel-gray/20 text-[7px] mt-1.5 text-center">
                  CHANGLI-AI · REALM GUIDE v1.0
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}