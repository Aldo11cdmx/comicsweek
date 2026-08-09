import { motion } from 'motion/react'
import { Play } from 'lucide-react'
import { useComicStore } from '../store/useComicStore'
import type { Comic } from '../types'

export function ComicCard({ comic, index }: { comic: Comic; index: number }) {
  const { openReader } = useComicStore()

  const statusColors = {
    new: 'bg-emerald-500/20 text-emerald-400',
    reading: 'bg-cw-accent/20 text-cw-accent',
    finished: 'bg-blue-500/20 text-blue-400',
  }

  const statusLabels = {
    new: 'Nuevo',
    reading: 'Leyendo',
    finished: 'Terminado',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={() => openReader(comic.id)}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-cw-surface border border-cw-border/30 transition-colors hover:border-cw-border"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-cw-surface-2">
        <img
          src={comic.cover}
          alt={comic.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cw-surface/90 via-cw-surface/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute right-2 top-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[comic.status]}`}>
            {statusLabels[comic.status]}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-cw-accent text-white shadow-xl"
          >
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </motion.div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-serif text-lg font-bold text-cw-text line-clamp-2 leading-tight">
          {comic.title}
        </h3>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-cw-text-muted">Progreso</span>
            <span className="font-mono text-cw-text-muted">
              {Math.round((comic.progress / comic.pageCount) * 100)}%
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-cw-surface-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cw-accent to-cw-warm transition-all duration-500"
              style={{ width: `${(comic.progress / comic.pageCount) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-cw-text-muted">
            Página {comic.progress} de {comic.pageCount}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
