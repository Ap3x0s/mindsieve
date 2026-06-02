import { LayoutDashboard, Library, RotateCcw, BarChart3 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const items = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/library', icon: Library, label: 'Library' },
  { path: '/review', icon: RotateCcw, label: 'Review' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface-900)] sm:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(item => {
          const active = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                active ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
