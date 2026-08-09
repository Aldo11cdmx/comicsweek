import { motion } from 'motion/react'
import { useComicStore } from '../store/useComicStore'
import { ComicCard } from './ComicCard'

export function Collections() {
  const { comics, filter, setFilter } = useComicStore()

  const reading = comics.filter(c => c.status === 'reading')
  const finished = comics.filter(c => c.status === 'finished')
  const newComics = comics.filter(c => c.status === 'new')

  const collections = [
    { id: 'all', label: 'Todos', count: comics.length, comics },
    { id: 'reading', label: 'Leyendo', count: reading.length, comics: reading },
    { id: 'finished', label: 'Terminados', count: finished.length, comics: finished },
    { id: 'new', label: 'Nuevos', count: newComics.length, comics: newComics },
  ] as const

  const active = collections.find(c => c.id === filter) || collections[0]

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10">
        <h2 className="font-display text-3xl font-bold text-cw-text md:text-4xl">Tu estantería</h2>
        <p className="mt-2 text-cw-text-muted">
          Todas tus historias, en un solo lugar.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-cw-border bg-cw-surface p-1">
          {collections.map(tab => (
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
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                filter === tab.id ? 'bg-cw-accent/20 text-cw-accent' : 'bg-cw-surface-2 text-cw-text-muted'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {active.comics.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-lg text-cw-text-muted">
            No hay historias en esta sección.
          </p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {active.comics.map((comic, i) => (
            <ComicCard key={comic.id} comic={comic} index={i} />
          ))}
        </motion.div>
      )}
    </section>
  )
}
