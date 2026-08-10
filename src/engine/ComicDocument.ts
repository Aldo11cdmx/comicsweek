import * as pdfjs from 'pdfjs-dist'
import JSZip from 'jszip'
import type { Page, Comic } from '../types'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

const MAX_CACHED_PAGES_MOBILE = 2
const MAX_CACHED_PAGES_DESKTOP = 4

function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

function getMaxCachedPages(): number {
  return isMobileDevice() ? MAX_CACHED_PAGES_MOBILE : MAX_CACHED_PAGES_DESKTOP
}

function getRenderScale(): number {
  if (typeof window === 'undefined') return 2
  if (window.innerWidth < 768) {
    return Math.min(window.devicePixelRatio, 1.5)
  }
  return Math.min(window.devicePixelRatio, 2.0)
}

interface CachedPage {
  url: string
  canvas?: HTMLCanvasElement
  blob?: Blob
}

export class ComicDocument {
  comic: Comic
  file: File
  pages: Page[] = []
  zip: JSZip | null = null
  pdfDoc: any | null = null
  loaded = false
  pageCache: Map<number, CachedPage> = new Map()

  constructor(comic: Comic, file: File) {
    this.comic = comic
    this.file = file
  }

  async load(): Promise<void> {
    if (this.loaded) return

    if (this.comic.format === 'pdf') {
      await this.loadPdf()
    } else {
      await this.loadZip()
    }

    this.loaded = true
  }

  private async loadZip(): Promise<void> {
    const zip = await JSZip.loadAsync(this.file)
    this.zip = zip

    const entries = Object.keys(zip.files)
      .filter(name => !zip.files[name].dir && /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

    this.pages = entries.map((name, index) => ({
      index,
      url: '',
      name,
      width: 0,
      height: 0,
      naturalWidth: 0,
      naturalHeight: 0,
    }))
  }

  private async loadPdf(): Promise<void> {
    const buffer = await this.file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: buffer }).promise
    this.pdfDoc = pdf

    const pages: Page[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 1 })
      pages.push({
        index: i - 1,
        url: '',
        name: `page-${i}`,
        width: viewport.width,
        height: viewport.height,
        naturalWidth: viewport.width,
        naturalHeight: viewport.height,
      })
    }
    this.pages = pages
  }

  async getPageUrl(index: number): Promise<string> {
    if (index < 0 || index >= this.pages.length) {
      throw new Error('Page index out of bounds')
    }

    const page = this.pages[index]

    if (page.url && this.pageCache.has(index)) {
      return page.url
    }

    if (this.comic.format === 'pdf' && this.pdfDoc) {
      const scale = getRenderScale()
      const pdfPage = await this.pdfDoc.getPage(index + 1)
      const viewport = pdfPage.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height

      const renderContext = {
        canvasContext: canvas.getContext('2d')!,
        viewport,
        canvas,
      }

      await pdfPage.render(renderContext as any).promise
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      page.url = dataUrl

      this.pageCache.set(index, { url: dataUrl, canvas })
      this.evictDistantPages(index)

      return dataUrl
    }

    if (this.zip) {
      const names = Object.keys(this.zip.files)
      const sortedNames = names
        .filter(name => !this.zip!.files[name].dir && /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(name))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

      const fileName = sortedNames[index]
      const entry = this.zip.files[fileName]
      const blob = await entry.async('blob')
      const url = URL.createObjectURL(blob)
      page.url = url

      this.pageCache.set(index, { url, blob })
      this.evictDistantPages(index)

      return url
    }

    throw new Error('Comic not loaded')
  }

  evictDistantPages(currentPage: number): void {
    const maxPages = getMaxCachedPages()
    const keysToKeep = new Set<number>()

    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (this.pageCache.has(i)) {
        keysToKeep.add(i)
      }
    }

    if (keysToKeep.size < maxPages) {
      const sortedEntries = Array.from(this.pageCache.entries())
        .sort((a, b) => Math.abs(a[0] - currentPage) - Math.abs(b[0] - currentPage))

      for (const [pageNum] of sortedEntries) {
        if (keysToKeep.size >= maxPages) break
        keysToKeep.add(pageNum)
      }
    }

    this.pageCache.forEach((cached, pageNum) => {
      if (!keysToKeep.has(pageNum)) {
        if (cached.canvas) {
          cached.canvas.width = 0
          cached.canvas.height = 0
        }
        if (cached.url && cached.url.startsWith('blob:')) {
          URL.revokeObjectURL(cached.url)
        }
        this.pageCache.delete(pageNum)
      }
    })
  }

  getPageCount(): number {
    return this.pages.length
  }

  async getPage(index: number): Promise<any> {
    if (index < 0 || index >= this.pages.length) {
      throw new Error('Page index out of bounds')
    }

    if (this.comic.format === 'pdf' && this.pdfDoc) {
      return await this.pdfDoc.getPage(index + 1)
    }

    throw new Error('getPage only supported for PDF format')
  }

  dispose(): void {
    this.pageCache.forEach((cached, pageNum) => {
      if (cached.canvas) {
        cached.canvas.width = 0
        cached.canvas.height = 0
      }
      if (cached.url && cached.url.startsWith('blob:')) {
        URL.revokeObjectURL(cached.url)
      }
      void pageNum
    })
    this.pageCache.clear()

    this.pages.forEach(page => {
      if (page.url && page.url.startsWith('blob:')) {
        URL.revokeObjectURL(page.url)
      }
    })
    this.pages = []
    this.zip = null
    this.pdfDoc = null
    this.loaded = false
  }
}
