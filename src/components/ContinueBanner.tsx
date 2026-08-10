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
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className="rounded-[20px] border border-[rgba(0,0,0,0.06)] bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-system-ui text-sm font-medium text-[#2D2D2D]">
                ¿Continuar donde lo dejaste?
              </span>
              <span className="text-xs text-[#8E8E93]">
                {panel > 0 ? `Página ${page} · Panel ${panel}` : `Página ${page} de ${totalPages}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRestart}
                className="flex items-center gap-1.5 rounded-xl bg-[#F0EDEA] px-3 py-2 text-xs font-medium text-[#8E8E93] transition-colors hover:bg-[#E5E2DE] hover:text-[#2D2D2D] sm:py-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Desde el principio
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onContinue}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm sm:py-1.5"
                style={{
                  background: 'linear-gradient(135deg, #FF9F87 0%, #A8D8EA 100%)',
                }}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Continuar
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export { AUTO_DISMISS_MS }
