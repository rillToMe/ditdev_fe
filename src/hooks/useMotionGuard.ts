import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * true while the document tab is visible (foreground). Backgrounded tabs stop
 * painting, so any rAF loop kept alive there is pure wasted battery.
 */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() =>
    typeof document === 'undefined' ? true : document.visibilityState !== 'hidden',
  )

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return visible
}

/**
 * Single gate for every canvas / rAF loop and any JS-driven motion.
 *
 * Returns `false` when the user asked for reduced motion (`useReducedMotion`
 * already folds in the app-wide `MotionConfig reducedMotion="user"`) OR when the
 * tab is hidden. CSS keyframes are already neutralised by the global
 * `prefers-reduced-motion` block in index.css — this closes the same gap for
 * the imperative canvas loops, which CSS can never reach.
 */
export function useMotionActive(): boolean {
  const reduced = useReducedMotion()
  const visible = usePageVisible()
  return !reduced && visible
}

export default useMotionActive
