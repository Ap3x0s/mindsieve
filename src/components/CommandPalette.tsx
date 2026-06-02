import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Library, RotateCcw, BarChart3, Settings, Search } from 'lucide-react'

interface Command {
  id: string
  label: string
  icon: typeof Search
  action: () => void
  shortcut?: string
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const commands: Command[] = [
    { id: 'home', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/') },
    { id: 'library', label: 'Open Library', icon: Library, action: () => navigate('/library'), shortcut: 'n' },
    { id: 'review', label: 'Start Review', icon: RotateCcw, action: () => navigate('/review'), shortcut: 'r' },
    { id: 'stats', label: 'View Stats', icon: BarChart3, action: () => navigate('/stats') },
    { id: 'settings', label: 'Open Connections', icon: Settings, action: () => navigate('/connections') },
  ]

  const filtered = query.trim()
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && filtered[selected]) { filtered[selected].action(); onClose() }
    if (e.key === 'Escape') onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg mx-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--color-border)]">
          <Search className="w-4 h-4 text-[var(--color-text-muted)]" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none" />
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--color-surface-700)] text-[var(--color-text-muted)]">ESC</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {filtered.map((cmd, i) => (
            <button key={cmd.id}
              onMouseDown={() => { cmd.action(); onClose() }}
              onMouseEnter={() => setSelected(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                i === selected ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)]'
              }`}>
              <cmd.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{cmd.label}</span>
              {cmd.shortcut && (
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--color-surface-700)] text-[var(--color-text-muted)]">
                  {cmd.shortcut}
                </kbd>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-sm text-[var(--color-text-muted)] text-center">No commands found</p>
          )}
        </div>
      </div>
    </div>
  )
}
