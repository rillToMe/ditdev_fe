import type { SectionId } from '../../data/site'

/* ── Achievement catalogue ────────────────────────────────────────────
   Every entry maps to a real, observable user action so the HUD meters
   mean something instead of ticking on a random timer. */

export interface AchievementDef {
  id: AchievementId
  title: string
  hint: string
  xp: number
  hidden?: boolean
}

export type AchievementId =
  | 'first_contact'
  | 'explorer'
  | 'quest_complete'
  | 'stargazer'
  | 'shell_hacker'
  | 'konami'
  | 'npc_friend'
  | 'knight_tap'

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_contact',  title: 'FIRST CONTACT',  hint: 'Enter the realm',                       xp: 10 },
  { id: 'explorer',       title: 'EXPLORER',       hint: 'Visit every zone on the map',           xp: 100 },
  { id: 'quest_complete', title: 'QUEST COMPLETE', hint: 'Open 3 project details',                xp: 60 },
  { id: 'stargazer',      title: 'STARGAZER',      hint: 'Inspect 6 skills in the constellation', xp: 50 },
  { id: 'shell_hacker',   title: 'SHELL HACKER',   hint: 'Open the developer console',            xp: 30 },
  { id: 'konami',         title: 'KONAMI',         hint: '↑↑↓↓←→←→BA',                            xp: 99, hidden: true },
  { id: 'npc_friend',     title: 'NPC FRIEND',     hint: 'Talk to CHANGLI-AI',                    xp: 40 },
  { id: 'knight_tap',     title: 'BRAVE KNIGHT',   hint: 'Poke the running knight',               xp: 25, hidden: true },
]

export const ACHIEVEMENT_MAP: Record<AchievementId, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map(a => [a.id, a]),
) as Record<AchievementId, AchievementDef>

export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length

/** Zones the player must visit for EXPLORER. */
export const EXPLORE_TARGET = 8 as const
export type VisitedZones = Set<SectionId>
