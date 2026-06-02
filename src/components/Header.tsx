import { useState, useRef, useEffect } from 'react'
import { Bot, Palette, Zap, LayoutDashboard, Library, BarChart3, RotateCcw, LogOut, ChevronDown, User, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { getConfig, PROVIDER_PRESETS } from '../lib/omniroute'
import { getStoredUser, logout } from '../lib/auth'
import { PRESETS } from '../lib/themes'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/library', icon: Library, label: 'Library' },
  { path: '/review', icon: RotateCcw, label: 'Review' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
]

interface HeaderProps {
  onOpenPalette: () => void
}

export default function Header({ onOpenPalette }: HeaderProps) {
  const { state, setDarkMode, setCustomTheme } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = state

  const aiConfig = getConfig()
  const aiConfigured = aiConfig !== null
  const providerLabel = aiConfig?.provider ? PROVIDER_PRESETS[aiConfig.provider]?.label : 'Mock'
  const tooltipText = aiConfigured ? `AI: ${providerLabel} (${aiConfig!.model})` : 'AI: Mock'
  const storedUser = getStoredUser()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const applyPreset = (key: string) => {
    const preset = PRESETS[key]
    if (!preset) return
    setDarkMode(key === 'dark' || key === 'sepia' || key === 'nord')
    setCustomTheme(preset)
    setShowThemeMenu(false)
  }

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-900)]">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
            <Logo />
            <span className="text-base font-semibold text-[var(--color-text-primary)] tracking-tight hidden sm:inline">
              MindSieve
            </span>
          </button>

          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(n => (
              <button
                key={n.path}
                onClick={() => navigate(n.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                  location.pathname === n.path
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)]'
                }`}
              >
                <n.icon className="w-4 h-4" />
                {n.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPalette}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface-700)] transition-colors cursor-pointer border border-[var(--color-border)]"
          >
            <span>Cmd+K</span>
          </button>

          <button
            onClick={() => navigate('/connections')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              aiConfigured ? 'text-[var(--color-success)] hover:bg-[var(--color-success)]/10' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-700)]'
            }`}
            title={tooltipText}
          >
            <Bot className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/stats')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface-700)] text-xs cursor-pointer hover:bg-[var(--color-surface-600)] transition-colors"
          >
            <Zap className="w-3 h-3 text-[var(--color-accent)]" />
            <span className="text-[var(--color-text-primary)] font-medium">Lv.{user.level}</span>
            <span className="text-[var(--color-text-muted)] hidden sm:inline">|</span>
            <span className="text-[var(--color-success)] font-medium hidden sm:inline">{user.xp} XP</span>
          </button>

          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] transition-colors cursor-pointer"
            >
              <Palette className="w-4 h-4" />
            </button>
            {showThemeMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-lg py-1 z-50">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <button key={key} onClick={() => applyPreset(key)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] transition-colors cursor-pointer"
                  >
                    <div className="w-4 h-4 rounded border border-[var(--color-border)]" style={{ backgroundColor: preset.colors.accent }} />
                    <span className="flex-1 text-left">{preset.name}</span>
                    {state.customTheme?.name === preset.name && <Check className="w-3 h-3 text-[var(--color-accent)]" />}
                  </button>
                ))}
                <div className="border-t border-[var(--color-border)] my-1" />
                <button onClick={() => { navigate('/theme'); setShowThemeMenu(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--color-accent)] hover:bg-[var(--color-surface-700)] transition-colors cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5" />
                  Theme Editor
                </button>
              </div>
            )}
          </div>

          {storedUser && (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] transition-colors cursor-pointer">
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline max-w-24 truncate">{storedUser.nickname}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-lg py-1 z-50">
                  <div className="px-3 py-2 border-b border-[var(--color-border)]">
                    <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{storedUser.nickname}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Signed in</p>
                  </div>
                  <button onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger/10 transition-colors cursor-pointer">
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

    </>
  )
}
