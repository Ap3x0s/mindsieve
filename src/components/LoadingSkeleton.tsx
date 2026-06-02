export function CardSkeleton() {
  return (
    <div className="flex items-start gap-4 p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] animate-pulse">
      <div className="flex-1 space-y-3">
        <div className="h-5 w-3/4 rounded bg-[var(--color-surface-700)]" />
        <div className="flex gap-3">
          <div className="h-3 w-20 rounded bg-[var(--color-surface-700)]" />
          <div className="h-3 w-16 rounded bg-[var(--color-surface-700)]" />
          <div className="h-3 w-24 rounded bg-[var(--color-surface-700)]" />
        </div>
      </div>
      <div className="h-6 w-20 rounded bg-[var(--color-surface-700)] shrink-0" />
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-700)]" />
        <div className="h-3 w-12 rounded bg-[var(--color-surface-700)]" />
      </div>
      <div className="h-7 w-16 rounded bg-[var(--color-surface-700)] mb-1" />
      <div className="h-3 w-20 rounded bg-[var(--color-surface-700)]" />
    </div>
  )
}

export function ReviewCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] animate-pulse space-y-4">
      <div className="h-5 w-2/3 rounded bg-[var(--color-surface-700)]" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-[var(--color-surface-700)]" />
        <div className="h-4 w-5/6 rounded bg-[var(--color-surface-700)]" />
        <div className="h-4 w-4/6 rounded bg-[var(--color-surface-700)]" />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-12 rounded-xl bg-[var(--color-surface-700)]" />
        ))}
      </div>
    </div>
  )
}

export function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 animate-pulse">
      <div className="h-8 w-16 rounded-lg bg-[var(--color-surface-700)]" />
      <div className="h-8 w-20 rounded-lg bg-[var(--color-surface-700)]" />
      <div className="h-8 w-24 rounded-lg bg-[var(--color-surface-700)]" />
      <div className="h-8 w-16 rounded-lg bg-[var(--color-surface-700)]" />
      <div className="h-8 w-24 rounded-lg bg-[var(--color-surface-700)]" />
    </div>
  )
}

export default function LoadingSkeleton() {
  return (
    <div className="px-6 py-4 space-y-3">
      {[1, 2, 3].map(i => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
