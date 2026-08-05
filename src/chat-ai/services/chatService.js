// src/chat-ai/services/chatService.js
// API caller ke backend CHANGLI-AI endpoint

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Send chat messages to CHANGLI-AI
 * @param {Array<{role: string, content: string}>} messages
 * @param {string} currentSection
 * @returns {Promise<string>} AI reply text
 */
export async function sendChatMessage(messages, currentSection = '') {
  const res = await fetch(`${API_BASE}/chat`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ messages, currentSection }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to reach CHANGLI-AI');
  }

  return data.reply;
}
