import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY_BRIGHTNESS = 'comicsweek-brightness'
const STORAGE_KEY_CONTRAST = 'comicsweek-contrast'

const DEFAULT_BRIGHTNESS = 1.0
const DEFAULT_CONTRAST = 1.0

const MIN_BRIGHTNESS = 0.5
const MAX_BRIGHTNESS = 2.0
const MIN_CONTRAST = 0.5
const MAX_CONTRAST = 2.0

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

function loadValue(key: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    const parsed = Number(raw)
    if (Number.isFinite(parsed)) {
      return clamp(parsed, 0.5, 2.0)
    }
  } catch {
    // ignore
  }
  return fallback
}

function saveValue(key: string, value: number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // ignore
  }
}

export function useImageAdjustments() {
  const [brightness, setBrightness] = useState<number>(() => loadValue(STORAGE_KEY_BRIGHTNESS, DEFAULT_BRIGHTNESS))
  const [contrast, setContrast] = useState<number>(() => loadValue(STORAGE_KEY_CONTRAST, DEFAULT_CONTRAST))

  useEffect(() => {
    saveValue(STORAGE_KEY_BRIGHTNESS, brightness)
  }, [brightness])

  useEffect(() => {
    saveValue(STORAGE_KEY_CONTRAST, contrast)
  }, [contrast])

  const reset = useCallback(() => {
    setBrightness(DEFAULT_BRIGHTNESS)
    setContrast(DEFAULT_CONTRAST)
  }, [])

  const setBrightnessValue = useCallback((value: number) => {
    setBrightness(clamp(value, MIN_BRIGHTNESS, MAX_BRIGHTNESS))
  }, [])

  const setContrastValue = useCallback((value: number) => {
    setContrast(clamp(value, MIN_CONTRAST, MAX_CONTRAST))
  }, [])

  return {
    brightness,
    contrast,
    setBrightness: setBrightnessValue,
    setContrast: setContrastValue,
    reset,
    isDefault: brightness === DEFAULT_BRIGHTNESS && contrast === DEFAULT_CONTRAST,
  }
}
