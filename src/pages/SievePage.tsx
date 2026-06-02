import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import SieveView from '../components/SieveView'
import { CardSkeleton } from '../components/LoadingSkeleton'

export default function SievePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state, loading } = useApp()

  const item = state.items.find(i => i.id === id)

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-900)]">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <ArrowLeft className="w-4 h-4" />
            Back
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto">
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-[var(--color-text-muted)]">Item not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-[var(--color-accent)] hover:underline cursor-pointer">
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-900)]">
      <div className="px-6 py-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      <SieveView item={item} onClose={() => navigate('/')} fullPage />
    </div>
  )
}
