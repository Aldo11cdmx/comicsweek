import { motion } from 'motion/react'
import { Play } from 'lucide-react'
import { useComicStore } from '../store/useComicStore'
import { LazyImage } from './LazyImage'
import type { Comic } from '../types'

export function ComicCard({ comic, index }: { comic: Comic; index: number }) {
  const { openReader } = useComicStore()

  const statusColors = {
    new: 'bg-[#C3E8B7] text-[#2D2D2D]',
    reading: 'bg-[#A8D8EA] text-[#2D2D2D]',
    finished: 'bg-[#F0EDEA] text-[#8E8E93]',
  }

  const statusLabels = {
    new: 'Nuevo',
    reading: 'Continuar',
    finished: 'Terminado',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => openReader(comic.id)}
      className="group cursor-pointer overflow-hidden rounded-[20px] border border-[rgba(0,0,0,0.06)] bg-white/70 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-[#F0EDEA]">
        <LazyImage
          src={comic.cover}
          alt={comic.title}
          className="h-full w-full"
          aspectRatio={2 / 3}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute left-3 top-3">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${statusColors[comic.status]}`}>
            {statusLabels[comic.status]}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[#2D2D2D] shadow-lg backdrop-blur-sm"
          >
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </motion.div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-system-ui text-base font-medium leading-snug text-[#2D2D2D] line-clamp-2">
          {comic.title}
        </h3>

        <div className="mt-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-[#F0EDEA]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(comic.progress / comic.pageCount) * 100}%`,
                background: 'linear-gradient(90deg, #FF9F87, #A8D8EA)',
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#8E8E93]">
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
