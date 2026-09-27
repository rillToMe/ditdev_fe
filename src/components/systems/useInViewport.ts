import { useEffect, useRef, useState } from 'react'

interface Options {
  /** Grow the viewport so animation loops can warm up just before entering. */
  rootMargin?: string
  threshold?: number
  /** Stop observing after the first intersection. */
  once?: boolean
}

/**
 * Track whether an element is on screen. Used to pause the heavy canvas /
 * rAF loops when a section scrolls out of view — previously every loop ran
 * for the whole lifetime of the page.
 */
export function useInViewport<T extends HTMLElement = HTMLDivElement>({
  rootMargin = '200px',
  threshold = 0,
  once = false,
}: Options = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) observer.disconnect()
      },
      { rootMargin, threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, threshold, once])

  return { ref, inView }
}

export default useInViewport
