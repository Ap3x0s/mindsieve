import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useApp } from '../context/AppContext'
import QuickInput from '../components/QuickInput'
import ContentCard from '../components/ContentCard'
import LoadingSkeleton from '../components/LoadingSkeleton'

const MAX_RECENT = 10

export default function Dashboard() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)

  const activeItems = state.items.filter(i => !i.archived).slice(0, MAX_RECENT)
  const activeCount = state.items.filter(i => !i.archived).length

  return (
    <div>
      <QuickInput onProcessing={setProcessing} />
      {processing && <LoadingSkeleton />}

      <div className="px-6 pb-8">
        {!processing && activeItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-700)] flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">No sieved content yet</h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-sm">
              Paste an article link or text above to start processing and remembering what matters.
            </p>
          </div>
        )}

        {!processing && activeItems.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-3">
            {activeCount >= 2 && (
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Recent
                </h2>
                <span className="text-xs text-[var(--color-text-muted)]">{activeCount} total</span>
              </div>
            )}
            {activeItems.map(item => (
              <ContentCard key={item.id} item={item} onClick={() => navigate(`/sieve/${item.id}`)} />
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
