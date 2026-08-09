import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useComicStore } from '../store/useComicStore'
import { ComicCard } from './ComicCard'
import { SearchBar } from './SearchBar'
import { ReadingStats } from './ReadingStats'
import { useReadingStats } from '../hooks/useReadingStats'
import { BarChart3 } from 'lucide-react'

export function Library() {
  const { comics, filter, searchQuery, setFilter } = useComicStore()
  const { stats, reset } = useReadingStats()
  const [showStats, setShowStats] = useState(false)

  let filtered = comics

  if (filter !== 'all') {
    filtered = comics.filter(c => c.status === filter)
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(c => c.title.toLowerCase().includes(q))
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10">
        <h2 className="font-display text-3xl font-bold text-cw-text md:text-4xl">Tu estantería</h2>
        <p className="mt-2 text-cw-text-muted">
          {filtered.length} {filtered.length === 1 ? 'historia' : 'historias'}
          {filter !== 'all' && ` · ${filter === 'new' ? 'Nuevas' : filter === 'reading' ? 'En lectura' : 'Terminadas'}`}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-cw-border bg-cw-surface p-1">
          {([
            { id: 'all', label: 'Todos' },
            { id: 'new', label: 'Nuevos' },
            { id: 'reading', label: 'Leyendo' },
            { id: 'finished', label: 'Terminados' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                filter === tab.id
                  ? 'bg-cw-surface-2 text-cw-text shadow-sm'
                  : 'text-cw-text-muted hover:text-cw-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SearchBar />
          <button
            onClick={() => setShowStats(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-cw-border/60 bg-cw-surface text-cw-text transition-colors hover:bg-cw-surface-2"
            title="Estadísticas de lectura"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-24 text-center"
          >
            <p className="text-lg text-cw-text-muted">
              {comics.length === 0
                ? 'Tu estantería está vacía.'
                : 'No se encontraron historias con este filtro.'}
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filtered.map((comic, i) => (
              <ComicCard key={comic.id} comic={comic} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {showStats && (
        <ReadingStats stats={stats} onClose={() => setShowStats(false)} onReset={reset} />
      )}
    </section>
  )
}
