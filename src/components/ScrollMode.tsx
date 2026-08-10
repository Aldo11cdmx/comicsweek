import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface ScrollModeProps {
  doc: any
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  brightness: number
  contrast: number
  nightFilter: string
  zoom: number
}

export function ScrollMode({ doc, totalPages, currentPage, onPageChange, brightness, contrast, nightFilter, zoom }: ScrollModeProps) {
  const [pageUrls, setPageUrls] = useState<Map<number, string>>(new Map())
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const getMaxVisiblePages = () => {
    if (typeof window === 'undefined') return 10
    return window.innerWidth < 768 ? 6 : 10
  }

  const evictDistantPages = useCallback((centerPage: number) => {
    const maxPages = getMaxVisiblePages()
    const halfWindow = Math.floor(maxPages / 2)
    const minPage = Math.max(0, centerPage - halfWindow - 1)
    const maxPage = Math.min(totalPages - 1, centerPage + halfWindow + 1)

    setPageUrls(prev => {
      const next = new Map<number, string>()
      prev.forEach((url, pageIndex) => {
        if (pageIndex >= minPage && pageIndex <= maxPage) {
          next.set(pageIndex, url)
        }
      })
      return next
    })
  }, [totalPages])

  useEffect(() => {
    evictDistantPages(currentPage)
  }, [currentPage, evictDistantPages])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const index = Number(entry.target.getAttribute('data-page'))
          if (entry.isIntersecting) {
            if (!pageUrls.has(index)) {
              doc.getPageUrl(index).then((url: string) => {
                setPageUrls(prev => new Map(prev).set(index, url))
              }).catch(() => {})
            }
          }
        })
      },
      { rootMargin: '200px' }
    )

    return () => observerRef.current?.disconnect()
  }, [doc, pageUrls])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight - container.clientHeight
      if (scrollHeight > 0) {
        setScrollProgress(scrollTop / scrollHeight)
      }

      const pageHeight = container.scrollHeight / totalPages
      const currentPageIndex = Math.round(scrollTop / pageHeight)
      if (currentPageIndex !== currentPage && currentPageIndex >= 0 && currentPageIndex < totalPages) {
        onPageChange(currentPageIndex)
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [totalPages, currentPage, onPageChange])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const ratio = y / rect.height
    const targetScroll = ratio * (container.scrollHeight - container.clientHeight)
    container.scrollTo({ top: targetScroll, behavior: 'smooth' })
  }, [])

  return (
    <div ref={containerRef} className="h-full w-full overflow-y-auto bg-cw-bg">
      <div className="mx-auto max-w-3xl">
        {Array.from({ length: totalPages }, (_, i) => (
          <div
            key={i}
            data-page={i}
            ref={(el) => {
              if (el) observerRef.current?.observe(el)
            }}
            className={`flex items-center justify-center border-b border-cw-border/20 ${
              i === currentPage ? 'bg-cw-accent/5' : ''
            }`}
          >
            {pageUrls.has(i) ? (
              <img
                src={pageUrls.get(i)}
                alt={`Página ${i + 1}`}
                className="max-h-screen max-w-full object-contain"
                style={{
                  filter: `brightness(${brightness}) contrast(${contrast}) ${nightFilter}`,
                  transform: `scale(${zoom})`,
                }}
                draggable={false}
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center">
                <div className="h-8 w-8 border-2 border-cw-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="fixed right-2 top-1/2 z-30 h-1/2 w-2 -translate-y-1/2 cursor-pointer overflow-hidden rounded-full bg-cw-surface-2"
        onClick={handleProgressClick}
      >
        <motion.div
          className="w-full rounded-full bg-cw-accent"
          animate={{ height: `${scrollProgress * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="fixed right-6 top-1/2 z-30 -translate-y-1/2 flex flex-col gap-2">
        <button
          onClick={() => containerRef.current?.scrollBy({ top: -window.innerHeight, behavior: 'smooth' })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-cw-surface/80 text-cw-text backdrop-blur-md border border-cw-border/50"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
        <button
          onClick={() => containerRef.current?.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-cw-surface/80 text-cw-text backdrop-blur-md border border-cw-border/50"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
