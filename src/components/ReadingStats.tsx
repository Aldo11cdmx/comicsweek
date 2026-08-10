import { motion, AnimatePresence } from 'motion/react'
import { BookOpen, Clock, Flame, Trophy, TrendingUp, RotateCcw } from 'lucide-react'
import type { ReadingStats } from '../hooks/useReadingStats'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function getLast7Days(): { date: string; label: string; pages: number }[] {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const dateStr = d.toISOString().split('T')[0]
    const label = DAYS[d.getDay()]
    days.push({ date: dateStr, label, pages: 0 })
  }
  return days
}

export function ReadingStats({ stats, onClose, onReset }: { stats: ReadingStats; onClose: () => void; onReset: () => void }) {
  const last7 = getLast7Days()
  const statsMap = new Map(stats.pagesPerDay.map(p => [p.date, p.pages]))
  const maxPages = Math.max(...last7.map(d => statsMap.get(d.date) || 0), 1)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[20px] bg-white/90 backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] p-5">
            <h3 className="font-system-ui text-lg font-medium text-[#2D2D2D]">
              Estadísticas de Lectura
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#8E8E93] transition-colors hover:bg-[#F0EDEA] hover:text-[#2D2D2D]"
            >
              ✕
            </motion.button>
          </div>

          <div className="p-5 space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: BookOpen, value: stats.totalComicsRead, label: 'Cómics leídos', color: '#FF9F87' },
                { icon: TrendingUp, value: stats.totalPagesRead, label: 'Páginas leídas', color: '#A8D8EA' },
                { icon: Clock, value: formatDuration(stats.totalReadingTimeMs), label: 'Tiempo total', color: '#8E8E93' },
                { icon: Flame, value: `${stats.streakDays} días`, label: 'Racha', color: '#FF9F87' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[#F0EDEA]/50 p-4 text-center"
                >
                  <item.icon className="mx-auto mb-2 h-6 w-6" style={{ color: item.color }} />
                  <div className="font-system-ui text-2xl font-light text-[#2D2D2D]">{item.value}</div>
                  <div className="text-xs text-[#8E8E93]">{item.label}</div>
                </motion.div>
              ))}
            </div>

            {stats.longestComicTitle && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[#F0EDEA]/50 p-4"
              >
                <Trophy className="h-6 w-6 text-yellow-500" />
                <div>
                  <div className="text-sm font-medium text-[#2D2D2D]">Cómic más largo</div>
                  <div className="text-xs text-[#8E8E93]">
                    {stats.longestComicTitle} · {stats.longestComicPages} páginas
                  </div>
                </div>
              </motion.div>
            )}

            <div>
              <h4 className="mb-3 text-sm font-medium text-[#2D2D2D]">Páginas por día (últimos 7 días)</h4>
              <div className="flex items-end gap-2">
                {last7.map(day => {
                  const pages = statsMap.get(day.date) || 0
                  const height = maxPages > 0 ? (pages / maxPages) * 100 : 0
                  return (
                    <div key={day.date} className="flex-1 text-center">
                      <div className="mx-auto mb-1 h-24 w-full overflow-hidden rounded-xl bg-[#F0EDEA]">
                        <motion.div
                          className="w-full rounded-xl"
                          style={{
                            background: 'linear-gradient(to top, #FF9F87, #A8D8EA)',
                          }}
                          animate={{ height: `${Math.max(height, 4)}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-[10px] text-[#8E8E93]">{day.label}</span>
                      <div className="text-[10px] font-mono text-[#2D2D2D]">{pages}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="flex items-center gap-1.5 rounded-xl bg-[#F0EDEA] px-3 py-1.5 text-xs text-[#8E8E93] transition-colors hover:bg-[#E5E2DE] hover:text-[#2D2D2D]"
              >
                <RotateCcw className="h-3 w-3" />
                Limpiar estadísticas
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
