import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-700)] flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] max-w-sm mb-4">{description}</p>
      {action && (
        <button onClick={action.onClick}
          className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer">
          {action.label}
        </button>
      )}
    </div>
  )
}