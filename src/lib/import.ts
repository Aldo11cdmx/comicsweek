import * as pdfjs from 'pdfjs-dist'
import JSZip from 'jszip'

export async function parseComicFile(file: File, format: 'cbz' | 'zip' | 'pdf'): Promise<{ title: string; pageCount: number }> {
  if (format === 'pdf') {
    const buffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: buffer }).promise
    const title = file.name.replace(/\.(pdf)$/i, '')
    return {
      title,
      pageCount: pdf.numPages,
    }
  } else {
    const zip = await JSZip.loadAsync(file)
    const entries = Object.keys(zip.files).filter(name => !zip.files[name].dir && /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(name))
    const title = file.name.replace(/\.(cbz|zip)$/i, '')
    return {
      title,
      pageCount: entries.length,
    }
  }
}

export async function extractCover(file: File, format: 'cbz' | 'zip' | 'pdf'): Promise<string> {
  if (format === 'pdf') {
    const buffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: buffer }).promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    const renderContext = {
      canvasContext: ctx,
      viewport,
      canvas,
    }

    await page.render(renderContext as any).promise
    return canvas.toDataURL('image/jpeg', 0.85)
  } else {
    const zip = await JSZip.loadAsync(file)
    const entries = Object.keys(zip.files)
      .filter(name => !zip.files[name].dir && /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

    if (entries.length === 0) {
      return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" fill="%2322222b"><rect width="400" height="600"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%238a8697" font-family="sans-serif" font-size="16">No preview</text></svg>'
    }

    const firstEntry = zip.files[entries[0]]
    const blob = await firstEntry.async('blob')
    return URL.createObjectURL(blob)
  }
}
