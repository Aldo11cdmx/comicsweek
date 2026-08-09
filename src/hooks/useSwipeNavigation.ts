import { useState, useRef, useCallback } from 'react'

const SWIPE_THRESHOLD = 50
const SPRING_BACK_DURATION = 300

export function useSwipeNavigation(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const swipeRef = useRef<{
    startX: number
    startY: number
    currentX: number
    direction: 'horizontal' | 'vertical' | null
  } | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return
    swipeRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      currentX: e.touches[0].clientX,
      direction: null,
    }
    setIsSwiping(false)
    setSwipeOffset(0)
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!swipeRef.current || e.touches.length !== 1) return
    const dx = e.touches[0].clientX - swipeRef.current.startX
    const dy = e.touches[0].clientY - swipeRef.current.startY

    if (!swipeRef.current.direction) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        swipeRef.current.direction = 'horizontal'
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
        swipeRef.current.direction = 'vertical'
      }
    }

    if (swipeRef.current.direction === 'horizontal') {
      e.preventDefault()
      swipeRef.current.currentX = e.touches[0].clientX
      setSwipeOffset(dx)
      setIsSwiping(true)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!swipeRef.current) return
    const dx = swipeRef.current.currentX - swipeRef.current.startX

    if (Math.abs(dx) > SWIPE_THRESHOLD && swipeRef.current.direction === 'horizontal') {
      if (dx < 0) {
        onSwipeLeft()
      } else {
        onSwipeRight()
      }
    }

    setSwipeOffset(0)
    setIsSwiping(false)
    swipeRef.current = null
  }, [onSwipeLeft, onSwipeRight])

  const containerStyle: React.CSSProperties = isSwiping ? {
    transform: `translateX(${swipeOffset}px)`,
    transition: 'none',
  } : {
    transform: 'translateX(0)',
    transition: `transform ${SPRING_BACK_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
  }

  return {
    isSwiping,
    containerStyle,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}
