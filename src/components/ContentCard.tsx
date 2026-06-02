import { Clock, Globe, BookOpen, CheckCircle, Sparkles, Star, Tag } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { SieveItem } from '../types'
import { format } from 'date-fns'

interface ContentCardProps {
  item: SieveItem
  onClick: () => void
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  unread: { label: 'Unread', classes: 'bg-[var(--color-surface-600)] text-[var(--color-text-secondary)]' },
  sieved: { label: 'Sieved', classes: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' },
  mastered: { label: 'Quiz Mastered', classes: 'bg-[var(--color-success)]/10 text-[var(--color-success)]' },
}

function safeFormatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 'Unknown date'
    return format(d, 'MMM d, yyyy')
  } catch {
    return 'Unknown date'
  }
}

export default function ContentCard({ item, onClick }: ContentCardProps) {
  const { state } = useApp()
  const st = statusConfig[item.status]

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] hover:border-[var(--color-accent)]/40 transition-[border-color,transform] duration-200 cursor-pointer group animate-fade-in-up opacity-0 overflow-hidden active:scale-[0.99]"
    >
      {item.image && (
        <div className="w-full h-36 sm:h-44 overflow-hidden bg-[var(--color-surface-800)]">
          <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => {
              const img = e.target as HTMLElement
              const parent = img.parentElement
              img.style.display = 'none'
              if (parent) {
                parent.classList.add('flex', 'items-center', 'justify-center')
                parent.innerHTML = '<div class="w-8 h-8 text-[var(--color-text-muted)] opacity-40"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg></div>'
              }
            }} />
        </div>
      )}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {item.favorite && <Star className="w-3 h-3 text-[var(--color-warning)] shrink-0" />}
            <h3 className="text-[var(--color-text-primary)] font-medium text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
              {item.title}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{item.domain}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.readingTime}</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{safeFormatDate(item.date)}</span>
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {(item.tags || []).map(tagId => {
                const tag = (state.tags || []).find((t: any) => t.id === tagId)
                return tag ? (
                  <span key={tagId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                    <Tag className="w-2.5 h-2.5" />{tag.name}
                  </span>
                ) : null
              })}
            </div>
          )}
        </div>

        <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium ${st.classes}`}>
          {item.status === 'mastered' ? <CheckCircle className="w-3 h-3" /> :
           item.status === 'sieved' ? <Sparkles className="w-3 h-3" /> : null}
          {st.label}
        </span>
      </div>
      </div>
    </button>
  )
}
