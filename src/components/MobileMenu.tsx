import { motion, AnimatePresence } from 'motion/react'
import { ZoomIn, ZoomOut, Sun, Moon, Share2, BookOpenCheck, Settings, X } from 'lucide-react'
import { ImageAdjustments } from '../components/ImageAdjustments'
import type { ViewerMode } from '../hooks/useManualZoom'

export function MobileMenu({
  zoom,
  mode,
  onZoomIn,
  onZoomOut,
  onToggleMode,
  brightness,
  contrast,
  onBrightnessChange,
  onContrastChange,
  onResetImageAdjustments,
  isImageDefault,
  nightMode,
  onCycleNightMode,
  onExportPanel,
  showExport,
  doublePageMode,
  onToggleDoublePage,
  onClose,
}: {
  zoom: number
  mode: ViewerMode
  onZoomIn: () => void
  onZoomOut: () => void
  onToggleMode: () => void
  brightness: number
  contrast: number
  onBrightnessChange: (value: number) => void
  onContrastChange: (value: number) => void
  onResetImageAdjustments: () => void
  isImageDefault: boolean
  nightMode: 'normal' | 'dark' | 'sepia'
  onCycleNightMode: () => void
  onExportPanel?: () => void
  showExport?: boolean
  doublePageMode?: boolean
  onToggleDoublePage?: () => void
  onClose: () => void
}) {
  const NightIcon = nightMode === 'dark' ? Moon : nightMode === 'sepia' ? Sun : Sun

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg rounded-t-3xl bg-cw-surface border-t border-cw-border/60 p-5 pb-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="font-display text-lg font-bold text-cw-text">Menú</span>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-cw-text-muted hover:bg-cw-surface-2">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-5 flex items-center justify-center gap-3">
            <button onClick={onZoomOut} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cw-surface-2 text-cw-text active:bg-cw-border">
              <ZoomOut className="h-6 w-6" />
            </button>
            <span className="w-16 text-center font-mono text-sm text-cw-text-muted">{Math.round(zoom * 100)}%</span>
            <button onClick={onZoomIn} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cw-surface-2 text-cw-text active:bg-cw-border">
              <ZoomIn className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-5">
            <ImageAdjustments
              brightness={brightness}
              contrast={contrast}
              onBrightnessChange={onBrightnessChange}
              onContrastChange={onContrastChange}
              onReset={onResetImageAdjustments}
              isDefault={isImageDefault}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button onClick={onCycleNightMode} className={`flex flex-col items-center gap-2 rounded-2xl p-4 ${nightMode !== 'normal' ? 'bg-cw-accent/20 text-cw-accent' : 'bg-cw-surface-2 text-cw-text'}`}>
              <NightIcon className="h-6 w-6" />
              <span className="text-xs font-medium">Noche</span>
            </button>

            {showExport && onExportPanel && (
              <button onClick={onExportPanel} className="flex flex-col items-center gap-2 rounded-2xl bg-cw-surface-2 p-4 text-cw-text">
                <Share2 className="h-6 w-6" />
                <span className="text-xs font-medium">Exportar</span>
              </button>
            )}

            {onToggleDoublePage && (
              <button onClick={onToggleDoublePage} className={`flex flex-col items-center gap-2 rounded-2xl p-4 ${doublePageMode ? 'bg-cw-accent/20 text-cw-accent' : 'bg-cw-surface-2 text-cw-text'}`}>
                <BookOpenCheck className="h-6 w-6" />
                <span className="text-xs font-medium">Doble</span>
              </button>
            )}

            <button onClick={onToggleMode} className={`flex flex-col items-center gap-2 rounded-2xl p-4 ${mode === 'panel' ? 'bg-cw-accent/20 text-cw-accent' : 'bg-cw-surface-2 text-cw-text'}`}>
              {mode === 'panel' ? <BookOpenCheck className="h-6 w-6" /> : <Settings className="h-6 w-6" />}
              <span className="text-xs font-medium">{mode === 'panel' ? 'Viñeta' : 'Libre'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
