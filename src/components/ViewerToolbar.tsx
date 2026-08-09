import { motion } from 'motion/react'
import { ZoomIn, ZoomOut, BookOpen, Maximize, Sun, Moon, Share2, BookOpenCheck } from 'lucide-react'
import type { ViewerMode } from '../hooks/useManualZoom'
import { ImageAdjustments } from '../components/ImageAdjustments'

export function ViewerToolbar({
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
}) {
  const nightTitle = nightMode === 'dark' ? 'Modo Oscuro' : nightMode === 'sepia' ? 'Modo Sepia' : 'Modo Normal'
  const NightIcon = nightMode === 'dark' ? Moon : nightMode === 'sepia' ? Sun : Sun

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-6 right-6 z-20 flex items-center gap-2 rounded-2xl border border-cw-border/60 bg-cw-surface/80 px-3 py-2 shadow-2xl backdrop-blur-xl"
    >
      <button
        onClick={onZoomOut}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-cw-text transition-colors hover:bg-cw-surface-2"
        title="Zoom - (-)"
      >
        <ZoomOut className="h-4 w-4" />
      </button>

      <span className="w-12 text-center font-mono text-xs text-cw-text-muted">
        {Math.round(zoom * 100)}%
      </span>

      <button
        onClick={onZoomIn}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-cw-text transition-colors hover:bg-cw-surface-2"
        title="Zoom + (+)"
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      <div className="mx-1 h-6 w-px bg-cw-border/60" />

      <ImageAdjustments
        brightness={brightness}
        contrast={contrast}
        onBrightnessChange={onBrightnessChange}
        onContrastChange={onContrastChange}
        onReset={onResetImageAdjustments}
        isDefault={isImageDefault}
      />

      <button
        onClick={onCycleNightMode}
        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
          nightMode !== 'normal' ? 'bg-cw-accent/20 text-cw-accent' : 'text-cw-text hover:bg-cw-surface-2'
        }`}
        title={nightTitle}
      >
        <NightIcon className="h-4 w-4" />
      </button>

      {showExport && onExportPanel && (
        <button
          onClick={onExportPanel}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-cw-text transition-colors hover:bg-cw-surface-2"
          title="Exportar panel (E)"
        >
          <Share2 className="h-4 w-4" />
        </button>
      )}

      {onToggleDoublePage && (
        <button
          onClick={onToggleDoublePage}
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
            doublePageMode ? 'bg-cw-accent/20 text-cw-accent' : 'text-cw-text hover:bg-cw-surface-2'
          }`}
          title={doublePageMode ? 'Doble página (D)' : 'Página simple (D)'}
        >
          <BookOpenCheck className="h-4 w-4" />
        </button>
      )}

      <button
        onClick={onToggleMode}
        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
          mode === 'panel'
            ? 'bg-cw-accent/20 text-cw-accent'
            : 'text-cw-text hover:bg-cw-surface-2'
        }`}
        title={mode === 'panel' ? 'Modo Viñeta' : 'Modo Libre'}
      >
        {mode === 'panel' ? (
          <BookOpen className="h-4 w-4" />
        ) : (
          <Maximize className="h-4 w-4" />
        )}
      </button>
    </motion.div>
  )
}
