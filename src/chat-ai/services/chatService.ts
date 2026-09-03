// API caller ke backend CHANGLI-AI endpoint
import type { ChatMessage, ChatResponse } from '../../types/api'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

/**
 * Send chat messages to CHANGLI-AI
 * @param messages conversation history (only role/content are sent to the model)
 * @param currentSection scroll-aware section hint
 * @returns AI reply text
 */
export async function sendChatMessage(messages: ChatMessage[], currentSection = ''): Promise<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, currentSection }),
  })

  const data = (await res.json()) as ChatResponse

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to reach CHANGLI-AI')
  }

  return data.reply
}