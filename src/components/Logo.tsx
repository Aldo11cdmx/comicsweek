import { motion } from 'motion/react'

interface LogoProps {
  variant?: 'full' | 'icon' | 'wordmark'
  size?: number
  animated?: boolean
  breathing?: boolean
  className?: string
}

export function Logo({ variant = 'full', size = 120, animated = true, breathing = false, className = '' }: LogoProps) {
  const iconSize = size
  const textSize = size * 0.25

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {variant !== 'wordmark' && (
        <motion.svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 100 100"
          fill="none"
          animate={breathing ? { scale: [1, 1.03, 1] } : {}}
          transition={breathing ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF9F87" />
              <stop offset="50%" stopColor="#A8D8EA" />
              <stop offset="100%" stopColor="#C3E8B7" />
            </linearGradient>
          </defs>

          <motion.path
            d="M20 80 L20 30 Q20 20 30 20 L50 20 Q55 20 55 25 L55 45 Q55 50 50 50 L30 50 Q25 50 25 45 L25 80 M55 45 Q55 50 60 50 L80 50 Q85 50 85 45 L85 20 Q85 15 80 15 L60 15 Q55 15 55 20"
            stroke="url(#logoGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={animated ? { strokeDasharray: 300, strokeDashoffset: 300 } : {}}
            animate={animated ? { strokeDashoffset: 0 } : {}}
            transition={animated ? { duration: 1.5, ease: 'easeInOut' } : {}}
          />

          {animated && (
            <motion.path
              d="M20 80 L20 30 Q20 20 30 20 L50 20 Q55 20 55 25 L55 45 Q55 50 50 50 L30 50 Q25 50 25 45 L25 80 M55 45 Q55 50 60 50 L80 50 Q85 50 85 45 L85 20 Q85 15 80 15 L60 15 Q55 15 55 20"
              stroke="url(#logoGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ strokeDasharray: 300, strokeDashoffset: 300 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
              style={{ opacity: 0.3, filter: 'blur(4px)' }}
            />
          )}
        </motion.svg>
      )}

      {variant !== 'icon' && (
        <motion.span
          className="font-system-ui font-light tracking-widest"
          style={{ fontSize: textSize, color: 'currentColor' }}
          initial={animated ? { opacity: 0, letterSpacing: '0.3em' } : {}}
          animate={animated ? { opacity: 1, letterSpacing: '0.15em' } : {}}
          transition={animated ? { duration: 1, ease: 'easeOut', delay: 0.8 } : {}}
        >
          ComicsWeek
        </motion.span>
      )}
    </div>
  )
}
