import { motion } from 'motion/react'
import { Play } from 'lucide-react'
import { useComicStore } from '../store/useComicStore'
import type { Comic } from '../types'

export function ComicCard({ comic, index }: { comic: Comic; index: number }) {
  const { openReader } = useComicStore()

  const statusColors = {
    new: 'border-emerald-500/30 text-emerald-400',
    reading: 'border-cw-accent/40 text-cw-accent',
    finished: 'border-blue-400/30 text-blue-300',
  }

  const statusLabels = {
    new: 'Nuevo',
    reading: 'Leyendo',
    finished: 'Terminado',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={() => openReader(comic.id)}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-cw-surface border border-cw-border/40 transition-colors hover:border-cw-border"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-cw-surface-2">
        <img
          src={comic.cover}
          alt={comic.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cw-bg/70 via-cw-bg/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute left-3 top-3">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusColors[comic.status]}`}>
            {statusLabels[comic.status]}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-cw-accent text-white shadow-2xl"
          >
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </motion.div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-serif text-base font-bold text-cw-text leading-snug line-clamp-2">
          {comic.title}
        </h3>

        <div className="mt-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-cw-surface-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cw-accent to-cw-warm transition-all duration-700"
              style={{ width: `${(comic.progress / comic.pageCount) * 100}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-cw-text-muted">
            <span>{comic.progress} / {comic.pageCount}</span>
            <span className="font-mono">
              {Math.round((comic.progress / comic.pageCount) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
