import { Search, X } from 'lucide-react'
import { useComicStore } from '../store/useComicStore'

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useComicStore()

  return (
    <div className="relative w-full sm:w-64">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cw-text-muted transition-colors group-focus-within:text-cw-accent" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar..."
          className="w-full rounded-xl border border-cw-border bg-cw-surface py-2 pl-9 pr-8 text-sm text-cw-text placeholder:text-cw-text-muted transition-all focus:border-cw-accent/50 focus:bg-cw-surface-2 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cw-text-muted hover:text-cw-text"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
