import { create } from 'zustand'
import type { Comic, ReaderState, ComicStatus, Theme, View, ImportResult } from '../types'
import { getAllComics, saveComic, deleteComic as dbDeleteComic, getFile, saveFile } from '../lib/idb'

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

    set(state => ({
      comics: [comic, ...state.comics],
      view: 'library',
      showImportZone: false,
    }))

    return comic
  },

  removeComic: async (id: string) => {
    await dbDeleteComic(id)
    set(state => ({
      comics: state.comics.filter(c => c.id !== id),
      currentComicId: state.currentComicId === id ? null : state.currentComicId,
      currentReaderState: state.currentComicId === id ? null : state.currentReaderState,
    }))
  },

  updateComic: async (comic: Comic) => {
    await saveComic(comic)
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
