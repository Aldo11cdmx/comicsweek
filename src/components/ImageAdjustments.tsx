import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Sun, Contrast, RotateCcw } from 'lucide-react'

const BRIGHTNESS_MIN = 0.5
const BRIGHTNESS_MAX = 2.0
const CONTRAST_MIN = 0.5
const CONTRAST_MAX = 2.0

export function ImageAdjustments({
  brightness,
  contrast,
  onBrightnessChange,
  onContrastChange,
  onReset,
  isDefault,
}: {
  brightness: number
  contrast: number
  onBrightnessChange: (value: number) => void
  onContrastChange: (value: number) => void
  onReset: () => void
  isDefault: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
          !isDefault ? 'bg-cw-accent/20 text-cw-accent' : 'text-cw-text hover:bg-cw-surface-2'
        }`}
        title="Ajustes de imagen"
      >
        <Sun className="h-4 w-4" />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          ref={panelRef}
          className="absolute bottom-10 right-0 z-30 w-72 rounded-2xl border border-cw-border bg-cw-surface p-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-display text-sm font-bold text-cw-text">Ajustes de imagen</span>
            <button
              onClick={onReset}
              className="flex items-center gap-1 rounded-lg bg-cw-surface-2 px-2 py-1 text-xs text-cw-text-muted transition-colors hover:bg-cw-border hover:text-cw-text"
              title="Restablecer valores"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 text-cw-text-muted">
                  <Sun className="h-3.5 w-3.5" />
                  Brillo
                </label>
                <span className="font-mono text-cw-text">{brightness.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={BRIGHTNESS_MIN}
                max={BRIGHTNESS_MAX}
                step="0.1"
                value={brightness}
                onChange={(e) => onBrightnessChange(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-cw-surface-2 accent-cw-accent"
              />
              <div className="mt-1 flex justify-between text-[10px] text-cw-text-muted">
                <span>{BRIGHTNESS_MIN}</span>
                <span>{BRIGHTNESS_MAX}</span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 text-cw-text-muted">
                  <Contrast className="h-3.5 w-3.5" />
                  Contraste
                </label>
                <span className="font-mono text-cw-text">{contrast.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={CONTRAST_MIN}
                max={CONTRAST_MAX}
                step="0.1"
                value={contrast}
                onChange={(e) => onContrastChange(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-cw-surface-2 accent-cw-accent"
              />
              <div className="mt-1 flex justify-between text-[10px] text-cw-text-muted">
                <span>{CONTRAST_MIN}</span>
                <span>{CONTRAST_MAX}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
