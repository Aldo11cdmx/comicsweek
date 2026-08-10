import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Library } from './components/Library'
import { ImportZone } from './components/ImportZone'
import { Collections } from './components/Collections'
import { Reader } from './components/Reader'
import { LoginPage } from './components/LoginPage'
import { LandingPage } from './components/LandingPage'
import { SplashScreen } from './components/SplashScreen'
import { useComicStore } from './store/useComicStore'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { view, loadComics, currentComicId, showImportZone, setShowImportZone } = useComicStore()
  const { user, loading } = useAuth()
  const [offlineMode, setOfflineMode] = useState(() => {
    return localStorage.getItem('comicsweek-offline-mode') === 'true'
  })
  const [showSplash, setShowSplash] = useState(true)
  const [showLanding, setShowLanding] = useState(true)

  useEffect(() => {
    loadComics()
  }, [loadComics])

  useEffect(() => {
    localStorage.setItem('comicsweek-offline-mode', String(offlineMode))
  }, [offlineMode])

  useEffect(() => {
    if (user) {
      setShowLanding(false)
    }
  }, [user])

  const showReader = view === 'reader' && currentComicId
  const showApp = !loading && (user || offlineMode)
  const showLandingPage = showApp && showLanding && !user

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  if (!showApp) {
    return <LoginPage onOffline={() => setOfflineMode(true)} />
  }

  if (showLandingPage) {
    return <LandingPage onStart={() => setShowLanding(false)} />
  }

  return (
    <div className="min-h-screen bg-cw-bg text-cw-text">
      <AnimatePresence mode="wait">
        {!showReader && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Header onImportClick={() => setShowImportZone(true)} />

            <main>
              <AnimatePresence mode="wait">
                {view === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Hero />
                  </motion.div>
                )}

                {view === 'library' && (
                  <motion.div
                    key="library"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Library />
                  </motion.div>
                )}

                {view === 'collections' && (
                  <motion.div
                    key="collections"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Collections />
                  </motion.div>
                )}

                {view === 'import' && (
                  <motion.div
                    key="import"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ImportZone />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            <footer className="mx-auto max-w-7xl px-6 py-12 text-center text-xs text-cw-text-muted">
              ComicsWeek · Tu refugio para leer cómics
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReader && (
          <motion.div
            key="reader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Reader />
          </motion.div>
        )}
      </AnimatePresence>

      {showImportZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cw-bg/95 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-6">
            <ImportZone />
            <button
              onClick={() => setShowImportZone(false)}
              className="mt-4 mx-auto block rounded-full bg-cw-surface-2 px-6 py-2.5 text-sm font-medium text-cw-text transition-colors hover:bg-cw-border"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
