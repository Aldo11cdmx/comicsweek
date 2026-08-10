import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Link2, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useComicStore } from '../store/useComicStore'
import { supabase } from '../lib/supabase'

interface ImportUrlModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ImportUrlModal({ isOpen, onClose }: ImportUrlModalProps) {
  const { user } = useAuth()
  const { importComicFromUrl } = useComicStore()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const reset = () => {
    setTitle('')
    setUrl('')
    setLoading(false)
    setProgress({ current: 0, total: 0 })
    setError(null)
    setSuccess(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleImport = async () => {
    if (!title.trim() || !url.trim()) {
      setError('Completa el título y la URL')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const scrapeRes = await fetch('/api/scrape-comic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!scrapeRes.ok) {
        const data = await scrapeRes.json().catch(() => ({}))
        throw new Error(data?.error || `Error al analizar la página (${scrapeRes.status})`)
      }

      const { images } = (await scrapeRes.json()) as { images: string[] }

      if (!images.length) {
        throw new Error('No encontramos imágenes de cómic en esa página')
      }

      const comicId = `comic-${Date.now()}`
      const pageUrls: string[] = []

      for (let i = 0; i < images.length; i++) {
        setProgress({ current: i + 1, total: images.length })

        const imageUrl = images[i]
        try {
          const imageRes = await fetch('/api/download-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: imageUrl }),
          })

          if (!imageRes.ok) {
            console.warn(`Failed to download image ${i + 1}: ${imageRes.status}`)
            continue
          }

          const { base64, contentType } = await imageRes.json()
          const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
          const path = `${user?.id || 'anonymous'}/${comicId}/page_${String(i + 1).padStart(3, '0')}.${extension}`

          const binaryString = atob(base64)
          const bytes = new Uint8Array(binaryString.length)
          for (let j = 0; j < binaryString.length; j++) {
            bytes[j] = binaryString.charCodeAt(j)
          }
          const blob = new Blob([bytes], { type: contentType })

          const { error: uploadError } = await supabase.storage
            .from('comics')
            .upload(path, blob, { contentType, upsert: true })

          if (uploadError) {
            console.warn(`Failed to upload image ${i + 1}:`, uploadError)
            continue
          }

          const { data } = supabase.storage.from('comics').getPublicUrl(path)
          const publicUrl = data.publicUrl
          pageUrls.push(publicUrl)
        } catch (err) {
          console.warn(`Error processing image ${i + 1}:`, err)
        }
      }

      if (!pageUrls.length) {
        throw new Error('No se pudo procesar ninguna imagen. Intentá con otra URL.')
      }

      const comic = await importComicFromUrl(title.trim(), pageUrls)
      setSuccess(comic.title)
      setTimeout(handleClose, 1200)
    } catch (err: any) {
      setError(err?.message || 'Error desconocido')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        onClick={loading ? undefined : handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg rounded-[20px] border border-[rgba(0,0,0,0.06)] bg-white/90 p-6 shadow-sm backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-system-ui text-lg font-medium text-[#2D2D2D]">
              Importar desde URL
            </h3>
            {!loading && !success && (
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#8E8E93] transition-colors hover:bg-[#F0EDEA] hover:text-[#2D2D2D]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-8 text-center"
            >
              <CheckCircle2 className="h-10 w-10 text-[#C3E8B7]" />
              <p className="font-system-ui text-base font-medium text-[#2D2D2D]">
                Cómic importado
              </p>
              <p className="text-sm text-[#8E8E93]">{success}</p>
            </motion.div>
          ) : loading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#A8D8EA]" />
              <p className="text-sm text-[#8E8E93]">
                {progress.total > 0
                  ? `Página ${progress.current} de ${progress.total}...`
                  : 'Analizando página...'}
              </p>
              {progress.total > 0 && (
                <div className="h-1 w-full overflow-hidden rounded-full bg-[#F0EDEA]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #FF9F87, #A8D8EA)',
                    }}
                    animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#2D2D2D]">
                  Título
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Spider-Man: La última cacería"
                  className="w-full rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/50 px-4 py-3 text-sm text-[#2D2D2D] placeholder-[#8E8E93] outline-none transition-all focus:border-[#A8D8EA] focus:shadow-[0_0_0_3px_rgba(168,216,234,0.15)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#2D2D2D]">
                  URL del cómic
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8E8E93]" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://ejemplo.com/leer-spiderman/..."
                    className="w-full rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/50 pl-10 pr-4 py-3 text-sm text-[#2D2D2D] placeholder-[#8E8E93] outline-none transition-all focus:border-[#A8D8EA] focus:shadow-[0_0_0_3px_rgba(168,216,234,0.15)]"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleImport}
                className="w-full rounded-2xl px-6 py-3.5 text-sm font-medium text-white shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #FF9F87 0%, #A8D8EA 100%)',
                }}
              >
                Importar
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
