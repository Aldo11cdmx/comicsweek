import { motion, AnimatePresence } from 'motion/react'
import { Bookmark } from 'lucide-react'

export function BookmarkToast() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-cw-warm/90 px-4 py-2 text-sm font-medium text-cw-bg shadow-lg backdrop-blur-sm"
      >
        <Bookmark className="h-4 w-4 fill-current" />
        Momento guardado
      </motion.div>
    </AnimatePresence>
  )
}
