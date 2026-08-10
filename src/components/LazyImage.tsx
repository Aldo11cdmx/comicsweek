import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  aspectRatio?: number
  onClick?: () => void
}

export function LazyImage({ src, alt, className = '', priority = false, aspectRatio = 2 / 3, onClick }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (priority) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observerRef.current?.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [priority])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoaded(true)
  }, [])

  const paddingBottom = `${(1 / aspectRatio) * 100}%`

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ paddingBottom: !isLoaded ? paddingBottom : undefined }}
      onClick={onClick}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-[#F0EDEA]">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="h-full w-full"
            style={{
              background: 'linear-gradient(90deg, #F0EDEA 0%, #E5E2DE 50%, #F0EDEA 100%)',
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F0EDEA]">
          <span className="text-xs text-[#8E8E93]">Error al cargar</span>
        </div>
      ) : (
        isInView && (
          <motion.img
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: isLoaded ? 1 : 0, filter: isLoaded ? 'blur(0px)' : 'blur(10px)' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className="absolute inset-0 h-full w-full object-cover"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        )
      )}
    </div>
  )
}
