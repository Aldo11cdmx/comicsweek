import { motion } from 'motion/react'
import { ZoomIn, ZoomOut, BookOpen, Maximize, Sun, Moon, Share2, BookOpenCheck, Settings } from 'lucide-react'
import type { ViewerMode } from '../hooks/useManualZoom'
import { ImageAdjustments } from '../components/ImageAdjustments'
import { MobileMenu } from '../components/MobileMenu'
import { useResponsive } from '../hooks/useResponsive'

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
  mobileMenuOpen,
  onToggleMobileMenu,
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
  mobileMenuOpen: boolean
  onToggleMobileMenu: () => void
}) {
  const { isMobile } = useResponsive()
  const nightTitle = nightMode === 'dark' ? 'Modo Oscuro' : nightMode === 'sepia' ? 'Modo Sepia' : 'Modo Normal'
  const NightIcon = nightMode === 'dark' ? Moon : nightMode === 'sepia' ? Sun : Sun

  if (isMobile) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-6 right-6 z-20 flex items-center gap-2"
        >
          <button
            onClick={onToggleMode}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
              mode === 'panel'
                ? 'bg-cw-accent/20 text-cw-accent'
                : 'bg-cw-surface/80 text-cw-text border border-cw-border/60'
            }`}
            title={mode === 'panel' ? 'Modo Viñeta' : 'Modo Libre'}
          >
            {mode === 'panel' ? <BookOpen className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>

          <button
            onClick={onToggleMobileMenu}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cw-surface/80 text-cw-text border border-cw-border/60"
            title="Menú"
          >
            <Settings className="h-5 w-5" />
          </button>
        </motion.div>

        {mobileMenuOpen && (
          <MobileMenu
            zoom={zoom}
            mode={mode}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onToggleMode={onToggleMode}
            brightness={brightness}
            contrast={contrast}
            onBrightnessChange={onBrightnessChange}
            onContrastChange={onContrastChange}
            onResetImageAdjustments={onResetImageAdjustments}
            isImageDefault={isImageDefault}
            nightMode={nightMode}
            onCycleNightMode={onCycleNightMode}
            onExportPanel={onExportPanel}
            showExport={showExport}
            doublePageMode={doublePageMode}
            onToggleDoublePage={onToggleDoublePage}
            onClose={onToggleMobileMenu}
          />
        )}
      </>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-6 right-6 z-20 flex items-center gap-2 rounded-[20px] border border-[rgba(0,0,0,0.06)] bg-white/80 px-3 py-2 shadow-sm backdrop-blur-xl"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onZoomOut}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8E8E93] transition-colors hover:bg-[#F0EDEA] hover:text-[#2D2D2D]"
        title="Zoom - (-)"
      >
        <ZoomOut className="h-4 w-4" />
      </motion.button>

      <span className="w-12 text-center font-mono text-xs text-[#8E8E93]">
        {Math.round(zoom * 100)}%
      </span>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onZoomIn}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8E8E93] transition-colors hover:bg-[#F0EDEA] hover:text-[#2D2D2D]"
        title="Zoom + (+)"
      >
        <ZoomIn className="h-4 w-4" />
      </motion.button>

      <div className="mx-1 h-6 w-px bg-[rgba(0,0,0,0.06)]" />

      <ImageAdjustments
        brightness={brightness}
        contrast={contrast}
        onBrightnessChange={onBrightnessChange}
        onContrastChange={onContrastChange}
        onReset={onResetImageAdjustments}
        isDefault={isImageDefault}
      />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCycleNightMode}
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
          nightMode !== 'normal' ? 'bg-[#A8D8EA]/20 text-[#A8D8EA]' : 'text-[#8E8E93] hover:bg-[#F0EDEA] hover:text-[#2D2D2D]'
        }`}
        title={nightTitle}
      >
        <NightIcon className="h-4 w-4" />
      </motion.button>

      {showExport && onExportPanel && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExportPanel}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8E8E93] transition-colors hover:bg-[#F0EDEA] hover:text-[#2D2D2D]"
          title="Exportar panel (E)"
        >
          <Share2 className="h-4 w-4" />
        </motion.button>
      )}

      {onToggleDoublePage && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleDoublePage}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
            doublePageMode ? 'bg-[#FF9F87]/20 text-[#FF9F87]' : 'text-[#8E8E93] hover:bg-[#F0EDEA] hover:text-[#2D2D2D]'
          }`}
          title={doublePageMode ? 'Doble página (D)' : 'Página simple (D)'}
        >
          <BookOpenCheck className="h-4 w-4" />
        </motion.button>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleMode}
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
          mode === 'panel'
            ? 'bg-[#C3E8B7]/20 text-[#C3E8B7]'
            : 'text-[#8E8E93] hover:bg-[#F0EDEA] hover:text-[#2D2D2D]'
        }`}
        title={mode === 'panel' ? 'Modo Viñeta' : 'Modo Libre'}
      >
        {mode === 'panel' ? (
          <BookOpen className="h-4 w-4" />
        ) : (
          <Maximize className="h-4 w-4" />
        )}
      </motion.button>
    </motion.div>
  )
}
