import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const THUMBNAIL_SCALE = 0.2

interface ThumbnailGridProps {
  doc: any
  comicFormat: 'pdf' | 'cbz' | 'zip'
  currentPage: number
  totalPages: number
  onSelectPage: (page: number) => void
  onClose: () => void
}

export function ThumbnailGrid({ doc, comicFormat, currentPage, totalPages, onSelectPage, onClose }: ThumbnailGridProps) {
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState<Set<number>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const generateThumbnail = useCallback(async (pageIndex: number) => {
    if (thumbnails.has(pageIndex)) return
    if (loading.has(pageIndex)) return

    setLoading(prev => {
      const next = new Set(prev)
      next.add(pageIndex)
      return next
    })

    try {
      let url: string
      if (comicFormat === 'pdf' && doc?.pdfDoc) {
        const page = await doc.pdfDoc.getPage(pageIndex + 1)
        const viewport = page.getViewport({ scale: THUMBNAIL_SCALE })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('No canvas context')
        await page.render({ canvasContext: ctx, viewport }).promise
        url = canvas.toDataURL('image/jpeg', 0.6)
      } else {
        const pageUrl = await doc.getPageUrl(pageIndex)
        url = pageUrl
      }

      setThumbnails(prev => {
        const next = new Map(prev)
        next.set(pageIndex, url)
        return next
      })
    } catch (error) {
      console.error('Error generating thumbnail:', error)
    } finally {
      setLoading(prev => {
        const next = new Set(prev)
        next.delete(pageIndex)
        return next
      })
    }
  }, [comicFormat, doc, thumbnails, loading])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const index = Number(entry.target.getAttribute('data-page'))
          if (entry.isIntersecting) {
            generateThumbnail(index)
          }
        })
      },
      { rootMargin: '100px' }
    )

    return () => observerRef.current?.disconnect()
  }, [generateThumbnail])

  const handleRef = useCallback((el: HTMLDivElement | null) => {
    if (el && observerRef.current) {
      observerRef.current.observe(el)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-cw-surface border border-cw-border/60 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-cw-border/60 p-4">
            <h3 className="font-display text-lg font-bold text-cw-text">
              Páginas
            </h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-cw-text-muted transition-colors hover:bg-cw-surface-2 hover:text-cw-text"
            >
              ✕
            </button>
          </div>

          <div
            ref={containerRef}
            className="grid grid-cols-3 gap-4 overflow-y-auto p-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
            style={{ maxHeight: 'calc(90vh - 80px)' }}
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <div
                key={i}
                ref={handleRef}
                data-page={i}
                onClick={() => onSelectPage(i)}
                className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                  i === currentPage
                    ? 'border-cw-accent shadow-lg shadow-cw-accent/20'
                    : 'border-cw-border/40 hover:border-cw-border'
                }`}
              >
                <div className="aspect-[2/3] overflow-hidden bg-cw-surface-2">
                  {thumbnails.has(i) ? (
                    <img
                      src={thumbnails.get(i)}
                      alt={`Página ${i + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : loading.has(i) ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-6 w-6 border-2 border-cw-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-cw-text-muted">
                      {i + 1}
                    </div>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="text-xs font-medium text-white">{i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
