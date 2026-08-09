import { motion } from 'motion/react'
import { ZoomIn, ZoomOut, BookOpen, Maximize } from 'lucide-react'
import type { ViewerMode } from '../hooks/useManualZoom'

const DEBUG_VIEWER_MODE = false

export function ViewerToolbar({
  zoom,
  mode,
  onZoomIn,
  onZoomOut,
  onToggleMode,
}: {
  zoom: number
  mode: ViewerMode
  onZoomIn: () => void
  onZoomOut: () => void
  onToggleMode: () => void
}) {
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

      {DEBUG_VIEWER_MODE && (
        <>
          <div className="mx-1 h-6 w-px bg-cw-border/60" />
          <span className="font-mono text-[10px] text-cw-text-dim">
            {mode}
          </span>
        </>
      )}
    </motion.div>
  )
}
