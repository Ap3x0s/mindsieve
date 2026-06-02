import { useEffect, useState } from 'react'
import { Trophy, Zap, X } from 'lucide-react'

export default function LevelUpModal({ level, xp, onClose }: { level: number; xp: number; onClose: () => void }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setShow(true))
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${show ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className={`relative p-8 rounded-2xl bg-[var(--color-surface-900)] border border-[var(--color-accent)]/30 shadow-2xl text-center transition-all duration-300 ${show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-700)] cursor-pointer">
          <X className="w-4 h-4" />
        </button>
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-[var(--color-accent)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Level Up!</h2>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-[var(--color-accent)]" />
          <span className="text-4xl font-bold text-[var(--color-accent)]">{level}</span>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">Total XP: {xp}</p>
      </div>
    </div>
  )
}
