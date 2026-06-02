import { useRef, type ReactNode, type TouchEvent } from 'react'

interface SwipeableCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export default function SwipeableCard({ children, onSwipeLeft, onSwipeRight, threshold = 80 }: SwipeableCardProps) {
  const startX = useRef(0)
  const startY = useRef(0)
  const currentX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const onTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
  }

  const onTouchMove = (e: TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current
    if (Math.abs(dx) < Math.abs(dy)) {
      if (cardRef.current) cardRef.current.style.transform = ''
      return
    }
    currentX.current = dx
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${dx}px)`
      cardRef.current.style.transition = 'none'
    }
  }

  const onTouchEnd = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease'
      cardRef.current.style.transform = ''
    }
    const dx = currentX.current
    if (dx > threshold && onSwipeRight) onSwipeRight()
    else if (dx < -threshold && onSwipeLeft) onSwipeLeft()
    currentX.current = 0
  }

  return (
    <div
      ref={cardRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="touch-pan-y"
    >
      {children}
    </div>
  )
}
