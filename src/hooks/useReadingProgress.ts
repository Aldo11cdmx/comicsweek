import { useCallback } from 'react'

export interface ReadingProgress {
  fileName: string
  fileHash: string
  currentPage: number
  currentPanel: number
  viewerMode: 'panel' | 'free'
  brightness: number
  contrast: number
  lastOpened: number
}

const STORAGE_KEY_PREFIX = 'comicsweek-progress-'
const MAX_ENTRIES = 50

function hashFile(fileName: string, fileSize: number): string {
  const raw = `${fileName}:${fileSize}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `progress-${Math.abs(hash)}`
}

function loadProgress(key: string): ReadingProgress | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ReadingProgress
    if (!parsed || !parsed.fileHash || !Number.isFinite(parsed.currentPage)) return null
    return parsed
  } catch {
    return null
  }
}

function saveProgress(key: string, progress: ReadingProgress) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(progress))
  } catch {
    // ignore
  }
}

function pruneOldEntries() {
  if (typeof window === 'undefined') return
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keys.push(key)
      }
    }
    if (keys.length > MAX_ENTRIES) {
      const entries = keys
        .map(key => {
          try {
            const raw = localStorage.getItem(key)
            const parsed = raw ? JSON.parse(raw) : null
            return { key, lastOpened: parsed?.lastOpened || 0 }
          } catch {
            return { key, lastOpened: 0 }
          }
        })
        .sort((a, b) => a.lastOpened - b.lastOpened)

      const toRemove = entries.slice(0, entries.length - MAX_ENTRIES)
      for (const entry of toRemove) {
        localStorage.removeItem(entry.key)
      }
    }
  } catch {
    // ignore
  }
}

export function useReadingProgress() {
  const getKey = useCallback((fileName: string, fileSize: number) => {
    return `${STORAGE_KEY_PREFIX}${hashFile(fileName, fileSize)}`
  }, [])

  const getProgress = useCallback((fileName: string, fileSize: number): ReadingProgress | null => {
    const key = getKey(fileName, fileSize)
    return loadProgress(key)
  }, [getKey])

  const saveProgressData = useCallback((data: Omit<ReadingProgress, 'lastOpened'>) => {
    const key = `${STORAGE_KEY_PREFIX}${data.fileHash}`
    const progress: ReadingProgress = {
      ...data,
      lastOpened: Date.now(),
    }
    saveProgress(key, progress)
    pruneOldEntries()
  }, [])

  const clearProgress = useCallback((fileName: string, fileSize: number) => {
    const key = getKey(fileName, fileSize)
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  }, [getKey])

  return {
    getProgress,
    saveProgressData,
    clearProgress,
  }
}
