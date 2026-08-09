import { useState, useCallback } from 'react'

export interface ReadingStats {
  totalComicsRead: number
  totalPagesRead: number
  totalReadingTimeMs: number
  streakDays: number
  lastReadDate: string | null
  pagesPerDay: { date: string; pages: number }[]
  longestComicPages: number
  longestComicTitle: string
}

const STORAGE_KEY = 'comicsweek-stats'

function loadStats(): ReadingStats {
  if (typeof window === 'undefined') {
    return getDefaultStats()
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as ReadingStats
    }
  } catch {
    // ignore
  }
  return getDefaultStats()
}

function getDefaultStats(): ReadingStats {
  return {
    totalComicsRead: 0,
    totalPagesRead: 0,
    totalReadingTimeMs: 0,
    streakDays: 0,
    lastReadDate: null,
    pagesPerDay: [],
    longestComicPages: 0,
    longestComicTitle: '',
  }
}

function saveStats(stats: ReadingStats) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // ignore
  }
}

export function useReadingStats() {
  const [stats, setStats] = useState<ReadingStats>(() => loadStats())

  const recordSession = useCallback((pagesRead: number, durationMs: number, comicTitle: string) => {
    setStats(prev => {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      let newStreak = prev.streakDays
      if (prev.lastReadDate === today) {
        // same day, keep streak
      } else if (prev.lastReadDate === yesterday) {
        newStreak += 1
      } else if (prev.lastReadDate !== today) {
        newStreak = 1
      }

      const pagesPerDay = [...prev.pagesPerDay]
      const todayEntry = pagesPerDay.find(p => p.date === today)
      if (todayEntry) {
        todayEntry.pages += pagesRead
      } else {
        pagesPerDay.push({ date: today, pages: pagesRead })
      }

      const last7 = pagesPerDay.slice(-7)

      const isLongest = pagesRead > prev.longestComicPages
      const newLongestPages = isLongest ? pagesRead : prev.longestComicPages
      const newLongestTitle = isLongest ? comicTitle : prev.longestComicTitle

      const newStats: ReadingStats = {
        totalComicsRead: prev.totalComicsRead + 1,
        totalPagesRead: prev.totalPagesRead + pagesRead,
        totalReadingTimeMs: prev.totalReadingTimeMs + durationMs,
        streakDays: newStreak,
        lastReadDate: today,
        pagesPerDay: last7,
        longestComicPages: newLongestPages,
        longestComicTitle: newLongestTitle,
      }

      saveStats(newStats)
      return newStats
    })
  }, [])

  const reset = useCallback(() => {
    const newStats = getDefaultStats()
    saveStats(newStats)
    setStats(newStats)
  }, [])

  return { stats, recordSession, reset }
}
