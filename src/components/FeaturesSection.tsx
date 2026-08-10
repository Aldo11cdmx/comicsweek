import { motion } from 'motion/react'

const features = [
  {
    icon: '🧠',
    title: 'Detección IA',
    description: 'Tu cómic se analiza automáticamente. Viñetas, globos y orden de lectura.',
  },
  {
    icon: '🎥',
    title: 'Zoom Cinemático',
    description: 'Navega entre viñetas con transiciones fluidas. Como una película.',
  },
  {
    icon: '🎨',
    title: 'Tu estilo',
    description: 'Modo noche, sepia, brillo y contraste. Lee como quieras.',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="font-system-ui text-3xl font-light text-[#2D2D2D] md:text-4xl">
            Diseñado para lectores exigentes
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
              className="rounded-3xl border border-[rgba(0,0,0,0.06)] bg-white/60 p-8 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 font-system-ui text-xl font-medium text-[#2D2D2D]">{feature.title}</h3>
              <p className="font-system-ui text-sm leading-relaxed text-[#8E8E93]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
