const STORAGE_KEY = 'comicsweek-night-mode'

import { useState, useEffect, useCallback } from 'react'

type NightMode = 'normal' | 'dark' | 'sepia'

function loadMode(): NightMode {
  if (typeof window === 'undefined') return 'normal'
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'dark' || raw === 'sepia' || raw === 'normal') return raw
  } catch {
    // ignore
  }
  return 'normal'
}

function saveMode(mode: NightMode) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // ignore
  }
}

export function useNightMode() {
  const [mode, setMode] = useState<NightMode>(() => loadMode())

  useEffect(() => {
    saveMode(mode)
  }, [mode])

  const cycle = useCallback(() => {
    setMode(prev => prev === 'normal' ? 'dark' : prev === 'dark' ? 'sepia' : 'normal')
  }, [])

  const getFilter = useCallback(() => {
    switch (mode) {
      case 'dark':
        return 'invert(1) hue-rotate(180deg)'
      case 'sepia':
        return 'sepia(0.8) brightness(0.9)'
      default:
        return ''
    }
  }, [mode])

  return { mode, cycle, filter: getFilter() }
}
