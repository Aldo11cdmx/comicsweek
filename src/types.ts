export interface ReadingProgress {
  fileName: string
  fileHash: string
  currentPage: number
  currentPanel: number
  viewerMode: 'panel' | 'free'
  brightness: number
  contrast: number
  lastOpened: number
}

export type ReadingMode = 'page' | 'vertical' | 'cinematic'
export type ReadingDirection = 'ltr' | 'rtl'
export type ComicStatus = 'new' | 'reading' | 'finished'
export type Theme = 'dark' | 'light' | 'sepia'
export type View = 'home' | 'library' | 'collections' | 'reader' | 'import'

export interface Comic {
  id: string
  title: string
  format: 'cbz' | 'zip' | 'pdf' | 'url'
  cover: string
  pageCount: number
  progress: number
  status: ComicStatus
  importedAt: number
  lastReadAt: number | null
  fileSize: number
  pageUrls?: string[]
}

export interface ReaderState {
  currentPage: number
  zoom: number
  mode: ReadingMode
  direction: ReadingDirection
  isFullscreen: boolean
  isControlsVisible: boolean
  showSettings: boolean
  showModeSelector: boolean
  bookmarks: number[]
  debugMode: boolean
}

export interface ImportResult {
  title: string
  format: Comic['format']
  cover: string
  pageCount: number
  file: File
}

export interface Page {
  index: number
  url: string
  name: string
  width: number
  height: number
  naturalWidth: number
  naturalHeight: number
}

export interface ComicPanel {
  x: number
  y: number
  width: number
  height: number
  confidence: number
  area: number
  aspectRatio: number
  index: number
}

export type DetectionConfidence = 'high' | 'medium' | 'low'
export type DetectionStatus = 'SUCCESS' | 'LOW_CONFIDENCE' | 'NO_PANELS' | 'INVALID' | 'ERROR'

export interface DetectionResult {
  status: DetectionStatus
  panels: ComicPanel[]
  confidence: DetectionConfidence
  rawCandidates: number
  debugImageUrl?: string
}
