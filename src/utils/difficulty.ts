import type { Project } from '../types/api'

export type Difficulty = { label: string; stars: number; color: string }

// Deterministic difficulty from the project's own signals — no fake numbers.
export function getDifficulty(project: Project): Difficulty {
  const tags = (project.tags || []).map(t => t.toLowerCase())
  let score = 0
  if (tags.some(t => /unity|unreal|godot|game|3d/.test(t))) score += 2
  if (tags.some(t => /react|node|api|backend|database|postgres|sql/.test(t))) score += 2
  if (tags.length >= 4) score += 1
  if ((project.description || '').length > 160) score += 1

  if (score >= 5) return { label: 'LEGENDARY', stars: 5, color: '#ffd700' }
  if (score >= 3) return { label: 'EPIC',      stars: 4, color: '#c084fc' }
  if (score >= 2) return { label: 'HARD',      stars: 3, color: '#00d4ff' }
  return { label: 'NORMAL', stars: 2, color: '#4f8cff' }
}

/** Release stage derived from the links that actually exist — never invented. */
export function getStage(project: Project): { label: string; color: string } {
  const types = (project.links || []).map(l => l.type)
  if (types.includes('demo') || types.includes('website')) return { label: 'LIVE', color: '#39d353' }
  if (types.includes('github')) return { label: 'SOURCE', color: '#4f8cff' }
  return { label: 'LOGGED', color: '#8892a4' }
}
