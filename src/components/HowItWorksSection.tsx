import { motion } from 'motion/react'

const steps = [
  {
    number: '01',
    title: 'Sube tu cómic',
    description: 'PDF, CBZ, ZIP. Arrastra y suelta.',
  },
  {
    number: '02',
    title: 'La IA lo analiza',
    description: 'Detección automática de viñetas y orden de lectura.',
  },
  {
    number: '03',
    title: 'Lee sin esfuerzo',
    description: 'Zoom automático, navegación fluida, sin pellizcos.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="font-system-ui text-3xl font-light text-[#2D2D2D] md:text-4xl">
            Cómo funciona
          </h2>
        </div>

        <div className="relative grid gap-12 md:grid-cols-3">
          <div className="absolute left-1/4 right-1/4 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-[#A8D8EA] to-transparent md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: 'easeOut' }}
              className="relative text-center"
            >
              <div className="mb-6 text-6xl font-light text-[#A8D8EA]/30">{step.number}</div>
              <h3 className="mb-2 font-system-ui text-xl font-medium text-[#2D2D2D]">{step.title}</h3>
              <p className="font-system-ui text-sm leading-relaxed text-[#8E8E93]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
