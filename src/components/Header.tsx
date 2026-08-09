import { motion } from 'motion/react'
import { BookOpen, Library, Sparkles, Import } from 'lucide-react'
import { useComicStore } from '../store/useComicStore'

export function Header({ onImportClick }: { onImportClick: () => void }) {
  const { setView, view, comics } = useComicStore()
  const hasComics = comics.length > 0

  return (
    <header className="sticky top-0 z-40 border-b border-cw-border/50 bg-cw-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 font-serif text-xl font-bold tracking-wide text-cw-text hover:text-cw-accent transition-colors"
          >
            <BookOpen className="h-6 w-6 text-cw-accent" />
            <span>COMICSWEEK</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <NavButton active={view === 'home'} onClick={() => setView('home')} icon={<Sparkles className="h-4 w-4" />}>
              Inicio
            </NavButton>
            <NavButton active={view === 'library'} onClick={() => setView('library')} icon={<Library className="h-4 w-4" />}>
              Biblioteca
            </NavButton>
            {hasComics && (
              <NavButton active={view === 'collections'} onClick={() => setView('collections')} icon={<BookOpen className="h-4 w-4" />}>
                Colecciones
              </NavButton>
            )}
          </nav>
        </div>

        <button
          onClick={onImportClick}
          className="flex items-center gap-2 rounded-full bg-cw-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-cw-accent-hover hover:shadow-lg hover:shadow-cw-accent/20 active:scale-95"
        >
          <Import className="h-4 w-4" />
          <span className="hidden sm:inline">Importar</span>
        </button>
      </div>
    </header>
  )
}

function NavButton({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all ${
        active
          ? 'text-cw-text'
          : 'text-cw-text-muted hover:text-cw-text'
      }`}
    >
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute inset-0 rounded-full bg-cw-surface-2"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{children}</span>
    </button>
  )
}
