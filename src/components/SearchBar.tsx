import { Search } from 'lucide-react'
import { useComicStore } from '../store/useComicStore'

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useComicStore()

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cw-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en tu biblioteca..."
          className="w-full rounded-xl bg-cw-surface border border-cw-border py-2.5 pl-10 pr-10 text-sm text-cw-text placeholder:text-cw-text-muted transition-colors focus:border-cw-accent focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cw-text-muted hover:text-cw-text"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
