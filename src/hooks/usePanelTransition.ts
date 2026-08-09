import { useEffect, useState, useCallback, useRef } from 'react'

const NORMAL_DURATION = 250
const FAST_DURATION = 100
const FAST_THRESHOLD = 300
const EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)'

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function usePanelTransition() {
  const [duration, setDuration] = useState(NORMAL_DURATION)
  const lastNavRef = useRef<number>(0)

  const getDuration = useCallback(() => {
    if (prefersReducedMotion()) return 0
    return duration
  }, [duration])

  const notifyNavigation = useCallback(() => {
    const now = Date.now()
    const elapsed = now - lastNavRef.current
    if (elapsed < FAST_THRESHOLD && lastNavRef.current > 0) {
      setDuration(FAST_DURATION)
    } else {
      setDuration(NORMAL_DURATION)
    }
    lastNavRef.current = now
  }, [])

  const reset = useCallback(() => {
    setDuration(NORMAL_DURATION)
    lastNavRef.current = 0
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => {
      if (mediaQuery.matches) {
        setDuration(0)
      } else {
        setDuration(NORMAL_DURATION)
      }
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return {
    duration: getDuration(),
    easing: EASING,
    notifyNavigation,
    reset,
  }
}
