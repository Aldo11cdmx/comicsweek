import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Logo } from './Logo'

const MIN_DURATION = 2000

type SplashState = 'entering' | 'visible' | 'exiting' | 'finished'

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [state, setState] = useState<SplashState>('entering')

  useEffect(() => {
    const enterTimer = setTimeout(() => {
      setState('visible')
    }, 100)

    const exitTimer = setTimeout(() => {
      setState('exiting')
    }, MIN_DURATION)

    const finishTimer = setTimeout(() => {
      setState('finished')
      onFinish()
    }, MIN_DURATION + 600)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
      clearTimeout(finishTimer)
    }
  }, [onFinish])

  if (state === 'finished') return null

  return (
    <AnimatePresence>
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FF9F87 0%, #A8D8EA 50%, #C3E8B7 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 8s ease infinite',
          }}
        >
          <style>{`
            @keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          `}</style>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center gap-6"
          >
            <Logo variant="full" size={100} animated={true} breathing={state === 'visible'} />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex items-center gap-2"
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-white/80"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
    </AnimatePresence>
  )
}
