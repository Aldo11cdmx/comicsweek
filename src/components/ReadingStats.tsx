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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-cw-surface border border-cw-border/60 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-cw-border/60 p-5">
            <h3 className="font-display text-lg font-bold text-cw-text">
              Estadísticas de Lectura
            </h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-cw-text-muted transition-colors hover:bg-cw-surface-2 hover:text-cw-text"
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-cw-border/40 bg-cw-surface-2 p-4 text-center">
                <BookOpen className="mx-auto mb-2 h-6 w-6 text-cw-accent" />
                <div className="font-display text-xl font-bold text-cw-text">{stats.totalComicsRead}</div>
                <div className="text-xs text-cw-text-muted">Cómics leídos</div>
              </div>

              <div className="rounded-xl border border-cw-border/40 bg-cw-surface-2 p-4 text-center">
                <TrendingUp className="mx-auto mb-2 h-6 w-6 text-cw-warm" />
                <div className="font-display text-xl font-bold text-cw-text">{stats.totalPagesRead}</div>
                <div className="text-xs text-cw-text-muted">Páginas leídas</div>
              </div>

              <div className="rounded-xl border border-cw-border/40 bg-cw-surface-2 p-4 text-center">
                <Clock className="mx-auto mb-2 h-6 w-6 text-blue-400" />
                <div className="font-display text-xl font-bold text-cw-text">{formatDuration(stats.totalReadingTimeMs)}</div>
                <div className="text-xs text-cw-text-muted">Tiempo total</div>
              </div>

              <div className="rounded-xl border border-cw-border/40 bg-cw-surface-2 p-4 text-center">
                <Flame className="mx-auto mb-2 h-6 w-6 text-orange-400" />
                <div className="font-display text-xl font-bold text-cw-text">{stats.streakDays}</div>
                <div className="text-xs text-cw-text-muted">Racha (días)</div>
              </div>
            </div>

            {stats.longestComicTitle && (
              <div className="flex items-center gap-3 rounded-xl border border-cw-border/40 bg-cw-surface-2 p-4">
                <Trophy className="h-6 w-6 text-yellow-400" />
                <div>
                  <div className="text-sm font-medium text-cw-text">Cómic más largo</div>
                  <div className="text-xs text-cw-text-muted">
                    {stats.longestComicTitle} · {stats.longestComicPages} páginas
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="mb-3 text-sm font-medium text-cw-text">Páginas por día (últimos 7 días)</h4>
              <div className="flex items-end gap-2">
                {last7.map(day => {
                  const pages = statsMap.get(day.date) || 0
                  const height = maxPages > 0 ? (pages / maxPages) * 100 : 0
                  return (
                    <div key={day.date} className="flex-1 text-center">
                      <div className="mx-auto mb-1 h-24 w-full overflow-hidden rounded-lg bg-cw-surface-2">
                        <div
                          className="w-full bg-gradient-to-t from-cw-accent to-cw-warm transition-all duration-500"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-cw-text-muted">{day.label}</span>
                      <div className="text-[10px] font-mono text-cw-text">{pages}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 rounded-xl bg-cw-surface-2 px-3 py-1.5 text-xs text-cw-text-muted transition-colors hover:bg-cw-border hover:text-cw-text"
              >
                <RotateCcw className="h-3 w-3" />
                Limpiar estadísticas
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
