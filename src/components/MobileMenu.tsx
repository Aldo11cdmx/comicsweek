import { motion, AnimatePresence } from 'motion/react'
import { ZoomIn, ZoomOut, Sun, Moon, Share2, BookOpenCheck, Settings } from 'lucide-react'
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
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-lg rounded-t-[20px] bg-white/90 p-5 pb-8 backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#F0EDEA]" />

          <div className="mb-6 flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onZoomOut}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0EDEA] text-[#8E8E93] transition-colors hover:bg-[#E5E2DE] hover:text-[#2D2D2D]"
            >
              <ZoomOut className="h-5 w-5" />
            </motion.button>
            <span className="w-14 text-center font-mono text-sm text-[#8E8E93]">{Math.round(zoom * 100)}%</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onZoomIn}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0EDEA] text-[#8E8E93] transition-colors hover:bg-[#E5E2DE] hover:text-[#2D2D2D]"
            >
              <ZoomIn className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="mb-6">
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
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onCycleNightMode}
              className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-colors ${
                nightMode !== 'normal' ? 'bg-[#A8D8EA]/15 text-[#A8D8EA]' : 'bg-[#F0EDEA] text-[#8E8E93] hover:bg-[#E5E2DE]'
              }`}
            >
              <NightIcon className="h-6 w-6" />
              <span className="text-xs font-medium">Noche</span>
            </motion.button>

            {showExport && onExportPanel && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onExportPanel}
                className="flex flex-col items-center gap-2 rounded-2xl bg-[#F0EDEA] p-4 text-[#8E8E93] transition-colors hover:bg-[#E5E2DE]"
              >
                <Share2 className="h-6 w-6" />
                <span className="text-xs font-medium">Exportar</span>
              </motion.button>
            )}

            {onToggleDoublePage && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onToggleDoublePage}
                className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-colors ${
                  doublePageMode ? 'bg-[#FF9F87]/15 text-[#FF9F87]' : 'bg-[#F0EDEA] text-[#8E8E93] hover:bg-[#E5E2DE]'
                }`}
              >
                <BookOpenCheck className="h-6 w-6" />
                <span className="text-xs font-medium">Doble</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onToggleMode}
              className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-colors ${
                mode === 'panel' ? 'bg-[#C3E8B7]/15 text-[#C3E8B7]' : 'bg-[#F0EDEA] text-[#8E8E93] hover:bg-[#E5E2DE]'
              }`}
            >
              {mode === 'panel' ? <BookOpenCheck className="h-6 w-6" /> : <Settings className="h-6 w-6" />}
              <span className="text-xs font-medium">{mode === 'panel' ? 'Viñeta' : 'Libre'}</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
