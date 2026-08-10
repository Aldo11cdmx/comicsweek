import { create } from 'zustand'
import type { Comic, ReaderState, ComicStatus, Theme, View, ImportResult } from '../types'
import { getAllComics, saveComic, deleteComic as dbDeleteComic, getFile, saveFile } from '../lib/idb'
import { supabase } from '../lib/supabase'

interface ComicStore {
  comics: Comic[]
  isLoading: boolean
  currentReaderState: ReaderState | null
  currentComicId: string | null
  theme: Theme
  view: View
  searchQuery: string
  filter: ComicStatus | 'all' | 'favorites'
  showImportZone: boolean

  loadComics: () => Promise<void>
  importComic: (result: ImportResult) => Promise<Comic>
  importComicFromUrl: (title: string, pageUrls: string[]) => Promise<Comic>
  removeComic: (id: string) => Promise<void>
  updateComic: (comic: Comic) => Promise<void>
  openReader: (comicId: string, state?: Partial<ReaderState>) => void
  closeReader: () => void
  setTheme: (theme: Theme) => void
  setView: (view: View) => void
  setSearchQuery: (query: string) => void
  setFilter: (filter: ComicStatus | 'all' | 'favorites') => void
  updateReaderState: (state: Partial<ReaderState>) => void
  getComicFile: (id: string) => Promise<File | undefined>
  setShowImportZone: (show: boolean) => void
}

const defaultReaderState: ReaderState = {
  currentPage: 0,
  zoom: 1,
  mode: 'page',
  direction: 'ltr',
  isFullscreen: false,
  isControlsVisible: false,
  showSettings: false,
  showModeSelector: false,
  bookmarks: [],
  debugMode: false,
}

async function getSupabaseUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function syncComicToSupabase(comic: Comic) {
  const user = await getSupabaseUser()
  if (!user) return

  await supabase.from('comics').upsert({
    id: comic.id,
    user_id: user.id,
    title: comic.title,
    format: comic.format,
    cover: comic.cover,
    page_count: comic.pageCount,
    progress: comic.progress,
    status: comic.status,
    imported_at: new Date(comic.importedAt).toISOString(),
    last_read_at: comic.lastReadAt ? new Date(comic.lastReadAt).toISOString() : null,
    file_size: comic.fileSize,
    page_urls: comic.pageUrls || null,
  })
}

async function deleteComicFromSupabase(id: string) {
  const user = await getSupabaseUser()
  if (!user) return

  await supabase.from('comics').delete().eq('id', id).eq('user_id', user.id)
}

async function loadComicsFromSupabase(): Promise<Comic[]> {
  const user = await getSupabaseUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('comics')
    .select('*')
    .eq('user_id', user.id)
    .order('imported_at', { ascending: false })

  if (error || !data) return []

  return data.map((row: any) => ({
    id: row.id,
    title: row.title,
    format: row.format,
    cover: row.cover,
    pageCount: row.page_count,
    progress: row.progress,
    status: row.status,
    importedAt: new Date(row.imported_at).getTime(),
    lastReadAt: row.last_read_at ? new Date(row.last_read_at).getTime() : null,
    fileSize: row.file_size,
    pageUrls: row.page_urls || undefined,
  }))
}

export const useComicStore = create<ComicStore>((set, get) => ({
  comics: [],
  isLoading: false,
  currentReaderState: null,
  currentComicId: null,
  theme: 'dark',
  view: 'home',
  searchQuery: '',
  filter: 'all',
  showImportZone: false,

  loadComics: async () => {
    set({ isLoading: true })
    try {
      const supabaseComics = await loadComicsFromSupabase()
      if (supabaseComics.length > 0) {
        set({ comics: supabaseComics, isLoading: false })
        return
      }
    } catch {
      // fallback to local
    }

    const comics = await getAllComics()
    set({ comics: comics.sort((a, b) => b.importedAt - a.importedAt), isLoading: false })
  },

  importComic: async (result: ImportResult) => {
    const id = `comic-${Date.now()}`
    const comic: Comic = {
      id,
      title: result.title,
      format: result.format,
      cover: result.cover,
      pageCount: result.pageCount,
      progress: 0,
      status: 'new',
      importedAt: Date.now(),
      lastReadAt: null,
      fileSize: result.file.size,
    }

    await saveFile(id, result.file)
    await saveComic(comic)
    await syncComicToSupabase(comic)

    set(state => ({
      comics: [comic, ...state.comics],
      view: 'library',
      showImportZone: false,
    }))

    return comic
  },

  importComicFromUrl: async (title: string, pageUrls: string[]) => {
    const id = `comic-${Date.now()}`
    const comic: Comic = {
      id,
      title,
      format: 'url',
      cover: pageUrls[0] || '',
      pageCount: pageUrls.length,
      progress: 0,
      status: 'new',
      importedAt: Date.now(),
      lastReadAt: null,
      fileSize: 0,
      pageUrls,
    }

    await saveComic(comic)
    await syncComicToSupabase(comic)

    set(state => ({
      comics: [comic, ...state.comics],
      view: 'library',
      showImportZone: false,
    }))

    return comic
  },

  removeComic: async (id: string) => {
    await dbDeleteComic(id)
    await deleteComicFromSupabase(id)
    set(state => ({
      comics: state.comics.filter(c => c.id !== id),
      currentComicId: state.currentComicId === id ? null : state.currentComicId,
      currentReaderState: state.currentComicId === id ? null : state.currentReaderState,
    }))
  },

  updateComic: async (comic: Comic) => {
    await saveComic(comic)
    await syncComicToSupabase(comic)
    set(state => ({
      comics: state.comics.map(c => c.id === comic.id ? comic : c),
    }))
  },

  openReader: (comicId, state = {}) => {
    const comic = get().comics.find(c => c.id === comicId)
    if (!comic) return

    set({
      currentComicId: comicId,
      view: 'reader',
      currentReaderState: {
        ...defaultReaderState,
        ...state,
        currentPage: state.currentPage ?? comic.progress,
      },
    })
  },

  closeReader: () => {
    set({
      currentComicId: null,
      currentReaderState: null,
      view: 'home',
    })
  },

  setTheme: (theme) => set({ theme }),
  setView: (view) => set({ view }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilter: (filter) => set({ filter }),
  updateReaderState: (state) => {
    const { currentReaderState } = get()
    if (!currentReaderState) return
    set({ currentReaderState: { ...currentReaderState, ...state } })
  },
  getComicFile: async (id) => {
    return getFile(id)
  },
  setShowImportZone: (show) => set({ showImportZone: show }),
}))
