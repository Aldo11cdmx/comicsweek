import { useState, useRef, useCallback } from 'react'

const MIN_SCALE = 1.0
const MAX_SCALE = 5.0

export interface PinchState {
  scale: number
  translateX: number
  translateY: number
}

export function usePinchZoom(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [pinch, setPinch] = useState<PinchState>({ scale: 1, translateX: 0, translateY: 0 })
  const pinchRef = useRef<{
    initialDistance: number
    initialScale: number
    focalX: number
    focalY: number
    initialTx: number
    initialTy: number
  } | null>(null)

  const reset = useCallback(() => {
    setPinch({ scale: 1, translateX: 0, translateY: 0 })
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2) return
    const t1 = e.touches[0]
    const t2 = e.touches[1]
    const dx = t2.clientX - t1.clientX
    const dy = t2.clientY - t1.clientY
    const distance = Math.hypot(dx, dy)
    const focalX = (t1.clientX + t2.clientX) / 2
    const focalY = (t1.clientY + t2.clientY) / 2

    const rect = containerRef.current?.getBoundingClientRect()
    const containerX = rect ? rect.left : 0
    const containerY = rect ? rect.top : 0

    pinchRef.current = {
      initialDistance: distance,
      initialScale: pinch.scale,
      focalX: focalX - containerX,
      focalY: focalY - containerY,
      initialTx: pinch.translateX,
      initialTy: pinch.translateY,
    }
  }, [containerRef, pinch])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2 || !pinchRef.current) return
    e.preventDefault()
    const t1 = e.touches[0]
    const t2 = e.touches[1]
    const dx = t2.clientX - t1.clientX
    const dy = t2.clientY - t1.clientY
    const distance = Math.hypot(dx, dy)

    const scaleDelta = distance / pinchRef.current.initialDistance
    let newScale = pinchRef.current.initialScale * scaleDelta
    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale))

    const focalX = pinchRef.current.focalX
    const focalY = pinchRef.current.focalY
    const tx = pinchRef.current.initialTx - (focalX * (newScale / pinchRef.current.initialScale - 1))
    const ty = pinchRef.current.initialTy - (focalY * (newScale / pinchRef.current.initialScale - 1))

    setPinch({ scale: newScale, translateX: tx, translateY: ty })
  }, [pinch])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      pinchRef.current = null
      if (pinch.scale < MIN_SCALE) {
        setPinch({ scale: MIN_SCALE, translateX: 0, translateY: 0 })
      }
    }
  }, [pinch])

  const containerStyle: React.CSSProperties = pinch.scale > MIN_SCALE ? {
    transform: `translate(${pinch.translateX}px, ${pinch.translateY}px) scale(${pinch.scale})`,
    transformOrigin: 'center center',
    transition: 'none',
  } : {
    transform: 'none',
    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  }

  return {
    pinch,
    containerStyle,
    reset,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}
