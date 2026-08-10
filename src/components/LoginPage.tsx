import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, WifiOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Logo } from './Logo'

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
    <div className="flex min-h-screen items-center justify-center px-6" style={{ background: 'linear-gradient(135deg, #FAF9F7 0%, #F0EDEA 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="mb-10 flex justify-center">
          <Logo variant="full" size={80} animated={true} breathing />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-3xl border border-[rgba(0,0,0,0.06)] bg-white/70 p-8 shadow-sm backdrop-blur-xl"
        >
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4 flex justify-center"
              >
                <Mail className="h-12 w-12" style={{ color: '#FF9F87' }} />
              </motion.div>
              <h2 className="font-system-ui text-xl font-medium text-[#2D2D2D]">Revisa tu correo</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#8E8E93]">
                Te enviamos un enlace mágico a <span className="font-medium text-[#2D2D2D]">{email}</span>.
                Haz clic para iniciar sesión.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#2D2D2D]">
                  Correo electrónico
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/50 px-4 py-3.5 text-[#2D2D2D] placeholder-[#8E8E93] outline-none transition-all focus:border-[#A8D8EA] focus:shadow-[0_0_0_3px_rgba(168,216,234,0.15)]"
                />
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl px-6 py-3.5 text-sm font-medium text-white shadow-md transition-opacity disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #FF9F87 0%, #A8D8EA 100%)',
                }}
              >
                {loading ? 'Enviando...' : 'Enviar magic link'}
              </motion.button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgba(0,0,0,0.06)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/70 px-2 text-[#8E8E93]">o</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onOffline}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/30 px-6 py-3.5 text-sm font-medium text-[#8E8E93] transition-colors hover:bg-white/50 hover:text-[#2D2D2D]"
            >
              <WifiOff className="h-4 w-4" />
              Continuar sin cuenta
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
