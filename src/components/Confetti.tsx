import { useEffect, useState } from 'react'

const colors = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6']

interface Piece {
  id: number
  x: number
  color: string
  delay: number
  size: number
  rotation: number
}

export default function Confetti() {
  const [pieces] = useState<Piece[]>(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
    }))
  )

  useEffect(() => {
    const t = setTimeout(() => {
      const el = document.getElementById('confetti-container')
      if (el) el.style.display = 'none'
    }, 3500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      id="confetti-container"
      className="fixed inset-0 pointer-events-none z-[60] overflow-hidden"
    >
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece absolute top-0"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
