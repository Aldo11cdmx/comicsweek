import { useState, useCallback, useEffect, useRef } from 'react'

export type ViewerMode = 'panel' | 'free'

const DEBUG_VIEWER_MODE = false
const MIN_SCALE = 1.0
const MAX_SCALE = 5.0

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

const STORAGE_KEY = 'comicsweek-viewer-mode'

function loadMode(): ViewerMode {
  if (typeof window === 'undefined') return 'panel'
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'free') return 'free'
  } catch {
    // ignore
  }
  return 'panel'
}

function saveMode(mode: ViewerMode) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // ignore
  }
}

export function useViewerMode() {
  const [mode, setMode] = useState<ViewerMode>(loadMode)

  useEffect(() => {
    saveMode(mode)
    if (DEBUG_VIEWER_MODE) {
      console.log('[ViewerMode] cambiado a', mode)
    }
  }, [mode])

  const toggleMode = useCallback(() => {
    setMode(prev => (prev === 'panel' ? 'free' : 'panel'))
  }, [])

  const setModeDirect = useCallback((next: ViewerMode) => {
    setMode(next)
  }, [])

  return { mode, toggleMode, setMode: setModeDirect }
}

export function useManualZoom(containerRef: React.RefObject<HTMLDivElement | null>, options?: { enabled?: boolean; onZoomChange?: (scale: number, tx: number, ty: number) => void }) {
  const { enabled = true, onZoomChange } = options || {}
  const [scale, setScale] = useState(1)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [isManual, setIsManual] = useState(false)
  const lastManualRef = useRef<{ tx: number; ty: number; scale: number } | null>(null)

  const resetZoom = useCallback(() => {
    setScale(1)
    setTranslateX(0)
    setTranslateY(0)
    setIsManual(false)
    lastManualRef.current = null
    onZoomChange?.(1, 0, 0)
  }, [onZoomChange])

  const applyManual = useCallback((nextScale: number, tx: number, ty: number) => {
    if (!enabled) return
    setScale(nextScale)
    setTranslateX(tx)
    setTranslateY(ty)
    setIsManual(true)
    lastManualRef.current = { tx, ty, scale: nextScale }
    if (DEBUG_VIEWER_MODE) {
      console.log('[ManualZoom] scale:', nextScale.toFixed(3), 'tx:', tx.toFixed(2), 'ty:', ty.toFixed(2))
    }
    onZoomChange?.(nextScale, tx, ty)
  }, [enabled, onZoomChange])

  const zoomToPoint = useCallback((clientX: number, clientY: number, nextScale: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const tx = (1 - nextScale) * (x / rect.width) * rect.width
    const ty = (1 - nextScale) * (y / rect.height) * rect.height
    applyManual(nextScale, tx, ty)
  }, [applyManual, containerRef])

  const zoomIn = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const nextScale = clamp(scale + 0.5, MIN_SCALE, MAX_SCALE)
    const x = rect.width / 2
    const y = rect.height / 2
    const tx = (1 - nextScale) * x
    const ty = (1 - nextScale) * y
    applyManual(nextScale, tx, ty)
  }, [applyManual, containerRef, scale])

  const zoomOut = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const nextScale = clamp(scale - 0.5, MIN_SCALE, MAX_SCALE)
    const x = rect.width / 2
    const y = rect.height / 2
    const tx = (1 - nextScale) * x
    const ty = (1 - nextScale) * y
    applyManual(nextScale, tx, ty)
  }, [applyManual, containerRef, scale])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!enabled) return false
    if (!e.ctrlKey && !e.metaKey) return false
    e.preventDefault()
    const nextScale = clamp(scale + (e.deltaY < 0 ? 0.2 : -0.2), MIN_SCALE, MAX_SCALE)
    if (nextScale === scale) return true
    zoomToPoint(e.clientX, e.clientY, nextScale)
    return true
  }, [enabled, scale, zoomToPoint])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!enabled) return false
    if (scale > 1.05) {
      resetZoom()
      return true
    }
    const nextScale = 2
    zoomToPoint(e.clientX, e.clientY, nextScale)
    return true
  }, [enabled, scale, resetZoom, zoomToPoint])

  return {
    scale,
    translateX,
    translateY,
    isManual,
    lastManual: lastManualRef.current,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel,
    handleDoubleClick,
    applyManual,
  }
}
