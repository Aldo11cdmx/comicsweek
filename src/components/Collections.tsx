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
  ]

  const activeCollection = collections.find(c => c.id === filter) || collections[0]

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h2 className="font-serif text-3xl font-bold text-cw-text md:text-4xl">Colecciones</h2>
        <p className="mt-2 text-cw-text-muted">
          Organiza tus historias
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {collections.map(collection => (
          <button
            key={collection.id}
            onClick={() => setFilter(collection.id as any)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filter === collection.id
                ? 'bg-cw-accent text-white'
                : 'bg-cw-surface text-cw-text-muted hover:text-cw-text'
            }`}
          >
            {collection.label}
            <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
              filter === collection.id ? 'bg-white/20' : 'bg-cw-surface-2'
            }`}>
              {collection.count}
            </span>
          </button>
        ))}
      </div>

      {activeCollection.comics.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-cw-text-muted">
            No hay historias en esta colección.
          </p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {activeCollection.comics.map((comic, i) => (
            <ComicCard key={comic.id} comic={comic} index={i} />
          ))}
        </motion.div>
      )}
    </section>
  )
}
