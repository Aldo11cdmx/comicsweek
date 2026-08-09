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
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-7xl px-6 py-16"
    >
      <div className="flex flex-col gap-3 mb-8">
        <h2 className="font-serif text-3xl font-bold text-cw-text md:text-4xl">
          {readingComic ? 'Sigues leyendo' : 'Dónde nos quedamos?'}
        </h2>
        <p className="text-cw-text-muted text-lg">
          {readingComic ? 'Continuando tu historia' : 'Tu última historia'}
        </p>
      </div>

      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={() => openReader(lastReadComic.id)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-cw-surface border border-cw-border/50 shadow-2xl shadow-black/20"
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative h-64 w-full md:h-auto md:w-64 lg:w-80 flex-shrink-0 overflow-hidden bg-cw-surface-2">
            <img
              src={lastReadComic.cover}
              alt={lastReadComic.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cw-surface/80 to-transparent md:bg-gradient-to-r" />
          </div>

          <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
            <div>
              <h3 className="font-serif text-2xl font-bold text-cw-text md:text-3xl lg:text-4xl line-clamp-2">
                {lastReadComic.title}
              </h3>
              <div className="mt-3 flex items-center gap-3 text-sm text-cw-text-muted">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {lastReadComic.pageCount} páginas
                </span>
                <span>·</span>
                <span className="capitalize">{lastReadComic.status === 'reading' ? 'Leyendo' : 'Nuevo'}</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-cw-text-muted">Progreso</span>
                <span className="font-mono text-cw-accent">
                  {Math.round((lastReadComic.progress / lastReadComic.pageCount) * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-cw-surface-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(lastReadComic.progress / lastReadComic.pageCount) * 100}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-cw-accent to-cw-warm"
                />
              </div>
              <p className="mt-2 text-xs text-cw-text-muted">
                Página {lastReadComic.progress} de {lastReadComic.pageCount}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cw-accent py-3.5 text-sm font-semibold text-white transition-colors hover:bg-cw-accent-hover md:w-auto md:px-8"
            >
              <Play className="h-4 w-4 fill-current" />
              Continuar leyendo
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}

function EmptyState() {
  const { setView } = useComicStore()

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-7xl px-6 py-16 text-center"
    >
      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-6xl">📚</div>
        <h2 className="font-serif text-3xl font-bold text-cw-text md:text-4xl">
          Tu biblioteca está vacía.
        </h2>
        <p className="mt-4 text-lg text-cw-text-muted">
          Hay historias esperando a ser descubiertas.
        </p>
        <button
          onClick={() => setView('library')}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-cw-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-cw-accent-hover hover:shadow-lg hover:shadow-cw-accent/20"
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
