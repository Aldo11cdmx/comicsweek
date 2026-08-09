import { useState, useEffect } from 'react'

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop'
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setBreakpoint('mobile')
      } else if (width < 1024) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = breakpoint === 'mobile'
  const isTablet = breakpoint === 'tablet'
  const isDesktop = breakpoint === 'desktop'

  return { breakpoint, isMobile, isTablet, isDesktop }
}
