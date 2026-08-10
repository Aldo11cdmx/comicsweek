import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, WifiOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage({ onOffline }: { onOffline: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signInWithEmail, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await signInWithEmail(email)
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Error al enviar el enlace')
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-cw-bg px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-cw-text">ComicsWeek</h1>
          <p className="mt-2 text-cw-text-muted">
            Sincroniza tu biblioteca en la nube o usa la app sin conexión
          </p>
        </div>

        <div className="rounded-2xl border border-cw-border/60 bg-cw-surface p-6 shadow-2xl">
          {sent ? (
            <div className="text-center">
              <Mail className="mx-auto mb-4 h-12 w-12 text-cw-accent" />
              <h2 className="font-display text-xl font-bold text-cw-text">Revisa tu correo</h2>
              <p className="mt-2 text-sm text-cw-text-muted">
                Te enviamos un enlace mágico a <span className="font-medium text-cw-text">{email}</span>.
                Haz clic para iniciar sesión.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-cw-text">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full rounded-xl border border-cw-border/60 bg-cw-surface-2 px-4 py-3 text-cw-text placeholder-cw-text-muted outline-none transition-colors focus:border-cw-accent"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cw-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-cw-accent-hover disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar magic link'}
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cw-border/40" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-cw-surface px-2 text-cw-text-muted">o</span>
              </div>
            </div>

            <button
              onClick={onOffline}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cw-border/60 bg-cw-surface-2 px-6 py-3 text-sm font-medium text-cw-text transition-colors hover:bg-cw-border"
            >
              <WifiOff className="h-4 w-4" />
              Continuar sin cuenta (offline)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
