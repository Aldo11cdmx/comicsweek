import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, X, Maximize, Minimize } from 'lucide-react'

interface PresentationControlsProps {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
}

export function PresentationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onClose,
  onToggleFullscreen,
  isFullscreen,
}: PresentationControlsProps) {
  return (
    <AnimatePresence>
      {['visible'].map(state => (
        <motion.div
          key={state}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-black/30 via-transparent to-black/30 p-6 pointer-events-none"
        >
          <div className="flex items-start justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20"
                aria-label="Salir del modo presentación"
              >
                <X className="h-5 w-5" />
              </motion.button>
              <div className="rounded-full bg-white/20 px-4 py-2 backdrop-blur-md border border-white/20">
                <span className="font-mono text-sm text-white">
                  {currentPage + 1} / {totalPages}
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleFullscreen}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20"
              aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </motion.button>
          </div>

          <div className="flex items-center justify-between pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onPrev}
              disabled={currentPage === 0}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20 disabled:opacity-30"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </motion.button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                const pageIndex = Math.floor((i / 9) * (totalPages - 1))
                const isActive = pageIndex === currentPage
                return (
                  <motion.div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      isActive ? 'w-6 bg-white' : 'w-2 bg-white/40'
                    }`}
                  />
                )
              })}
              {totalPages > 10 && (
                <span className="ml-2 font-mono text-xs text-white/80">...</span>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onNext}
              disabled={currentPage === totalPages - 1}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20 disabled:opacity-30"
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </motion.button>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
