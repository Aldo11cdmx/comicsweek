import { motion } from 'motion/react'

export function CTASection({ onStart }: { onStart: () => void }) {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="font-system-ui mb-4 text-3xl font-light text-[#2D2D2D] md:text-5xl">
            ¿Listo para redescubrir tus cómics?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg font-light text-[#8E8E93]">
            Gratis. Sin anuncios. Sin límites.
          </p>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="rounded-2xl px-10 py-4 text-base font-medium text-white shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #FF9F87 0%, #A8D8EA 100%)',
            }}
          >
            Probar ahora
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
