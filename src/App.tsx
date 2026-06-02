import { useEffect, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Loader2, AlertTriangle, Plus } from 'lucide-react'
import { useApp } from './context/AppContext'
import { storageKey } from './lib/constants'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import CommandPalette from './components/CommandPalette'
import TutorialOverlay from './components/TutorialOverlay'
import SetupWizard from './components/SetupWizard'
import Dashboard from './pages/Dashboard'
import SievePage from './pages/SievePage'
import Library from './pages/Library'
import Stats from './pages/Stats'
import Review from './pages/Review'
import Connections from './pages/Settings'
import ThemeEditor from './pages/ThemeEditor'
import AuthPage from './pages/AuthPage'
import LevelUpModal from './components/LevelUpModal'
import ErrorBoundary from './components/ErrorBoundary'
import { getConfig } from './lib/omniroute'
import { checkSession, getToken } from './lib/auth'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-900)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-[var(--color-accent)] animate-spin" />
        <p className="text-[var(--color-text-muted)] text-sm">Loading MindSieve...</p>
      </div>
    </div>
  )
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[var(--color-surface-900)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <AlertTriangle className="w-10 h-10 text-danger" />
        <p className="text-[var(--color-text-primary)] font-medium">Connection Error</p>
        <p className="text-[var(--color-text-muted)] text-sm max-w-md">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const [valid, setValid] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setChecking(false)
      setValid(false)
      return
    }
    checkSession().then(user => {
      setValid(user !== null)
      setChecking(false)
    })
  }, [])

  if (checking) return <LoadingScreen />
  if (!valid) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [checking, setChecking] = useState(true)
  const [valid, setValid] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setChecking(false)
      setValid(false)
      return
    }
    checkSession().then(user => {
      setValid(user !== null)
      setChecking(false)
    })
  }, [location.pathname])

  if (checking) return <LoadingScreen />
  if (!valid && location.pathname !== '/auth') return <Navigate to="/auth" replace />
  if (valid && location.pathname === '/auth') return <Navigate to="/" replace />
  return <>{children}</>
}

function AppContent() {
  const { state, loading, migrating, error } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const [prevLevel, setPrevLevel] = useState(state.user.level)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem(storageKey('tutorial_done')))
  const [showPalette, setShowPalette] = useState(false)
  const [showSetupWizard, setShowSetupWizard] = useState(() => !getConfig())

  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  useEffect(() => {
    if (state.user.level > prevLevel) {
      setShowLevelUp(true)
      setPrevLevel(state.user.level)
    }
  }, [state.user.level, prevLevel])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      setShowPalette(p => !p)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleTutorialDone = () => {
    localStorage.setItem(storageKey('tutorial_done'), 'true')
    setShowTutorial(false)
  }

  if (error && state.items.length === 0) {
    return <ErrorScreen message={error} />
  }

  if (loading && state.items.length === 0) {
    return <LoadingScreen />
  }

  if (migrating) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-900)] text-[var(--color-text-primary)] transition-colors duration-300 pb-16 sm:pb-0">
      <Header onOpenPalette={() => setShowPalette(true)} />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sieve/:id" element={<SievePage />} />
              <Route path="/library" element={<Library />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/review" element={<Review />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/theme" element={<ThemeEditor />} />
            </Routes>
          </ProtectedRoute>
        } />
      </Routes>
      <BottomNav />
      {location.pathname !== '/auth' && (
        <button
          onClick={() => navigate('/')}
          className="fixed bottom-20 right-4 z-50 w-12 h-12 bg-[var(--color-accent)] rounded-full shadow-lg flex items-center justify-center hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer sm:hidden"
          title="Quick add"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      )}
      {showLevelUp && (
        <LevelUpModal
          level={state.user.level}
          xp={state.user.xp}
          onClose={() => setShowLevelUp(false)}
        />
      )}
      {showTutorial && <TutorialOverlay onDone={handleTutorialDone} />}
      {showSetupWizard && <SetupWizard onDone={() => setShowSetupWizard(false)} />}
      <CommandPalette open={showPalette} onClose={() => setShowPalette(false)} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface-800)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AuthGuard>
    </BrowserRouter>
  )
}
