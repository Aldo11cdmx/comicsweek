import { motion } from 'motion/react'
import { Play, BookOpen } from 'lucide-react'
import { useComicStore } from '../store/useComicStore'

export function Hero() {
  const { comics, openReader } = useComicStore()

  const readingComic = comics.find(c => c.status === 'reading')
  const lastReadComic = readingComic || [...comics].sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0))[0]

  if (!lastReadComic) {
    return <EmptyState />
  }

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20">
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-[2rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-cw-surface-2 via-cw-bg to-cw-bg" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cw-accent/5 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cw-warm/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-6 md:flex-row md:items-center md:gap-12"
      >
        <motion.div
          whileHover={{ scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => openReader(lastReadComic.id)}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-cw-surface-2 border border-cw-border/60 shadow-2xl shadow-black/30 md:w-[320px] lg:w-[380px] flex-shrink-0"
        >
          <div className="aspect-[2/3] overflow-hidden">
            <img
              src={lastReadComic.cover}
              alt={lastReadComic.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-cw-bg/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cw-accent text-white shadow-2xl backdrop-blur-sm">
              <Play className="h-7 w-7 fill-current ml-1" />
            </div>
          </div>
        </motion.div>

        <div className="flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-cw-text-muted">
              <span className="rounded-full border border-cw-border px-2.5 py-1 text-[10px]">
                {readingComic ? 'Leyendo' : 'Nuevo'}
              </span>
              <span>Issue</span>
              <span className="text-cw-text-dim">·</span>
              <span>Página {lastReadComic.progress + 1} / {lastReadComic.pageCount}</span>
            </div>

            <h2 className="font-display text-3xl font-bold leading-tight text-cw-text md:text-4xl lg:text-5xl">
              {lastReadComic.title}
            </h2>

            <p className="text-base text-cw-text-muted md:text-lg">
              {readingComic ? 'Sigues leyendo esta historia' : 'Tu última historia'}
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-cw-text-muted">Progreso</span>
              <span className="font-mono text-cw-accent">
                {Math.round((lastReadComic.progress / lastReadComic.pageCount) * 100)}%
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-cw-surface-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(lastReadComic.progress / lastReadComic.pageCount) * 100}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                className="h-full rounded-full bg-gradient-to-r from-cw-accent to-cw-warm"
              />
            </div>
            <p className="mt-2 text-xs text-cw-text-muted">
              Página {lastReadComic.progress} de {lastReadComic.pageCount}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => openReader(lastReadComic.id)}
              className="inline-flex items-center gap-2 rounded-full bg-cw-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-cw-accent-hover"
            >
              <Play className="h-4 w-4 fill-current" />
              Continuar leyendo
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => openReader(lastReadComic.id, { currentPage: 0 })}
              className="inline-flex items-center gap-2 rounded-full border border-cw-border bg-cw-surface px-6 py-3 text-sm font-medium text-cw-text transition-colors hover:border-cw-text-muted hover:bg-cw-surface-2"
            >
              <BookOpen className="h-4 w-4" />
              Desde el inicio
            </motion.button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function EmptyState() {
  const { setView } = useComicStore()

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative mx-auto max-w-7xl px-6 py-24"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-[2rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-cw-surface-2 via-cw-bg to-cw-bg" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cw-accent/5 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl border border-cw-border bg-cw-surface-2">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cw-text-muted">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>

        <h2 className="font-display text-3xl font-bold text-cw-text md:text-4xl">
          Tu estantería está vacía.
        </h2>
        <p className="mt-4 text-lg text-cw-text-muted">
          Hay historias esperando a ser descubiertas.
        </p>
        <button
          onClick={() => setView('library')}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-cw-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-cw-accent-hover"
        >
          <BookOpen className="h-4 w-4" />
          Importar tu primer cómic
        </button>
        <p className="mt-4 text-xs text-cw-text-muted">
          CBZ · ZIP · PDF
        </p>
      </div>
    </motion.section>
  )
}
