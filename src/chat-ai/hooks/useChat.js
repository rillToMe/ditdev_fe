// src/chat-ai/hooks/useChat.js
// Manages chat state + scroll-aware section detection

import { useState, useEffect, useRef, useCallback } from 'react';
import { sendChatMessage } from '../services/chatService';

// Opening message dari CHANGLI-AI
const OPENING_MESSAGE = {
  role   : 'assistant',
  content: `🟢 CHANGLI-AI ONLINE

Welcome, traveler.

You've entered Rahmat Aditya's digital realm.
I'm CHANGLI-AI, your guide through this world.

You may ask me about his:
• Projects & quests
• Skills & tech stack
• Achievements & certificates
• Experience & contact

Or simply explore the realm yourself.`,
};

// Section detection untuk scroll awareness
const SECTIONS = [
  { id: 'home',         hint: 'Ah, you stand at the entrance of the realm. Welcome, traveler. ⚔️' },
  { id: 'about',        hint: 'You are reading the lore of Rahmat Aditya. A developer forged by passion. 📖' },
  { id: 'projects',     hint: 'The Quest Log awaits. Each project is a battle Rahmat has conquered. ⚔️' },
  { id: 'certificates', hint: 'The Hall of Achievements. Proof of quests completed and skills earned. 🏆' },
  { id: 'skills',       hint: 'The Skill Tree unfolds before you. Rahmat has been leveling up. 📊' },
  { id: 'contact',      hint: 'The Contact Portal. Ready to begin a new quest together? 🌐' },
];

export function useChat() {
  const [messages,     setMessages]     = useState([OPENING_MESSAGE]);
  const [input,        setInput]        = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [isOpen,       setIsOpen]       = useState(false);
  const [sectionHint,  setSectionHint]  = useState(null);
  const lastSectionRef    = useRef('');
  const currentSectionRef  = useRef('');
  const hintTimerRef   = useRef(null);

  // ── Scroll awareness ──────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + window.innerHeight / 2;

      let current = '';
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop <= scrollY) current = section.id;
      }

      if (current && current !== lastSectionRef.current) {
        lastSectionRef.current   = current;
        currentSectionRef.current = current;
        const found = SECTIONS.find(s => s.id === current);

        // Tampilkan hint hanya kalau chat tidak sedang open
        // dan hanya setelah user sudah interaksi minimal (bukan first load)
        if (found && messages.length > 1) {
          clearTimeout(hintTimerRef.current);
          hintTimerRef.current = setTimeout(() => {
            setSectionHint(found.hint);
            // Auto-hide hint setelah 4 detik
            setTimeout(() => setSectionHint(null), 4000);
          }, 800);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(hintTimerRef.current);
    };
  }, [messages.length]);

  // ── Send message ──────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;

    setInput('');
    setSectionHint(null);

    const userMsg  = { role: 'user', content };
    const newMsgs  = [...messages, userMsg];
    setMessages(newMsgs);
    setIsLoading(true);

    try {
      // Kirim hanya role user/assistant ke backend (skip system)
      const history = newMsgs.filter(m => m.role !== 'system');
      const reply   = await sendChatMessage(history, currentSectionRef.current || '');

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role   : 'assistant',
          content: `A disturbance in the realm...\n\n${err.message}\n\nTry again, traveler.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading]);

  // ── Quick prompts ─────────────────────────────────────
  const quickPrompts = [
    { label: '⚔️ Projects',     text: 'Tell me about his projects' },
    { label: '📊 Skills',       text: 'What is his skill tree?' },
    { label: '🏆 Achievements', text: 'What certificates has he earned?' },
    { label: '📬 Contact',      text: 'How can I contact Rahmat?' },
  ];

  return {
    messages,
    input,
    setInput,
    isLoading,
    isOpen,
    setIsOpen,
    sendMessage,
    sectionHint,
    setSectionHint,
    quickPrompts,
  };
}