import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Upload, FileText, Image, CheckCircle2 } from 'lucide-react'
import { useComicStore } from '../store/useComicStore'
import { extractCover, parseComicFile } from '../lib/import'

export function ImportZone() {
  const { importComic } = useComicStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (!file) return

    const validTypes = ['application/zip', 'application/x-cbz', 'application/pdf', 'application/x-rar-compressed']
    const validExtensions = ['.cbz', '.zip', '.pdf', '.cbr']
    const fileName = file.name.toLowerCase()
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
    const hasValidType = validTypes.some(type => file.type === type)

    if (!hasValidExtension && !hasValidType) {
      alert('Por favor, selecciona un archivo CBZ, ZIP o PDF válido.')
      return
    }

    setIsImporting(true)
    setSuccess(null)

    try {
      const format = file.name.endsWith('.pdf') ? 'pdf' : 'cbz'
      const comicData = await parseComicFile(file, format)
      const cover = await extractCover(file, format)

      const result = {
        title: comicData.title,
        format: format as 'cbz' | 'zip' | 'pdf',
        cover,
        pageCount: comicData.pageCount,
        file,
      }

      const comic = await importComic(result)
      setSuccess(comic.title)

      setTimeout(() => {
        setSuccess(null)
        setIsImporting(false)
      }, 2500)
    } catch (error) {
      console.error('Error importing comic:', error)
      setIsImporting(false)
      alert('No pudimos importar este cómic. Por favor, inténtalo de nuevo.')
    }
  }, [importComic])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-3xl px-6 py-20"
    >
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl font-bold text-cw-text md:text-4xl">
          Importa tu historia
        </h2>
        <p className="mt-4 text-cw-text-muted">
          Arrastra tu cómic aquí o explora para seleccionar
        </p>
        <p className="mt-2 text-xs text-cw-text-muted">
          CBZ · ZIP · PDF
        </p>
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-cw-border bg-cw-surface p-14"
          >
            <CheckCircle2 className="h-12 w-12 text-cw-accent" />
            <p className="font-display text-xl font-bold text-cw-text">Añadido a tu biblioteca</p>
            <p className="text-cw-text-muted">{success}</p>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input')?.click()}
            className={`relative cursor-pointer overflow-hidden rounded-2xl border border-dashed p-16 text-center transition-all duration-300 ${
              isDragging
                ? 'border-cw-accent bg-cw-accent/5 scale-[1.01]'
                : 'border-cw-border hover:border-cw-text-muted/50 hover:bg-cw-surface/60'
            }`}
          >
            <input
              id="file-input"
              type="file"
              accept=".cbz,.zip,.pdf,.cbr"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleDrop({ preventDefault: () => {}, dataTransfer: { files: [file] } } as any)
                }
              }}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-5">
              <div className={`flex h-16 w-16 items-center justify-center rounded-xl border transition-colors duration-300 ${
                isDragging
                  ? 'border-cw-accent/50 bg-cw-accent/10 text-cw-accent'
                  : 'border-cw-border bg-cw-surface-2 text-cw-text-muted'
              }`}>
                {isImporting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    className="h-6 w-6 border-2 border-cw-accent border-t-transparent rounded-full"
                  />
                ) : isDragging ? (
                  <Upload className="h-6 w-6" />
                ) : (
                  <FileText className="h-6 w-6" />
                )}
              </div>

              <div>
                <p className="text-lg font-semibold text-cw-text">
                  {isDragging ? 'Suelta tu historia aquí' : 'Suelta tu archivo aquí'}
                </p>
                <p className="mt-2 text-sm text-cw-text-muted">
                  o haz clic para explorar
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs text-cw-text-muted">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  PDF
                </span>
                <span className="flex items-center gap-1.5">
                  <Image className="h-4 w-4" />
                  CBZ / ZIP
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
