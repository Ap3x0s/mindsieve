import { useMemo } from 'react'
import type { SieveItem, ReviewEntry } from '../types'
import { isReviewDue } from '../lib/sm2'

export function useRetention(items: SieveItem[]) {
  const dueItems = useMemo(() => items.filter(i => i.review && isReviewDue(i.review) && !i.archived), [items])

  const score = (entry: ReviewEntry | null): number => {
    if (!entry) return 0
    const factor = entry.easeFactor
    const reps = entry.repetitions
    if (factor >= 2.3 && reps >= 5) return 95
    if (factor >= 2.0 && reps >= 3) return 80
    if (factor >= 1.7 && reps >= 1) return 60
    return 30
  }

  const itemsWithScore = useMemo(() => items.map(i => ({ ...i, retentionScore: score(i.review) })), [items])

  return { dueItems, itemsWithScore, score }
}
