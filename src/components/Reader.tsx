import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, BookOpen, Maximize, Minimize, Bookmark, Settings } from 'lucide-react'
import { useComicStore } from '../store/useComicStore'
import { ComicDocument } from '../engine/ComicDocument'
import { ReadingModes } from '../engine/ReadingModes'
import { detectPanels } from '../engine/CinematicDetector'
import { cn } from '../lib/utils'
import type { ReadingMode, ReadingDirection, ComicStatus } from '../types'

export function Reader() {
  const { currentComicId, currentReaderState, updateReaderState, closeReader, updateComic, getComicFile, comics } = useComicStore()
  const comic = comics.find(c => c.id === currentComicId)
  const [doc, setDoc] = useState<ComicDocument | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [isPanelsLoading, setIsPanelsLoading] = useState(false)
  const [panels, setPanels] = useState<any[]>([])
  const [cinematicIndex, setCinematicIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<number | null>(null)
  const prevPageRef = useRef(0)

  const state = currentReaderState!
  const isFullscreen = state.isFullscreen
  const zoom = state.zoom
  const mode = state.mode
  const direction = state.direction
  const currentPage = state.currentPage
  const showSettings = state.showSettings
  const showModeSelector = state.showModeSelector
  const bookmarks = state.bookmarks

  const loadComic = useCallback(async () => {
    if (!comic || !currentComicId) return

    setIsLoading(true)
    setError(null)
    setPanels([])
    setCinematicIndex(0)

    try {
      const file = await getComicFile(currentComicId)
      if (!file) {
        setError('No se pudo cargar el archivo del cómic.')
        setIsLoading(false)
        return
      }

      const newDoc = new ComicDocument(comic, file)
      await newDoc.load()
      setDoc(newDoc)

      if (newDoc.getPageCount() > 0) {
        const url = await newDoc.getPageUrl(currentPage)
        setCurrentUrl(url)
      }

      if (mode === 'cinematic') {
        loadPanels(newDoc, currentPage)
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Error loading comic:', err)
      setError('No pudimos abrir este cómic.')
      setIsLoading(false)
    }
  }, [comic, currentComicId, currentPage, getComicFile, mode])

  useEffect(() => {
    if (currentComicId && comic) {
      loadComic()
    }
    return () => {
      if (doc) {
        doc.dispose()
        setDoc(null)
      }
    }
  }, [currentComicId])

  useEffect(() => {
    if (doc && currentPage !== prevPageRef.current) {
      prevPageRef.current = currentPage
      doc.getPageUrl(currentPage).then(url => {
        setCurrentUrl(url)
        if (mode === 'cinematic') {
          setCinematicIndex(0)
          loadPanels(doc, currentPage)
        }
      }).catch(() => {
        setError('No se pudo cargar esta página.')
      })
    }
  }, [currentPage, doc, mode])

  const loadPanels = async (document: ComicDocument, pageIndex: number) => {
    try {
      const url = await document.getPageUrl(pageIndex)
      const detectedPanels = await detectPanels(url, 0.5)
      setPanels(detectedPanels)
      setCinematicIndex(0)
    } catch (error) {
      console.error('Error detecting panels:', error)
      setPanels([])
    } finally {
      setIsPanelsLoading(false)
    }
  }

  const saveProgress = useCallback(async (page: number) => {
    if (!comic) return
    const status: ComicStatus = page >= comic.pageCount - 1 ? 'finished' : 'reading'
    const updated = {
      ...comic,
      progress: page,
      status,
      lastReadAt: Date.now(),
    }
    await updateComic(updated)
  }, [comic, updateComic])

  const goToPage = useCallback((page: number) => {
    if (!doc || page < 0 || page >= doc.getPageCount()) return
    updateReaderState({ currentPage: page })
    saveProgress(page)
  }, [doc, updateReaderState, saveProgress])

  const nextPage = useCallback(() => {
    if (!doc) return
    const total = doc.getPageCount()
    if (mode === 'cinematic' && panels.length > 0) {
      if (cinematicIndex < panels.length - 1) {
        setCinematicIndex(prev => prev + 1)
        return
      }
    }
    const next = ReadingModes.nextPage(currentPage, total, mode, direction)
    goToPage(next)
  }, [doc, currentPage, mode, direction, goToPage, cinematicIndex, panels.length])

  const prevPage = useCallback(() => {
    if (!doc) return
    if (mode === 'cinematic' && panels.length > 0 && cinematicIndex > 0) {
      setCinematicIndex(prev => prev - 1)
      return
    }
    const prev = ReadingModes.prevPage(currentPage, doc.getPageCount(), mode, direction)
    goToPage(prev)
  }, [doc, currentPage, mode, direction, goToPage, cinematicIndex, panels.length])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      updateReaderState({ zoom: Math.max(0.5, Math.min(5, zoom + delta)) })
    }
  }, [zoom, updateReaderState])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        prevPage()
        break
      case 'ArrowRight':
        e.preventDefault()
        nextPage()
        break
      case ' ':
        e.preventDefault()
        nextPage()
        break
      case 'Escape':
        if (isFullscreen) {
          updateReaderState({ isFullscreen: false })
        } else if (showSettings || showModeSelector) {
          updateReaderState({ showSettings: false, showModeSelector: false })
        } else {
          closeReader()
        }
        break
      case 'f':
      case 'F':
        e.preventDefault()
        updateReaderState({ isFullscreen: !isFullscreen })
        break
      case '+':
      case '=':
        e.preventDefault()
        updateReaderState({ zoom: Math.min(5, zoom + 0.2) })
        break
      case '-':
        e.preventDefault()
        updateReaderState({ zoom: Math.max(0.5, zoom - 0.2) })
        break
      case 'b':
      case 'B':
        e.preventDefault()
        const newBookmarks = bookmarks.includes(currentPage)
          ? bookmarks.filter(p => p !== currentPage)
          : [...bookmarks, currentPage]
        updateReaderState({ bookmarks: newBookmarks })
        break
    }
  }, [nextPage, prevPage, isFullscreen, showSettings, showModeSelector, closeReader, updateReaderState, zoom, bookmarks, currentPage])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    const handleFullscreenChange = () => {
      updateReaderState({ isFullscreen: !!document.fullscreenElement })
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [updateReaderState])

  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [])

  const handleDoubleClick = useCallback(() => {
    updateReaderState({ zoom: zoom === 1 ? 2 : 1 })
  }, [zoom, updateReaderState])

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width

    if (x < width * 0.3) {
      prevPage()
    } else if (x > width * 0.7) {
      nextPage()
    }
  }, [nextPage, prevPage])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }, [])

  const currentPanel = mode === 'cinematic' && panels.length > 0 ? panels[cinematicIndex] : null
  const total = doc?.getPageCount() || comic?.pageCount || 0

  if (!comic) {
    return (
      <div className="flex h-screen items-center justify-center bg-cw-bg">
        <p className="text-cw-text-muted">No se encontró el cómic.</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        'fixed inset-0 z-50 bg-cw-bg transition-colors',
        isFullscreen && 'fullscreen'
      )}
    >
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-x-0 top-0 z-10 flex items-start justify-between bg-gradient-to-b from-cw-bg/80 via-cw-bg/40 to-transparent p-5"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={closeReader}
                className="flex items-center justify-center rounded-full bg-cw-surface/60 p-2 text-cw-text backdrop-blur-md transition-colors hover:bg-cw-surface-2 border border-cw-border/50"
                title="Cerrar lector (Esc)"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col gap-0.5">
                <span className="font-display text-sm font-bold text-cw-text">
                  {comic.title}
                </span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-cw-text-muted">
                  Issue · Page {currentPage + 1} / {total}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => updateReaderState({ zoom: Math.max(0.5, zoom - 0.2) })}
                className="rounded-full bg-cw-surface/60 p-2 text-cw-text backdrop-blur-md transition-colors hover:bg-cw-surface-2 border border-cw-border/50"
                title="Zoom - (-)"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="font-mono text-[11px] text-cw-text-muted w-14 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => updateReaderState({ zoom: Math.min(5, zoom + 0.2) })}
                className="rounded-full bg-cw-surface/60 p-2 text-cw-text backdrop-blur-md transition-colors hover:bg-cw-surface-2 border border-cw-border/50"
                title="Zoom + (+)"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => updateReaderState({ showModeSelector: !showModeSelector })}
                className="rounded-full bg-cw-surface/60 p-2 text-cw-text backdrop-blur-md transition-colors hover:bg-cw-surface-2 border border-cw-border/50"
                title="Modo de lectura"
              >
                <BookOpen className="h-4 w-4" />
              </button>
              <button
                onClick={() => updateReaderState({ showSettings: !showSettings })}
                className="rounded-full bg-cw-surface/60 p-2 text-cw-text backdrop-blur-md transition-colors hover:bg-cw-surface-2 border border-cw-border/50"
                title="Ajustes"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="rounded-full bg-cw-surface/60 p-2 text-cw-text backdrop-blur-md transition-colors hover:bg-cw-surface-2 border border-cw-border/50"
                title="Pantalla completa (F)"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModeSelector && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-cw-surface border border-cw-border p-1.5 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-col gap-0.5">
              {([
                { mode: 'page', label: 'Página' },
                { mode: 'vertical', label: 'Vertical' },
                { mode: 'cinematic', label: 'Cinematic' },
              ] as { mode: ReadingMode; label: string }[]).map(item => (
                <button
                  key={item.mode}
                  onClick={() => {
                    updateReaderState({ mode: item.mode })
                    if (item.mode === 'cinematic') {
                      setIsPanelsLoading(true)
                    }
                  }}
                  className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
                    mode === item.mode
                      ? 'bg-cw-accent text-white'
                      : 'text-cw-text hover:bg-cw-surface-2'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-5 top-20 z-20 w-72 rounded-2xl bg-cw-surface border border-cw-border p-5 shadow-2xl backdrop-blur-xl"
          >
            <h3 className="mb-5 font-display text-lg font-bold text-cw-text">Ajustes</h3>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs text-cw-text-muted">Dirección de lectura</label>
                <div className="flex gap-2">
                  {([
                    { dir: 'ltr', label: '← →' },
                    { dir: 'rtl', label: '→ ←' },
                  ] as { dir: ReadingDirection; label: string }[]).map(item => (
                    <button
                      key={item.dir}
                      onClick={() => updateReaderState({ direction: item.dir })}
                      className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                        direction === item.dir
                          ? 'bg-cw-accent text-white'
                          : 'bg-cw-surface-2 text-cw-text hover:bg-cw-border'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs text-cw-text-muted">Zoom</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateReaderState({ zoom: Math.max(0.5, zoom - 0.2) })}
                    className="rounded-lg bg-cw-surface-2 px-3 py-1.5 text-sm text-cw-text hover:bg-cw-border"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono text-sm text-cw-text">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => updateReaderState({ zoom: Math.min(5, zoom + 0.2) })}
                    className="rounded-lg bg-cw-surface-2 px-3 py-1.5 text-sm text-cw-text hover:bg-cw-border"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  const newBookmarks = bookmarks.includes(currentPage)
                    ? bookmarks.filter(p => p !== currentPage)
                    : [...bookmarks, currentPage]
                  updateReaderState({ bookmarks: newBookmarks })
                }}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  bookmarks.includes(currentPage)
                    ? 'bg-cw-warm/20 text-cw-warm'
                    : 'bg-cw-surface-2 text-cw-text hover:bg-cw-border'
                }`}
              >
                <Bookmark className="h-4 w-4" />
                {bookmarks.includes(currentPage) ? 'Guardado' : 'Guardar página (B)'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="h-12 w-12 border-[3px] border-cw-accent border-t-transparent rounded-full"
          />
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex h-full flex-col items-center justify-center gap-5"
        >
          <p className="text-lg text-cw-text">{error}</p>
          <button
            onClick={closeReader}
            className="rounded-full bg-cw-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cw-accent-hover"
          >
            Volver a biblioteca
          </button>
        </motion.div>
      )}

      {!isLoading && !error && currentUrl && (
        <div
          className="flex h-full items-center justify-center"
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
        >
          {mode === 'cinematic' && panels.length > 0 && currentPanel ? (
            <motion.div
              key={`${currentPage}-${cinematicIndex}`}
              initial={{ scale: 1.04, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="relative"
              style={{
                width: '100%',
                maxWidth: '100%',
                height: '100%',
              }}
            >
              <img
                src={currentUrl}
                alt={`Página ${currentPage + 1}`}
                className="h-full w-full object-contain"
                style={{
                  objectPosition: `${currentPanel.x * 100}% ${currentPanel.y * 100}%`,
                  objectFit: 'cover',
                }}
              />
              {isPanelsLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-cw-bg/50">
                  <div className="h-8 w-8 border-2 border-cw-accent border-t-transparent rounded-full" />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
              style={{
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s ease-out',
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            >
              <img
                src={currentUrl}
                alt={`Página ${currentPage + 1}`}
                className="max-h-screen max-w-full object-contain"
                draggable={false}
              />
            </motion.div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showControls && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-gradient-to-t from-cw-bg/80 via-cw-bg/40 to-transparent p-5"
          >
            <button
              onClick={prevPage}
              disabled={currentPage <= 0}
              className="flex items-center justify-center rounded-full bg-cw-surface/60 p-3 text-cw-text backdrop-blur-md transition-all hover:bg-cw-surface-2 disabled:opacity-30 border border-cw-border/50"
              title="Página anterior (←)"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="flex-1 px-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-mono text-cw-text">
                  {currentPage + 1} / {total}
                </span>
                <span className="text-cw-text-muted">
                  {Math.round(((currentPage + 1) / total) * 100)}%
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-cw-surface-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cw-accent to-cw-warm transition-all duration-300"
                  style={{ width: `${((currentPage + 1) / total) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage >= total - 1}
              className="flex items-center justify-center rounded-full bg-cw-accent p-3 text-white backdrop-blur-md transition-all hover:bg-cw-accent-hover disabled:opacity-30"
              title="Página siguiente (→)"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bookmarks.includes(currentPage) && showControls && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute right-5 bottom-24 z-10 flex items-center gap-2 rounded-full bg-cw-warm/15 px-3.5 py-1.5 text-cw-warm backdrop-blur-md border border-cw-warm/20"
          >
            <Bookmark className="h-4 w-4 fill-current" />
            <span className="text-xs font-medium">Marcado</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
