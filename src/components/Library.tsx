import { motion, AnimatePresence } from 'motion/react'
import { useComicStore } from '../store/useComicStore'
import { ComicCard } from './ComicCard'
import { SearchBar } from './SearchBar'

export function Library() {
  const { comics, filter, searchQuery, setFilter } = useComicStore()

  let filtered = comics

  if (filter !== 'all') {
    filtered = comics.filter(c => c.status === filter)
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(c => c.title.toLowerCase().includes(q))
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-cw-text md:text-4xl">Biblioteca</h2>
          <p className="mt-2 text-cw-text-muted">
            {filtered.length} {filtered.length === 1 ? 'historia' : 'historias'}
            {filter !== 'all' && ` · ${filter === 'new' ? 'Nuevas' : filter === 'reading' ? 'En lectura' : 'Terminadas'}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>Todos</FilterButton>
          <FilterButton active={filter === 'new'} onClick={() => setFilter('new')}>Nuevos</FilterButton>
          <FilterButton active={filter === 'reading'} onClick={() => setFilter('reading')}>Leyendo</FilterButton>
          <FilterButton active={filter === 'finished'} onClick={() => setFilter('finished')}>Terminados</FilterButton>
        </div>
      </div>

      <SearchBar />

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center"
          >
            <p className="text-lg text-cw-text-muted">
              {comics.length === 0
                ? 'Tu biblioteca está vacía.'
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
    </section>
  )
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? 'bg-cw-surface-2 text-cw-text'
          : 'text-cw-text-muted hover:text-cw-text'
      }`}
    >
      {children}
    </button>
  )
}
