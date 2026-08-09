import { useState, useCallback, useEffect } from 'react'
import type { ViewerMode } from './useManualZoom'

const DEBUG_VIEWER_MODE = false

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
