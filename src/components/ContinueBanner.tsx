import { motion, AnimatePresence } from 'motion/react'
import { Play, RotateCcw } from 'lucide-react'

const AUTO_DISMISS_MS = 5000

export function ContinueBanner({
  page,
  panel,
  totalPages,
  onContinue,
  onRestart,
}: {
  page: number
  panel: number
  totalPages: number
  onContinue: () => void
  onRestart: () => void
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 top-16 z-30 mx-auto max-w-2xl px-4 sm:px-6"
      >
        <div className="rounded-2xl border border-cw-border/60 bg-cw-surface/90 px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-display text-sm font-bold text-cw-text">
                ¿Continuar donde lo dejaste?
              </span>
              <span className="text-xs text-cw-text-muted">
                {panel > 0 ? `Página ${page} · Panel ${panel}` : `Página ${page} de ${totalPages}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRestart}
                className="flex items-center gap-1.5 rounded-xl bg-cw-surface-2 px-3 py-2 text-xs font-medium text-cw-text transition-colors hover:bg-cw-border sm:py-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Desde el principio
              </button>
              <button
                onClick={onContinue}
                className="flex items-center gap-1.5 rounded-xl bg-cw-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-cw-accent-hover sm:py-1.5"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Continuar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export { AUTO_DISMISS_MS }
