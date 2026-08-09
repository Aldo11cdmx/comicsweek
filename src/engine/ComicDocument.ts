import * as pdfjs from 'pdfjs-dist'
import JSZip from 'jszip'
import type { Page, Comic } from '../types'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

export class ComicDocument {
  comic: Comic
  file: File
  pages: Page[] = []
  zip: JSZip | null = null
  pdfDoc: any | null = null
  loaded = false

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

    if (page.url) return page.url

    if (this.comic.format === 'pdf' && this.pdfDoc) {
      const pdfPage = await this.pdfDoc.getPage(index + 1)
      const viewport = pdfPage.getViewport({ scale: 2 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height

      const renderContext = {
        canvasContext: canvas.getContext('2d')!,
        viewport,
        canvas,
      }

      await pdfPage.render(renderContext as any).promise
      page.url = canvas.toDataURL('image/jpeg', 0.85)
      return page.url
    }

    if (this.zip) {
      const names = Object.keys(this.zip.files)
      const sortedNames = names
        .filter(name => !this.zip!.files[name].dir && /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(name))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

      const fileName = sortedNames[index]
      const entry = this.zip.files[fileName]
      const blob = await entry.async('blob')
      page.url = URL.createObjectURL(blob)
      return page.url
    }

    throw new Error('Comic not loaded')
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
    this.pages.forEach(page => {
      if (page.url) URL.revokeObjectURL(page.url)
    })
    this.pages = []
    this.zip = null
    this.pdfDoc = null
    this.loaded = false
  }
}
