import { addDays } from 'date-fns'
import type { ReviewEntry, Sm2Settings } from '../types'
import { DEFAULT_SM2 } from '../types'
import { storageKey } from './constants'

function loadSettings(): Sm2Settings {
  try {
    const raw = localStorage.getItem(storageKey('sm2'))
    if (raw) return { ...DEFAULT_SM2, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_SM2
}

export function saveSm2Settings(s: Sm2Settings): void {
  localStorage.setItem(storageKey('sm2'), JSON.stringify(s))
}

export { loadSettings as loadSm2Settings }

export function createReview(grades: number[], settings?: Sm2Settings): ReviewEntry {
  const s = settings || loadSettings()
  let ease = s.defaultEase
  let interval = 0
  let reps = 0

  for (const grade of grades) {
    reps++
    if (grade >= 3) {
      if (reps === 1) interval = s.intervalStep1
      else if (reps === 2) interval = s.intervalStep2
      else interval = Math.min(s.maxInterval, Math.round(interval * ease))
    } else {
      reps = 0
      interval = s.intervalStep1
    }
    ease = Math.max(s.minEase, ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)))
  }

  return {
    dueDate: addDays(new Date(), interval).toISOString(),
    interval,
    easeFactor: Math.round(ease * 100) / 100,
    repetitions: reps,
  }
}

export function scheduleReview(current: ReviewEntry, grade: number, settings?: Sm2Settings): ReviewEntry {
  const s = settings || loadSettings()
  let { interval, easeFactor, repetitions } = current
  if (grade >= 3) {
    repetitions++
    if (repetitions === 1) interval = s.intervalStep1
    else if (repetitions === 2) interval = s.intervalStep2
    else interval = Math.min(s.maxInterval, Math.round(interval * easeFactor))
  } else {
    repetitions = 0
    interval = s.intervalStep1
  }
  easeFactor = Math.max(s.minEase, easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)))

  return {
    dueDate: addDays(new Date(), interval).toISOString(),
    interval,
    easeFactor: Math.round(easeFactor * 100) / 100,
    repetitions,
  }
}

export function isReviewDue(entry: ReviewEntry | null): boolean {
  if (!entry) return false
  return new Date(entry.dueDate) <= new Date()
}
