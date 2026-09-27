import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ACHIEVEMENT_MAP, EXPLORE_TARGET, TOTAL_ACHIEVEMENTS } from './achievements'
import type { AchievementId } from './achievements'
import type { SectionId } from '../../data/site'

interface AchievementToast {
  id: number
  title: string
  hint: string
  xp: number
}

interface AchievementsState {
  xp: number
  unlocked: Set<AchievementId>
  visited: Set<SectionId>
  /** 0..1 — fraction of zones explored. */
  mapProgress: number
  unlockedCount: number
  total: number
  toasts: AchievementToast[]
  unlock: (id: AchievementId) => void
  visit: (id: SectionId) => void
  /** Increment a named counter and unlock an achievement once it hits `target`. */
  record: (key: string, target: number, id: AchievementId) => void
  dismissToast: (id: number) => void
  consoleOpened: boolean
  markConsoleOpened: () => void
}

const Ctx = createContext<AchievementsState | null>(null)

const BASE_XP = 120

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const [xp, setXp] = useState(BASE_XP)
  const [unlocked, setUnlocked] = useState<Set<AchievementId>>(() => new Set())
  const [visited, setVisited] = useState<Set<SectionId>>(() => new Set())
  const [toasts, setToasts] = useState<AchievementToast[]>([])
  const [consoleOpened, setConsoleOpened] = useState(false)

  // Refs are the authoritative dedup source: they are mutated only inside the
  // callbacks below, never during render, so StrictMode double-invoked effects
  // can't double-fire an unlock.
  const unlockedRef = useRef(unlocked)
  const visitedRef = useRef(visited)
  const toastId = useRef(0)

  const unlock = useCallback((id: AchievementId) => {
    if (unlockedRef.current.has(id)) return
    const def = ACHIEVEMENT_MAP[id]
    if (!def) return

    const next = new Set(unlockedRef.current)
    next.add(id)
    unlockedRef.current = next
    setUnlocked(next)
    setXp(prev => prev + def.xp)

    toastId.current += 1
    const tid = toastId.current
    setToasts(prev => [...prev, { id: tid, title: def.title, hint: def.hint, xp: def.xp }])
    window.setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== tid))
    }, 4200)
  }, [])

  const visit = useCallback((id: SectionId) => {
    if (visitedRef.current.has(id)) return
    const next = new Set(visitedRef.current)
    next.add(id)
    visitedRef.current = next
    setVisited(next)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Generic counter: sections call record('projects_opened', 3, 'quest_complete').
  const countersRef = useRef<Record<string, number>>({})
  const record = useCallback((key: string, target: number, id: AchievementId) => {
    if (unlockedRef.current.has(id)) return
    const next = (countersRef.current[key] || 0) + 1
    countersRef.current[key] = next
    if (next >= target) unlock(id)
  }, [unlock])

  const markConsoleOpened = useCallback(() => setConsoleOpened(true), [])

  // Derived unlocks: keep the "meta" achievements in sync with progress.
  useEffect(() => {
    if (visited.size >= 1) unlock('first_contact')
  }, [visited.size, unlock])

  useEffect(() => {
    if (visited.size >= EXPLORE_TARGET) unlock('explorer')
  }, [visited.size, unlock])

  const mapProgress = Math.min(visited.size / EXPLORE_TARGET, 1)
  const unlockedCount = unlocked.size

  const value = useMemo<AchievementsState>(() => ({
    xp,
    unlocked,
    visited,
    mapProgress,
    unlockedCount,
    total: TOTAL_ACHIEVEMENTS,
    toasts,
    unlock,
    visit,
    record,
    dismissToast,
    consoleOpened,
    markConsoleOpened,
  }), [xp, unlocked, visited, mapProgress, unlockedCount, toasts, unlock, visit, record, dismissToast, consoleOpened, markConsoleOpened])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAchievements(): AchievementsState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAchievements must be used inside <AchievementsProvider>')
  return ctx
}
