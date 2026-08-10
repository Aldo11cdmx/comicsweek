import { useEffect, useRef, useState, useCallback } from 'react'

type PresentationState = 'idle' | 'visible' | 'hidden'

export function usePresentationMode() {
  const [enabled, setEnabled] = useState(false)
  const [uiState, setUiState] = useState<PresentationState>('visible')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const hideTimerRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const resetHideTimer = useCallback(() => {
    clearHideTimer()
    setUiState('visible')
    if (enabled) {
      hideTimerRef.current = window.setTimeout(() => {
        setUiState('hidden')
      }, 3000)
    }
  }, [enabled, clearHideTimer])

  const enterFullscreen = useCallback(async () => {
    try {
      if (containerRef.current && !document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }, [])

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Exit fullscreen error:', error)
    }
  }, [])

  const toggle = useCallback(async () => {
    if (!enabled) {
      setEnabled(true)
      setUiState('visible')
      await enterFullscreen()
      resetHideTimer()
    } else {
      setEnabled(false)
      setUiState('visible')
      clearHideTimer()
      await exitFullscreen()
    }
  }, [enabled, enterFullscreen, exitFullscreen, resetHideTimer, clearHideTimer])

  useEffect(() => {
    if (!enabled) return

    const handleMouseMove = () => resetHideTimer()
    const handleTouchStart = () => resetHideTimer()
    const handleClick = () => resetHideTimer()

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('click', handleClick)
    }
  }, [enabled, resetHideTimer])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    return () => {
      clearHideTimer()
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [clearHideTimer])

  return {
    enabled,
    uiState,
    isFullscreen,
    containerRef,
    toggle,
    resetHideTimer,
    exitFullscreen,
  }
}
