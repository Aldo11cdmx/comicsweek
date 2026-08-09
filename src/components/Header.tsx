import { motion } from 'motion/react'
import { Library, Sparkles, FolderOpen } from 'lucide-react'
import { useComicStore } from '../store/useComicStore'

export function Header({ onImportClick }: { onImportClick: () => void }) {
  const { setView, view, comics } = useComicStore()
  const hasComics = comics.length > 0

  return (
    <header className="sticky top-0 z-40 border-b border-cw-border-subtle bg-cw-bg/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cw-surface-2 border border-cw-border">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cw-accent">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold tracking-wide text-cw-text">
              COMICSWEEK
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <NavButton active={view === 'home'} onClick={() => setView('home')} icon={<Sparkles className="h-4 w-4" />}>
              Inicio
            </NavButton>
            <NavButton active={view === 'library'} onClick={() => setView('library')} icon={<Library className="h-4 w-4" />}>
              Biblioteca
            </NavButton>
            {hasComics && (
              <NavButton active={view === 'collections'} onClick={() => setView('collections')} icon={<FolderOpen className="h-4 w-4" />}>
                Colecciones
              </NavButton>
            )}
          </nav>
        </div>

        <button
          onClick={onImportClick}
          className="group flex items-center gap-2 rounded-full border border-cw-border bg-cw-surface px-4 py-2 text-sm font-medium text-cw-text transition-all hover:border-cw-accent/50 hover:bg-cw-surface-2 active:scale-95"
        >
          <FolderOpen className="h-4 w-4 text-cw-accent transition-transform group-hover:-translate-y-0.5" />
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
      className={`relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm transition-all ${
        active
          ? 'text-cw-text'
          : 'text-cw-text-muted hover:text-cw-text'
      }`}
    >
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute inset-0 rounded-full bg-cw-surface-2 border border-cw-border-subtle"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{children}</span>
    </button>
  )
}
