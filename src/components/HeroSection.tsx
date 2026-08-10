import { motion } from 'motion/react'
import { Logo } from './Logo'

export function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              background: i % 3 === 0 ? '#FF9F87' : i % 3 === 1 ? '#A8D8EA' : '#C3E8B7',
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              filter: 'blur(80px)',
            }}
            animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
            transition={{ duration: 12 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="mb-8 flex justify-center">
          <Logo variant="full" size={120} animated={true} />
        </div>

        <h1 className="font-system-ui mb-4 text-4xl font-light leading-tight text-[#2D2D2D] md:text-6xl">
          Tu cómic, más vivo que nunca
        </h1>

        <p className="mx-auto mb-10 max-w-xl text-lg font-light leading-relaxed text-[#8E8E93] md:text-xl">
          Detección inteligente de viñetas. Zoom automático. Lectura inmersiva.
        </p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="relative overflow-hidden rounded-2xl px-10 py-4 text-base font-medium text-white shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #FF9F87 0%, #A8D8EA 100%)',
          }}
        >
          <span className="relative z-10">Comenzar a leer</span>
          <motion.div
            className="absolute inset-0 -z-0"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            }}
          />
        </motion.button>

        <p className="mt-6 text-sm text-[#8E8E93]">Sin registros. Sin complicaciones.</p>
      </motion.div>
    </section>
  )
}
