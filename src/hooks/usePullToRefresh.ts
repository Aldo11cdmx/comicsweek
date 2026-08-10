import { useState, useRef, useCallback, useEffect } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  maxPull?: number
}

export function usePullToRefresh({ onRefresh, threshold = 80, maxPull = 120 }: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startYRef = useRef(0)
  const currentYRef = useRef(0)
  const isPullingRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isRefreshing) return
    const container = containerRef.current
    if (!container) return
    if (container.scrollTop > 0) return

    startYRef.current = e.touches[0].clientY
    currentYRef.current = e.touches[0].clientY
    isPullingRef.current = true
  }, [isRefreshing])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return
    const container = containerRef.current
    if (!container) return
    if (container.scrollTop > 0) return

    currentYRef.current = e.touches[0].clientY
    const diff = currentYRef.current - startYRef.current

    if (diff > 0) {
      e.preventDefault()
      const distance = Math.min(diff * 0.5, maxPull)
      setPullDistance(distance)
      setIsPulling(distance > threshold * 0.5)
    }
  }, [isRefreshing, maxPull, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current) return
    isPullingRef.current = false

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(threshold)

      if (navigator.vibrate) {
        navigator.vibrate(10)
      }

      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
        setIsPulling(false)
      }
    } else {
      setPullDistance(0)
      setIsPulling(false)
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const progress = Math.min(pullDistance / threshold, 1)

  return {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    progress,
  }
}
