import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useApp } from '../context/AppContext'
import QuickInput from '../components/QuickInput'
import ContentCard from '../components/ContentCard'
import SwipeableCard from '../components/SwipeableCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

const MAX_RECENT = 10

export default function Dashboard() {
  const { state, toggleArchive, toggleFavorite } = useApp()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const prevCount = useRef(state.items.length)

  const activeItems = state.items.filter(i => !i.archived).slice(0, MAX_RECENT)
  const activeCount = state.items.filter(i => !i.archived).length
  const justRefreshed = !processing && state.items.length > prevCount.current
  if (justRefreshed) prevCount.current = state.items.length

  return (
    <div>
      <QuickInput onProcessing={setProcessing} />
      {processing && <LoadingSkeleton />}

      <div className="px-6 pb-8">
        {!processing && activeItems.length === 0 && (
          <EmptyState
            icon={<FileText className="w-8 h-8 text-[var(--color-text-muted)]" />}
            title="No sieved content yet"
            description="Paste an article link or text above to start processing and remembering what matters."
            action={{ label: 'Try with sample', onClick: () => { const input = document.querySelector<HTMLInputElement>('input[placeholder*="Paste"]'); if (input) { input.value = 'https://example.com'; input.focus() } } }}
          />
        )}

        {!processing && activeItems.length > 0 && (
          <div key={activeItems.length} className="max-w-3xl mx-auto space-y-3">
            {activeCount >= 2 && (
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Recent
                </h2>
                <span className="text-xs text-[var(--color-text-muted)]">{activeCount} total</span>
              </div>
            )}
            {activeItems.map(item => (
              <SwipeableCard key={item.id} onSwipeLeft={() => toggleArchive(item.id)} onSwipeRight={() => toggleFavorite(item.id)}>
                <ContentCard item={item} onClick={() => navigate(`/sieve/${item.id}`)} />
              </SwipeableCard>
            ))}
            {activeCount > MAX_RECENT && (
              <button
                onClick={() => navigate('/library')}
                className="w-full py-3 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors cursor-pointer"
              >
                View all {activeCount} items →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
