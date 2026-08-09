import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, BookOpen, Maximize, Minimize, Bookmark, Settings } from 'lucide-react'
import { useComicStore } from '../store/useComicStore'
import { ComicDocument } from '../engine/ComicDocument'
import { ReadingModes } from '../engine/ReadingModes'
import { detectPanels } from '../engine/CinematicDetector'
import { ViewerToolbar } from '../components/ViewerToolbar'
import { useManualZoom, useViewerMode } from '../hooks'
import { cn } from '../lib/utils'
import type { ReadingMode, ReadingDirection, ComicStatus, DetectionResult, ComicPanel } from '../types'

const MIN_FOCUS_SCALE = 1
const MAX_FOCUS_SCALE = 3.5
const FOCUS_PADDING = 0.04
const DETECTION_CACHE_MAX = 20

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

export function Reader() {
  const { currentComicId, currentReaderState, updateReaderState, closeReader, updateComic, getComicFile, comics } = useComicStore()
  const { mode: viewerMode, toggleMode } = useViewerMode()
  const comic = comics.find(c => c.id === currentComicId)
  const [doc, setDoc] = useState<ComicDocument | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [isPanelsLoading, setIsPanelsLoading] = useState(false)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [cinematicIndex, setCinematicIndex] = useState(0)
  const [cinematicPaused, setCinematicPaused] = useState(false)
  const [panelFocus, setPanelFocus] = useState<{ tx: number; ty: number; scale: number } | null>(null)
  const [isFocusAnimating, setIsFocusAnimating] = useState(false)
  const [imageDims, setImageDims] = useState({ w: 0, h: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<number | null>(null)
  const prevPageRef = useRef(0)
  const detectionCacheRef = useRef<Map<string, DetectionResult>>(new Map())
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const imageDimsRef = useRef({ w: 0, h: 0 })

  useEffect(() => {
    imageDimsRef.current = { w: imageDims.w, h: imageDims.h }
  }, [imageDims])

  useEffect(() => {
    if (!currentUrl) return
    const img = new Image()
    img.onload = () => setImageDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = currentUrl
  }, [currentUrl])

  const state = currentReaderState!
  const isFullscreen = state.isFullscreen
  const zoom = state.zoom
  const mode = state.mode
  const direction = state.direction
  const currentPage = state.currentPage
  const showSettings = state.showSettings
  const showModeSelector = state.showModeSelector
  const bookmarks = state.bookmarks
  const debugMode = state.debugMode

  const cinematicActive = mode === 'cinematic' && viewerMode === 'panel'

  const manualZoom = useManualZoom(containerRef, {
    enabled: true,
    onZoomChange: () => {
      if (cinematicActive && !cinematicPaused) {
        setCinematicPaused(true)
      }
    },
  })

  const currentPanel: ComicPanel | null = cinematicActive && detectionResult && detectionResult.panels.length > 0
    ? detectionResult.panels[cinematicIndex]
    : null
  const total = doc?.getPageCount() || comic?.pageCount || 0

  const computeFocusTarget = useCallback((panel: ComicPanel, containerWidth: number, containerHeight: number) => {
    const { w: imgW, h: imgH } = imageDimsRef.current
    if (!imgW || !imgH) {
      return { tx: 0, ty: 0, scale: 1 }
    }

    const padding = FOCUS_PADDING
    const imageAspect = imgW / imgH
    const containerAspect = containerWidth / containerHeight

    let renderedW: number, renderedH: number, offsetX = 0, offsetY = 0

    if (imageAspect > containerAspect) {
      renderedW = containerWidth
      renderedH = containerWidth / imageAspect
      offsetY = (containerHeight - renderedH) / 2
    } else {
      renderedH = containerHeight
      renderedW = containerHeight * imageAspect
      offsetX = (containerWidth - renderedW) / 2
    }

    const panelRX = panel.x * renderedW
    const panelRY = panel.y * renderedH
    const panelRW = panel.width * renderedW
    const panelRH = panel.height * renderedH

    if (panelRW <= 0 || panelRH <= 0) {
      return { tx: 0, ty: 0, scale: 1 }
    }

    const availW = containerWidth * (1 - 2 * padding)
    const availH = containerHeight * (1 - 2 * padding)

    const scaleX = availW / panelRW
    const scaleY = availH / panelRH
    let targetScale = Math.min(scaleX, scaleY)
    targetScale = clamp(targetScale, MIN_FOCUS_SCALE, MAX_FOCUS_SCALE)

    const panelCX = offsetX + panelRX + panelRW / 2
    const panelCY = offsetY + panelRY + panelRH / 2

    const tx = -targetScale * (panelCX - containerWidth / 2)
    const ty = -targetScale * (panelCY - containerHeight / 2)

    return { tx, ty, scale: targetScale }
  }, [])

  const animateToFocus = useCallback((target: { tx: number; ty: number; scale: number }) => {
    setPanelFocus(target)
    setIsFocusAnimating(true)
    setTimeout(() => setIsFocusAnimating(false), 300)
  }, [])

  const applyFocusToPanel = useCallback((panel: ComicPanel) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const target = computeFocusTarget(panel, rect.width, rect.height)
    animateToFocus(target)
  }, [computeFocusTarget, animateToFocus])

  const loadPanels = useCallback(async (document: ComicDocument, pageIndex: number) => {
    try {
      const url = await document.getPageUrl(pageIndex)
      const cacheKey = `${currentComicId}-${pageIndex}`
      const cached = detectionCacheRef.current.get(cacheKey)
      let result: DetectionResult

      if (cached) {
        result = cached
      } else {
        result = await detectPanels(url, 0.45)
        detectionCacheRef.current.set(cacheKey, result)
        if (detectionCacheRef.current.size > DETECTION_CACHE_MAX) {
          const firstKey = detectionCacheRef.current.keys().next().value
          if (firstKey !== undefined) detectionCacheRef.current.delete(firstKey)
        }
      }

      setDetectionResult(result)
      setCinematicIndex(0)
      setCinematicPaused(false)
      manualZoom.resetZoom()

      if (result.status === 'SUCCESS' && result.panels.length > 0) {
        const panel = result.panels[0]
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const target = computeFocusTarget(panel, rect.width, rect.height)
          animateToFocus(target)
        }
      } else {
        setPanelFocus(null)
      }
    } catch (error) {
      console.error('Error detecting panels:', error)
      setDetectionResult({
        status: 'ERROR',
        panels: [],
        confidence: 'low',
        rawCandidates: 0,
      })
    } finally {
      setIsPanelsLoading(false)
    }
  }, [currentComicId, computeFocusTarget, animateToFocus, manualZoom])

  const loadComic = useCallback(async () => {
    if (!comic || !currentComicId) return

    setIsLoading(true)
    setError(null)
    setDetectionResult(null)
    setCinematicIndex(0)
    setCinematicPaused(false)
    setPanelFocus(null)
    manualZoom.resetZoom()

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
        setIsPanelsLoading(true)
        loadPanels(newDoc, currentPage)
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Error loading comic:', err)
      setError('No pudimos abrir este cómic.')
      setIsLoading(false)
    }
  }, [comic, currentComicId, currentPage, getComicFile, mode, loadPanels, manualZoom])

  useEffect(() => {
    if (currentComicId && comic) {
      loadComic()
    }
    return () => {
      if (doc) {
        doc.dispose()
        setDoc(null)
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
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
          setCinematicPaused(false)
          setPanelFocus(null)
          manualZoom.resetZoom()
          setIsPanelsLoading(true)
          loadPanels(doc, currentPage)
        }
      }).catch(() => {
        setError('No se pudo cargar esta página.')
      })
    }
  }, [currentPage, doc, mode, loadPanels, manualZoom])

  useEffect(() => {
    if (!containerRef.current || mode !== 'cinematic') return

    resizeObserverRef.current?.disconnect()
    resizeObserverRef.current = new ResizeObserver(() => {
      if (currentPanel && !cinematicPaused && panelFocus) {
        const rect = containerRef.current!.getBoundingClientRect()
        const target = computeFocusTarget(currentPanel, rect.width, rect.height)
        setPanelFocus(target)
      }
    })
    resizeObserverRef.current.observe(containerRef.current)

    return () => {
      resizeObserverRef.current?.disconnect()
    }
  }, [mode, currentPanel, cinematicPaused, panelFocus, computeFocusTarget])

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

  const nextPanel = useCallback(() => {
    if (!detectionResult) return
    const panels = detectionResult.panels
    if (cinematicIndex < panels.length - 1) {
      const next = panels[cinematicIndex + 1]
      setCinematicIndex(prev => prev + 1)
      setCinematicPaused(false)
      manualZoom.resetZoom()
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const target = computeFocusTarget(next, rect.width, rect.height)
        animateToFocus(target)
      }
    } else {
      goToPage(currentPage + 1)
    }
  }, [detectionResult, cinematicIndex, currentPage, goToPage, computeFocusTarget, animateToFocus, manualZoom])

  const prevPanel = useCallback(() => {
    if (!detectionResult) return
    if (cinematicIndex > 0) {
      const prev = detectionResult.panels[cinematicIndex - 1]
      setCinematicIndex(prev => prev - 1)
      setCinematicPaused(false)
      manualZoom.resetZoom()
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const target = computeFocusTarget(prev, rect.width, rect.height)
        animateToFocus(target)
      }
    } else {
      goToPage(currentPage - 1)
    }
  }, [detectionResult, cinematicIndex, currentPage, goToPage, computeFocusTarget, animateToFocus, manualZoom])

  const nextPage = useCallback(() => {
    if (!doc) return
    if (cinematicActive && detectionResult && detectionResult.panels.length > 0) {
      nextPanel()
      return
    }
    const next = ReadingModes.nextPage(currentPage, doc.getPageCount(), mode, direction)
    goToPage(next)
  }, [doc, currentPage, mode, direction, goToPage, cinematicActive, detectionResult, nextPanel])

  const prevPage = useCallback(() => {
    if (!doc) return
    if (cinematicActive && detectionResult && detectionResult.panels.length > 0 && cinematicIndex > 0) {
      prevPanel()
      return
    }
    const prev = ReadingModes.prevPage(currentPage, doc.getPageCount(), mode, direction)
    goToPage(prev)
  }, [doc, currentPage, mode, direction, goToPage, cinematicActive, detectionResult, cinematicIndex, prevPanel])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (mode === 'cinematic' && detectionResult && detectionResult.panels.length > 0) {
      if (manualZoom.handleWheel(e)) {
        return
      }
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault()
        if (e.deltaX > 20) nextPanel()
        else if (e.deltaX < -20) prevPanel()
      } else if (e.deltaY > 30) {
        e.preventDefault()
        nextPanel()
      } else if (e.deltaY < -30) {
        e.preventDefault()
        prevPanel()
      }
      return
    }

    if (e.ctrlKey || e.metaKey) {
      manualZoom.handleWheel(e)
    }
  }, [mode, detectionResult, manualZoom, nextPanel, prevPanel])

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
        if (cinematicActive && detectionResult && detectionResult.panels.length > 0) {
          nextPanel()
        } else {
          nextPage()
        }
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
        if (e.ctrlKey || e.metaKey) {
          updateReaderState({ isFullscreen: !isFullscreen })
        } else {
          toggleMode()
        }
        break
      case '+':
      case '=':
        e.preventDefault()
        manualZoom.zoomIn()
        break
      case '-':
        e.preventDefault()
        manualZoom.zoomOut()
        break
      case 'b':
      case 'B':
        e.preventDefault()
        const newBookmarks = bookmarks.includes(currentPage)
          ? bookmarks.filter(p => p !== currentPage)
          : [...bookmarks, currentPage]
        updateReaderState({ bookmarks: newBookmarks })
        break
      case 'd':
      case 'D':
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault()
          updateReaderState({ debugMode: !debugMode })
        }
        break
    }
  }, [prevPage, nextPage, isFullscreen, showSettings, showModeSelector, closeReader, updateReaderState, bookmarks, currentPage, mode, cinematicActive, detectionResult, nextPanel, prevPage, debugMode, manualZoom, toggleMode])

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

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (manualZoom.handleDoubleClick(e)) {
      return
    }
  }, [manualZoom])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (mode === 'cinematic' && detectionResult && detectionResult.panels.length > 0 && !manualZoom.isManual) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const width = rect.width

      if (x < width * 0.3) {
        prevPanel()
      } else if (x > width * 0.7) {
        nextPanel()
      } else {
        setCinematicPaused(p => !p)
        if (cinematicPaused && currentPanel) {
          applyFocusToPanel(currentPanel)
        }
      }
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width

    if (x < width * 0.3) {
      prevPage()
    } else if (x > width * 0.7) {
      nextPage()
    }
  }, [mode, detectionResult, cinematicIndex, prevPanel, nextPanel, cinematicPaused, currentPanel, applyFocusToPanel, prevPage, nextPage, manualZoom.isManual])

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

  if (!comic) {
    return (
      <div className="flex h-screen items-center justify-center bg-cw-bg">
        <p className="text-cw-text-muted">No se encontró el cómic.</p>
      </div>
    )
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="h-12 w-12 border-[3px] border-cw-accent border-t-transparent rounded-full"
          />
        </div>
      )
    }

    if (error) {
      return (
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
      )
    }

    if (!currentUrl) return null

    if (cinematicActive && detectionResult && detectionResult.panels.length > 0 && currentPanel) {
      const focus: { tx: number; ty: number; scale: number } | null = panelFocus
      const defaultFocus = { tx: 0, ty: 0, scale: 1 }
      const activeFocus = focus || defaultFocus

      const containerStyle: React.CSSProperties = {
        transformOrigin: 'center center',
        transition: isFocusAnimating && !manualZoom.isManual ? 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
      }

      if (manualZoom.isManual && manualZoom.lastManual) {
        containerStyle.transform = `translate(${manualZoom.lastManual.tx}px, ${manualZoom.lastManual.ty}px) scale(${manualZoom.lastManual.scale})`
      } else if (focus) {
        containerStyle.transform = `translate(${activeFocus.tx}px, ${activeFocus.ty}px) scale(${activeFocus.scale})`
      } else {
        containerStyle.transform = 'none'
      }

      return (
        <motion.div
          key={`${currentPage}-${cinematicIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="relative h-full w-full"
          style={containerStyle}
        >
          <img
            src={currentUrl}
            alt={`Página ${currentPage + 1}`}
            className="h-full w-full object-contain"
            draggable={false}
          />

          {debugMode && (
            <div className="absolute inset-0 pointer-events-none">
              {detectionResult.panels.map((p, i) => {
                const panelScreenX = p.x * 100
                const panelScreenY = p.y * 100
                const panelScreenW = p.width * 100
                const panelScreenH = p.height * 100
                return (
                  <div
                    key={i}
                    className="absolute border-2"
                    style={{
                      left: `${panelScreenX}%`,
                      top: `${panelScreenY}%`,
                      width: `${panelScreenW}%`,
                      height: `${panelScreenH}%`,
                      borderColor: i === cinematicIndex ? '#ff7b54' : 'rgba(255,255,255,0.3)',
                      backgroundColor: i === cinematicIndex ? 'rgba(255,123,84,0.1)' : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <span
                      className="absolute -top-5 left-0 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-mono text-white"
                    >
                      {i + 1}
                    </span>
                    {debugMode && (
                      <span
                        className="absolute bottom-0 right-0 rounded bg-black/70 px-1 py-0.5 text-[9px] font-mono text-white"
                      >
                        {p.confidence.toFixed(2)}
                      </span>
                    )}
                  </div>
                )
              })}

              {currentPanel && (
                <div
                  className="absolute border-2 border-dashed border-cw-warm"
                  style={{
                    left: `${currentPanel.x * 100}%`,
                    top: `${currentPanel.y * 100}%`,
                    width: `${currentPanel.width * 100}%`,
                    height: `${currentPanel.height * 100}%`,
                  }}
                >
                  <span
                    className="absolute -top-5 left-0 rounded bg-cw-warm/80 px-1.5 py-0.5 text-[10px] font-mono text-cw-bg"
                  >
                    FOCUS
                  </span>
                </div>
              )}

              <div className="absolute top-2 left-2 rounded bg-black/80 p-2 text-[10px] font-mono text-white space-y-1">
                <div>scale: {(manualZoom.isManual && manualZoom.lastManual ? manualZoom.lastManual.scale : activeFocus.scale).toFixed(3)}</div>
                <div>tx: {(manualZoom.isManual && manualZoom.lastManual ? manualZoom.lastManual.tx : activeFocus.tx).toFixed(1)}px</div>
                <div>ty: {(manualZoom.isManual && manualZoom.lastManual ? manualZoom.lastManual.ty : activeFocus.ty).toFixed(1)}px</div>
                {currentPanel && (
                  <>
                    <div>panel: {(currentPanel.width * 100).toFixed(1)}% x {(currentPanel.height * 100).toFixed(1)}%</div>
                    <div>img: {imageDims.w} x {imageDims.h}</div>
                  </>
                )}
              </div>
            </div>
          )}

          {isPanelsLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-cw-bg/50">
              <div className="h-8 w-8 border-2 border-cw-accent border-t-transparent rounded-full" />
            </div>
          )}
        </motion.div>
      )
    }

    if (viewerMode === 'free' || !cinematicActive) {
      return (
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
      )
    }

    return (
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
    )
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      className={cn(
        'fixed inset-0 z-50 bg-cw-bg transition-colors overflow-hidden',
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
                  {viewerMode === 'free'
                    ? `Page ${currentPage + 1} / ${total}`
                    : cinematicActive && detectionResult && detectionResult.panels.length > 0
                      ? `Panel ${cinematicIndex + 1} / ${detectionResult.panels.length} · Page ${currentPage + 1} / ${total}`
                      : `Issue · Page ${currentPage + 1} / ${total}`}
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
                onClick={toggleMode}
                className={`rounded-full p-2 backdrop-blur-md transition-colors border ${
                  viewerMode === 'panel'
                    ? 'bg-cw-accent/80 text-white border-cw-accent'
                    : 'bg-cw-surface/60 text-cw-text border-cw-border/50 hover:bg-cw-surface-2'
                }`}
                title={viewerMode === 'panel' ? 'Modo Viñeta' : 'Modo Libre'}
              >
                {viewerMode === 'panel' ? (
                  <BookOpen className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => updateReaderState({ showModeSelector: !showModeSelector })}
                className="rounded-full bg-cw-surface/60 p-2 text-cw-text backdrop-blur-md transition-colors hover:bg-cw-surface-2 border border-cw-border/50"
                title="Modo de lectura"
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
                      setDetectionResult(null)
                      setCinematicPaused(false)
                      setPanelFocus(null)
                      manualZoom.resetZoom()
                      setIsPanelsLoading(true)
                      if (doc) {
                        loadPanels(doc, currentPage)
                      }
                    } else {
                      setDetectionResult(null)
                      setPanelFocus(null)
                      manualZoom.resetZoom()
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

              <button
                onClick={() => updateReaderState({ debugMode: !debugMode })}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  debugMode
                    ? 'bg-cw-accent/20 text-cw-accent'
                    : 'bg-cw-surface-2 text-cw-text hover:bg-cw-border'
                }`}
              >
                <span className="font-mono text-xs">DEBUG</span>
                {debugMode ? 'ON' : 'OFF'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="flex h-full w-full"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
      >
        {renderContent()}
      </div>

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

      <ViewerToolbar
        zoom={manualZoom.isManual ? manualZoom.scale : zoom}
        mode={viewerMode}
        onZoomIn={viewerMode === 'panel' ? manualZoom.zoomIn : () => updateReaderState({ zoom: clamp(zoom + 0.2, 0.5, 5) })}
        onZoomOut={viewerMode === 'panel' ? manualZoom.zoomOut : () => updateReaderState({ zoom: Math.max(0.5, zoom - 0.2) })}
        onToggleMode={toggleMode}
      />

      {mode === 'cinematic' && detectionResult && !showControls && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-cw-surface/60 px-4 py-1.5 backdrop-blur-md border border-cw-border/50">
            <span className="font-mono text-[11px] text-cw-text-muted">
              {cinematicIndex + 1} / {detectionResult.panels.length}
            </span>
            <span className="text-cw-text-dim">·</span>
            <span className="text-[11px] text-cw-text-muted uppercase tracking-wider">
              {detectionResult.confidence}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
