import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  aspectRatio?: number
  onClick?: () => void
  style?: React.CSSProperties
  draggable?: boolean
}

export function LazyImage({ src, alt, className = '', priority = false, aspectRatio = 2 / 3, onClick, style, draggable }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img || !src) return

    if (img.complete && img.naturalWidth > 0) {
      setIsLoaded(true)
      return
    }

    const handleLoad = () => setIsLoaded(true)
    const handleError = () => {
      setHasError(true)
      setIsLoaded(true)
    }

    img.addEventListener('load', handleLoad)
    img.addEventListener('error', handleError)

    return () => {
      img.removeEventListener('load', handleLoad)
      img.removeEventListener('error', handleError)
    }
  }, [src])

  const paddingBottom = `${(1 / aspectRatio) * 100}%`

  return (
    <div
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
        <motion.img
          ref={imgRef}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: isLoaded ? 1 : 0, filter: isLoaded ? 'blur(0px)' : 'blur(10px)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-contain"
          style={style}
          draggable={draggable}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  )
}
