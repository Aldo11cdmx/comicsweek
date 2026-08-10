import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useComicStore } from '../store/useComicStore'
import { ComicCard } from './ComicCard'
import { SearchBar } from './SearchBar'
import { ReadingStats } from './ReadingStats'
import { useReadingStats } from '../hooks/useReadingStats'
import { useAuth } from '../contexts/AuthContext'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { BarChart3, Cloud, CloudOff, LogOut, RefreshCw, BarChart2, Filter } from 'lucide-react'
import { Logo } from './Logo'
import { RadialMenu } from './RadialMenu'

export function Library() {
  const { comics, filter, searchQuery, loadComics } = useComicStore()
  const { stats, reset } = useReadingStats()
  const { user, signOut } = useAuth()
  const [showStats, setShowStats] = useState(false)
  const [radialOpen, setRadialOpen] = useState(false)
  const {
    containerRef: pullRef,
    isPulling,
    isRefreshing,
  } = usePullToRefresh({
    onRefresh: async () => {
      await loadComics()
    },
  })

  let filtered = comics

  if (filter !== 'all') {
    filtered = comics.filter(c => c.status === filter)
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(c => c.title.toLowerCase().includes(q))
  }

  return (
    <section className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FAF9F7 0%, #F0EDEA 100%)' }}>
      <div className="sticky top-0 z-30 border-b border-[rgba(0,0,0,0.06)] bg-white/60 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="icon" size={28} animated={false} />
            <h2 className="font-system-ui text-xl font-light text-[#2D2D2D]">Tu Biblioteca</h2>
            {user ? (
              <span className="flex items-center gap-1 rounded-full border border-[rgba(0,0,0,0.06)] bg-white/60 px-2.5 py-1 text-xs text-[#8E8E93]">
                <Cloud className="h-3.5 w-3.5" style={{ color: '#FF9F87' }} />
                Sincronizado
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full border border-[rgba(0,0,0,0.06)] bg-white/60 px-2.5 py-1 text-xs text-[#8E8E93]">
                <CloudOff className="h-3.5 w-3.5" />
                Offline
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SearchBar />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStats(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/60 text-[#8E8E93] transition-colors hover:bg-white/80"
              title="Estadísticas de lectura"
            >
              <BarChart3 className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRadialOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/60 text-[#8E8E93] transition-colors hover:bg-white/80"
              title="Más opciones"
            >
              <span className="text-lg leading-none">•••</span>
            </motion.button>
            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={signOut}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/60 text-[#8E8E93] transition-colors hover:bg-white/80"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>

        <RadialMenu
          items={[
            {
              icon: RefreshCw,
              label: 'Actualizar',
              action: () => loadComics(),
              color: '#A8D8EA',
            },
            {
              icon: BarChart2,
              label: 'Estadísticas',
              action: () => setShowStats(true),
              color: '#FF9F87',
            },
            {
              icon: Filter,
              label: 'Filtrar',
              action: () => {},
              color: '#C3E8B7',
            },
          ]}
          isOpen={radialOpen}
          onClose={() => setRadialOpen(false)}
          position="bottom-right"
        />
      </div>

      <div ref={pullRef} className="relative">
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center py-4"
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
              className="h-6 w-6 rounded-full border-2 border-[#A8D8EA] border-t-transparent"
            />
            <span className="ml-3 text-sm text-[#8E8E93]">
              {isRefreshing ? 'Actualizando...' : 'Suelta para actualizar'}
            </span>
          </motion.div>
        )}

        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10">
            <p className="text-sm text-[#8E8E93]">
              {filtered.length} {filtered.length === 1 ? 'historia' : 'historias'}
              {filter !== 'all' && ` · ${filter === 'new' ? 'Nuevas' : filter === 'reading' ? 'En lectura' : 'Terminadas'}`}
            </p>
          </div>

          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-24 text-center"
              >
                <div className="mb-6 text-6xl">📚</div>
                <p className="text-lg font-light text-[#8E8E93]">Tu biblioteca está vacía</p>
                <p className="mt-2 text-sm text-[#8E8E93]">Sube tu primer cómic y empieza a leer</p>
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
        </div>
      </div>
    </section>
  )
}
