import { Search, X } from 'lucide-react'
import { useComicStore } from '../store/useComicStore'

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useComicStore()

  return (
    <div className="relative w-full sm:w-64">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8E93] transition-colors group-focus-within:text-[#2D2D2D]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar..."
          className="w-full rounded-full border border-[rgba(0,0,0,0.06)] bg-white/60 py-2 pl-9 pr-8 text-sm text-[#2D2D2D] placeholder:text-[#8E8E93] transition-all focus:border-[#A8D8EA] focus:bg-white/80 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#2D2D2D]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
